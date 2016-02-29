---
layout: post
title: "创建自定义外观的表单select"
category: "javascript"
description: "对网页表单的外观和一致性有更高的要求？那就自己搭建一个拥有同样功能的表单元素。本文描述的是用YUI创建一个自定义外观的表单select的过程。"
extraCSS: ["posts/201403/custom-select.css"]
extraJS: ["http://yui.yahooapis.com/3.15.0/build/yui/yui-min.js","posts/201403/custom-select.js"]
---
{% include JB/setup %}

网页表单中的`<select>`，在不同浏览器中的默认外观是不同的，比如下图：

![表单select默认外观][img_default_select_appearance]

除了边框，宽高等差异外，表示下拉的小箭头也是各不相同。不过，整体上说，差异并不是特别大，所以，很多时候直接使用这种原生select就足够了。

[携程UED上的一篇文章][]探讨过设置css使select在不同浏览器中的外观更倾向于一致的做法（注意，这已经是2年前的文章了，所以里面的信息会有偏差）。但显然，要实现更一致、美观的表单，我们应该做的就是*自定义*。

## 准备工作 ##

select可以看做两部分组成的。这样，首先我们就是设计一下这两部分的外观：

![自定义外观设计][img_custom_select_design]

这两部分会是这样的html代码：

{% highlight html %}
<span>-2014年4月番-</span>

<div>
    <ul>
        <li><a href="javascript:;">-2014年4月番-</a></li>
        <li><a href="javascript:;">艾斯卡与罗吉的工作室</a></li>
        <li><a href="javascript:;">Love Live! 第2期</a></li>
        <li><a href="javascript:;">漫画家与助手们</a></li>
    </ul>
</div>
{% endhighlight %}

然后，为它们添加class，定义好样式，准备工作就结束了。接下来是实现交互功能。

## 添加功能 ##

本文使用了javascript库—YUI。它的参考资料并不多，建议直接查看[官方文档][]。此外，还有一个非常推荐的参考站点[jQuery - YUI 3 Rosetta Stone][]，它通过对比形式列出了某一功能如何分别用YUI和jQuery实现。

我的自定义select的功能实现的思路是这样的：

* html代码本身仍然是原生的select。
* javascript找到这些select，然后为每一个select，都创建一份自定义元素，内容和原select相同。
* 将自定义元素摆放到select原本所在的位置，并隐藏掉原来的select。
* 修改自定义元素的选择项，将对应地改变原本的select的选择项。

这个过程中，把select自定义想成了更像是附加功能的形式。表单提交只会提交原生select的信息，而如果禁用javascript，则原生select正常使用。

整个代码结构是：

{% highlight javascript %}
YUI().use("node", function(Y) {

    Y.namespace("customSelect");

    Y.customSelect.one = function(selectNode) {

        // 常量&参数
        var Constants = {

        };

        // 变量
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
            selectedText;

        // 一系列函数声明

        function init() {
            // 初始化代码
        }

        init();
    };
});
{% endhighlight %}

整个功能只需要用到YUI的node模块。这个结构是我编写各类功能一般遵循的格式，这样确定之后，剩余的所有代码都是一系列函数声明。显然，变量和常量也不是一开始就能定下来，而是随着编写过程，根据需要随时添加或删减，它们都可以被这一系列定义的函数访问到。

### 初始化 ###

`init()`初始化函数是所有代码执行的入口，定义如下：

{% highlight javascript %}
function init() {
    if (Y.Lang.isString(selectNode)) {
        selectNode = Y.one(selectNode);
    }

    if (selectNode) {
        assignData();   // 变量赋值
        createReplace();    // 创建自定义元素
        bindEvents();   // 事件绑定
    }
}
{% endhighlight %}

这里只是判断如果元素存在，则依次执行一系列操作。

### 获取select信息 ###

`assignData()`的代码：

{% highlight javascript %}
function assignData() {
    selectDOM = selectNode.getDOMNode();
    selectedIndex = selectDOM.selectedIndex;
    options = selectDOM.options;
    indexTotal = options.length;
    selectedOption = options[selectedIndex];
    selectedText = selectedOption.text;
}
{% endhighlight %}

这部分是因为要生成一个内容相同的自定义元素，需要先读取并保存原select的信息。

### 创建替换元素 ###

`createReplace()`即创建替换元素的部分。它的代码较多，在此不直接贴出来。你可以打开前端开发工具来查看本页中的代码，也可以到[runJS上的完整源码][]。

对这一部分的一些说明：

* html生成使用字符串连接（更好的做法是模板引擎，但也相对更复杂）。
* 替换元素需要设置适当宽度，所以要遍历选择项确定最大的宽度。
* 替换元素设置`tabindex`是为了处理键盘上下和回车的控制。
* 下拉浮层的每一项代表的索引值是用html5自定义属性来标记的。

这里还用到一个特殊的样式类名`Constants.HIDDEN_CLASS`，即`remote_invisible`，它的定义是：

{% highlight css %}
.remote_invisible{position:absolute;left:-9999em;}
{% endhighlight %}

可见是一个隐藏用的样式。

### 事件及事件处理 ###

`bindEvents()`将绑定各类事件。

{% highlight javascript %}
function bindEvents() {
    selectReplaceNode.on("mouseover", replaceMouseoverHandler);
    selectReplaceNode.on("mouseout", replaceMouseoutHandler);
    selectReplaceNode.on("keydown", layerKeydownHandler);
    layerNode.on("mouseover", layerMouseoverHandler);
    layerNode.on("mouseout", layerMouseoutHandler);
    layerNode.delegate("click", layerLinkClickHandler, "." + Constants.LINK_CLASS);
}
{% endhighlight %}

不同于原生select是点击出下拉的情况，我的设计是鼠标移入到替换元素时，即显示下拉浮层。所以，这里绑定的事件种类就是上面这样的。

剩下的部分是事件处理函数及它们引用的应用逻辑函数。同样，它们的代码也请见[runJS上的完整源码][]。这部分有几点需要说明的是：

* 下拉浮层的关闭不是瞬间的，而是留有一个定时的余量。这可以很好地应对鼠标指针从替换元素移到下拉浮层的过渡（而不是突然关闭）。
* 为了使键盘事件有效，需要在合理的时候调用元素的`focus()`方法，获得焦点。
* 键盘事件取消默认行为是要阻止上下方向键对垂直滚动条的操作。

到此，`Y.customSelect.one`中保存的方法就实现了自定义外观select。不过，它只能一次处理单个表单select。为了让使用更方便，再增加一点东西。

### 多元素处理 ###

新增一个`Y.customSelect.all`，它接收多个元素，然后一一对它们调用之前的方法。

{% highlight javascript %}
Y.customSelect.all = function(selectNodes) {
    if (Y.Lang.isString(selectNodes)) {
        selectNodes = Y.all(selectNodes);
    }

    selectNodes.each(Y.customSelect.one);
};
{% endhighlight %}

这样，只需要在页面用简单一句`Y.customSelect.all("select");`，就可以对页面上存在的所有表单select，全部替换为自定义的版本。

## 实际效果 ##

实际效果如下：

<div class="post_display">
    <select name="anime" class="m_select" style="margin-left:10px;">
        <option>-2014年4月番-</option>
        <option>艾斯卡与罗吉的工作室</option>
        <option>Love Live! 第2期</option>
        <option>漫画家与助手们</option>
        <option>请问您今天要来点兔子吗</option>
        <option>漆黑的子弹</option>
        <option>魔法高校的劣等生</option>
        <option>萨达四大阿斗</option>
        <option>网球优等生</option>
        <option>我们大家的河合庄</option>
        <option>一周的朋友</option>
    </select>
</div>

为了方便看到关联性，这里没有隐藏原来的select。实际使用时应该隐藏它们。

## 结语 ##

表单自定义总的来说还是一件费心思的事，需要不少的代码。不过，我从中也感受到，一个可拆卸的功能是很有用的。实现任何功能，在思路上很值得多琢磨一番。

~~本文写到中途时发现代码太多简直不适合现在的节奏~~

[img_default_select_appearance]: {{POSTS_IMG_PATH}}/201403/default_select_appearance.png "表单select默认外观"
[img_custom_select_design]: {{POSTS_IMG_PATH}}/201403/custom_select_design.png "自定义外观设计"

[携程UED上的一篇文章]: http://ued.ctrip.com/blog/?p=3229  "select的最佳预设（reset）"
[官方文档]: http://yuilibrary.com/yui/docs/ "YUI Documentation"
[jQuery - YUI 3 Rosetta Stone]: http://www.jsrosettastone.com/ "jQuery - YUI 3 Rosetta Stone"
[runJS上的完整源码]: http://runjs.cn/code/4pqwwqqm "自定义外观select-RunJS"
