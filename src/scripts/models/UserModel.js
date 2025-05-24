import CONFIG from "../config";

class UserModel {
  constructor() {
    this.token = localStorage.getItem("user-token") || null;
  }

  isLoggedIn() {
    return !!this.token;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("user-token", token);
  }

  getToken() {
    return this.token;
  }

  logout() {
    this.token = null;
    localStorage.removeItem("user-token");
  }

  async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!data.error) {
        this.setToken(data.loginResult.token);
      }

      return data;
    } catch (error) {
      console.error("Error logging in:", error);
      return { error: true, message: "Login failed" };
    }
  }

  async register(name, email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    } catch (error) {
      console.error("Error registering:", error);
      return { error: true, message: "Registration failed" };
    }
  }
}

export default UserModel;
