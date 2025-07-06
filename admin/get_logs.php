<?php
session_start();

if (empty($_SESSION['log'])) {
    echo "No recent activity logged.";
    exit;
}

$latest = array_slice($_SESSION['log'], -100);
echo implode("\n", $latest);
