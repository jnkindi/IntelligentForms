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
            <?php
            $query = "SELECT * FROM form WHERE id = '" . $_GET['id'] . "'";
            $query = $conn->query($query);
            $arr = $query->fetch_array();

            $query = "SELECT * FROM form_replier WHERE form_id = '" . $_GET['id'] . "' ORDER BY id DESC";
            $query = $conn->query($query);
            ?>
            <h3><?php echo $arr['title']; ?> <?php echo (($query->num_rows == 0) ? '' : '(' . $query->num_rows . ')') ?></h3>
          </div>
        </div>
      </div>
    </div>
  </div>


  <section class="job-browse section" style="padding-top: 0px;">
    <div class="container">
      <div class="row">
        <div class="col-lg-12 col-md-12 col-xs-12">
          <?php
          while ($row = $query->fetch_assoc()) {
            $replier = $row['id'];
            ?>
            <!--  -->
            <div class="job-listings">
              <div class="row">
                <div class="col-lg-12">
                  <div class="job-details">
                    <table class="table form-table-result">
                      <tr>
                        <th>DateTime</th>
                        <td><?php echo $row['date']; ?></td>
                      </tr>
                      <?php
                      $fetch_field = "SELECT * FROM form_field WHERE form_id = '" . $_GET['id'] . "'";
                      $fetch_field = $conn->query($fetch_field);
                      while ($rowField = $fetch_field->fetch_assoc()) {
                        $field = $rowField['id'];
                        ?>
                        <tr>
                          <th><?php echo $rowField['field'] ?></th>
                          <td>
                            <ul>
                              <?php
                              $fetchAnswer = "SELECT answer FROM form_replies WHERE field_id = '$field' AND replier_id = '$replier'";
                              $fetchAnswer = $conn->query($fetchAnswer);
                              while ($rowAnswers = $fetchAnswer->fetch_assoc()) {
                                ?>
                                <li><?php echo $rowAnswers['answer']; ?></li>
                              <?php
                            }
                            ?>
                            </ul>
                          </td>
                        </tr>
                      <?php } ?>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          <?php
        }
        ?>
          <!--  -->

        </div>
      </div>
    </div>
  </section>



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
</body>

</html>