<?php
require_once '../connection.php';
session_start();

if (!isset($_SESSION["user_id"])) {
    echo "You must be logged in.";
    exit;
}

// Update user
if ($_SERVER["REQUEST_METHOD"] === "POST" && !empty($_POST["name"]) && !empty($_POST["email"])) {
  if (!isset($_SESSION["user_id"])) {
      echo "Not logged in.";
      exit;
  }

  $userId = $_SESSION["user_id"];
  $name = trim($_POST["name"]);
  $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);

  if (strlen($name) < 2) {
      echo "Name must be at least 2 characters.";
      exit;
  }

  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      echo "Invalid email address.";
      exit;
  }

  try {
      // Check if email is used by another account
      $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
      $checkStmt->execute([$email, $userId]);
      if ($checkStmt->fetch()) {
          echo "Email is already used by another account.";
          exit;
      }

      // Update user
      $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
      $stmt->execute([$name, $email, $userId]);

      // Update session values
      $_SESSION["user_name"] = $name;
      $_SESSION["user_email"] = $email;

      echo "success";
  } catch (PDOException $e) {
      error_log("Profile update error: " . $e->getMessage());
      echo "Database error.";
  }

  exit;
}
