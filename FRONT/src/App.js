import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ChatScreen from "./ChatScreen";
import Register from "./Register";
import Header from "./Header";
import { Toaster } from "react-hot-toast";
import Videocall from "./Videocall";

function App() {
  const location = useLocation();
  const showHeader =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/chat-to/");

  return (
    <div className="App">
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat-to/:id" element={<ChatScreen />} />
        <Route path="/videocall/:id" element={<Videocall />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;
