import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://backend-dz3k.onrender.com/api";

export const login = async (username, password) => {
  try {
    console.log("API URL:", API_URL); // Debugging

    const response = await axios.post(
      `${API_URL}/auth/login`, // ✅ Corrected API endpoint
      { username, password },  // ✅ Send JSON
      {
        headers: { "Content-Type": "application/json" }, // ✅ Correct Content-Type
      }
    );

    return response.data; // ✅ Returns { access_token, role }
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || "Login failed";
  }
};
