// src/services/auth.js
import axios from "axios";

export const logout = async () => {
  try {
    await axios.post(
      "http://localhost:8080/utilisateur/logout",
      {},
      {
        withCredentials: true, // Important for session cookies
      }
    );
    localStorage.removeItem("user");
    window.location.href = "/login"; // Force full page reload
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
