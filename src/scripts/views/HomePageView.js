import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CONFIG from "../config.js";
import Swal from "sweetalert2";
import "leaflet.markercluster";
import Database from "../data/database.js";

class HomePageView {
  constructor() {
    this._map = null;
    this._markers = [];
    this._markerCluster = null;
    this._storyModal = null;
    this._activeStory = null;
  }

  getTemplate() {
    return `
      <section class="container">
        <h1>Story Locations</h1>
        
        <div class="map-controls">
          <button class="map-control-btn" id="fit-markers-btn">
            <i class="fas fa-expand-arrows-alt"></i> Fit All Markers
          </button>
          <button class="map-control-btn" id="toggle-cluster-btn">
            <i class="fas fa-object-group"></i> Toggle Clustering
          </button>
        </div>
        
        <div class="map-container">
          <div id="map"></div>
        </div>
        
        <div id="stories-list" class="stories-section">
          <h2>Recent Stories</h2>
          <div class="stories-grid" id="stories-grid">
            <div class="loading-indicator">
              <div class="loading-spinner"></div>
            </div>
          </div>
        </div>
        
        <div id="story-modal" class="story-modal">
          <div class="modal-content">
            <button class="close-modal" id="close-modal">
              <i class="fas fa-times"></i>
            </button>
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23999'%3ENo Image Available%3C/text%3E%3C/svg%3E" alt="No image available" class="modal-image" id="modal-image">
            <div class="modal-details">
              <h2 id="modal-title"></h2>
              <p id="modal-description"></p>
              <div class="modal-meta">
                <span id="modal-author"></span>
                <span id="modal-date"></span>
                <button class="bookmark-btn" id="bookmark-btn">
                  <i class="fas fa-bookmark"></i> Bookmark
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  render(container) {
    container.innerHTML = this.getTemplate();
    this._initElements();
    return this;
  }

  _initElements() {
    this._storyModal = document.getElementById("story-modal");
    this._closeModalBtn = document.getElementById("close-modal");
    this._fitMarkersBtn = document.getElementById("fit-markers-btn");
    this._toggleClusterBtn = document.getElementById("toggle-cluster-btn");

    if (this._closeModalBtn) {
      this._closeModalBtn.addEventListener("click", () => {
        this._closeStoryModal();
      });
    }

    if (this._fitMarkersBtn) {
      this._fitMarkersBtn.addEventListener("click", () => {
        this._fitMapToMarkers();
      });
    }

    if (this._toggleClusterBtn) {
      this._toggleClusterBtn.addEventListener("click", () => {
        this._toggleClustering();
      });
    }

    window.addEventListener("click", (e) => {
      if (e.target === this._storyModal) {
        this._closeStoryModal();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this._storyModal.classList.contains("active")) {
        this._closeStoryModal();
      }
    });
  }

  async initMap() {
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (this._map) {
      this._map.remove();
      this._markers = [];
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

    const stamenTonerLayer = L.tileLayer(
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png",
      {
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: "abcd",
      },
    );

    this._markerCluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
    });

    L.control
      .layers(
        {
          OpenStreetMap: openStreetMapLayer,
          "CartoDB Light": cartoDBLayer,
          "CartoDB Dark": cartoDBDarkLayer,
          "ESRI World Imagery": esriWorldImageryLayer,
          "Stamen Toner": stamenTonerLayer,
        },
        {
          "Marker Clusters": this._markerCluster,
        },
      )
      .addTo(this._map);

    openStreetMapLayer.addTo(this._map);
    this._markerCluster.addTo(this._map);

    this._map.on("load", () => {
      this._map.invalidateSize();
    });

    window.addEventListener("resize", () => {
      if (this._map) {
        setTimeout(() => this._map.invalidateSize(), 100);
      }
    });
  }

  showLoginRequired() {
    return Swal.fire({
      title: "You need to login first!",
      text: "Please login to access the story locations.",
      icon: "warning",
      confirmButtonText: "Go to Login",
    });
  }

  displayStories(stories) {
    if (!stories || stories.length === 0) {
      console.log("No stories available.");
      document.getElementById("stories-grid").innerHTML = `
        <div class="no-stories">
          <p>No stories available. Be the first to share your story!</p>
        </div>
      `;
      return;
    }

    this._markers = [];
    this._markerCluster.clearLayers();

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const markerIcon = L.icon({
          iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [0, -41],
        });

        const marker = L.marker([story.lat, story.lon], { icon: markerIcon })
          .bindPopup(`
            <div style="text-align: center;">
              <h3>${story.name}</h3>
              <img src="${story.photoUrl}" alt="${story.description}" width="150" />
              <p>${story.description}</p>
              <p>Created: ${new Date(story.createdAt).toLocaleDateString()}</p>
            </div>
          `);

        this._markers.push(marker);
        this._markerCluster.addLayer(marker);

        marker.on("click", () => {
          this._openStoryModal(story);
        });
      }
    });

    if (this._markers.length > 0) {
      this._fitMapToMarkers();
    }

    const storiesGrid = document.getElementById("stories-grid");
    storiesGrid.innerHTML = stories
      .map((story) => this._createStoryCard(story))
      .join("");

    const storyCards = document.querySelectorAll(".story-card");
    storyCards.forEach((card, index) => {
      card.addEventListener("click", () => {
        this._openStoryModal(stories[index]);
      });
    });
  }

  _createStoryCard(story) {
    return `
      <div class="story-card" data-id="${story.id}" style="view-transition-name: story-card-${story.id}">
        <div class="story-image-container">
          <img src="${story.photoUrl}" alt="${story.description}" class="story-image" data-id="${story.id}" style="view-transition-name: story-image-${story.id}">
        </div>
        <div class="story-content">
          <h3>${story.name}</h3>
          <p>${story.description.length > 100 ? story.description.substring(0, 100) + "..." : story.description}</p>
          <div class="story-meta">
            <span class="story-date">${new Date(story.createdAt).toLocaleDateString()}</span>
            ${
              story.lat && story.lon
                ? `
              <span class="story-location">
                <i class="fas fa-map-marker-alt"></i> Map Location
              </span>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;
  }

  async _openStoryModal(story) {
    this._activeStory = story;

    const modalImage = document.getElementById("modal-image");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalAuthor = document.getElementById("modal-author");
    const modalDate = document.getElementById("modal-date");
    const bookmarkBtn = document.getElementById("bookmark-btn");

    modalImage.src = story.photoUrl;
    modalImage.alt = story.description;
    modalTitle.textContent = story.name;
    modalDescription.textContent = story.description;
    modalAuthor.textContent = `By: ${story.name}`;
    modalDate.textContent = `Posted: ${new Date(story.createdAt).toLocaleDateString()}`;

    // Check bookmark status from IndexedDB
    try {
      const bookmark = await Database.getBookmarkById(story.id);
      if (bookmark) {
        this.renderRemoveBookmarkButton();
      } else {
        this.renderSaveBookmarkButton();
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      this.renderSaveBookmarkButton();
    }

    const existingButton = document.getElementById("focus-map-btn");
    if (existingButton) {
      existingButton.remove();
    }

    if (story.lat && story.lon) {
      const focusMapBtn = document.createElement("button");
      focusMapBtn.id = "focus-map-btn";
      focusMapBtn.className = "map-control-btn";
      focusMapBtn.innerHTML = `<i class="fas fa-map-marker-alt"></i> Show on Map`;
      focusMapBtn.addEventListener("click", () => {
        this._closeStoryModal();
        this._focusOnStory(story);
      });

      modalDescription.parentNode.insertBefore(
        focusMapBtn,
        modalDescription.nextSibling,
      );
    }

    if (
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.startViewTransition(() => {
        this._storyModal.classList.add("active");
      });
    } else {
      this._storyModal.classList.add("active");
    }
  }

  _closeStoryModal() {
    if (
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.startViewTransition(() => {
        this._storyModal.classList.remove("active");
      });
    } else {
      this._storyModal.classList.remove("active");
    }
  }

  _focusOnStory(story) {
    if (story.lat && story.lon) {
      this._map.setView([story.lat, story.lon], 14, {
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        duration: 1,
      });

      this._markers.forEach((marker) => {
        const markerLatLng = marker.getLatLng();
        if (markerLatLng.lat === story.lat && markerLatLng.lng === story.lon) {
          marker.openPopup();
        }
      });
    }
  }

  _fitMapToMarkers() {
    if (this._markers.length > 0) {
      const group = L.featureGroup(this._markers);
      this._map.fitBounds(group.getBounds(), {
        padding: [50, 50],
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        duration: 0.5,
      });
    }
  }

  _toggleClustering() {
    if (this._map.hasLayer(this._markerCluster)) {
      this._map.removeLayer(this._markerCluster);
      this._markers.forEach((marker) => marker.addTo(this._map));
    } else {
      this._markers.forEach((marker) => this._map.removeLayer(marker));
      this._markerCluster.clearLayers();
      this._markers.forEach((marker) => this._markerCluster.addLayer(marker));
      this._map.addLayer(this._markerCluster);
    }
  }

  getActiveStory() {
    return this._activeStory;
  }

  updateBookmarkButtonState(isBookmarked) {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (!bookmarkBtn) {
      console.error('Bookmark button not found');
      return;
    }

    if (isBookmarked) {
      this.renderRemoveBookmarkButton();
    } else {
      this.renderSaveBookmarkButton();
    }
  }

  renderSaveBookmarkButton() {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (!bookmarkBtn) {
      console.error('Bookmark button not found');
      return;
    }

    bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i> Save Story';
    bookmarkBtn.classList.remove('bookmarked');
    bookmarkBtn.classList.add('btn', 'btn-transparent');
  }

  renderRemoveBookmarkButton() {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (!bookmarkBtn) {
      console.error('Bookmark button not found');
      return;
    }

    bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Remove Story';
    bookmarkBtn.classList.add('bookmarked', 'btn', 'btn-transparent');
  }

  showBookmarkSuccess() {
    Swal.fire({
      title: 'Success!',
      text: 'Story has been saved to bookmarks',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  }

  showBookmarkRemoved() {
    Swal.fire({
      title: 'Success!',
      text: 'Story has been removed from bookmarks',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  }

  showBookmarkError(message) {
    Swal.fire({
      title: 'Error!',
      text: message || 'Failed to process bookmark',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}

export default HomePageView;
