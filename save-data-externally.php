<?php include('session.php'); ?>
<?php
if (isset($_POST['submit'])) {
  $url = $_POST['url'];
  $method = $_POST['method'];
  $formid = $_GET['id'];
  //
  $fieldid = $_POST['fieldid'];
  $fieldname = $_POST['fieldname'];
  //
  $fetch = "SELECT * FROM external_api WHERE form_id = '" . $formid . "'";
  $fetch = $conn->query($fetch);
  $arr_externalApi = $fetch->fetch_array();
  if ($fetch->num_rows == 0) {
    $query = "INSERT INTO external_api(id, form_id, url, method) VALUES(NULL, '$formid', '$url', '$method');";

    $query = $conn->query($query);
    $external_api = $conn->insert_id;
  } else {
    $query = "UPDATE external_api SET url='$url', method='$method' WHERE form_id = '$formid'";
    $query = $conn->query($query);
  }
  //
  for ($i = 0; $i < count($fieldid); $i++) {
    $formfieldid = $fieldid[$i];
    $formfieldname = $fieldname[$i];

    $fetch = "SELECT * FROM external_api_field WHERE field_id = '" . $formfieldid . "'";
    $fetch = $conn->query($fetch);
    if ($fetch->num_rows == 0) {
      echo $query = "INSERT INTO external_api_field(id, external_api, field_id, externalfield_name) VALUES(NULL, '$external_api', '$formfieldid', '$formfieldname');";
    } else {
      $query = "UPDATE external_api_field SET externalfield_name = '$formfieldname' WHERE field_id = '$formfieldid'";
    }
    $query = $conn->query($query);
  }
  header('Location: save-data-externally.php?id=' . $formid);
}
?>
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="utf-8">
  <meta name="viewport" content="widtd=device-widtd, initial-scale=1, shrink-to-fit=no">
  <meta name="keywords" content="Bootstrap, Landing page, Template, Registration, Landing">
  <meta name="viewport" content="widtd=device-widtd, initial-scale=1, maximum-scale=1">
  <meta name="autdor" content="Grayrids">
  <title>IntelligentForms</title>

  <link rel="stylesheet" href="assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="assets/css/line-icons.css">
  <link rel="stylesheet" href="assets/css/owl.carousel.min.css">
  <link rel="stylesheet" href="assets/css/owl.tdeme.default.css">
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

            $fetch = "SELECT * FROM external_api WHERE form_id = '" . $_GET['id'] . "'";
            $fetch = $conn->query($fetch);
            $arr_externalApi = $fetch->fetch_array();
            ?>
            <h3><?php echo $arr['title']; ?></h3>
            <p>Connect fields on this form with your API</p>
          </div>
        </div>
      </div>
    </div>
  </div>


  <section class="job-browse section" style="padding-top: 0px;">
    <div class="container">
      <div class="row">
        <div class="col-lg-12 col-md-12 col-xs-12">
          <!--  -->
          <div class="job-listings">
            <div class="row">
              <div class="col-lg-12">
                <div class="job-details">
                  <form method="POST">
                    <table class="table">
                      <tr>
                        <td><input type="url" name="url" value="<?php echo $arr_externalApi['url'] ?>" required placeholder="API URL" class="form-control"></td>
                        <td>
                          <select name="method" class="form-control">
                            <option value="" disabled>Select Method</option>
                            <?php
                            $listmethods = ['POST', 'GET', 'PUT', 'PATCH'];
                            foreach ($listmethods as $method) {
                              echo '<option ' . (($arr_externalApi['method'] == $method) ? 'selected' : '') . ' value="' . $method . '">' . $method . '</option>';
                            }
                            ?>
                          </select>
                        </td>
                      </tr>
                      <?php
                      $fetch_field = "SELECT * FROM form_field WHERE form_id = '" . $_GET['id'] . "' ORDER BY id ASC";
                      $fetch_field = $conn->query($fetch_field);
                      while ($rowField = $fetch_field->fetch_assoc()) {
                        $field = $rowField['id'];
                        ?>
                        <tr>
                          <td><?php echo $rowField['field'] ?></td>
                          <td>
                            <input type="hidden" name="fieldid[]" value="<?php echo $rowField['id']; ?>" class="form-control">
                            <?php
                            $fieldvalue = "";
                            $fetch = "SELECT * FROM external_api_field WHERE field_id = '" . $rowField['id'] . "' ORDER BY id ASC";
                            $fetch = $conn->query($fetch);
                            $row = $fetch->fetch_array();
                            $fieldvalue = $row['externalfield_name'];
                            ?>
                            <input type="text" name="fieldname[]" value="<?php echo $fieldvalue; ?>" placeholder="Field Name" class="form-control">
                          </td>
                        </tr>
                      <?php } ?>
                      <tr class="text-center">
                        <td colspan="2"><button type="submit" name="submit" class="btn btn-dark">SAVE</button></td>
                      </tr>
                    </table>
                  </form>
                </div>
              </div>
            </div>
          </div>
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