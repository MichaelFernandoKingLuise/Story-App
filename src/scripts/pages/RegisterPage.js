import RegisterPageView from "../views/RegisterPageView.js";
import RegisterPagePresenter from "../presenters/RegisterPagePresenter.js";
import UserModel from "../models/UserModel.js";

class RegisterPage {
  constructor() {
    this._view = new RegisterPageView();
    this._model = new UserModel();
  }

  async render(container) {
    this._view.render(container);
    return this;
  }

  async afterRender() {
    const presenter = new RegisterPagePresenter({
      view: this._view,
      model: this._model,
      router: {
        navigateTo: (url) => {
          window.location.hash = url;
        },
      },
    });

    await presenter.init();
  }
}

export default RegisterPage;
