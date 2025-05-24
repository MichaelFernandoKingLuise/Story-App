import LoginPageView from "../views/LoginPageView.js";
import LoginPagePresenter from "../presenters/LoginPagePresenter.js";
import UserModel from "../models/UserModel.js";

class LoginPage {
  constructor() {
    this._view = new LoginPageView();
    this._model = new UserModel();
  }

  async render(container) {
    this._view.render(container);
    return this;
  }

  async afterRender() {
    const presenter = new LoginPagePresenter({
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

export default LoginPage;
