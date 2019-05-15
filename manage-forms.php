<?php include('session.php'); ?>
<?php
if (isset($_GET['inactivate'])) {
  $conn->query("UPDATE form SET status = 'Inactive' WHERE id = '" . $_GET['inactivate'] . "'");
  header('Location: manage-forms.php');
  return;
}
if (isset($_GET['activate'])) {
  $conn->query("UPDATE form SET status = 'Active' WHERE id = '" . $_GET['activate'] . "'");
  header('Location: manage-forms.php');
  return;
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
    <?php echo include('includes/menu-logged-in.php'); ?>

  </header>


  <div class="page-header">
    <div class="container">
      <div class="row">
        <div class="col-xl-3 col-lg-6 col-12">
          <div class="card bg-dark text-white">
            <div class="card-content">
              <div class="card-body">
                <div class="media d-flex">
                  <div class="align-self-center">
                    <i class="lni-files float-left" style="font-size: 75px;"></i>
                  </div>
                  <div class="media-body text-right">
                    <?php
                    $query = "SELECT * FROM form WHERE user_id = '$userId' AND status = 'Active'";
                    $query = $conn->query($query);
                    ?>
                    <h3 style="color: #fff"><?php echo $query->num_rows; ?></h3>
                    <span>All active forms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-12">
          <div class="card bg-light">
            <div class="card-content">
              <div class="card-body">
                <div class="media d-flex">
                  <div class="align-self-center">
                    <i class="lni-files float-left" style="font-size: 75px;"></i>
                  </div>
                  <div class="media-body text-right">
                    <?php
                    $query = "SELECT * FROM form WHERE user_id = '$userId' AND type = 'Form'";
                    $query = $conn->query($query);
                    ?>
                    <h3><?php echo $query->num_rows; ?></h3>
                    <span>Added forms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-12">
          <div class="card bg-light">
            <div class="card-content">
              <div class="card-body">
                <div class="media d-flex">
                  <div class="align-self-center">
                    <i class="lni-files float-left" style="font-size: 75px;"></i>
                  </div>
                  <div class="media-body text-right">
                    <?php
                    $query = "SELECT * FROM form WHERE user_id = '$userId' AND type = 'Survey'";
                    $query = $conn->query($query);
                    ?>
                    <h3><?php echo $query->num_rows; ?></h3>
                    <span>Added surveys</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-3 col-lg-6 col-12">
          <div class="card bg-light">
            <div class="card-content">
              <div class="card-body">
                <div class="media d-flex">
                  <div class="align-self-center">
                    <i class="lni-files float-left" style="font-size: 75px;"></i>
                  </div>
                  <div class="media-body text-right">
                    <?php
                    $query = "SELECT * FROM form WHERE user_id = '$userId' AND type = 'Cart'";
                    $query = $conn->query($query);
                    ?>
                    <h3><?php echo $query->num_rows; ?></h3>
                    <span>Added cart</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div id="content">
    <div class="container">
      <div class="row">
        <?php include('includes/leftbar.php'); ?>
        <div class="col-lg-8 col-md-12 col-xs-12">
          <div class="job-alerts-item candidates">
            <?php
            $type = "all Forms";
            if (isset($_GET['form'])) {
              $type = "Form";
            }
            if (isset($_GET['survey'])) {
              $type = "Survey";
            }
            if (isset($_GET['cart'])) {
              $type = "Cart";
            }
            ?>
            <h3 class="alerts-title">Manage <?php echo $type; ?></h3>

            <?php
            $query = "SELECT * FROM form WHERE user_id = '$userId' ORDER BY id DESC";
            if ($type != "all Forms") {
              $query = "SELECT * FROM form WHERE user_id = '$userId' AND type = '$type' ORDER BY id DESC";
            }
            $query = $conn->query($query);
            while ($row = $query->fetch_assoc()) {

              $queryReplies = "SELECT * FROM form_replier WHERE form_id = '" . $row['id'] . "' ORDER BY id DESC";
              $queryReplies = $conn->query($queryReplies);
              ?>
              <!--  -->
              <div class="manager-resumes-item">
                <div class="manager-content">
                  <div class="manager-info">
                    <div class="manager-name">
                      <h5><a href="form-replies.php?id=<?php echo $row['id']; ?>" style="color:#000"><?php echo $row['title']; ?> <?php echo (($queryReplies->num_rows == 0) ? '' : '(' . $queryReplies->num_rows . ')') ?></a></h5>
                    </div>
                  </div>
                </div>
                <div class="update-date">
                  <div class="status">
                    <?php if ($row['status'] == "Active") { ?>
                      <a class="btn btn-xs btn-gray" href="manage-forms.php?inactivate=<?php echo $row['id'] ?>">Deactivate</a>
                    <?php } else { ?>
                      <a class="btn btn-xs btn-gray" href="manage-forms.php?activate=<?php echo $row['id'] ?>">Activate</a>
                    <?php } ?>
                    <a class="btn btn-xs btn-gray" href="save-data-externally.php?id=<?php echo $row['id'] ?>">Save data externally</a>
                    <span onclick="copyToClipboard('#texttocopy_<?php echo $row['id'] ?>')" class="btn btn-xs btn-gray">Copy URL</span>
                    <p style="display:none" id="texttocopy_<?php echo $row['id'] ?>">http://forms-intelligentforms.jnkindilogs.xyz/index.php?form=<?php echo $row['identifierhash'] ?></p>
                    <span data-toggle="modal" data-target="#embed-<?php echo $row['id'] ?>" class="btn btn-xs btn-gray">Use in your website</span>
                  </div>
                </div>
              </div>
              <!--  -->
              <div class="modal" id="embed-<?php echo $row['id'] ?>">
                <div class="modal-dialog modal-dialog-centered">
                  <div class="modal-content">

                    <!-- Modal body -->
                    <div class="modal-body">
                      Copy paste the script in your website <span class="badge badge-md badge-primary" style="cursor: pointer" onclick="copyToClipboard('#code_section_<?php echo $row['id'] ?>')">COPY</span>
                      <br>
                      <code>
                        &lt;iframe src=&quot;http://forms-intelligentforms.jnkindilogs.xyz/embed.php?form=<?php echo $row['identifierhash'] ?>&quot;&gt;&lt;/iframe&gt;
                        <!-- <tex type="text" id="code_section_<?php echo $row['id'] ?>" value='<iframe src="http://forms-intelligentforms.jnkindilogs.xyz/embed.php?form=<?php echo $row['identifierhash'] ?>"></iframe>'> -->
                      </code>
                      </pre>
                    </div>

                  </div>
                </div>
              </div>
            <?php
          }
          ?>

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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js"></script>
  <script src="assets/js/main.js"></script>
  <script>
    function copyToClipboard(element) {
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val($(element).html()).select();
      document.execCommand("copy");
      $temp.remove();
      $.notify("Copied to clipboard", "success", );
    }
  </script>
</body>

</html>