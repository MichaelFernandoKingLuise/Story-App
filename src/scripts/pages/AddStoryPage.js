import AddStoryPageView from "../views/AddStoryPageView.js";
import AddStoryPagePresenter from "../presenters/AddStoryPagePresenter.js";
import UserModel from "../models/UserModel.js";
import StoryModel from "../models/StoryModel.js";

class AddStoryPage {
  constructor() {
    this._view = new AddStoryPageView();
    this._userModel = new UserModel();
    this._storyModel = new StoryModel();
  }

  async render(container) {
    this._view.render(container);
    return this;
  }

  async afterRender() {
    const presenter = new AddStoryPagePresenter({
      view: this._view,
      userModel: this._userModel,
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

export default AddStoryPage;
