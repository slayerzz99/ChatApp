import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ChatScreen from "./ChatScreen";

function App() {
  const navigate = useNavigate();

  const logOut = () => {
    localStorage.clear();

    document.cookie.split(";").forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    navigate("/");
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat-to/:id" element={<ChatScreen />} />
      </Routes>

      <div className="text-center absolute top-0 right-[40%] mt-6">
        <button onClick={() => logOut()}>Logout</button>
      </div>
    </div>
  );
}

export default App;
