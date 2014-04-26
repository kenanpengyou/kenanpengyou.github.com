// text-truncation.js

var truncation = (function() {
    var Constants = {
        CHARACTERS_EN: ["A", "Q", "a", "W", "l", "C", "h"],
        CHARACTERS_CH: ["葉", "月", "抹", "茶"],
        SUFFIX: "..."
    };

    var doc = document,
        body = doc.getElementsByTagName("body")[0],
        resultNode = doc.getElementById("character");

    return {
        createWidthTest: function() {
            var testNode = doc.createElement("span"),
                characters_en = Constants.CHARACTERS_EN,
                characters_ch = Constants.CHARACTERS_CH,
                characters = characters_en.concat(characters_ch),
                boundaryIndex = characters_en.length - 1,
                i = 0,
                len = characters.length,
                testWidth = 0,
                resultHTML = "";

            body.appendChild(testNode);

            for (; i < len; i++) {
                testNode.innerHTML = characters[i];
                testWidth = testNode.offsetWidth;
                resultHTML = resultHTML + "<span>" + characters[i] + " : " + "<em>" + testWidth + "</em></span>";
                if (i === boundaryIndex) {
                    resultHTML = resultHTML + "<br>";
                }
            }

            body.removeChild(testNode);
            resultNode.innerHTML = resultHTML;
        },
        doOne: function(string, widthLimit, targetStyles){
            var containerNode = doc.createElement("div"),
            width = 0,
            suffix = Constants.SUFFIX,
            i;

            for (i in targetStyles) {
                if (targetStyles.hasOwnProperty(i)) {
                    containerNode.style[i] = targetStyles[i];
                }
            }

            containerNode.style.position = "absolute";
            body.appendChild(containerNode);

            containerNode.innerHTML = string;
            width = containerNode.offsetWidth;
            if(width < widthLimit){
                body.removeChild(containerNode);
                return string;
            }
            while(width > widthLimit){
                string = string.substr(0, string.length - 1);
                containerNode.innerHTML = string + suffix;
                width = containerNode.offsetWidth;
            }

            string = string + suffix;
            body.removeChild(containerNode);
            return string;
        },
        doMultiple: function(string, lineLimit, lastWidthLimit, targetStyles) {
            var containerNode = doc.createElement("div"),
                textNode = doc.createElement("span"),
                lastRect = null,
                lastWidth = 0,
                line = 0,
                suffix = Constants.SUFFIX,
                clientRects,
                i;

            // targetStyles包含了最终文字会被存放的元素的排版有关样式，临时元素需要和它一样
            for (i in targetStyles) {
                if (targetStyles.hasOwnProperty(i)) {
                    containerNode.style[i] = targetStyles[i];
                }
            }

            containerNode.style.position = "absolute";
            containerNode.appendChild(textNode);
            body.appendChild(containerNode);

            // 首次判断， 有可能不需要截断
            textNode.innerHTML = string;
            clientRects = textNode.getClientRects();
            line = clientRects.length;
            lastRect = clientRects[line - 1];
            // IE8及以下没有width属性
            lastWidth = typeof lastRect.width === "undefined" ? lastRect.right - lastRect.left : lastRect.width;

            if(line < lineLimit){
                body.removeChild(containerNode);
                return string;
            }else if(line === lineLimit && lastWidth < lastWidthLimit){
                body.removeChild(containerNode);
                return string;
            }

            // 如果需要截断，进入循环，并在结果后添加后缀记号(...)
            while (line > lineLimit || lastWidth > lastWidthLimit) {
                string = string.substr(0, string.length - 1);
                textNode.innerHTML = string + suffix;
                clientRects = textNode.getClientRects();
                line = clientRects.length;
                lastRect = clientRects[line - 1];
                lastWidth = typeof lastRect.width === "undefined" ? lastRect.right - lastRect.left : lastRect.width;
            }

            string = string + suffix;
            body.removeChild(containerNode);
            return string;
        }
    };
}());

truncation.createWidthTest();
