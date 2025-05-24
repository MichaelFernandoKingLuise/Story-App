import Swal from "sweetalert2";

class LoginPageView {
  constructor() {
    this._form = null;
    this._email = null;
    this._password = null;
    this._submitButton = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <h1>Login</h1>
        <form id="login-form">
          <label for="email"><i class="fas fa-envelope"></i> Email</label>
          <input type="email" id="email" required />

          <label for="password"><i class="fas fa-lock"></i> Password</label>
          <input type="password" id="password" required />

          <button type="submit" id="login-button">
            <i class="fas fa-sign-in-alt"></i> Login
          </button>
          <p>Don't have an account? <a href="#/register" style="text-decoration: none;">Register here</a></p>
        </form>
      </section>
    `;
  }

  render(container) {
    container.innerHTML = this.getTemplate();
    this._initElements();
    return this;
  }

  _initElements() {
    this._form = document.getElementById("login-form");
    this._email = document.getElementById("email");
    this._password = document.getElementById("password");
    this._submitButton = document.getElementById("login-button");
  }

  bindLoginSubmit(handler) {
    this._form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = this._email.value;
      const password = this._password.value;

      this.showLoading();

      await handler(email, password);
    });
  }

  showLoading() {
    this._submitButton.disabled = true;
    this._submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    return Swal.fire({
      title: "Please wait...",
      text: "Logging you in",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  hideLoading(loadingAlert) {
    loadingAlert.close();
    this._submitButton.disabled = false;
    this._submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
  }

  showLoginError(message) {
    Swal.fire({
      title: "Login Failed",
      text: message,
      icon: "error",
      confirmButtonText: "Ok",
    });
  }

  showLoginSuccess() {
    return Swal.fire({
      title: "Login Successful!",
      text: "Welcome back!",
      icon: "success",
      confirmButtonText: "Proceed",
    });
  }
}

export default LoginPageView;
