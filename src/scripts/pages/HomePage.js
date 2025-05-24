import HomePageView from "../views/HomePageView.js";
import HomePagePresenter from "../presenters/HomePagePresenter.js";
import UserModel from "../models/UserModel.js";
import StoryModel from "../models/StoryModel.js";

class HomePage {
  constructor() {
    this._view = new HomePageView();
    this._userModel = new UserModel();
    this._storyModel = new StoryModel();
  }

  async render(container) {
    this._view.render(container);
    return this;
  }

  async afterRender() {
    const presenter = new HomePagePresenter({
      view: this._view,
      model: this._userModel,
      storyModel: this._storyModel,
      router: {
        navigateTo: (url) => {
          window.location.hash = url;
        },
      },
    });

    await presenter.init();
  }
}

export default HomePage;
