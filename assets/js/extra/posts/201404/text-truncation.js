// text-truncation.js

var truncation = (function() {
    var Constants = {
        CHARACTERS_EN: ["A", "Q", "a", "W", "l", "C", "h"],
        CHARACTERS_CH: ["葉", "月", "抹", "茶"]
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

            for(; i<len;i++){
                testNode.innerHTML = characters[i];
                testWidth = testNode.offsetWidth;
                resultHTML = resultHTML + "<span>" + characters[i] + " : " + "<em>" + testWidth + "</em></span>";
                if( i === boundaryIndex){
                    resultHTML = resultHTML + "<br>";
                }
            }

            body.removeChild(testNode);
            resultNode.innerHTML = resultHTML;
        }
    };
}());

truncation.createWidthTest();