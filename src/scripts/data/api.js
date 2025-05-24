import CONFIG from "../config.js";

const API = {
  async loginUser(email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error logging in:", error);
      return { error: true, message: "Login failed" };
    }
  },

  async registerUser(name, email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    } catch (error) {
      console.error("Error registering:", error);
      return { error: true, message: "Registration failed" };
    }
  },

  async getAllStories(token, location = 0, page = 1, size = 10) {
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/stories?location=${location}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching stories:", error);
      return { error: true, message: "Failed to fetch stories" };
    }
  },

  async addNewStory(description, photo, lat, lon, token) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);

    if (lat && lon) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    } catch (error) {
      console.error("Error adding story:", error);
      return { error: true, message: "Failed to add story" };
    }
  },

  async addNewStoryGuest(description, photo, lat, lon) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);

    if (lat && lon) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
        method: "POST",
        body: formData,
      });
      return response.json();
    } catch (error) {
      console.error("Error adding story:", error);
      return { error: true, message: "Failed to add story" };
    }
  },
};

function getAccessToken() {
  try {
    const accessToken = localStorage.getItem("user-token");

    if (!accessToken) {
      console.error('getAccessToken: error - token not found');
      return null;  // Jika token tidak ada, kembalikan null
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;  // Jika terjadi error, kembalikan null
  }
}

// Fungsi untuk subscribe ke push notification
export async function subscribePushNotification({
  endpoint,
  keys: { p256dh, auth },
}) {
  const accessToken = getAccessToken();  // Ambil token dari localStorage

  if (!accessToken) {
    alert("Tidak ada token akses. Anda harus login terlebih dahulu.");
    return;
  }

  const data = JSON.stringify({
    endpoint,  // Endpoint untuk push notification
    keys: { p256dh, auth },  // Key p256dh dan auth dari subscription
  });

  try {
    const fetchResponse = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {  // URL sesuai dokumentasi
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,  // Gunakan token di header Authorization
      },
      body: data,  // Kirim data subscription
    });

    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,  // status dari response, true jika berhasil
    };
  } catch (error) {
    console.error("subscribePushNotification error:", error);
    return {
      error: true,
      message: "Gagal berlangganan push notification",
    };
  }
}

// Fungsi untuk unsubscribe dari push notification
export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();  // Ambil token dari localStorage

  if (!accessToken) {
    alert("Tidak ada token akses. Anda harus login terlebih dahulu.");
    return;
  }

  const data = JSON.stringify({ endpoint });  // Kirim endpoint untuk unsubscribe

  try {
    const fetchResponse = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {  // URL sesuai dokumentasi
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,  // Gunakan token di header Authorization
      },
      body: data,  // Data endpoint untuk unsubscribe
    });

    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,  
    };
  } catch (error) {
    console.error("unsubscribePushNotification error:", error);
    return {
      error: true,
      message: "Gagal membatalkan langganan push notification",
    };
  }
}

export default API;
