import Swal from "sweetalert2";

class RegisterPageView {
  constructor() {
    this._form = null;
    this._name = null;
    this._email = null;
    this._password = null;
    this._submitButton = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <h1>Register</h1>
        <form id="register-form">
          <label for="name"><i class="fas fa-user"></i> Name</label>
          <input type="text" id="name" required />

          <label for="email"><i class="fas fa-envelope"></i> Email</label>
          <input type="email" id="email" required />

          <label for="password"><i class="fas fa-lock"></i> Password</label>
          <input type="password" id="password" required />

          <button type="submit" id="register-button">
            <i class="fas fa-user-plus"></i> Register
          </button>
          <p>Already have an account? <a href="#/login" style="text-decoration: none;">Login here</a></p>
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
    this._form = document.getElementById("register-form");
    this._name = document.getElementById("name");
    this._email = document.getElementById("email");
    this._password = document.getElementById("password");
    this._submitButton = document.getElementById("register-button");
  }

  bindRegisterSubmit(handler) {
    this._form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = this._name.value;
      const email = this._email.value;
      const password = this._password.value;

      this.showLoading();

      await handler(name, email, password);
    });
  }

  showLoading() {
    this._submitButton.disabled = true;
    this._submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Registering...';

    return Swal.fire({
      title: "Please wait...",
      text: "Registering you...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  hideLoading(loadingAlert) {
    loadingAlert.close();
    this._submitButton.disabled = false;
    this._submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Register';
  }

  showRegisterError(message) {
    Swal.fire({
      title: "Registration Failed",
      text: message,
      icon: "error",
      confirmButtonText: "Try Again",
    });
  }

  showRegisterSuccess() {
    return Swal.fire({
      title: "Registration Successful",
      text: "You can now log in.",
      icon: "success",
      confirmButtonText: "Proceed to Login",
    });
  }
}

export default RegisterPageView;
