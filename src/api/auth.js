import axios from "axios";

export const login = async (username, password) => {
  try {
    console.log("API URL:", process.env.REACT_APP_API_URL); // Debug
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/login`,
      new URLSearchParams({ username, password }), // Send as x-www-form-urlencoded
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data; // Return access_token and role
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || "Login failed";
  }
};
