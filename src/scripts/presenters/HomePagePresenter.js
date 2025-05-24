import Database from '../data/database.js';

class HomePagePresenter {
  #view;
  #userModel;
  #storyModel;
  #dbModel;
  #router;

  constructor({ view, model, storyModel, router }) {
    this.#view = view;
    this.#userModel = model;
    this.#storyModel = storyModel;
    this.#dbModel = Database;
    this.#router = router;
  }

  async init() {
    if (!this.#userModel.isLoggedIn()) {
      const result = await this.#view.showLoginRequired();
      if (result.isConfirmed) {
        this.#router.navigateTo("/login");
      }
      return;
    }

    await this.#view.initMap();
    await this.#loadStories();
    this.#initBookmarkHandler();
  }

  async #loadStories() {
    const token = this.#userModel.getToken();
    const response = await this.#storyModel.getAllStories(token, 1);

    if (!response.error) {
      this.#view.displayStories(response.listStory);
    }
  }

  async #handleStoryClick(story) {
    this.#view._openStoryModal(story);
    await this.showBookmarkButton(story.id);
  }

  async showBookmarkButton(storyId) {
    if (await this.#isStoryBookmarked(storyId)) {
      this.#view.renderRemoveBookmarkButton();
      return;
    }
    this.#view.renderSaveBookmarkButton();
  }

  async #isStoryBookmarked(storyId) {
    try {
      const bookmark = await this.#dbModel.getBookmarkById(storyId);
      return !!bookmark;
    } catch (error) {
      console.error('Error checking if story is bookmarked:', error);
      return false;
    }
  }

  async saveBookmark(story) {
    try {
      await this.#dbModel.putBookmark(story);
      this.#view.showBookmarkSuccess();
      await this.showBookmarkButton(story.id);
    } catch (error) {
      console.error('Error saving bookmark:', error);
      this.#view.showBookmarkError('Gagal menyimpan bookmark');
    }
  }

  async removeBookmark(storyId) {
    try {
      await this.#dbModel.deleteBookmark(storyId);
      this.#view.showBookmarkRemoved();
      await this.showBookmarkButton(storyId);
    } catch (error) {
      console.error('Error removing bookmark:', error);
      this.#view.showBookmarkError('Gagal menghapus bookmark');
    }
  }

  #initBookmarkHandler() {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (!bookmarkBtn) {
      console.error('Bookmark button not found during initialization');
      return;
    }

    bookmarkBtn.addEventListener('click', async () => {
      const story = this.#view.getActiveStory();
      if (!story || !story.id) {
        console.error('No valid story found');
        return;
      }

      try {
        if (await this.#isStoryBookmarked(story.id)) {
          await this.removeBookmark(story.id);
        } else {
          await this.saveBookmark(story);
        }
      } catch (error) {
        console.error('Error handling bookmark:', error);
        this.#view.showBookmarkError('Gagal memproses bookmark');
      }
    });
  }
}

export default HomePagePresenter;
