<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>F1 Schedule</title>
    <link rel="stylesheet" href="resources/css/indexstyle.css" />
    <link rel="icon" href="resources/img/f1logo.svg" type="image/x-icon" />
  </head>
  <body>
    <header>
      <section class="nav-global">
        <nav class="global-nav" aria-label="Global Navigation Menu">
          <ul aria-label="Brand Links" class="g-brand-links">
            <li>
              <a href="https://www.fia.com/" target="_blank">
                <img
                  alt="FIA"
                  width="37"
                  height="25"
                  src="https://media.formula1.com/image/upload/f_auto,c_limit,w_55,q_auto/etc/designs/fom-website/images/fia_logo"
                />
              </a>
            </li>
            <li>
              <a href="https://www.fiaformula2.com/" target="_blank">
                <span>F1™</span>
              </a>
            </li>
            <li>
              <a href="https://www.fiaformula2.com/" target="_blank">
                <span>F2™</span>
              </a>
            </li>
            <li>
              <a href="https://www.fiaformula3.com/" target="_blank">
                <span>F3™</span>
              </a>
            </li>
            <li>
              <a href="https://www.f1academy.com/" target="_blank">
                <span>F1 ACADEMY™</span>
              </a>
            </li>
          </ul>

          <ul aria-label="Commercial Links" class="g-commercial-links">
            <li>
              <a
                class="commercial-link"
                href="https://www.f1authentics.com/"
                target="_blank"
                >Authentics</a
              >
            </li>
            <li>
              <a
                class="commercial-link"
                href="https://f1store.formula1.com/"
                target="_blank"
                >Store</a
              >
            </li>
            <li>
              <a
                class="commercial-link"
                href="https://tickets.formula1.com"
                target="_blank"
                >Tickets</a
              >
            </li>
            <li>
              <a
                class="commercial-link"
                href="https://tickets.formula1.com/en/h-formula1-hospitality"
                target="_blank"
                >Hospitality</a
              >
            </li>
            <li>
              <a
                class="commercial-link"
                href="https://f1experiences.com/"
                target="_blank"
                >Experiences</a
              >
            </li>
            <li>
              <a
                class="commercial-link"
                href="https://f1tv.formula1.com"
                target="_blank"
              >
                <img
                  alt="F1® TV"
                  width="75"
                  height="12"
                  src="https://media.formula1.com/image/upload/f_auto,c_limit,w_112,q_auto/nwp-navigation/f1-tv-logo"
                />
              </a>
            </li>
          </ul>

          <div class="g-auth-buttons">
            <a
              class="btn signin-btn"
              href="management.php"
            >
              <span class="icon-user"></span>
              <span>Sign In</span>
            </a>
            <a class="btn subscribe-btn" href="/subscribe-to-f1-tv">
              <span>Subscribe</span>
            </a>
          </div>
          <!-- Hamburger menu for mobile -->
          <button class="hamburger-menu" aria-label="Open menu" onclick="document.body.classList.add('menu-open');">
            ☰
          </button>
        </nav>
      </section>
      <section class="nav-main">
        <nav class="main-nav" aria-label="Main Navigation Menu">
        <div class="logo">
            <img
              src="https://media.formula1.com/image/upload/f_auto,c_limit,w_285,q_auto/f_auto/q_auto/fom-website/etc/designs/fom-website/images/F1_75_Logo"
              alt="F1 Logo"
            />
          </div>

          <ul class="nav-links">
            <li><a href="/main/index.html">latest</a></li>
            <li><a href="/video">Video</a></li>
            <li><a href="/f1-unlocked">F1 Unlocked</a></li>
            <li><a href="/schedule">Schedule</a></li>
            <li><a href="/results">Results</a></li>
            <li><a href="/drivers">Drivers</a></li>
            <li><a href="/teams">Teams</a></li>
            <li><a href="/gaming">Gaming</a></li>
            <li><a href="/live-timing">Live Timing</a></li>
          </ul>
        </nav>
      </section>
      <div class="overlay-menu">
        <div class="overlay-menu-content">
        <button class="close-overlay" aria-label="Close menu" onclick="document.body.classList.remove('menu-open')">&times;</button>
          <div class="logo">
            <img
              src="https://media.formula1.com/image/upload/f_auto,c_limit,w_285,q_auto/f_auto/q_auto/fom-website/etc/designs/fom-website/images/F1_75_Logo"
              alt="F1 Logo"
            />
          </div>

          <div class="overlay-global-nav">
            <h3>Formula 1 Family</h3>
            <ul class="brand-links">
              <li>
                <a href="/">
                  <img
                    src="resources/img/1024px-F1.png"
                    alt="F1®"
                    style="height:24px;"
                  />
                </a>
              </li>
              <li>
                <a href="https://www.fiaformula2.com/" target="_blank">
                  <img
                    src="resources/img/f2_logo.png"
                    alt="F2™"
                    style="height:24px;"
                  />
                </a>
              </li>
              <li>
                <a href="https://www.fiaformula3.com/" target="_blank">
                  <img
                    src="resources/img/f3_logo.png"
                    alt="F3™"
                    style="height:24px;"
                  />
                </a>
              </li>
              <li>
                <a href="https://www.f1academy.com/" target="_blank">
                  <img
                    src="resources/img/f1academy.png"
                    alt="F1 ACADEMY™"
                    style="height:24px;"
                  />
                </a>
              </li>
            </ul>

            <h3>Services</h3>
            <ul class="commercial-links">
              <li>
                <a href="https://f1store.formula1.com/en/" target="_blank"
                  >Store</a
                >
              </li>
              <li>
                <a href="https://tickets.formula1.com" target="_blank"
                  >Tickets</a
                >
              </li>
              <li>
                <a
                  href="https://tickets.formula1.com/en/h-formula1-hospitality"
                  target="_blank"
                  >Hospitality</a
                >
              </li>
              <li>
                <a href="https://www.f1authentics.com/" target="_blank"
                  >Authentics</a
                >
              </li>
              <li>
                <a href="https://f1experiences.com/" target="_blank"
                  >Experiences</a
                >
              </li>
            </ul>
          </div>

          <div class="overlay-main-nav">
            <h3>Navigation</h3>
            <ul class="nav-links">
              <li>Latest</li>
              <li>Video</li>
              <li>F1 Unlocked</li>
              <li>Schedule</li>
              <li>Results</li>
              <li>Drivers</li>
              <li>Teams</li>
              <li>Gaming</li>
              <li>Live Timing</li>
            </ul>
          </div>

          <div class="profile-links">
            <div class="sign-in-link">
              <a href="management.php">Sign In</a>
            </div>
            <div class="subscribe-link">
              <a href="/subscribe-to-f1-tv">Subscribe to F1 TV</a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="container">
      <section class="f1-header">
        <div class="f1-header-bar" style="padding: 8px 0">
          <hr
            style="border: none; border-top: 20px solid #e10600; margin: 0 0 4px 0;"
          />
        </div>
        <div class="f1-header-content">
          <div class="f1-header-title">
            <h1>F1 Schedule 2026</h1>
            <p>2026 FIA FORMULA ONE WORLD CHAMPIONSHIP™ RACE CALENDAR</p>
          </div>
        </div>
      </section>
      <section class="race-grid" id="raceGrid">
          <div class="race-container">
            <?php
            require_once 'connection.php';
            $result = $pdo->query("SELECT * FROM races    ORDER BY     date ASC");
            $round = 1;

            while ($row = $result->fetch    (PDO::FETCH_ASSOC)) {
              echo '<label class="race-flip">';
              echo '<input type="checkbox"    class="race-toggle" />';
            
              echo '<div class="race-card">';
              echo '<div class="front">';
            
              // Header
              echo '<div class="race-header">';
              echo '<div class="race-round">Round ' .     $round++ . '</div>';
              echo '<div class="race-date">📅 ' . date("d     M Y", strtotime($row['date'])) . '</div>';
              echo '</div>';
            
              // Location and Title
              echo '<div class="race-title">' . $row    ['title'] . '</div>';
              echo '<div class="race-location-title">';
              echo '<img class="race-flag" style="height:     24px;" src="resources/img/flags/' . $row    ['country'] . '.png" alt="Flag">';
              echo '<span class="race-title">' . $row   ['location'] . '</span>';
              echo '</div>';
            
              echo '<div class="race-full-title">' . $row   ['full_title'] . '</div>';
            
              echo '</div>'; // end .front
            
              // Back side (map)
              echo '<div class="back">';
              echo '<div class="map-preview-container">';
              echo '<iframe
                      width="100%"
                      height="140"
                      style="border:0"
                      loading="lazy"
                      allowfullscreen
                      referrerpolicy="no-referrer-when-down   grade"
                      src="https://www.google.com/maps?   q=' . $row['latitude'] . ',' . $row   ['longitude'] . '&hl=es;z=14&  output=embed">
                    </iframe>';
              echo '</div>';
              echo '</div>'; // end .back
            
              echo '</div>'; // end .race-card
              echo '</label>';
            }      
          ?>
        </div>
      </section>
    <script src="resources/js/index.js"></script>
    <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAAgY3Vew0LpTLCBR_Sg98TKXrW_8Yk_4o&libraries=places&callback=initMap"></script>
  </main>
  </body>
</html>