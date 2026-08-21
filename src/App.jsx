import { Routes, Route } from "react-router-dom";
import Home from "./pages/dashboard";
import Login from "./pages/signin";
import SignUp from "./pages/signup";
import Devices from "./pages/devices";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/devices" element={<Devices />} />
    </Routes>
  );
}

export default App;
