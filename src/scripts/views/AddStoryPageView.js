import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CONFIG from "../config.js";
import Swal from "sweetalert2";

class AddStoryPageView {
  constructor() {
    this._map = null;
    this._marker = null;
    this._selectedLocation = null;
    this._cameraStream = null;
    this._capturedPhoto = null;
    this._form = null;
    this._submitBtn = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <h1>Add New Story</h1>
        <form id="add-story-form">
          <label for="description">Description</label>
          <textarea id="description" required></textarea>

          <div class="photo-options">
            <div class="photo-option">
              <label for="photo"><i class="fas fa-upload"></i> Upload Photo</label>
              <input type="file" id="photo" accept="image/*">
            </div>
            <div class="photo-option">
              <label><i class="fas fa-camera"></i> Or Take Photo</label>
              <button type="button" id="start-camera-btn" class="camera-btn">
                <i class="fas fa-video"></i> Start Camera
              </button>
              <div id="camera-container" style="display:none;">
                <video id="camera-video" width="300" height="200" autoplay></video>
                <canvas id="camera-canvas" style="display:none;"></canvas>
                <br>
                <button type="button" id="capture-btn" class="camera-btn">
                  <i class="fas fa-camera"></i> Capture Photo
                </button>
                <button type="button" id="stop-camera-btn" class="camera-btn">
                  <i class="fas fa-stop"></i> Stop Camera
                </button>
              </div>
              <img id="photo-preview" style="display:none; max-width:300px; margin-top:10px;">
            </div>
          </div>

          <label for="map"><i class="fas fa-map-marker-alt"></i> Select Location on Map</label>
          <div id="map" style="height: 400px; margin-top: 20px;"></div>

          <button type="submit" id="submit-btn">
            <i class="fas fa-paper-plane"></i> Submit Story
          </button>
        </form>
      </section>
    `;
  }

  render(container) {
    container.innerHTML = this.getTemplate();
    this._initElements();
    return this;
  }

  _initElements() {
    this._form = document.getElementById("add-story-form");
    this._submitBtn = document.getElementById("submit-btn");
  }

  async initMap() {
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (this._map) {
      this._map.remove();
    }

    this._map = L.map("map", {
      center: CONFIG.DEFAULT_MAP_CENTER,
      zoom: CONFIG.DEFAULT_MAP_ZOOM,
      preferCanvas: true,
    });

    const openStreetMapLayer = L.tileLayer(CONFIG.MAP_TILE_URL, {
      attribution: CONFIG.MAP_ATTRIBUTION,
    });

    const cartoDBLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://carto.com/attributions">CartoDB</a>',
      },
    );

    const cartoDBDarkLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://carto.com/attributions">CartoDB</a>',
      },
    );

    const esriWorldImageryLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      },
    );

    L.control
      .layers({
        OpenStreetMap: openStreetMapLayer,
        "CartoDB Light": cartoDBLayer,
        "CartoDB Dark": cartoDBDarkLayer,
        "ESRI World Imagery": esriWorldImageryLayer,
      })
      .addTo(this._map);

    openStreetMapLayer.addTo(this._map);

    this._map.on("load", () => {
      this._map.invalidateSize();
    });

    window.addEventListener("resize", () => {
      if (this._map) {
        setTimeout(() => this._map.invalidateSize(), 100);
      }
    });

    const locationButton = L.control({ position: "topleft" });
    locationButton.onAdd = () => {
      const button = L.DomUtil.create(
        "button",
        "leaflet-bar leaflet-control leaflet-control-custom",
      );
      button.innerHTML =
        '<i class="fas fa-location-arrow" style="font-size: 16px; padding: 5px;"></i>';
      button.style.backgroundColor = "white";
      button.style.cursor = "pointer";
      button.title = "Show my location";

      button.onclick = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const latlng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              this._map.setView(latlng, 15);
              this.setMarker(latlng);
            },
            (error) => {
              console.error("Error getting location:", error);
              Swal.fire({
                title: "Location Error",
                text: "Could not get your location. Please check permissions.",
                icon: "error",
              });
            },
          );
        }
        return false;
      };

      return button;
    };
    locationButton.addTo(this._map);

    setTimeout(() => {
      this._map.invalidateSize();
    }, 100);
  }

  bindMapClick(handler) {
    this._map.off("click");

    this._map.on("click", (e) => {
      e.originalEvent.stopPropagation();
      handler(e.latlng);
    });
  }

  setMarker(latlng) {
    this._selectedLocation = latlng;

    if (this._marker) {
      this._map.removeLayer(this._marker);
    }

    const markerIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41],
    });

    this._marker = L.marker(latlng, {
      icon: markerIcon,
      draggable: true,
    }).addTo(this._map);

    this._marker
      .bindPopup(
        `
        <b>Selected Location</b><br>
        Latitude: ${latlng.lat.toFixed(4)}<br>
        Longitude: ${latlng.lng.toFixed(4)}
      `,
      )
      .openPopup();

    this._marker.on("dragend", (event) => {
      this._selectedLocation = event.target.getLatLng();
      this._marker.setPopupContent(`
        <b>Selected Location</b><br>
        Latitude: ${this._selectedLocation.lat.toFixed(4)}<br>
        Longitude: ${this._selectedLocation.lng.toFixed(4)}
      `);
      this._marker.openPopup();
    });
  }

  setupCamera() {
    const startCameraBtn = document.getElementById("start-camera-btn");
    const stopCameraBtn = document.getElementById("stop-camera-btn");
    const captureBtn = document.getElementById("capture-btn");
    const cameraContainer = document.getElementById("camera-container");
    const videoElement = document.getElementById("camera-video");
    const canvasElement = document.getElementById("camera-canvas");
    const photoPreview = document.getElementById("photo-preview");

    if (
      !startCameraBtn ||
      !stopCameraBtn ||
      !captureBtn ||
      !cameraContainer ||
      !videoElement ||
      !canvasElement ||
      !photoPreview
    ) {
      console.error("Camera elements not found");
      return;
    }

    startCameraBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        if (this._cameraStream) {
          this._stopCamera();
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }

        this._cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true, 
        });

        videoElement.srcObject = this._cameraStream;
        cameraContainer.style.display = "block";
        startCameraBtn.style.display = "none";
      } catch (error) {
        console.error("Camera error:", error);
        Swal.fire({
          title: "Camera Error",
          text: `Could not access the camera: ${error.message}. Please check permissions.`,
          icon: "error",
        });
      }
    });

    captureBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!this._cameraStream) return;

      const context = canvasElement.getContext("2d");
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      context.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height,
      );

      const imageData = canvasElement.toDataURL("image/jpeg");

      photoPreview.src = imageData;
      photoPreview.style.display = "block";

      const photoBlob = this.dataURLtoBlob(imageData);
      this._capturedPhoto = new File([photoBlob], "captured-photo.jpg", {
        type: "image/jpeg",
      });

      this._stopCamera();
      cameraContainer.style.display = "none";
      startCameraBtn.style.display = "block";
    });

    stopCameraBtn.addEventListener("click", (e) => {
      e.preventDefault(); 
      this._stopCamera();
      cameraContainer.style.display = "none";
      startCameraBtn.style.display = "block";
      photoPreview.style.display = "none";
    });
  }

  _stopCamera() {
    if (this._cameraStream) {
      this._cameraStream.getTracks().forEach((track) => track.stop());
      this._cameraStream = null;
    }
  }

  dataURLtoBlob(dataURL) {
    const [metadata, base64Data] = dataURL.split(",");
    const mimeType = metadata.match(/:(.*?);/)[1];
    const byteString = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([uintArray], { type: mimeType });
  }

  bindSubmitForm(handler) {
    this._form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.showLoading();

      const description = this._form.description.value;
      const filePhoto = this._form.photo.files[0];
      const photo = filePhoto || this._capturedPhoto;
      const location = this._selectedLocation;

      await handler(description, photo, location);
    });
  }

  showLoading() {
    this._submitBtn.disabled = true;
    this._submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Submitting...';
  }

  hideLoading() {
    this._submitBtn.disabled = false;
    this._submitBtn.innerHTML =
      '<i class="fas fa-paper-plane"></i> Submit Story';
  }

  showError(message) {
    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
    });
  }

  showSuccess() {
    return Swal.fire({
      title: "Success!",
      text: "Your story has been added successfully",
      icon: "success",
    });
  }

  getSelectedLocation() {
    return this._selectedLocation;
  }

  getCapturedPhoto() {
    return this._capturedPhoto;
  }
}

export default AddStoryPageView;
