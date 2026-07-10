import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/signin";
import SignUp from "./pages/signup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}

export default App;
