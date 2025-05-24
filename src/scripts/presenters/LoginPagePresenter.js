class LoginPagePresenter {
  constructor({ view, model, router }) {
    this._view = view;
    this._model = model;
    this._router = router;
  }

  async init() {
    this._view.bindLoginSubmit(this._handleLogin.bind(this));
  }

  async _handleLogin(email, password) {
    const loadingAlert = this._view.showLoading();
    const response = await this._model.login(email, password);
    this._view.hideLoading(loadingAlert);

    if (response.error) {
      this._view.showLoginError(response.message);
    } else {
      const result = await this._view.showLoginSuccess();
      if (result.isConfirmed) {
        this._router.navigateTo("/");
      }
    }
  }
}

export default LoginPagePresenter;
