// custom-select.js

YUI().use("node", function(Y) {

    Y.namespace("customSelect.one");
    Y.namespace("customSelect.all");

    Y.customSelect.one = function(selectNode) {
        var Constants = {
            REPLACE_BASE_HTML: '<span class="m_select_replace_self"></span>',
            LAYER_CLASS: "m_select_replace_layer",
            LIST_CLASS: "select_replace_list",
            ITEM_CLASS: "select_replace_item",
            LINK_CLASS: "option_link",
            SELELCTED_CLASS: "selected",
            HIDDEN_CLASS: "remote_invisible",

            // 是否隐藏原select
            IS_HIDE_ORIGIN: false,
            TIME_LIMIT: 50
        };

        var selectReplaceNode = null,
            replaceHeight = 0,
            layerNode = null,
            layerItemNodes = null,
            timeFlag = null,

            // 浮层显示状态标识
            isLayerShowed = false,

            // 取原生DOM对象（而不是YUI的Node外观对象），更方便读取select信息
            selectDOM,
            selectedIndex,
            indexTotal,
            options,
            selectedOption,
            selectedText,
            selectedValue;

        function createReplace() {
            var layerInnerHTML = "",
                layerClass = Constants.LAYER_CLASS,
                listClass = Constants.LIST_CLASS,
                itemClass = Constants.ITEM_CLASS,
                linkClass = Constants.LINK_CLASS,
                hiddenClass = Constants.HIDDEN_CLASS,

                // 遍历时的宽度记录
                recordWidth = 0,

                // 最终的适当宽度
                replaceProperWidth = 0,
                body = Y.one("body"),
                i = 0,
                len = indexTotal,
                option = null;

            // 创建替代DOM
            selectReplaceNode = Y.Node.create(Constants.REPLACE_BASE_HTML);

            // 先隐藏替代DOM，遍历option的文字，找出最大宽度
            selectReplaceNode.addClass(hiddenClass);
            selectReplaceNode.appendTo(body);

            for (; i < len; i++) {
                option = options[i];
                selectReplaceNode.set("text", option.text);
                recordWidth = parseInt(selectReplaceNode.getComputedStyle("width"));
                if (recordWidth > replaceProperWidth) {
                    replaceProperWidth = recordWidth;
                }
            }

            selectReplaceNode.setStyle("width", replaceProperWidth);

            // 有tabindex的元素才可以接受键盘事件
            selectReplaceNode.setAttribute("tabindex", 0);
            selectReplaceNode.set("text", selectedText);
            selectNode.insert(selectReplaceNode, "before");
            selectReplaceNode.removeClass(hiddenClass);

            if (Constants.IS_HIDE_ORIGIN) {
                selectNode.setStyle("display", "none");
            }

            // 替换元素的高度，帮助浮层定位到正确的位置
            replaceHeight = selectReplaceNode.get("offsetHeight");

            // 创建浮层DOM
            layerInnerHTML = layerInnerHTML + '<ul class="' + listClass + '">';

            for (i = 0; i < len; i++) {
                option = options[i];

                // 把每一项所代表的索引，保存在名为 data-index 的自定义属性中
                layerInnerHTML = layerInnerHTML + '<li class="' + itemClass + '">' +
                    '<a class="' + linkClass + '" href="javascript:;" data-index=' + i + ' title="">' + option.text + '</a>' +
                    '</li>';
            }
            layerInnerHTML = layerInnerHTML + '</ul>';

            layerNode = Y.Node.create('<div class="' + layerClass + '"></div>');
            layerNode.setHTML(layerInnerHTML);

            // html5自定义属性，用作标记，形如 data-related="anime"
            layerNode.setAttribute("data-related", selectNode.getAttribute("name"));
            layerNode.setStyle("display", "none").appendTo(body);

            // 浮层的宽度应和替换元素一致
            layerNode.setStyle("width", selectReplaceNode.get("clientWidth"));

            // 保存浮层所有li元素
            layerItemNodes = layerNode.all("." + itemClass);

            // 设置浮层当前选中项
            preUpdateSelect();
        }

        function hideLayer() {
            layerNode.setStyle("display", "none");
            selectReplaceNode.blur();
            isLayerShowed = false;
        }

        function showLayer() {
            var pos = selectReplaceNode.getXY(),
                x = pos[0],
                y = pos[1] + replaceHeight;

            layerNode.setStyles({
                display: "block",
                left: x,
                top: y
            })

            selectReplaceNode.focus();
            isLayerShowed = true;
        }

        function switchLayerStatus(action) {
            clearTimeout(timeFlag);
            switch (action) {
                case "show":
                    if (!isLayerShowed) {
                        showLayer();
                    }
                    break;
                case "hide":
                    if (isLayerShowed) {
                        timeFlag = setTimeout(function() {

                            // 如果不是因为点击或回车确认引起浮层隐藏，则还原选择
                            selectedIndex = selectDOM.selectedIndex;
                            preUpdateSelect();
                            hideLayer();
                        }, Constants.TIME_LIMIT);
                    }
                    break;
            }
        }

        function executeUpdateSelect() {
            selectReplaceNode.set("text", options[selectedIndex].text);
            selectDOM.selectedIndex = selectedIndex;
            hideLayer();
        }

        function preUpdateSelect() {
            var selectedClass = Constants.SELELCTED_CLASS;
            layerItemNodes.removeClass(selectedClass);
            layerItemNodes.item(selectedIndex).addClass(selectedClass);
        }

        function layerMouseoutHandler(event) {
            switchLayerStatus("hide");
        }

        function layerMouseoverHandler(event) {
            var target = event.target;
            if (target.get("className") === Constants.LINK_CLASS) {
                selectedIndex = target.getData("index");
            }
            preUpdateSelect();

            switchLayerStatus("show");
        }

        function layerKeydownHandler(event) {
            var keyCode = event.keyCode;
            switch (keyCode) {

                // UP
                case 38:
                    if (selectedIndex > 0) {
                        selectedIndex--;
                    }
                    preUpdateSelect();
                    break;

                    // DOWN
                case 40:
                    if (selectedIndex < indexTotal - 1) {
                        selectedIndex++;
                    }
                    preUpdateSelect();
                    break;

                    // ENTER
                case 13:
                    executeUpdateSelect();
                    break;
            }
            event.preventDefault();
        }

        function replaceMouseoverHandler(event) {
            switchLayerStatus("show");
        }

        function replaceMouseoutHandler(event) {
            switchLayerStatus("hide");
        }

        function layerLinkClickHandler(event) {
            var target = event.currentTarget;
            selectedIndex = target.getData("index");
            executeUpdateSelect();
        }

        function bindEvents() {
            selectReplaceNode.on("mouseover", replaceMouseoverHandler);
            selectReplaceNode.on("mouseout", replaceMouseoutHandler);
            selectReplaceNode.on("keydown", layerKeydownHandler);
            layerNode.on("mouseover", layerMouseoverHandler);
            layerNode.on("mouseout", layerMouseoutHandler);
            layerNode.delegate("click", layerLinkClickHandler, "." + Constants.LINK_CLASS);
        }

        function assignData() {
            selectDOM = selectNode.getDOMNode();
            selectedIndex = selectDOM.selectedIndex;
            options = selectDOM.options;
            indexTotal = options.length;
            selectedOption = options[selectedIndex];
            selectedText = selectedOption.text;
            selectedValue = selectedOption.value;
        }

        function init() {
            if (Y.Lang.isString(selectNode)) {
                selectNode = Y.one(selectNode);
            }

            if (selectNode) {
                assignData();
                createReplace();
                bindEvents();
            }
        }

        init();
    };

    Y.customSelect.all = function(selectNodes) {
        if (Y.Lang.isString(selectNodes)) {
            selectNodes = Y.all(selectNodes);
        }

        selectNodes.each(Y.customSelect.one);
    };

    Y.customSelect.all("select");
});