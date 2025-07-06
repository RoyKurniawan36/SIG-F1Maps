// Optimized admin.js with duplicates removed
document.addEventListener("DOMContentLoaded", function () {
  const pageLinks = document.querySelectorAll(".pagelinks");
  const wrappers = document.querySelectorAll(".wrappers");
  const navTabs = document.querySelectorAll(".nav-tabs li");
  const isLoggedIn = document.querySelector(".logout-wrapper") !== null;

  // Hide all wrappers initially
  wrappers.forEach((wrapper) => (wrapper.style.display = "none"));

  // Set initial view based on login status
  if (isLoggedIn) {
    const myAccountWrapper = document.querySelector(".my-account-wrapper");
    if (myAccountWrapper) myAccountWrapper.style.display = "block";
    navTabs.forEach((li) => li.classList.remove("active"));
    const myAccountNav = document.querySelector(
      '.nav-tabs a[href="#my-account"]'
    );
    if (myAccountNav) myAccountNav.closest("li").classList.add("active");
  } else {
    const loginWrapper = document.querySelector(".login-wrapper");
    if (loginWrapper) loginWrapper.style.display = "block";
    navTabs.forEach((li) => li.classList.remove("active"));
    const loginNav = document.querySelector('.nav-tabs a[href="#login"]');
    if (loginNav) loginNav.closest("li").classList.add("active");
  }

  // Page navigation
  pageLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("href").substring(1);
      if (this.classList.contains("logout")) return;

      requestAnimationFrame(() => {
        wrappers.forEach((wrapper) => {
          wrapper.style.display = "none";
        });

        const targetWrapper = document.querySelector(`.${target}-wrapper`);
        if (targetWrapper) {
          targetWrapper.style.display = "block";
          if (target === "race-calendar") loadRaces();
        }

        navTabs.forEach((li) => li.classList.remove("active"));
        this.closest("li")?.classList.add("active");
      });
    });
  });

  // Toggle password visibility
  const eyeIcons = document.querySelectorAll(".eyeIcon");
  eyeIcons.forEach((icon) => {
    icon.addEventListener("click", function () {
      const input = this.previousElementSibling;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      this.classList.toggle("eyeShow", isHidden);
      this.classList.toggle("eyeHide", !isHidden);
    });
  });

  // Logout handler
  const logoutLink = document.querySelector(".logout");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        window.location.href = "logout.php";
      }
    });
  }
});

// Register form handler
document
  .getElementById("registerform")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const alertBox = form.querySelector(".alert-danger");
    const controlLabel = alertBox.querySelector(".control-label");

    formData.append("register_ajax", "1");

    const showError = (message) => {
      alertBox.style.display = "block";
      controlLabel.textContent = message;
    };

    try {
      const response = await fetch("management.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      if (result.trim() === "success") {
        document.getElementById("registerSuccessPopup").style.display = "flex";
        alertBox.style.display = "none";
      } else {
        showError(result);
      }
    } catch (err) {
      console.error("Registration error:", err);
      showError("Network error occurred. Please try again.");
    }
  });

// Login form handler
document
  .getElementById("loginform")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const alertBox = form.querySelector(".alert-danger");
    const controlLabel = alertBox.querySelector(".control-label");

    formData.append("login_ajax", "1");

    const showError = (message) => {
      alertBox.style.display = "block";
      controlLabel.textContent = message;
    };

    try {
      const response = await fetch("management.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      if (result.trim() === "success") {
        document.querySelectorAll(".wrappers").forEach((div) => {
          div.style.display = "none";
        });
        document.querySelector(".my-account-wrapper").style.display = "block";

        document
          .querySelectorAll(".nav-tabs li")
          .forEach((li) => li.classList.remove("active"));
        const myAccountNav = document.querySelector(
          '.nav-tabs a[href="#my-account"]'
        );
        if (myAccountNav) {
          myAccountNav.closest("li").classList.add("active");
        }

        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showError(result);
      }
    } catch (err) {
      console.error("Login error:", err);
      showError("Network error occurred. Please try again.");
    }
  });

// Race form handler
document
  .getElementById("raceForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    try {
      const res = await fetch("management.php", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      alert(json.message || "Saved.");
      closeRacePopup();
      if (typeof loadRaces === "function") loadRaces();
    } catch (err) {
      console.error("Race save error:", err);
      alert("Error saving race. Please try again.");
    }
  });

// Load races
async function loadRaces() {
  try {
    const response = await fetch("management.php", {
      method: "POST",
      body: new URLSearchParams({ get_races: 1 }),
    });
    const races = await response.json();
    const tbody = document.getElementById("raceTableBody");
    tbody.innerHTML = "";

    races.forEach((race) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${race.title}</td>
        <td>${race.date}</td>
        <td>${race.location}</td>
        <td><img src="resources/img/flags/${race.country}.png" alt="${race.country}" style="height: 20px;"> ${race.country}</td>
      `;

      // FIX: Store race data as a data attribute and use proper event handling
      tr.dataset.raceData = JSON.stringify(race);
      tr.style.cursor = "pointer";
      tr.addEventListener("click", function () {
        const raceData = JSON.parse(this.dataset.raceData);
        openRacePopup(raceData);
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Load races error:", err);
  }
}

// Race popup functions - IMPROVED VERSION with better map handling
function openRacePopup(race = null) {
  document.getElementById("racePopup").style.display = "flex";
  const form = document.getElementById("raceForm");

  if (race) {
    // Edit mode
    document.getElementById("popupTitle").textContent = "Edit Race";

    // Set the race_id field
    document.getElementById("race_id").value = race.id || race.race_id || "";

    // Set all other form fields
    Object.keys(race).forEach((key) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = race[key] || "";
      }
    });

    // Update flag preview if country is set
    if (race.country) {
      updateFlagPreview();
    }
  } else {
    // Add mode
    form.reset();
    document.getElementById("popupTitle").textContent = "Add New Race";
    document.getElementById("race_id").value = "";
  }

  // Enhanced map handling after popup is visible
  setTimeout(() => {
    if (typeof google !== "undefined" && window.map) {
      // Trigger map resize
      google.maps.event.trigger(window.map, "resize");

      // If editing and coordinates exist, center map and add marker
      if (race && race.latitude && race.longitude) {
        const lat = parseFloat(race.latitude);
        const lng = parseFloat(race.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          const position = { lat, lng };

          // Center the map on the race location
          window.map.setCenter(position);
          window.map.setZoom(12); // Good zoom level for race circuits

          // Remove existing marker if any
          if (window.marker) {
            window.marker.setMap(null);
          }

          // Create new marker with custom info
          window.marker = new google.maps.Marker({
            map: window.map,
            position: position,
            title: race.title || "Race Location",
            animation: google.maps.Animation.DROP, // Nice drop animation
          });

          // Optional: Add info window with race details
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #e10600;">${
                  race.title || "Race"
                }</h3>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${
                  race.location || "N/A"
                }</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${
                  race.date || "N/A"
                }</p>
                <p style="margin: 5px 0;"><strong>Country:</strong> ${
                  race.country || "N/A"
                }</p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;">
                  Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}
                </p>
              </div>
            `,
          });

          // Show info window when marker is clicked
          window.marker.addListener("click", () => {
            infoWindow.open(window.map, window.marker);
          });

          // Auto-open info window for a few seconds
          infoWindow.open(window.map, window.marker);
          setTimeout(() => {
            infoWindow.close();
          }, 3000);

          console.log(`Map centered on ${race.title}: ${lat}, ${lng}`);
        } else {
          console.log("Invalid coordinates for race:", race);
          // If coordinates are invalid, center on default location
          setDefaultMapLocation();
        }
      } else {
        // No race data or no coordinates, set default location
        setDefaultMapLocation();
      }
    } else {
      console.log("Google Maps not loaded yet");
    }
  }, 300);
}

function closeRacePopup() {
  document.getElementById("racePopup").style.display = "none";
}

function deleteRace() {
  const raceId = document.getElementById("race_id").value;
  if (!raceId) {
    alert("No race selected for deletion.");
    return;
  }

  if (confirm("Are you sure you want to delete this race?")) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "management.php", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        alert(xhr.responseText);
        closeRacePopup();
        loadRaces();
      }
    };
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(`delete_race=1&race_id=${raceId}`);
  }
}

function updateFlagPreview() {
  const select = document.getElementById("country");
  const flag = document.getElementById("flagImage");
  if (select && flag) {
    flag.src = `resources/img/flags/${select.value}.png`;
  }
}

// Google Maps functionality
let map, marker;

// Enhanced initMap function with better marker handling
function initMap() {
  const defaultLatLng = {
    lat: parseFloat(document.getElementById("latitude").value) || 0,
    lng: parseFloat(document.getElementById("longitude").value) || 0,
  };

  // Initialize the map
  window.map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLatLng,
    zoom: 12,
    mapTypeId: "roadmap",
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  });

  // Add traffic layer
  const trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(window.map);

  // Click on map to place marker
  window.map.addListener("click", function (e) {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (window.marker) {
      window.marker.setMap(null);
    }

    window.marker = new google.maps.Marker({
      map: window.map,
      position: e.latLng,
      animation: google.maps.Animation.DROP,
      title: "Selected Location",
    });

    document.getElementById("latitude").value = lat.toFixed(6);
    document.getElementById("longitude").value = lng.toFixed(6);

    console.log(`New marker placed at: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  });

  // Set up Places search
  const input = document.getElementById("searchBox");
  if (input) {
    const searchBox = new google.maps.places.SearchBox(input);

    // Update bounds on map change
    window.map.addListener("bounds_changed", () => {
      searchBox.setBounds(window.map.getBounds());
    });

    // When a place is selected
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
      if (!places || !places.length) return;

      const bounds = new google.maps.LatLngBounds();

      places.forEach((place) => {
        if (!place.geometry) return;

        if (window.marker) {
          window.marker.setMap(null);
        }

        window.marker = new google.maps.Marker({
          map: window.map,
          position: place.geometry.location,
          title: place.name || "Search Result",
          animation: google.maps.Animation.DROP,
        });

        document.getElementById("latitude").value = place.geometry.location
          .lat()
          .toFixed(6);
        document.getElementById("longitude").value = place.geometry.location
          .lng()
          .toFixed(6);

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });

      window.map.fitBounds(bounds);
    });
  }
}

// Make initMap globally available for Google Maps API
window.initMap = initMap;

function updateMapLocation() {
  const countrySelect = document.getElementById("country");
  const selectedOption = countrySelect.options[countrySelect.selectedIndex];
  const countryName = selectedOption.textContent.replace(/^[^\w]+ /, ""); // Remove flag

  const geocoder = new google.maps.Geocoder();
  const zoom = zoomLevels[countryName] || 6;

  geocoder.geocode({ address: countryName }, function (results, status) {
    if (status === "OK" && results[0]) {
      const location = results[0].geometry.location;

      // Smooth pan animation
      const currentCenter = window.map.getCenter();
      const targetCenter = location;
      const panSteps = 20;
      const panInterval = 20;
      let step = 0;

      const panAnimation = setInterval(() => {
        if (step >= panSteps) {
          clearInterval(panAnimation);
          window.map.setCenter(targetCenter);
          window.map.setZoom(zoom);
        } else {
          const lat =
            currentCenter.lat() +
            ((targetCenter.lat() - currentCenter.lat()) / panSteps) * step;
          const lng =
            currentCenter.lng() +
            ((targetCenter.lng() - currentCenter.lng()) / panSteps) * step;
          window.map.panTo({ lat, lng });
          step++;
        }
      }, panInterval);

      // Drop new marker
      if (window.marker) window.marker.setMap(null);
      window.marker = new google.maps.Marker({
        map: window.map,
        position: targetCenter,
        animation: google.maps.Animation.DROP,
        title: countryName,
      });

      // Update form fields
      document.getElementById("latitude").value = location.lat().toFixed(6);
      document.getElementById("longitude").value = location.lng().toFixed(6);
    } else {
      console.error("Geocode error: " + status);
    }
  });
}

// Global popup functions for registration success
function goToSubscription() {
  document.getElementById("registerSuccessPopup").style.display = "none";
  // Navigate to subscription page logic here
  document.querySelector(".subscription-wrapper").style.display = "block";
}

function closePopup() {
  document.getElementById("registerSuccessPopup").style.display = "none";
}

const zoomLevels = {
  Azerbaijan: 7,
  Australia: 4,
  Austria: 7,
  Bahrain: 10,
  Belgium: 8,
  Brazil: 4,
  Canada: 4,
  China: 5,
  Hungary: 6,
  Indonesia: 5,
  Italy: 6,
  Japan: 6,
  Mexico: 5,
  Monaco: 13,
  Netherlands: 7,
  New_Zealand: 5,
  Qatar: 10,
  Singapore: 12,
  South_Korea: 7,
  Spain: 6,
  United_Arab_Emirates: 9,
  United_Kingdom: 6,
  United_States: 4,
};

let selectedPlan = null;
let isYearly = false;

// Initialize subscription interface
document.addEventListener("DOMContentLoaded", function () {
  updatePriceDisplay();
  setupBillingToggle();
});
function setDefaultMapLocation() {
  const defaultPosition = { lat: 0, lng: 0 }; // or a real default
  window.map.setCenter(defaultPosition);
  window.map.setZoom(2); // Zoomed out world view
}

// Billing toggle functionality
function setupBillingToggle() {
  const toggle = document.getElementById("billingToggle");
  const monthlyLabel = document.getElementById("monthlyLabel");
  const yearlyLabel = document.getElementById("yearlyLabel");

  toggle.addEventListener("click", function () {
    isYearly = !isYearly;

    toggle.classList.toggle("active", isYearly);
    monthlyLabel.classList.toggle("active", !isYearly);
    yearlyLabel.classList.toggle("active", isYearly);

    updatePriceDisplay();

    // Update selected plan info if a plan is selected
    if (selectedPlan) {
      updateSelectedPlanInfo();
    }
  });
}

// Update price display based on billing cycle
function updatePriceDisplay() {
  const cards = document.querySelectorAll(".subscription-card");

  cards.forEach((card) => {
    const priceElement = card.querySelector(".plan-price");
    const periodElement = card.querySelector(".plan-period");
    if (periodElement) {
      periodElement.textContent = isYearly
        ? periodElement.getAttribute("data-yearly") || "per year"
        : periodElement.getAttribute("data-monthly") || "per month";
    }
  });
}

function selectPlan(planType) {
  // Deselect all cards first
  document.querySelectorAll(".subscription-card").forEach((card) => {
    card.classList.remove("selected");
  });

  // Select the clicked one
  const selectedCard = document.querySelector(
    `.subscription-card[data-type="${planType}"]`
  );
  if (!selectedCard) {
    console.warn("No subscription card found for type:", planType);
    return;
  }

  selectedCard.classList.add("selected");

  // Update selected info
  const billingToggle = document.getElementById("billingToggle");
  const isYearly = billingToggle?.classList.contains("yearly");

  const price = isYearly
    ? selectedCard.getAttribute("data-yearly")
    : selectedCard.getAttribute("data-monthly");

  document.getElementById("selectedPlanName").textContent =
    planType.charAt(0).toUpperCase() + planType.slice(1);
  document.getElementById("selectedPlanPrice").textContent = `$${price}`;
  document.getElementById("mainSubscribeBtn").disabled = false;

  // Set plan selection
  document.getElementById("mainSubscribeBtn").onclick = function () {
    fetch("management.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        update_subscription: 1,
        type: planType,
        billing_cycle: isYearly ? "yearly" : "monthly",
      }),
    })
      .then((res) => res.text())
      .then((result) => {
        if (result === "success") {
          alert("Subscription updated!");
          location.reload();
        } else {
          alert(result);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Something went wrong.");
      });
  };
}

// Update selected plan information
function updateSelectedPlanInfo() {
  const infoDiv = document.getElementById("selectedPlanInfo");
  const nameSpan = document.getElementById("selectedPlanName");
  const priceSpan = document.getElementById("selectedPlanPrice");

  if (selectedPlan) {
    const planNames = {
      basic: "Free",
      pro: "F1 TV Pro",
      ultimate: "F1 TV Ultimate",
    };

    const price = isYearly ? selectedPlan.yearly : selectedPlan.monthly;
    const period = isYearly ? "year" : "month";

    nameSpan.textContent = planNames[selectedPlan.type];
    priceSpan.textContent = price === 0 ? "Free" : `$${price}/${period}`;

    infoDiv.classList.add("show");
  } else {
    infoDiv.classList.remove("show");
  }
}

// Update main subscribe button
function updateSubscribeButton() {
  const btn = document.getElementById("mainSubscribeBtn");

  if (selectedPlan) {
    btn.disabled = false;

    if (selectedPlan.type === "basic") {
      btn.textContent = "Continue with Free Plan";
    } else {
      const price = isYearly ? selectedPlan.yearly : selectedPlan.monthly;
      const period = isYearly ? "year" : "month";
      btn.textContent = `Subscribe for $${price}/${period}`;
    }

    // Add click handler
    btn.onclick = function () {
      handleSubscription();
    };
  } else {
    btn.disabled = true;
    btn.textContent = "Select a Plan to Continue";
    btn.onclick = null;
  }
}

// Handle subscription process
function handleSubscription() {
  if (!selectedPlan) {
    alert("Please select a plan first.");
    return;
  }

  const planNames = {
    basic: "Free",
    pro: "F1 TV Pro",
    ultimate: "F1 TV Ultimate",
  };

  const price = isYearly ? selectedPlan.yearly : selectedPlan.monthly;
  const period = isYearly ? "yearly" : "monthly";
  const planName = planNames[selectedPlan.type];

  if (selectedPlan.type === "basic") {
    alert(
      `You've selected the ${planName} plan. Your account will continue with free access.`
    );
  } else {
    // In a real application, this would redirect to payment processing
    const confirmMessage =
      `Proceeding with ${planName} subscription:\n\n` +
      `Plan: ${planName}\n` +
      `Billing: ${period}\n` +
      `Price: $${price}/${isYearly ? "year" : "month"}\n\n` +
      `Continue to payment?`;

    if (confirm(confirmMessage)) {
      // Simulate subscription process
      alert(
        "Redirecting to secure payment...\n\n(In a real application, this would process the payment)"
      );

      // Here you would typically:
      // 1. Send subscription data to your backend
      // 2. Process payment through payment gateway
      // 3. Update user's subscription status
      // 4. Redirect to confirmation page

      console.log("Subscription data:", {
        plan: selectedPlan.type,
        price: price,
        billing: period,
        yearly: isYearly,
      });
    }
  }
}

// Add keyboard navigation
document.addEventListener("keydown", function (e) {
  if (
    e.key === "Enter" &&
    document.activeElement.classList.contains("subscription-card")
  ) {
    const planType = document.activeElement.getAttribute("data-type");
    selectPlan(planType);
  }
});

// Make cards focusable for accessibility
document.querySelectorAll(".subscription-card").forEach((card) => {
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute(
    "aria-label",
    `Select ${card.querySelector(".plan-name").textContent} plan`
  );
});

document
  .getElementById("cancelBtn")
  ?.addEventListener("click", async function () {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    try {
      const response = await fetch("management.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ cancel_subscription: 1 }),
      });

      const result = await response.text();

      if (result.trim() === "success") {
        alert("Subscription successfully cancelled.");
        location.reload();
      } else {
        alert("Failed to cancel: " + result);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("An error occurred. Try again.");
    }
  });

document.getElementById("upgradeBtn")?.addEventListener("click", function () {
  const subscriptionTab = document.querySelector(".pagelinks.subscription");

  if (subscriptionTab) {
    // Simulate tab click
    subscriptionTab.click();

    // Set active class manually
    document
      .querySelectorAll(".nav-tabs li")
      .forEach((li) => li.classList.remove("active"));
    subscriptionTab.closest("li").classList.add("active");
  }
});

async function loadLogs() {
  const logContainer = document.getElementById("logContent");

  if (!logContainer) return;

  try {
    const res = await fetch("admin/get_logs.php");
    const text = await res.text();
    logContainer.textContent = text;
    logContainer.scrollTop = logContainer.scrollHeight;
  } catch (err) {
    logContainer.textContent = "⚠️ Failed to load logs.";
    console.error("Log fetch error:", err);
  }
}

document
  .querySelector(".pagelinks.order-history")
  ?.addEventListener("click", loadLogs);
document.getElementById("refreshLogsBtn")?.addEventListener("click", loadLogs);

document
  .getElementById("openProfileEditorBtn")
  ?.addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("profileEditorOverlay").style.display = "flex";
  });

function closeProfileEditor() {
  document.getElementById("profileEditorOverlay").style.display = "none";
}

document
  .getElementById("profileEditorForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });
      const result = await response.text();

      if (result === "success") {
        alert("Profile updated successfully!");
        // Optionally reload or close the modal
      } else {
        document.querySelector(".alert-danger .control-label").textContent =
          result;
        document.querySelector(".alert-danger").style.display = "block";
      }
    } catch (error) {
      console.error("Error:", error);
      document.querySelector(".alert-danger .control-label").textContent =
        "Unexpected error occurred.";
      document.querySelector(".alert-danger").style.display = "block";
    }
  });

document
  .getElementById("openResetPassword")
  .addEventListener("click", function () {
    document.querySelector(".profile-editor-wrapper").style.display = "none";
    document.querySelector(".forgetPassword-wrapper").style.display = "block";
  });

// Optional: handle "Back to Sign In" link
document.querySelector(".backtologin").addEventListener("click", function (e) {
  e.preventDefault();
  document.querySelector(".forgetPassword-wrapper").style.display = "none";
  document.querySelector(".login-wrapper").style.display = "block"; // Change as per your actual login wrapper class
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("forgetPasswordForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      const result = await response.text();

      if (result.trim() === "success") {
        alert("Password successfully reset!");
        closeForgotPassword(); // Optional: hide the popup
      } else {
        alert(result); // Show error from PHP
      }
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Forgot password link inside profile editor
  const forgotLink = document.getElementById("openForgotPasswordFromProfile");
  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("profileEditorOverlay").style.display = "none";
      document.getElementById("forgotPasswordOverlay").style.display = "block";
    });
  }

  // Back to sign in link inside forgot password form
  const backToLoginBtn = document.querySelector(".backtologin");
  if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      backToLoginFromForgot();
    });
  }
});

function closeForgotPassword() {
  backToLoginFromForgot();
}

function backToLoginFromForgot() {
  // Hide the forgot password popup
  document.getElementById("forgotPasswordOverlay").style.display = "none";

  // Show login wrapper
  document.querySelector(".login-wrapper").style.display = "block";

  // Restore "active" tab on header
  const loginTab = document.querySelector("a.pagelinks.login")?.parentElement;
  const registerTab = document.querySelector(
    "a.pagelinks.register"
  )?.parentElement;

  if (loginTab) loginTab.classList.add("active");
  if (registerTab) registerTab.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", function () {
  const resetForm = document.getElementById("forgetPasswordForm");
  const newPassword = document.getElementById("new-password");
  const confirmPassword = document.getElementById("confirm-password");

  resetForm.addEventListener("submit", function (e) {
    // Clear previous error styles
    newPassword.classList.remove("input-error");
    confirmPassword.classList.remove("input-error");

    // Check if passwords match
    if (newPassword.value !== confirmPassword.value) {
      e.preventDefault(); // Stop form submission

      // Add error styles or messages
      confirmPassword.classList.add("input-error");

      // Show alert or custom message
      alert("Passwords do not match. Please confirm your password.");
    }
  });
});
