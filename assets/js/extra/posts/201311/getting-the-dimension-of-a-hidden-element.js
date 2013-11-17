// getting-the-dimension-of-a-hidden-element.js

$("#demo-show-link").on("click",function(event){
    $("#demo-hidden").animate({
        display: "block",
        height: "show"
    });
})