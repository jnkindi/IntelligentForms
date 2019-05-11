<?php
if (isset($_POST['register'])) {
  include('modules/config.php');
  //
  $names = $_POST['names'];
  $email = $_POST['email'];
  $password = $_POST['password'];
  $query = "INSERT INTO users(names, title, email, password, address, twitter, facebook, linkedin, about) VALUES ('$names', '', '$email', '$password', '','','','','')";
  if ($conn->query($query)) {
    header('Location: signup.php?success');
    return;
  } else {
    header('Location: signup.php?error');
    return;
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
              Create Your account
            </h3>
            <div id="errormessage">
              <?php if (isset($_GET['error'])) { ?>
                <div class="post-header">
                  <p>Something went wrong! Try again later</p>
                </div>
              <?php } ?>
              <?php if (isset($_GET['success'])) { ?>
                <div class="post-header">
                  <p>Account created! <a href="login.php">Click here to login</a></p>
                </div>
              <?php } ?>
            </div>
            <form class="login-form" method="POST" onsubmit="return validateForm();">
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-user"></i>
                  <input type="text" class="form-control" name="names" placeholder="Names" required>
                </div>
              </div>
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-envelope"></i>
                  <input type="email" class="form-control" name="email" placeholder="Email Address" required>
                </div>
              </div>
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-lock"></i>
                  <input type="password" class="form-control" name="password" id="password" placeholder="Password" required>
                </div>
              </div>
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-unlock"></i>
                  <input type="password" class="form-control" id="confirmpassword" placeholder="Retype Password" required>
                </div>
              </div>
              <button type="submit" name="register" class="btn btn-common log-btn mt-3">Register</button>
              <p class="text-center">Already have an account?<a href="login.php"> Sign In</a></p>
            </form>
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
  <script type="text/javascript">
    function validateForm() {
      var password = $("#password").val();
      var confirmpassword = $("#confirmpassword").val();
      if (password.length < 8) {
        $("#errormessage").html('<div class="post-header"> <p> Password length should be more than 8 characters </p> </div>');
        return false;
      }
      if (password != confirmpassword) {
        $("#errormessage").html('<div class="post-header"> <p> Password mismatch </p> </div>');
        return false;
      }
    }
  </script>
</body>

</html>