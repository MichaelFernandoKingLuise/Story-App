class SavedStoriesPresenter {
  #view;
  #dbModel;

  constructor({ view, dbModel }) {
    this.#view = view;
    this.#dbModel = dbModel;
  }

  async init() {
    await this.#view.initMap();
    await this.#loadSavedStories();
    this.#view._initElements && this.#view._initElements(); // Inisialisasi event handler jika ada
    this._initBookmarkHandler();
  }

  async #loadSavedStories() {
    try {
      const stories = await this.#dbModel.getAllBookmarks();
      this.#view.displayStories(stories);
    } catch (error) {
      console.error('Failed to load saved stories:', error);
      this.#view.displayStories([]);
    }
  }

  _initBookmarkHandler() {
    document.addEventListener('click', async (e) => {
      if (e.target && (e.target.id === 'bookmark-btn' || e.target.closest('#bookmark-btn'))) {
        const story = this.#view.getActiveStory();
        if (!story || !story.id) return;
        try {
          await this.#dbModel.deleteBookmark(story.id);
          this.#view.showBookmarkRemoved();
          this.#view._closeStoryModal();
          await this.#loadSavedStories();
        } catch (error) {
          this.#view.showBookmarkError('Failed to remove bookmark');
        }
      }
    });
  }
}

export default SavedStoriesPresenter; 