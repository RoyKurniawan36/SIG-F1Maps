<?php
require_once '../connection.php';

$success = false;
$message = '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(403);
    $message = "Forbidden: Direct access not allowed.";
} else {
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $newPassword = trim($_POST['new_password'] ?? '');
    $confirmPassword = trim($_POST['confirm_password'] ?? '');

    if (!$email) {
        $message = "Invalid email address.";
    } elseif (strlen($newPassword) < 6) {
        $message = "Password must be at least 6 characters.";
    } elseif ($newPassword !== $confirmPassword) {
        $message = "Passwords do not match.";
    } else {
        try {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                $message = "Email address not found.";
            } else {
                $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
                $updateStmt->execute([$hashedPassword, $email]);
                $success = true;
                $message = "✅ Password successfully reset. Redirecting to dashboard...";
            }
        } catch (PDOException $e) {
            error_log("Password reset error: " . $e->getMessage());
            $message = "Database error.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
  <meta http-equiv="refresh" content="<?= $success ? '3;url=../management.php' : '2' ?>">
  <style>
    body {
      font-family: sans-serif;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .message-box {
      background: white;
      padding: 2rem 3rem;
      border-radius: 8px;
      box-shadow: 0 0 12px rgba(0,0,0,0.1);
      text-align: center;
    }
    .message-box h1 {
      margin-bottom: 1rem;
      font-size: 1.5rem;
      color: <?= $success ? '#28a745' : '#dc3545' ?>;
    }
    .message-box p {
      color: #333;
    }
  </style>
</head>
<body>
  <div class="message-box">
    <h1><?= $success ? 'Success!' : 'Oops...' ?></h1>
    <p><?= htmlspecialchars($message) ?></p>
    <?php if ($success): ?>
      <p>You will be redirected shortly...</p>
    <?php else: ?>
      <p><a href="javascript:history.back()">Go back</a> and try again.</p>
    <?php endif; ?>
  </div>
</body>
</html>
