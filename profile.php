<?php include('session.php'); ?>
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
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tingle/0.15.0/tingle.min.css">
</head>

<body>

  <header id="home" class="hero-area">



    <?php echo include('includes/menu-logged-in.php'); ?>

  </header>


  <div class="page-header">
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <div class="inner-header">
            <h3>Profile</h3>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div class="section">
    <div class="container">
      <div class="row">
        <?php include('includes/leftbar.php'); ?>
        <?php
        $query = "SELECT * FROM users WHERE id = '$userId'";
        $query = $conn->query($query);
        $arr = $query->fetch_array();
        ?>
        <div class="col-lg-8 col-md-8 col-xs-12">
          <div class="inner-box my-resume">
            <div class="author-resume">
              <div class="author">
                <h3><?php echo $arr['names']; ?> <sup><i class="lni-pencil" style="font-size: 25px; cursor: pointer" onclick="editProfile()"></i></sup>
                </h3>
                <p class="sub-title"><?php echo $arr['title']; ?></p>
                <p><span></i><?php echo ($arr['email'] == '' ? '' : '<i class="ti-mail"></i> ' . $arr['email']); ?></span></p>
                <p><span></i><?php echo ($arr['address'] == '' ? '' : '<i class="ti-address"></i> ' . $arr['address']); ?></span></p>
                <div class="social-link">
                  <?php if ($arr['twitter'] != '') { ?><a href="<?php echo $arr['twitter']; ?>" class="Twitter"><i class="lni-twitter-filled"></i></a><?php } ?>
                  <?php if ($arr['facebook'] != '') { ?><a href="<?php echo $arr['facebook']; ?>" class="Facebook"><i class="lni-facebook-filled"></i></a><?php } ?>
                  <?php if ($arr['linkedin'] != '') { ?><a href="<?php echo $arr['linkedin']; ?>" class="Linkedin"><i class="lni-linkedin-fill"></i></a><?php } ?>
                </div>
              </div>
            </div>
            <?php if ($arr['about'] != '') { ?>
              <div class="about-me item">
                <h3>About</h3>
                <p><?php echo $arr['about']; ?></p>
              </div>
            <?php } ?>
          </div>
        </div>
      </div>
    </div>
  </div>




  <?php echo include('includes/footer.php'); ?>


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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tingle/0.15.0/tingle.min.js"></script>

  <script>
    function editProfile() {

      // instanciate new modal
      var modal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'escape'],
        closeLabel: "Close",
        cssClass: ['custom-class-1', 'custom-class-2'],
        onOpen: function() {
          console.log('modal open');
        },
        onClose: function() {
          console.log('modal closed');
        },
        beforeClose: function() {
          // here's goes some logic
          // e.g. save content before closing the modal
          return true; // close the modal
          return false; // nothing happens
        }
      });

      let htmlData = '<h1>Update profile</h1>';
      htmlData += '<div class="row"><div class="col-md-12">';
      htmlData += '<div class="col-md-4"><label>Names</label></div>';
      htmlData += '</div></div> ';

      // set content
      modal.setContent(htmlData);

      // add a button
      modal.addFooterBtn('Update', 'tingle-btn tingle-btn--primary btn-sm', function() {
        // here goes some logic
        modal.close();
      });

      // add another button
      modal.addFooterBtn('Exit', 'tingle-btn tingle-btn--danger btn-sm', function() {
        // here goes some logic
        modal.close();
      });

      // open modal
      modal.open();

    }
  </script>
</body>

</html>