class RegisterPagePresenter {
  constructor({ view, model, router }) {
    this._view = view;
    this._model = model;
    this._router = router;
  }

  async init() {
    this._view.bindRegisterSubmit(this._handleRegister.bind(this));
  }

  async _handleRegister(name, email, password) {
    const loadingAlert = this._view.showLoading();
    const response = await this._model.register(name, email, password);
    this._view.hideLoading(loadingAlert);

    if (response.error) {
      this._view.showRegisterError(response.message);
    } else {
      const result = await this._view.showRegisterSuccess();
      if (result.isConfirmed) {
        this._router.navigateTo("/login");
      }
    }
  }
}

export default RegisterPagePresenter;
