import UrlParser from "../routes/url-parser.js";
import routes from "../routes/routes.js";
import Swal from "sweetalert2";
import { isServiceWorkerAvailable } from "../utils";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";
import NotFoundPage from "../pages/NotFoundPage.js";

class App {
  constructor({
    content,
    loginItem,
    logoutItem,
    hamburgerBtn,
    navList,
    supportsViewTransitions = false,
    prefersReducedMotion = false,
  }) {
    this._content = content;
    this._loginItem = loginItem;
    this._logoutItem = logoutItem;
    this._hamburgerBtn = hamburgerBtn;
    this._navList = navList;
    this._supportsViewTransitions = supportsViewTransitions;
    this._prefersReducedMotion = prefersReducedMotion;
    this._addHamburgerListener();
    this._isTransitioning = false;
  }

  async #setupPushNotification() {
    const notificationItem = document.getElementById("notification-item");
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    // Only one button/link at a time
    if (notificationItem) {
      notificationItem.style.display = "block";

      // Remove old button/link
      const existingButton = notificationItem.querySelector(".subscribe-button, .unsubscribe-button, .notification-button, button, a");
      if (existingButton) {
        existingButton.remove();
      }

      if (isSubscribed) {
        // Unsubscribe link
        const unsubscribeLink = document.createElement("a");
        unsubscribeLink.id = "unsubscribe-button";
        unsubscribeLink.className = "unsubscribe-button";
        unsubscribeLink.href = "#";
        unsubscribeLink.innerHTML = `<i class='fas fa-bell-slash'></i> Unsubscribe`;
        notificationItem.appendChild(unsubscribeLink);
        unsubscribeLink.addEventListener("click", (e) => {
          e.preventDefault();
          unsubscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
      } else {
        // Subscribe link
        const subscribeLink = document.createElement("a");
        subscribeLink.id = "notification-button";
        subscribeLink.className = "subscribe-button";
        subscribeLink.href = "#";
        subscribeLink.innerHTML = `<i class='fas fa-bell'></i> Subscribe`;
        notificationItem.appendChild(subscribeLink);
        subscribeLink.addEventListener("click", (e) => {
          e.preventDefault();
          subscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
      }
    }
  }

  async renderPage() {
    if (this._isTransitioning) return;
    this._isTransitioning = true;

    const url = UrlParser.parseActiveUrlWithCombiner();
    let page = routes[url];

    // Jika tidak ada page, gunakan NotFoundPage
    if (!page) {
      page = NotFoundPage;
    }

    const token = localStorage.getItem("user-token");

    try {
      if (this._supportsViewTransitions && !this._prefersReducedMotion) {
        const transition = document.startViewTransition(async () => {
          await this._renderPageContent(page, token);
        });

        await transition.finished;
      } else {
        await this._renderPageContent(page, token);
      }
    } catch (error) {
      console.error("Page transition error:", error);

      await this._renderPageContent(page, token);
    } finally {
      this._isTransitioning = false;
    }

    if (isServiceWorkerAvailable()) {
      this.#setupPushNotification();
    }
  }

  async _renderPageContent(page, token) {
    const pageInstance = new page();
    await pageInstance.render(this._content);
    await pageInstance.afterRender();
    this._handleLoginLogout(token);
  }

  _handleLoginLogout(token) {
    if (token) this._showLogoutItem();
    else this._showLoginItem();
  }

  _showLoginItem() {
    this._loginItem.style.display = "block";
    this._logoutItem.style.display = "none";
  }

  _showLogoutItem() {
    this._loginItem.style.display = "none";
    this._logoutItem.style.display = "block";
    this._logoutItem.onclick = (event) => {
      event.preventDefault();
      this._handleLogout();
    };
  }

  _showNavList() {
    const token = localStorage.getItem("user-token");
    Swal.fire({
      title: "Navigation Menu",
      html: `
        <div class="mobile-nav-container">
          <a href="#/" class="mobile-nav-link">Home</a>
          <a href="#/add-story" class="mobile-nav-link">Add Story</a>
          <a href="#/saved-stories" class="mobile-nav-link">Saved Stories</a>
          <a href="#" id="mobile-subscribe-btn" class="mobile-nav-link"><i class="fas fa-bell"></i> <span id="mobile-subscribe-text">Subscribe</span></a>
          ${
            token
              ? '<a href="#" id="mobile-logout-btn" class="mobile-nav-link">Logout</a>'
              : '<a href="#/login" class="mobile-nav-link">Login</a>'
          }
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      background: "#f8f9fa",
      width: "80%",
      padding: "0",
      willOpen: async () => {
        if (token) {
          document
            .getElementById("mobile-logout-btn")
            ?.addEventListener("click", (e) => {
              e.preventDefault();
              Swal.close();
              this._handleLogout();
            });
        }
        // Subscribe event
        const subscribeBtn = document.getElementById("mobile-subscribe-btn");
        const subscribeText = document.getElementById("mobile-subscribe-text");
        if (subscribeBtn && subscribeText) {
          const isSubscribed = await isCurrentPushSubscriptionAvailable();
          subscribeText.textContent = isSubscribed ? "Unsubscribe" : "Subscribe";
          subscribeBtn.querySelector("i").className = isSubscribed ? "fas fa-bell-slash" : "fas fa-bell";
          subscribeBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (await isCurrentPushSubscriptionAvailable()) {
              await unsubscribe();
              Swal.fire({
                title: 'Success!',
                text: 'Unsubscribed from notifications.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
            } else {
              await subscribe();
              Swal.fire({
                title: 'Success!',
                text: 'Subscribed to notifications.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
              });
            }
            Swal.close();
          });
        }
      },
    });
  }

  _handleLogout() {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user-token");
        Swal.fire({
          title: "Logged out",
          text: "You have successfully logged out.",
          icon: "success",
        }).then(() => {
          window.location.hash = "#/";
          this._updateAuthUI();
        });
      }
    });
  }

  _updateAuthUI() {
    const token = localStorage.getItem("user-token");
    this._handleLoginLogout(token);
  }

  _addHamburgerListener() {
    this._hamburgerBtn.addEventListener("click", () => {
      this._showNavList();
    });
  }
}

export default App;
