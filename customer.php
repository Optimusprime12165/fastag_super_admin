<?php
session_start();
require 'db.php'; // Your PDO connection

// Check login
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

// Fetch customers
$stmt = $pdo->prepare("SELECT id, name, email, phone, created_at FROM customers ORDER BY created_at DESC");
$stmt->execute();
$customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customers - Admin Portal</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body {font-family: Arial, sans-serif; margin: 0; display:flex; background:#f7f8fc;}
    .sidebar {width:230px;background:#fff;height:100vh;border-right:1px solid #ddd;padding:20px;}
    .sidebar a {display:block;padding:10px;margin:5px 0;color:#333;text-decoration:none;border-radius:5px;}
    .sidebar a:hover {background:#f0f0f0;}
    .sidebar a.active {background:#007bff;color:#fff;}
    .content {flex:1;padding:20px;}
    table {width:100%;border-collapse:collapse;margin-top:20px;}
    th, td {padding:10px;border:1px solid #ddd;text-align:left;}
    th {background:#007bff;color:#fff;}
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="logo"><i class="fa fa-id-card"></i> Fastag Admin</div>
    <a href="dashboard.html"><i class="fa fa-home"></i> Dashboard</a>
    <a href="order_manage.php"><i class="fa fa-receipt"></i> Fastag Orders</a>
    <a href="products.html"><i class="fa fa-car"></i> Vehicle Categories</a>
    <a href="banks.html"><i class="fa fa-university"></i> Bank Partners</a>
    <a href="customer.php" class="active"><i class="fa fa-users"></i> Customers</a>
    <a href="admins.html"><i class="fa fa-user-shield"></i> Admin role</a>
    <a href="statistics.php"><i class="fa fa-chart-line"></i> Reports</a>
  </div>
  <div class="content">
    <h1>Customer List</h1>
    <table>
      <tr>
        <th>Customer ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Registered Date</th>
      </tr>
      <?php foreach ($customers as $c): ?>
      <tr>
        <td><?= htmlspecialchars($c['id']) ?></td>
        <td><?= htmlspecialchars($c['name']) ?></td>
        <td><?= htmlspecialchars($c['email']) ?></td>
        <td><?= htmlspecialchars($c['phone']) ?></td>
        <td><?= htmlspecialchars($c['created_at']) ?></td>
      </tr>
      <?php endforeach; ?>
    </table>
  </div>
</body>
</html>
