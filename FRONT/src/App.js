import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ChatScreen from "./ChatScreen";
import Register from "./Register";

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat-to/:id" element={<ChatScreen />} />
      </Routes>
    </div>
  );
}

export default App;
