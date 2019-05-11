<?php
session_start();
include("modules/config.php");
$uname = '';
$error = '';
if (isset($_SESSION['logged_user_info'])) {
  header("Location: manage-forms.php");
}
if (isset($_POST['login'])) {
  // Define $username and $password
  $username = $_POST['email'];
  $uname = $_POST['email'];
  $password = $_POST['password'];
  // To protect MySQL injection for Security purpose
  $username = stripslashes($username);
  $password = stripslashes($password);

  $query = $conn->query("SELECT id FROM users WHERE email = '$username' AND password = '$password' LIMIT 1");
  $nums = $query->num_rows;
  $arr = $query->fetch_array();
  $userId = $arr['id'];

  //
  if ($nums == 0) {
    header('Location: login.php?error');
  } else {
    $_SESSION['logged_user_info'] = $userId;
    header("Location: manage-forms.php"); // Redirecting To Other Page
  }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="keywords" content="Bootstrap, Landing page, Template, Registration, Landing">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <meta name="author" content="Grayrids">
  <title>IntelligentForms</title>

  <link rel="stylesheet" href="assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="assets/css/line-icons.css">
  <link rel="stylesheet" href="assets/css/owl.carousel.min.css">
  <link rel="stylesheet" href="assets/css/owl.theme.default.css">
  <link rel="stylesheet" href="assets/css/slicknav.min.css">
  <link rel="stylesheet" href="assets/css/animate.css">
  <link rel="stylesheet" href="assets/css/main.css">
  <link rel="stylesheet" href="assets/css/responsive.css">
</head>

<body>

  <header id="home" class="hero-area">

    <?php echo include('includes/menu.php'); ?>

  </header>


  <div class="page-header">
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <div class="inner-header">
          </div>
        </div>
      </div>
    </div>
  </div>


  <section id="content" class="section-padding">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-6 col-xs-12">
          <div class="page-login-form box">
            <h3>
              Login
            </h3>
            <?php if (isset($_GET['error'])) { ?>
              <div class="post-header">
                <p>Invalid email or password!</a></p>
              </div>
            <?php } ?>
            <form class="login-form" method="POST">
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-user"></i>
                  <input type="email" class="form-control" name="email" placeholder="Email">
                </div>
              </div>
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-lock"></i>
                  <input type="password" class="form-control" name="password" placeholder="Password">
                </div>
              </div>
              <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="exampleCheck1">
                <label class="form-check-label" for="exampleCheck1">Keep Me Signed In</label>
              </div>
              <button class="btn btn-common log-btn" name="login" type="submit">login</button>
            </form>
            <ul class="form-links">
              <li class="text-center"><a href="signup.php">Don't have an account?</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>


  <a href="#" class="back-to-top">
    <i class="lni-arrow-up"></i>
  </a>

  <div id="preloader">
    <div class="loader" id="loader-1"></div>
  </div>


  <script src="assets/js/jquery-min.js"></script>
  <script src="assets/js/popper.min.js"></script>
  <script src="assets/js/bootstrap.min.js"></script>

  <script src="assets/js/owl.carousel.min.js"></script>
  <script src="assets/js/jquery.slicknav.js"></script>
  <script src="assets/js/jquery.counterup.min.js"></script>
  <script src="assets/js/waypoints.min.js"></script>
  <script src="assets/js/form-validator.min.js"></script>
  <script src="assets/js/contact-form-script.js"></script>
  <script src="assets/js/main.js"></script>
</body>

</html>