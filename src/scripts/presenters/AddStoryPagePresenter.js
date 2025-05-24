import { isCurrentPushSubscriptionAvailable } from "../utils/notification-helper";

class AddStoryPagePresenter {
  constructor({ view, userModel, storyModel, router }) {
    this._view = view;
    this._userModel = userModel;
    this._storyModel = storyModel;
    this._router = router;
  }

  async init() {
    await this._view.initMap();
    this._view.setupCamera();
    this._view.bindMapClick(this._handleMapClick.bind(this));
    this._view.bindSubmitForm(this._handleSubmit.bind(this));
  }

  _handleMapClick(latlng) {
    this._view.setMarker(latlng);
  }

  async _handleSubmit(description, photo, location) {
    try {
      if (!photo) {
        throw new Error("Please provide a photo");
      }

      const lat = location?.lat;
      const lon = location?.lng;
      const token = this._userModel.getToken();

      const result = token
        ? await this._storyModel.addNewStory(
            description,
            photo,
            lat,
            lon,
            token
          )
        : await this._storyModel.addNewStoryGuest(description, photo, lat, lon);

      if (result.error) {
        throw new Error(result.message);
      }

      await this._view.showSuccess();
      this._router.navigateTo("/");
    } catch (error) {
      this._view.showError(error.message);
    } finally {
      this._view.hideLoading();
    }
  }
}

export default AddStoryPagePresenter;
