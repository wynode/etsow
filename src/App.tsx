import React, { useState, useEffect } from "react";
import LoginRegister from "@/components/Login";
import Container from "@/components/Container";
import { Toaster } from "@/components/ui/toaster";

const LoginPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.ipcRenderer.send("change-window-size", { width: 1440, height: 670 });
    setIsLoggedIn(false);
  };

  const handleLogin = (username: any) => {
    window.ipcRenderer.send("change-window-size", { width: 1440, height: 800 });
    setIsLoggedIn(true);
    setUserName(username);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUserName(localStorage.getItem("userName") || "");
      setIsLoggedIn(true);
    } else {
      window.ipcRenderer.send("change-window-size", {
        width: 1440,
        height: 670,
      });
    }
  }, []);

  return (
    <div>
      <Toaster />
      {!isLoggedIn ? (
        <LoginRegister onLoginSuccess={handleLogin}></LoginRegister>
      ) : (
        <Container onLoginOut={handleLogout} userName={userName}></Container>
      )}
    </div>
  );
};

export default LoginPage;
