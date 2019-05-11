<?php include('session.php'); ?>
<?php
if (isset($_POST['submit'])) {
  $title = $_POST['title'];
  $type = $_POST['type'];
  $description = $_POST['description'];

  $fields = $_POST['field'];
  $field_nbr = $_POST['field_nbr'];
  $answer_type = $_POST['answer_type'];
  $answer_subtype = $_POST['answer_subtype'];
  $answer = $_POST['answer'];


  $date = Date('Y-m-d');

  $identifier = mt_rand(10000, 99999);
  $identifierhash = md5($identifier);
  $sqlSingle = "INSERT INTO form (id, title, type, identifier, identifierhash, user_id, status) VALUES (NULL, '$title', '$type', '$identifier', '$identifierhash', '$userId', 'Active');";
  $resultSingle = $conn->query($sqlSingle);
  if (!$resultSingle) {
    header("Location: add-form.php?error");
  } else {
    $form_id = $conn->insert_id;
    $counter = 0;
    foreach ($fields as $field) {
      $answer_type_name = $answer_type[$counter];
      $answer_type_sub_name = "";
      if ($answer_type_name == "Text") {
        $answer_type_sub_name = $answer_subtype[0];
        unset($answer_subtype[0]);
        $answer_subtype = array_values($answer_subtype);
      }
      $sqlSingle = "INSERT INTO form_field (id, form_id, field, answer_type, answer_subtype, status) VALUES (NULL, '$form_id', '$field', '$answer_type_name', '$answer_type_sub_name', 'Active');";
      if ($conn->query($sqlSingle)) {
        $field_id = $conn->insert_id;
        if ($answer_type_name != "Text") {
          $list_answer = $answer[$field_nbr[$counter]];
          foreach ($list_answer as $single_answer) {
            $sqlSingle = "INSERT INTO form_expected_answer (id, answer, field_id, status) VALUES (NULL, '$single_answer', '$field_id', 'Active');";
            $resultSingle = $conn->query($sqlSingle);
          }
        }
      }
      $counter++;
    }
  }
  header("Location: add-form.php?success");
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


  <form class="form-ad" method="POST">
    <div class="page-header">
      <div class="container">
        <div class="row">
          <div class="col-lg-12">
            <div class="inner-header">
              <h3>Create</h3>
            </div>
            <div class="form-group text-center">
              <div class="btn-group btn-group-toggle" data-toggle="buttons">
                <label class="btn btn-primary <?php echo isset($_GET['form']) ? 'active' : '' ?> <?php echo (!isset($_GET['form']) && !isset($_GET['survey']) && !isset($_GET['cart'])) ? 'active' : '' ?>">
                  <input type="radio" name="type" value="Form" autocomplete="off" <?php echo isset($_GET['form']) ? 'checked' : '' ?> <?php echo (!isset($_GET['form']) && !isset($_GET['survey']) && !isset($_GET['cart'])) ? 'checked' : '' ?>> Form
                </label>
                <label class="btn btn-primary <?php echo isset($_GET['survey']) ? 'active' : '' ?>">
                  <input type="radio" name="type" value="Survey" autocomplete="off" <?php echo isset($_GET['survey']) ? 'checked' : '' ?>> Survey
                </label>
                <label class="btn btn-primary <?php echo isset($_GET['cart']) ? 'active' : '' ?>">
                  <input type="radio" name="type" value="Cart" autocomplete="off" <?php echo isset($_GET['cart']) ? 'checked' : '' ?>> Cart
                </label>
              </div>
            </div>
            <?php if (isset($_GET['success'])) { ?>
              <div class="row">
                <div class="post-header col-md-4 offset-md-4">
                  <p>Successfully created! <a href="#">Manage Form</a></p>
                </div>
              </div>
            <?php } ?>
          </div>
        </div>
      </div>
    </div>


    <section id="content" style="margin-bottom: 40px">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-9 col-md-12 col-xs-12">
            <div class="add-resume box">
              <div class="form-group">
                <label class="control-label">Title</label>
                <input type="text" class="form-control" placeholder="Title" name="title" required>
              </div>
              <div class="form-group">
                <label class="control-label">Description</label>
                <textarea class="form-control" rows="2" placeholder="Description" name="description"></textarea>
              </div>
              <div class="add-post-btn">
                <div class="float-left">
                  <a href="javascript:void()" class="btn-added" onclick="add_question()"><i class="ti-plus"></i> Add Field</a>
                </div>
              </div>
              <div class="col-md-12 question_section">
                <div class="col-md-8 form-group">
                  <label>Field</label>
                  <input class="form-control" name="field[]" id="question_0" type="text" required="" autocomplete="off" aria-required="true" placeholder="Field title">
                  <input type="hidden" name="field_nbr[]" value="0">
                </div>
                <div class="col-md-4 form-group">
                  <label>Expected Answer Type</label>
                  <select class="form-control" name="answer_type[]" id="answer_type_0" onchange="answer_type(0)">
                    <option value="0" disabled selected> Select Answer Type </option>
                    <option>Text</option>
                    <option>Single Answer</option>
                    <option>Multiple Answer</option>
                  </select>
                </div>
                <div class="col-md-12 add-post-btn" id="sub_answer_0"></div>
              </div>
              <div id="questions" class="add-post-btn"></div>
              <button type="submit" name="submit" class="btn btn-common">Save</button>
  </form>
  </div>
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
  <script type="text/javascript">
    function answer_type(i) {
      $("#sub_answer_" + i).empty();
      var answer_type = $("#answer_type_" + i).val();
      if (answer_type == "Text") {
        var html = '<div class="col-md-6 form-group"><label>Answer Sub Type</label><select class="form-control" name="answer_subtype[]" id="answer_type_' + i + '"><option value="" disabled selected> Select Answer Sub Type </option><option>Text field</option><option>Textbox</option><option>Date</option><option>Number</option><option>Phone Number</option></select></div>';
        $("#sub_answer_" + i).append(html);
      }
      if (answer_type == "Single Answer" || answer_type == "Multiple Answer") {
        var html = '<div style="float:left; width: 100%;"><a href="javascript:void()" class="btn-added" onclick="add_answer(' + i + ')"><i class="ti-plus"></i> Add Answer</a></div><div class="col-md-3 form-group" id="answer_' + i + '_0"><input type="text" class="form-control col-md-12" name="answer[' + i + '][]" id="answer_type_' + i + '" required placeholder="Add Answer" autocomplete="off"><span class="btn btn-danger col-md-12" onclick="remove_answer(' + i + ',0)">Remove</span></div>';
        $("#sub_answer_" + i).append(html);
      }
    }
    var answer = 1;

    function add_answer(i) {
      var html = '<div class="col-md-3 form-group" id="answer_' + i + '_' + answer + '"><input type="text" class="form-control col-md-12" name="answer[' + i + '][]" id="answer_' + i + '" required placeholder="Add Answer" autocomplete="off"><span class="btn btn-danger col-md-12" onclick="remove_answer(' + i + ',' + answer + ')">Remove</span></div>';
      $("#sub_answer_" + i).append(html);
      answer++;
    }

    function remove_answer(row, column) {
      $("#answer_" + row + "_" + column).remove();
    }
    var question = 1;

    function add_question() {
      var html = '<div class="col-md-12 question_section" id="question_section_' + question + '"> <div style="float:left; width: 100%; margin-bottom: 10px;"> <div class="col-md-8 form-group"><label style="padding-bottom:10px">Field <span class="btn-sm btn-danger" style="cursor:pointer" onclick="remove_question(' + question + ')"> Remove </span></label><input class="form-control" name="field[]" id="question_' + question + '" type="text" required autocomplete="off" aria-required="true" placeholder="Field title"><input type="hidden" name="field_nbr[]" value="' + question + '"></div><div class="col-md-4 form-group"><label>Expected Answer Type</label><select class="form-control" name="answer_type[]" id="answer_type_' + question + '" onchange="answer_type(' + question + ')"><option value="0" disabled selected> Select Answer Type </option><option>Text</option><option>Single Answer</option><option>Multiple Answer</option></select></div></div><div class="col-md-12" id="sub_answer_' + question + '"></div></div>';
      $("#questions").append(html);
      question++;
    }

    function remove_question(i) {
      $("#question_section_" + i).remove();
    }
  </script>
</body>

</html>