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
            <div class="post-header">
              <p>Already have an account? <a href="register.php">Click here to login</a></p>
            </div>
            <form class="login-form">
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-user"></i>
                  <input type="text" class="form-control" name="name" placeholder="Username">
                </div>
              </div>
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-envelope"></i>
                  <input type="text" class="form-control" name="email" placeholder="Email Address">
                </div>
              </div>
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-lock"></i>
                  <input type="password" class="form-control" placeholder="Password">
                </div>
              </div>
              <div class="form-group">
                <div class="input-icon">
                  <i class="lni-unlock"></i>
                  <input type="password" class="form-control" placeholder="Retype Password">
                </div>
              </div>
              <button class="btn btn-common log-btn mt-3">Register</button>
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
</body>

</html>