// Close overlay when clicking outside or pressing Escape
document.addEventListener("click", function (e) {
  const overlay = document.querySelector(".overlay-menu");
  const toggleButton = document.querySelector(".nav-toggle");

  if (
    document.body.classList.contains("menu-open") &&
    !overlay.contains(e.target) &&
    !toggleButton.contains(e.target)
  ) {
    document.body.classList.remove("menu-open");
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
    document.body.classList.remove("menu-open");
  }
});

let currentPreviewMap = null;

function showMapPreview(cardElement, lat, lng) {
  const container = cardElement.querySelector(".map-preview-container");
  const mapDiv = container.querySelector(".map-preview");
  container.style.display = "block";

  // Optional: Reset existing map instance
  mapDiv.innerHTML = ""; // Clear any old map content

  // ✅ Create new map preview
  currentPreviewMap = new google.maps.Map(mapDiv, {
    center: { lat: lat, lng: lng },
    zoom: 10,
    disableDefaultUI: true,
  });

  new google.maps.Marker({
    position: { lat: lat, lng: lng },
    map: currentPreviewMap,
  });
}

function hideMapPreview(cardElement) {
  const container = cardElement.querySelector(".map-preview-container");
  container.style.display = "none";
  container.querySelector(".map-preview").innerHTML = ""; // Destroy the map content
}
let mapViewEnabled = false;
let mapsInitialized = false;

function toggleAllViews() {
  const button = document.getElementById("toggleViewBtn");
  const cards = document.querySelectorAll(".race-card");

  mapViewEnabled = !mapViewEnabled;

  cards.forEach((card) => {
    const details = card.querySelector(".race-details");
    const mapContainer = card.querySelector(".map-preview-container");
    const mapDiv = card.querySelector(".map-preview");

    if (mapViewEnabled) {
      details.style.display = "none";
      mapContainer.style.display = "block";

      // Initialize map only once per card
      if (!mapDiv.dataset.initialized) {
        const lat = parseFloat(card.dataset.lat);
        const lng = parseFloat(card.dataset.lng);

        const map = new google.maps.Map(mapDiv, {
          center: { lat, lng },
          zoom: 10,
          disableDefaultUI: true,
        });

        new google.maps.Marker({
          position: { lat, lng },
          map: map,
        });

        mapDiv.dataset.initialized = "true";
      }
    } else {
      details.style.display = "block";
      mapContainer.style.display = "none";
    }
  });

  button.textContent = mapViewEnabled ? "Show Race Details" : "Show Map View";
}
