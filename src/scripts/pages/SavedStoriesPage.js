import SavedStoriesView from "../views/SavedStoriesView.js";
import SavedStoriesPresenter from "../presenters/SavedStoriesPresenter.js";
import Database from "../data/database.js";

class SavedStoriesPage {
  constructor() {
    this._view = new SavedStoriesView();
  }

  async render(container) {
    this._view.render(container);
    return this;
  }

  async afterRender() {
    const presenter = new SavedStoriesPresenter({
      view: this._view,
      dbModel: Database,
    });
    await presenter.init();
  }
}

export default SavedStoriesPage; 