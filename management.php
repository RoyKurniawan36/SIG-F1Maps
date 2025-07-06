<?php
require_once 'connection.php';
session_start();

function log_session_event($message, $level = 'INFO') {
  if (!isset($_SESSION['log'])) {
      $_SESSION['log'] = [];
  }

  $timestamp = date('Y-m-d H:i:s');
  $_SESSION['log'][] = "[$timestamp] [$level] $message";

  // Limit log length in memory
  if (count($_SESSION['log']) > 500) {
      $_SESSION['log'] = array_slice($_SESSION['log'], -500);
  }
}

// AJAX registration
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["register_ajax"])) {
    $name = trim($_POST["name"] ?? "");
    $email = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
    $password = $_POST["password"] ?? "";
    $errors = [];

    if (empty($name)) {
        $errors[] = "Name is required.";
    } elseif (strlen($name) < 2) {
        $errors[] = "Name must be at least 2 characters.";
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Valid email address is required.";
    }

    if (empty($password)) {
        $errors[] = "Password is required.";
    } elseif (strlen($password) < 6) {
        $errors[] = "Password must be at least 6 characters.";
    }

    if (!empty($errors)) {
        echo $errors[0];
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    try {
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $checkStmt->execute([$email]);

        if ($checkStmt->fetch()) {
            echo "Email already registered.";
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())");
        $result = $stmt->execute([$name, $email, $hashedPassword]);

        if ($result) {
            $userId = $pdo->lastInsertId();
            $_SESSION["user_id"] = $userId;
            $_SESSION["user_name"] = $name;
            $_SESSION["user_email"] = $email;
            $_SESSION["login_time"] = time();
            echo "success";
        } else {
            echo "Registration failed. Please try again.";
        }
    } catch (PDOException $e) {
        error_log("Registration error: " . $e->getMessage());
        echo "Registration failed. Please try again.";
    }
    exit;
}

// AJAX login
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["login_ajax"])) {
    $email = filter_var(trim($_POST["email"] ?? ""), FILTER_SANITIZE_EMAIL);
    $password = $_POST["password"] ?? "";

    if (empty($email) || empty($password)) {
        echo "Please fill in both fields.";
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user["password"])) {
            $_SESSION["user_id"] = $user["id"];
            $_SESSION["user_name"] = $user["name"];
            $_SESSION["user_email"] = $user["email"];
            $_SESSION["login_time"] = time();
            echo "success";
        } else {
            echo "Incorrect email or password.";
        }
    } catch (PDOException $e) {
        error_log("Login error: " . $e->getMessage());
        echo "Login failed. Please try again.";
    }
    exit;
}

// User session and subscription fetch
$isLoggedIn = isset($_SESSION['user_id']);
$userData = null;
$hasActiveSubscription = false;
$subscriptionType = 'Free';
$memberSince = '';
$nextBilling = '';

if ($isLoggedIn) {
    try {
        $stmt = $pdo->prepare("
            SELECT u.name, u.email, u.created_at, s.status as subscription_status, 
                   s.type as subscription_type, s.next_billing_date
            FROM users u 
            LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
            WHERE u.id = ? LIMIT 1
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($userData) {
            $hasActiveSubscription = $userData['subscription_status'] === 'active';
            $subscriptionType = $userData['subscription_type'] ?? 'Free';
            $memberSince = date('F j, Y', strtotime($userData['created_at']));
            $nextBilling = $userData['next_billing_date'] ? date('F j, Y', strtotime($userData['next_billing_date'])) : '';
        }
    } catch (PDOException $e) {
        error_log("Error fetching user data: " . $e->getMessage());
    }
}

// Load race list
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["get_races"])) {
    $stmt = $pdo->query("SELECT * FROM races ORDER BY date ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Save (Add or Update) race
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["save_race"])) {
    $id = $_POST["race_id"] ?? "";
    $fields = ["title", "full_title", "date", "location", "country", "latitude", "longitude", "map_url"];
    $data = [];
    foreach ($fields as $field) {
        $data[$field] = trim($_POST[$field] ?? "");
    }

    try {
        if ($id) {
            $stmt = $pdo->prepare("UPDATE races SET title=?, full_title=?, date=?, location=?, country=?, latitude=?, longitude=?, map_url=? WHERE id=?");
            $stmt->execute([...array_values($data), $id]);
            echo json_encode(["success" => true, "message" => "Race updated."]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO races (title, full_title, date, location, country, latitude, longitude, map_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute(array_values($data));
            echo json_encode(["success" => true, "message" => "Race added.", "id" => $pdo->lastInsertId()]);
        }
    } catch (PDOException $e) {
        error_log("Save race error: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Database error occurred."]);
    }
    exit;
}

// Delete race
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["delete_race"])) {
    try {
        $stmt = $pdo->prepare("DELETE FROM races WHERE id = ?");
        $stmt->execute([$_POST["race_id"]]);
        echo "Race deleted.";
    } catch (PDOException $e) {
        error_log("Delete race error: " . $e->getMessage());
        echo "Error deleting race.";
    }
    exit;
}

// Update user subscription
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["update_subscription"])) {
  if (!isset($_SESSION["user_id"])) {
      echo "You must be logged in.";
      exit;
  }

  $userId = $_SESSION["user_id"];
  $type = $_POST["type"] ?? "basic"; // basic / pro / ultimate
  $billing = $_POST["billing_cycle"] ?? "monthly";

  $allowedTypes = ["basic", "pro", "ultimate"];
  $allowedBilling = ["monthly", "yearly"];

  if (!in_array($type, $allowedTypes) || !in_array($billing, $allowedBilling)) {
      echo "Invalid subscription data.";
      exit;
  }

  // Example: prices could also be validated here
  $nextBilling = date("Y-m-d", strtotime("+1 " . ($billing === "monthly" ? "month" : "year")));

  try {
      // Deactivate previous
      $pdo->prepare("UPDATE subscriptions SET status = 'inactive' WHERE user_id = ?")->execute([$userId]);

      // Insert new or replace
      $stmt = $pdo->prepare("
          INSERT INTO subscriptions (user_id, type, status, billing_cycle, start_date, next_billing_date)
          VALUES (?, ?, 'active', ?, NOW(), ?)
          ON DUPLICATE KEY UPDATE
              type = VALUES(type),
              billing_cycle = VALUES(billing_cycle),
              status = 'active',
              start_date = NOW(),
              next_billing_date = VALUES(next_billing_date)
      ");
      $stmt->execute([$userId, $type, $billing, $nextBilling]);
      echo "success";
  } catch (PDOException $e) {
      error_log("Subscription update error: " . $e->getMessage());
      echo "Database error. Try again.";
  }
  exit;
}

// Cancel subscription
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["cancel_subscription"])) {
  if (!isset($_SESSION["user_id"])) {
      echo "Not logged in.";
      exit;
  }

  try {
      $stmt = $pdo->prepare("DELETE FROM subscriptions WHERE user_id = ? AND status = 'active'");
      $stmt->execute([$_SESSION["user_id"]]);

      if ($stmt->rowCount() > 0) {
          echo "success";
      } else {
          echo "No active subscription to cancel.";
      }
  } catch (PDOException $e) {
      error_log("Cancel subscription error: " . $e->getMessage());
      echo "Error cancelling subscription.";
  }

  exit;
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>F1 Account Management</title>
  <meta name="description" content="F1 Account Management - Sign in, Register, and manage your F1 subscription" />

  <!-- Optimized font loading -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="icon" href="resources/img/f1logo.svg" type="image/x-icon" />
  <!-- CSS -->
  <link rel="stylesheet" href="resources/css/admin.css" />
</head>

<body>
  <header>
    <div class="site-header">
      <div class="topSection">
        <div class="logo">
          <img
            src="https://media.formula1.com/image/upload/f_auto,c_limit,w_285,q_auto/f_auto/q_auto/fom-website/etc/designs/fom-website/images/F1_75_Logo"
            alt="F1 Logo" width="285" height="40" loading="eager" />
        </div>
        <?php if ($isLoggedIn): ?>
          <div class="logout-wrapper" style="display: flex; align-items: center; gap: 1rem">
          <span class="user-greeting">Welcome,
            <strong>
              <?= htmlspecialchars($_SESSION["user_name"]) ?>
            </strong></span>
          </div>
        <?php endif; ?>
      </div>
      <nav class="nav-tabs" role="navigation" aria-label="Account navigation">
        <ul>
          <?php if (!$isLoggedIn): ?>
          <li class="active">
            <a href="#login" class="pagelinks login">Sign in</a>
          </li>
          <li><a href="#register" class="pagelinks register">Register</a></li>
          <?php else: ?>
          <li class="active">
            <a href="#my-account" class="pagelinks my-account">My Account</a>
          </li>
          <li>
            <a href="#subscription" class="pagelinks subscription">Subscription</a>
          </li>
          <li>
            <a href="#order-history" class="pagelinks order-history">Order History</a>
          </li>
          <?php
            try {
                $stmt = $pdo->prepare("SELECT type FROM subscriptions WHERE user_id = ? AND status = 'active'");
                $stmt->execute([$_SESSION['user_id']]);
                $subscription = $stmt->fetch();
    
                $hasAccess = $subscription && in_array($subscription['type'], ['pro', 'ultimate']);
               } catch (PDOException $e) {
                  error_log("Error checking subscription: " . $e->getMessage());
                  $hasAccess = false;
                }
              if ($isLoggedIn && $hasAccess): ?>
              <li>
                <a href="#race-calendar" class="pagelinks race-calendar">Race Calendar</a>
              </li>
            <?php endif; ?>
          <?php endif; ?>
        </ul>
      </nav>
    </div>
  </header>

  <main class="f1-account-site">
    <div class="site-content">
      <!-- Login Page -->
      <div class="wrappers login-wrapper" style="display: <?= $isLoggedIn ? 'none' : 'block' ?>;">
        <div class="loginForm custom-form">
          <h1 class="form-heading">Login</h1>
          <form id="loginform" method="post">
            <div class="field alert alert-danger" role="alert" style="display: none">
              <span class="control-label">Login failed. Please try again.</span>
            </div>
            <div class="field">
              <label>Email address</label>
              <input type="email" name="email" placeholder="Enter your email" required />
            </div>
            <div class="field password">
              <label>Password</label>
              <input type="password" name="password" placeholder="Enter your password" required />
              <span class="eyeIcon eyeHide"></span>
            </div>
            <div class="forgot-password-link">
            <a href="#" class="pagelinks link" onclick="document.getElementById('forgotPasswordOverlay').style.display='block'">Forgot your password?</a>
            </div>
            <div class="actions">
              <button type="submit" class="btn btn-primary">Login</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Register Page -->
      <section class="wrappers register-wrapper" style="display: <?= $isLoggedIn ? 'none' : 'none' ?>;"
        aria-labelledby="register-heading">
        <div class="registerForm custom-form">
          <h1 id="register-heading" class="form-heading">Register</h1>
          <form id="registerform" method="post" novalidate>
            <div class="field alert alert-danger" role="alert" style="display: none">
              <span class="control-label">Sorry something went wrong</span>
            </div>
            <div class="field">
              <label for="register-name">Full Name</label>
              <input type="text" id="register-name" placeholder="Enter your name" name="name" class="txtName" required
                minlength="2" aria-describedby="register-name-error" />
              <span id="register-name-error" class="error-msg" role="alert">Please enter your name</span>
            </div>
            <div class="field">
              <label for="register-email">Email address</label>
              <input type="email" id="register-email" placeholder="Enter your email" name="email" class="txtEmail"
                required aria-describedby="register-email-error" />
              <span id="register-email-error" class="error-msg" role="alert">Please enter valid email address</span>
            </div>
            <div class="field password">
              <label for="register-password">Password</label>
              <input type="password" id="register-password" placeholder="Create your password" name="password"
                class="txtPassword" required minlength="6" aria-describedby="register-password-error" />
              <span id="register-password-error" class="error-msg" role="alert">Password must be at least 6
                characters</span>
              <button type="button" class="eyeIcon eyeHide" aria-label="Toggle password visibility"></button>
            </div>
            <div class="actions">
              <button type="submit" class="btn btn-primary">Register</button>
            </div>
            <div class="secondary-actions">
              <span class="alreadyHaveAccount">Already have an account?</span>
              <a href="#login" class="pagelinks link">Sign In</a>
            </div>
          </form>
        </div>

        <!-- Popup Confirmation -->
        <div id="registerSuccessPopup" class="popup-overlay" style="display: none" role="dialog"
          aria-labelledby="popup-heading" aria-modal="true">
          <div class="popup-content">
            <h2 id="popup-heading">Registration Successful!</h2>
            <p>
              Your account has been created. Would you like to add a
              subscription?
            </p>
            <div class="popup-actions">
              <button onclick="goToSubscription()" class="btn btn-success">
                Yes, Add Subscription
              </button>
              <button onclick="closePopup()" class="btn btn-secondary">
                No, Maybe Later
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- My Account Page -->
      <section class="wrappers my-account-wrapper" style="display: <?= $isLoggedIn ? 'block' : 'none' ?>;"
        aria-labelledby="account-heading">
        <div class="accountForm custom-form">
          <h1 id="account-heading" class="form-heading">My Account</h1>

          <?php if ($isLoggedIn && $userData): ?>
          <div class="account-name" style="text-align: center; margin-bottom: 2rem">
            <span id="userName">
              <?php echo htmlspecialchars($userData['name'], ENT_QUOTES, 'UTF-8'); ?>
            </span>
            <span class="premium-icon" id="premiumIcon"
              style="<?php echo $hasActiveSubscription ? 'display: inline;' : 'display: none;'; ?> color: #ffd700; font-size: 1.5rem; margin-left: 10px;"
              aria-label="Premium member">👑</span>
          </div>

          <div class="account-details" style="margin-bottom: 2rem">
            <div class="field" style="
                  margin-bottom: 1rem;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
              <span style="font-weight: 600">Email:</span>
              <span id="userEmail">
                <?php echo htmlspecialchars($userData['email'], ENT_QUOTES, 'UTF-8'); ?>
              </span>
            </div>
            <div class="field" style="
                  margin-bottom: 1rem;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
              <span style="font-weight: 600">Member Since:</span>
              <span id="memberSince">
                <?php echo htmlspecialchars($memberSince, ENT_QUOTES, 'UTF-8'); ?>
              </span>
            </div>
            <div class="field" style="
                  margin-bottom: 1rem;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
              <span style="font-weight: 600">Account Type:</span>
              <span id="accountType">
                <?php echo htmlspecialchars($subscriptionType, ENT_QUOTES, 'UTF-8'); ?>
              </span>
            </div>
            <div class="field" style="
                  margin-bottom: 1rem;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
              <span style="font-weight: 600">Subscription Status:</span>
              <span class="subscription-status <?php echo $hasActiveSubscription ? 'status-active' : ''; ?>"
                id="subscriptionStatus" style="
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                  ">
                <span>●</span>
                <?php echo $hasActiveSubscription ? 'Active' : 'Inactive'; ?>
              </span>
            </div>
            <?php if ($hasActiveSubscription && $nextBilling): ?>
            <div class="field" id="subscriptionDetails" style="
                  display: flex;
                  margin-bottom: 1rem;
                  justify-content: space-between;
                  align-items: center;
                ">
              <span style="font-weight: 600">Next Billing Date:</span>
              <span id="nextBilling">
                <?php echo htmlspecialchars($nextBilling, ENT_QUOTES, 'UTF-8'); ?>
              </span>
            </div>
            <?php endif; ?>
          </div>

          <div class="actions" style="flex-direction: column; gap: 1rem">
            <?php if (!$hasActiveSubscription): ?>
              <button type="button" class="btn  btn-primary"           id="upgradeBtn"   style="width: 100%; text-align:             center">
                🚀 Upgrade to Premium
              </button>
            <?php else: ?>
            <form method="post" action="#" style="width: 100%">
              <button type="submit" class="btn" id="cancelBtn" style="width: 100%; background: #dc3545; color: white">
                ❌ Cancel Subscription
              </button>
            </form>
            <?php endif; ?>
            <a href="#" id="openProfileEditorBtn" class="btn" style="width: 100%; background: #6c757d; color: white; text-align: center;">
              ✏️ Edit Profile
            </a>

          </div>

          <div class="secondary-actions">
            <a href="#" class="logout link" onclick="logout(); return false;">Sign Out</a>
          </div>

          <?php elseif ($isLoggedIn && !$userData): ?>
          <div style="text-align: center; padding: 2rem">
            <p style="margin-bottom: 1rem; color: #dc3545">
              Error loading account data. Please try refreshing the page.
            </p>
            <button onclick="window.location.reload()" class="btn btn-primary">
              Refresh Page
            </button>
          </div>
          <?php else: ?>
          <div style="text-align: center; padding: 2rem">
            <p style="margin-bottom: 1rem">
              Please log in to view your account details.
            </p>
            <a href="#login" class="pagelinks btn btn-primary">Sign In</a>
          </div>
          <?php endif; ?>
        </div>
      </section>

      <!-- Subscription Page Placeholder -->
      <section class="wrappers subscription-wrapper" style="display: none" aria-labelledby="subscription-heading">
      <div class="subscriptionForm">
            <h1 id="subscription-heading" class="form-heading">F1 TV Access Subscription</h1>
            
            <!-- Billing Toggle -->
            <div class="billing-toggle">
                <span class="toggle-label active" id="monthlyLabel">Monthly</span>
                <div class="toggle-switch" id="billingToggle">
                    <div class="toggle-slider"></div>
                </div>
                <span class="toggle-label" id="yearlyLabel">Yearly <span class="savings-badge">Save 33%</span></span>
            </div>

            <div class="subscription-plans">
                <!-- Pro Plan -->
                <div class="subscription-card" data-type="pro" data-monthly="2.99" data-yearly="19.99">
                    <div class="card-header">
                        <div class="plan-name">F1 TV Pro</div>
                        <div class="plan-badge">Most Popular</div>
                    </div>
                    <div class="plan-description">Stream all F1 sessions ad-free, live and on demand</div>
                    <div class="plan-price" data-monthly="$2.99" data-yearly="$19.99">$2.99</div>
                    <div class="plan-period" data-monthly="per month" data-yearly="per year">per month</div>
                    <ul class="plan-features">
                        <li><span class="feature-icon check">✓</span>Everything in Free</li>
                        <li><span class="feature-icon check">✓</span>Stream all F1 sessions ad-free</li>
                        <li><span class="feature-icon check">✓</span>Live onboard cameras</li>
                        <li><span class="feature-icon check">✓</span>Live team radios</li>
                        <li><span class="feature-icon check">✓</span>F2, F3, F1 Academy access</li>
                        <li><span class="feature-icon check">✓</span>Exclusive race weekend content</li>
                    </ul>
                    <button class="subscribe-btn" onclick="selectPlan('pro')">Select Plan</button>
                </div>

                <!-- Ultimate Plan -->
                <div class="subscription-card" data-type="ultimate" data-monthly="9.99" data-yearly="79.99">
                    <div class="card-header">
                        <div class="plan-name">F1 TV Ultimate</div>
                        <div class="plan-badge">Premium</div>
                    </div>
                    <div class="plan-description">Ultimate F1 experience with multiview and 4K streaming</div>
                    <div class="plan-price" data-monthly="$9.99" data-yearly="$79.99">$9.99</div>
                    <div class="plan-period" data-monthly="per month" data-yearly="per year">per month</div>
                    <ul class="plan-features">
                        <li><span class="feature-icon check">✓</span>Everything in Pro</li>
                        <li><span class="feature-icon check">✓</span>Multiview - custom multi-feed</li>
                        <li><span class="feature-icon check">✓</span>Watch F1 live in 4K UHD/HDR</li>
                        <li><span class="feature-icon check">✓</span>Multiple devices (up to 6)</li>
                        <li><span class="feature-icon check">✓</span>Priority support</li>
                        <li><span class="feature-icon check">✓</span>Exclusive behind-the-scenes content</li>
                    </ul>
                    <button class="subscribe-btn" onclick="selectPlan('ultimate')">Select Plan</button>
                </div>
            </div>

            <div class="selected-plan-info" id="selectedPlanInfo">
                <p>Selected Plan: <strong id="selectedPlanName">None</strong></p>
                <p>Price: <strong id="selectedPlanPrice">$0</strong></p>
            </div>

            <button class="main-subscribe-btn" id="mainSubscribeBtn" disabled>
                Select a Plan to Continue
            </button>
        </div>
      </section>

      <!-- Order History Page Placeholder -->
      <section class="wrappers order-history-wrapper" style="display: none">
        <div class="orderHistoryForm custom-form">
          <h1 class="form-heading">Session Log</h1>
                
          <div id="logContent" style="background:#111;      color:#0f0;font-family:monospace;height:400px;      overflow-y:auto;padding:1rem;border-radius:8px;">
            Loading...
          </div>
                
          <button id="refreshLogsBtn" class="btn      btn-secondary" style="margin-top: 1rem;">🔄 Refresh     Logs</button>
        </div>
      </section>
                
      <!-- Race Calendar Manager -->
      <section class="wrappers race-calendar-wrapper" style="display: none" aria-labelledby="race-calendar-heading">
        <div class="race-calendar custom-form">
          <h1 id="race-calendar-heading" class="form-heading">
            Race Calendar Manager
          </h1>
          <div class="actions" style="justify-content: flex-end">
            <button class="btn btn-primary" onclick="openRacePopup()">
              + Add New Race
            </button>
          </div>
          <table class="race-table" style="width: 100%; margin-top: 1rem">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Country</th>
              </tr>
            </thead>
            <tbody id="raceTableBody">
              <!-- Race rows inserted by JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- Add/Edit Race Popup -->
      <div id="racePopup" class="popup-overlay" style="display: none;">
        <div class="popup-content">
          <h2 id="popupTitle" class="popup-title">Add/Edit Race</h2>

          <form id="raceForm" class="custom-form">
            <input type="hidden" name="race_id" id="race_id" />
            <input type="hidden" name="save_race" value="1" />

            <div class="field">
              <label for="title" class="field-label">Title *</label>
              <input type="text" class="field-input" id="title" name="title" required onkeydown="if(event.key !== 'Enter') return" />
            </div>

            <div class="field">
              <label for="full_title" class="field-label">Full Title</label>
              <input type="text" class="field-input" id="full_title" name="full_title" onkeydown="if(event.key !== 'Enter') return" />
            </div>

            <div class="field">
              <label for="date" class="field-label">Date *</label>
              <input type="date" class="field-input" id="date" name="date" required onkeydown="if(event.key !== 'Enter') return" />
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="location" class="field-label">Location *</label>
                <input type="text" class="field-input" id="location" name="location" required onkeydown="if(event.key !== 'Enter') return" />
              </div>
              <div class="field">
                <label for="country">Country</label>
                <select name="country" id="country" onchange="updateFlagPreview(); updateMapLocation();" onkeydown="if(event.key !== 'Enter') return">
                  <option value="" disabled selected hidden> Select Country </option>
                  <?php
                  $countries = array(
                    "Azerbaijan" => "azerbaijan-flag",
                    "Australia" => "australia-flag",
                    "Austria" => "austria-flag",
                    "Bahrain" => "bahrain-flag",
                    "Belgium" => "belgium-flag",
                    "Brazil" => "brazil-flag",
                    "Canada" => "canada-flag",
                    "China" => "china-flag",
                    "Hungary" => "hungary-flag",
                    "Indonesia" => "indonesia-flag",
                    "Italy" => "italy-flag",
                    "Japan" => "japan-flag",
                    "Mexico" => "mexico-flag",
                    "Monaco" => "monaco-flag",
                    "Netherlands" => "netherlands-flag",
                    "New Zealand" => "new-zealand-flag",
                    "Qatar" => "qatar-flag",
                    "Singapore" => "singapore-flag",
                    "South Korea" => "south-korea-flag",
                    "Spain" => "spain-flag",
                    "United Arab Emirates" => "united-arab-emirates-flag",
                    "United Kingdom" => "united-kingdom-flag",
                    "United States" => "united-states-flag",
                  );

                  $lastClickedOption = $_COOKIE['lastClickedCountry'] ?? '';

                  foreach ($countries as $countryName => $countryFlag) {
                    $selected = $lastClickedOption === $countryFlag ? 'selected' : '';
                    echo "<option value='$countryFlag' $selected>$countryName</option>";
                  }
                  ?>
                </select>
                <div id="flagPreview" style="margin-top:5px;">
                  <img id="flagImage" src="resources/img/flags/australia-flag.png" alt="Flag" style="height: 24px;">
                </div>
              </div>
            </div>

            <div class="search-wrapper">
              <label for="searchBox" class="field-label">Search Location</label>
              <div class="search-input">
                <span class="search-icon" onclick="searchLocation()" style="cursor: pointer; hover: cursor:pointer">
                  <svg viewBox="0 0 24 24" fill="none" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 21L15.8 15.8M18 10.5C18 14.0899 15 17 11.5 17C7.91015 17 5 14.0899 5 10.5C5 6.91015 7.91015 4 11.5 4C15.0899 4 18 6.91015 18 10.5Z"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <input type="text" id="searchBox" class="search-input-field"
                  placeholder="Search circuit, city, country..." onkeydown="if(event.key === 'Enter') searchLocation()" />
              </div>
            </div>
            <div class="map-container" id="map"></div>

            <div class="form-grid">
              <div class="field">
                <label for="latitude" class="field-label">Latitude</label>
                <input type="text" class="field-input" id="latitude" name="latitude" readonly />
              </div>
              <div class="field">
                <label for="longitude" class="field-label">Longitude</label>
                <input type="text" class="field-input" id="longitude" name="longitude" readonly />
              </div>
            </div>

            <div class="field">
              <label for="map_url" class="field-label">Map URL</label>
              <input type="url" class="field-input" id="map_url" name="map_url" placeholder="https://..." />
            </div>

            <div class="popup-actions">
              <button type="button" class="btn btn-secondary" onclick="closeRacePopup()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Race</button>
              <button type="button" class="btn btn-danger" onclick="deleteRace()">Delete Race</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Forgot Password Popup -->
      <div id="forgotPasswordOverlay" class="popup-overlay"       style="display:none;">
        <div class="overlay-content forgot-password-wrapper">
          <button class="close-btn" aria-label="Close forgot      password" onclick="closeForgotPassword()">×</button>
          <h1 id="forgot-password-heading"      class="form-heading">Reset your password</h1>

          <form id="forgetPasswordForm" action="admin/reset_password.php" method="post" novalidate>
            <p>To reset your password, please enter your email      and new password below.</p>
            <!-- Email -->
            <div class="field">
              <label for="reset-email">Email address</label>
              <input
                type="email"
                id="reset-email"
                name="email"
                class="txtEmail"
                placeholder="Email address"
                required
                aria-describedby="reset-email-error"
              />
              <span id="reset-email-error" class="error-msg"      role="alert">Please enter a valid email address</     span>
            </div>

            <!-- New Password -->
            <div class="field">
              <label for="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                name="new_password"
                class="txtPassword"
                placeholder="New password"
                required
                minlength="6"
              />
            </div>

            <!-- Confirm Password -->
            <div class="field">
              <label for="confirm-password">Confirm Password</      label>
              <input
                type="password"
                id="confirm-password"
                name="confirm_password"
                class="txtPassword"
                placeholder="Confirm password"
                required
                minlength="6"
              />
            </div>

            <div class="actions">
              <button type="submit" class="btn      btn-primary">Reset Password</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Profile Editor Page -->
      <div id="profileEditorOverlay" class="popup-overlay" style="display: none">
        <div class="overlay-content profile-editor-wrapper">
          <button class="close-btn" aria-label="Close profile editor" onclick="closeProfileEditor()">×</button>
          <h1 id="profile-editor-heading" class="form-heading">Edit Your Profile</h1>

          <form class="profile-edit" id="profileEditorForm" method="post" action="admin/profile_editor.php" novalidate>
            <div class="field alert alert-danger" role="alert" style="display: none">
              <span class="control-label">Sorry, something went wrong.</span>
            </div>

            <div class="field">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" placeholder="Enter your name" required minlength="2"
       value="<?php echo htmlspecialchars($_SESSION['user_name'] ?? ''); ?>" />
            </div>

            <div class="field">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="Enter your email" required
       value="<?php echo htmlspecialchars($_SESSION['user_email'] ?? ''); ?>" />
            </div>
            <div class="forgot-password-link">
            <a href="#" class="pagelinks link" onclick="document.getElementById('forgotPasswordOverlay').style.display='block'">Forgot your password?</a>
            </div>
            <div class="actions">
              <button type="submit" class="btn btn-primary">💾 Save Changes</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Loading Screen -->
      <div class="loading" role="status" aria-label="Loading">
        <div class="loader">
          <div class="sk-circle">
            <div class="sk-circle1 sk-child"></div>
            <div class="sk-circle2 sk-child"></div>
            <div class="sk-circle3 sk-child"></div>
            <div class="sk-circle4 sk-child"></div>
            <div class="sk-circle5 sk-child"></div>
            <div class="sk-circle6 sk-child"></div>
            <div class="sk-circle7 sk-child"></div>
            <div class="sk-circle8 sk-child"></div>
            <div class="sk-circle9 sk-child"></div>
            <div class="sk-circle10 sk-child"></div>
            <div class="sk-circle11 sk-child"></div>
            <div class="sk-circle12 sk-child"></div>
          </div>
        </div>
      </div>
      
    </div>
  </main>

  <!-- Scripts -->
  <script src="resources/js/admin.js" defer></script>

  <!-- Google Maps API -->
  <script
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAAgY3Vew0LpTLCBR_Sg98TKXrW_8Yk_4o&callback=initMap&libraries=places"
  async defer>
  </script>
</body>

</html>