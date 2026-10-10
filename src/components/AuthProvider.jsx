import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, registerAccount } from "../services/api";
import { AuthContext } from "../services/auth-context";
import { clearApiCache, setUnauthorizedHandler } from "../services/http";
import { clearSession, readSession, writeSession } from "../services/session";
import { pick } from "../utils/object";

function sessionFromLogin(payload, email) {
  const accessToken = pick(payload, "accessToken", "AccessToken");
  if (!accessToken) {
    throw new Error("Sign-in succeeded but no access token was returned.");
  }
  return {
    accessToken,
    email: pick(payload, "email", "Email") || email,
  };
}

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(readSession);

  const signOut = useCallback(() => {
    clearSession();
    clearApiCache();
    setSession(null);
    navigate("/signin", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      clearApiCache();
      setSession(null);
      navigate("/signin", {
        replace: true,
        state: { message: "Your session expired. Please sign in again." },
      });
    });
  }, [navigate]);

  const signIn = useCallback(async (email, password) => {
    const payload = await login(email, password);
    const next = sessionFromLogin(payload, email);
    writeSession(next);
    clearApiCache();
    setSession(next);
    return next;
  }, []);

  const signUp = useCallback(
    async (email, password) => {
      await registerAccount(email, password);
      return signIn(email, password);
    },
    [signIn],
  );

  const value = useMemo(
    () => ({ session, signIn, signUp, signOut }),
    [session, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
