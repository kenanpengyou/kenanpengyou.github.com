/*
* acgtofe.js
* Based on jquery-1.9.1
* By Liang Zhu(kenanpengyou@yeah.net)
* Date 2013-03-08
*/

 (function($) {

     //return to top
     var returnToTop = function() {
         var handleId = "returnTop",
             handleShowOffset = 200,
             handleShowDuration = 300,
             handlePos = {
                 right: 0,
                 bottom: 50
             },
             returnDuration = 100,
             scrollPos = 0,
             scrollPosLast = 0,
             windowResize = false,
             cssFixSupport = !window.ActiveXObject || window.XMLHttpRequest;

         var handleElement = $("#" + handleId),
             posString = cssFixSupport ? "fixed" : "absolute";

         var handleControl = function() {
             var scrollPos = $(document).scrollTop();
             if (scrollPosLast <= handleShowOffset && scrollPos > handleShowOffset) {
                 handleElement.fadeIn(handleShowDuration);
             } else if (scrollPosLast > handleShowOffset && scrollPos <= handleShowOffset) {
                 handleElement.fadeOut(handleShowDuration);
             }

             if (!cssFixSupport) {
                 handleElement.css("top", scrollPos + $(window).height() - handlePos.bottom);
             } else if (windowResize) {
                 windowResize = false;
                 handleElement.css("top", $(window).height() - handlePos.bottom);
             }

             //update value
             scrollPosLast = scrollPos;
         }

         handleElement.css({
             "position": posString,
             "right": handlePos.right,
             "top": $(window).height() - handlePos.bottom
         });

         //it's better to set the handleElement "display:none" in css previously if using static HTML
         handleElement.hide();

         handleElement.on("click", function(event) {
             $("html, body").animate({
                 scrollTop: 0
             }, handleShowDuration);
         })
         $(window).on("scroll", function() {
             handleControl();
         }).on("resize", function() {
             windowResize = true;
             handleControl();
         })
     }

     //preload imgs, based on jquery.imgpreloader
     var preloadImgs = function() {
         var siteURL = "http://acgtofe.com",
             themeImgPath = "/assets/themes/imaimo/images/",
             basePathArray = ["total_bg.jpg", "notebook.png"],
             resultPathArray = basePathArray;
         $.each(resultPathArray, function(index, value) {
             resultPathArray[index] = siteURL + themeImgPath + value;
         });
         $.imgpreloader({
             paths: resultPathArray
         }).done(function($allImages) {
             alert("preload ok!");
         });
     }

     //functions which run before page show
     preloadImgs();

     //functions which run after page ready
     $(function() {
         returnToTop();
     });

 })(jQuery);