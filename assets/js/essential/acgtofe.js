/*
 * acgtofe.js
 * Based on jquery-1.11.0
 * By Liang Zhu(kenanpengyou@yeah.net)
 * Date 2014-02-27
 */

// From https://gist.github.com/bobslaede/1221602
Modernizr.addTest('positionfixed', function() {
    var test = document.createElement('div'),
        control = test.cloneNode(false),
        fake = false,
        root = document.body || (function() {
            fake = true;
            return document.documentElement.appendChild(document.createElement('body'));
        }());

    var oldCssText = root.style.cssText;
    root.style.cssText = 'padding:0;margin:0';
    test.style.cssText = 'position:fixed;top:42px';
    root.appendChild(test);
    root.appendChild(control);

    var ret = test.offsetTop !== control.offsetTop;

    root.removeChild(test);
    root.removeChild(control);
    root.style.cssText = oldCssText;

    if (fake) {
        document.documentElement.removeChild(root);
    }

    return ret;
});

! function($) {

    window.acgtofe = {};

    // return to top
    acgtofe.returnToTop = function() {
        var handleId = "returnTop",
            handleShowOffset = 200,
            handleShowDuration = 300,
            handlePos = {
                right: 0,
                bottom: 50
            },
            returnDuration = 100,
            cssFixSupport = Modernizr.positionfixed;

        var handleNode = $("#" + handleId),
            posString = cssFixSupport ? "fixed" : "absolute",
            scrollPos = 0,
            scrollPosLast = 0,
            windowResize = false,
            win = $(window),
            doc = $(document);

        function controlHandleNode() {
            var scrollPos = win.scrollTop();
            if (scrollPosLast > handleShowOffset) {
                handleNode.fadeIn(handleShowDuration);
            } else if (scrollPosLast <= handleShowOffset) {
                handleNode.fadeOut(handleShowDuration);
            }

            if (!cssFixSupport) {
                handleNode.css("top", scrollPos + win.height() - handlePos.bottom);
            } else if (windowResize) {
                windowResize = false;
                handleNode.css("top", win.height() - handlePos.bottom);
            }

            //update value
            scrollPosLast = scrollPos;
        }

        function animateToTop() {
            $("html, body").animate({
                scrollTop: 0
            }, handleShowDuration);
        }

        function clickHandler(event) {
            animateToTop();
        }

        function scrollHandler(event) {
            controlHandleNode();
        }

        function resizeHandler(event) {
            windowResize = true;
            controlHandleNode();
        }

        function bindEvents() {
            handleNode.on("click", clickHandler);
            win.on({
                scroll: scrollHandler,
                resize: resizeHandler
            });
        }

        function init() {
            if (handleNode.length) {
                handleNode.css({
                    "position": posString,
                    "right": handlePos.right,
                    "top": win.height() - handlePos.bottom
                });

                //it's better to set the handleNode "display:none" in css previously if using static HTML
                handleNode.hide();

                bindEvents();
            }
        }

        init();
    }

    acgtofe.setup = function() {
        var object = this;
        object.returnToTop();
    }

    //functions which run after page ready
    $(function() {
        acgtofe.setup();
    });

}(jQuery);