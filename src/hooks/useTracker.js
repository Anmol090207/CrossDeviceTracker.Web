import { useCallback, useEffect, useState } from "react";
import { buildSampleModel } from "../services/sampleData";
import { getAccessToken } from "../services/session";
import { loadTracker } from "../services/tracker";
import { useAuth } from "./useAuth";

function initialState(range) {
  if (getAccessToken()) return { status: "loading", data: null, error: null };
  return { status: "ready", data: buildSampleModel(range), error: null };
}

export function useTracker(range) {
  const { session } = useAuth();
  const token = session?.accessToken ?? "";
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState(() => initialState(range));

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    loadTracker(range, { signal: controller.signal, fresh: reloadKey > 0 })
      .then((data) => {
        if (alive) setState({ status: "ready", data, error: null });
      })
      .catch((error) => {
        if (!alive || error.name === "AbortError") return;
        setState((current) => ({
          status: "error",
          data: current.data?.range === range ? current.data : null,
          error,
        }));
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, [range, token, reloadKey]);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, status: "loading", error: null }));
    setReloadKey((key) => key + 1);
  }, []);

  return {
    ...state,
    reload,
    isSample: state.data?.source === "sample",
    isStale: Boolean(state.data && state.data.range !== range),
  };
}
