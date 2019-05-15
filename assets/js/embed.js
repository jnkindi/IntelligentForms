$(window).on("load",function(){
  $.ajax({method:"GET",url:"http://intelligentforms.jnkindilogs.xyz/getForms.php",dataType:"json"})
    .done(function(data){
    //     for(let i=0; i<data.length;i++){
    //     //  
    //     console.log(data[i]);
    //     }
    // //   $("body").append(data);
    $(".body").html(`<h1>${data.a}</h1>`);
    })
    .fail(function(error){
        console.log(error);
    })
})