---
layout: post
title: "GSAP，专业的Web动画库"
category: "javascript"
description: "GSAP"
---
{% include JB/setup %}

说到在网页里创建动画，你可能很快会想到jQuery的`animate()`方法，或者css3的`animation`和`transition`。现在，本文将介绍另一个web动画的可选方案，GSAP。

[GSAP][GSAP]的全名是GreenSock Animation Platform，这个名字是有些怪异（官网还在各种安利你加入它的Club），但它的确是一个从flash时代一直发展到今天的专业动画库。

## 组成简介 ##

在官网选择Download zip就可以拿到GSAP源码，解压后可以看到有这些文件：

![GSAP的文件组成][img_gsap_files]

这里的`TweenLite.js`、`TweenMax.js`、`TimelineLite.js`和`TimelineMax.js`4个文件就是GSAP的一般引用库文件，不过，这几个文件还有一些重叠和包含的关系，如下图：

![GSAP的源文件关系][img_gsap_files_relations]

因此，如果想要简单地引入GSAP的主体功能，使用`TweenMax.js`这一个文件即可（请看前一张图中反映出的这个文件的大小）。而如果要争取更小的库文件大小，应该使用`TweenLite.js`（必需）+ 其他文件的组合。

这4个文件分别包含了什么东西呢？

`TweenLite`是GSAP的主体核心，它用于创建基本动画，是其他各类模块的基础。一般都会搭配`plugins/CSSPlugin`以实现DOM元素的动画（也就是我们最熟悉的动画了）。

`TimelineLite`是一个叫做时间轴的动画容器，它用于对多个动画进行有序的组织与控制。

`TimeLineMax`是`TimelineLite`的升级版，在`TimelineLite`的基础之上，可以有更高级的组织与控制。

`TweenMax`是GSAP集合包，除前面3个之外，还包括`plugins`里的常用插件以及`easing`里的缓动函数补充。

GSAP在Customize里是这样描述自己拥有的模块的：

![GSAP的模块组成][img_gsap_modules]

默认勾选的`TweenLite` + `css plugin`是最简单的应用组合，本文就先从它们开始（v1.18.4）。

## TweenLite的基本动画 ##

### 值动画 ###

一切动画，都从值的变化开始。

TweenLite作为主体核心，做的就是这件事。TweenLite具体如何使用呢？请看下面这个例子：

~~~javascript
var obj = {
    myProp: 0
};

TweenLite.to(obj, 0.2, {
    myProp: 1,
    onUpdate: function() {
        console.log("[update] obj.myProp = ", obj.myProp);
    }
});
~~~

`TweenLite.to(target, duration, vars)`是TweenLite最常用的方法，`target`指定动画元素，`duration`指定动画持续时间，`vars`指定动画的目标值。请注意，这里并没有操作任何DOM元素，所以和我们一般写的动画不太一样。运行一下：

![TweenLIte为object创建动画][img_tweenlite_value_update]

可以看到，TweenLite的作用是，让`obj`的属性`myProp`从初始值`0`，变化到目标值`1`。虽然没有视觉效果，但这就是基本的值动画。

### 有视觉效果的css动画 ###

TweenLite加上`plugins/CSSPlugin`后，就可以做我们熟悉的DOM元素的动画了。例如：

~~~javascript
TweenLite.to("#ball1", 2, {
  x: 200
});
~~~

效果：

![TweenLite的css动画][img_tweenlite_to]

GSAP用`x`、`y`表示transform的`translateX`和`translateY`。`TweenLite.to(target, duration, vars)`的第一个参数`target`可以是选择符，因此这里就是选取id为`ball1`的元素，执行时常为2s的动画，从当前位置移动到`translateX(200px)`的位置。

你可以在的第3个参数`vars`内添加任意css属性，它们都会被用作被选取元素的动画目标值。

### 延迟、缓动及动画事件 ###

第3个参数`vars`内除了css属性之外，还可以指定许多具有特定意义的属性，用于配置动画。GSAP会自动根据名字来区分它们。

例如，`delay`和`ease`分别用于设置动画延迟及缓动函数：

~~~javascript
TweenLite.to("#ball1", 2, {
  x: 200,
  delay: 2,
  ease: Linear.easeNone
});
~~~

这里的动画将延迟2s运行，而且改为线性变化（默认为`Quad.easeOut`）。

如果想要在动画开始，动画运行的每一帧，动画结束时分别执行对应的事件函数，使用`onStart`、`onUpdate`、`onComplete`。前文值动画的例子就是通过`onUpdate`把值的变化打印出来的。

GSAP有[专门的位置][专门的位置]可以查询缓动函数。更多的可用特定属性，请参考[官方文档][官方文档]，GSAP的文档挺完善的。

### 相对值 ###

有些时候我们可能不清楚元素当前是否已经有`translate`，但就是想让元素相对它原本的位置移动一段距离。这时可以用相对值，像这样：

~~~javascript
TweenLite.to("#ball1", 2, {
  x: "+=200px"
});
~~~

类似的还有`-=`，按照以上写法，无论元素当前的`translateX`是多少，都会相对偏移`200px`。

### 其他动画方法 ###

除`to()`之外，还有`from()`和`fromTo()`。单词都很简单，对吧？

`from()`和`to()`的参数及用法完全一样，只是`vars`里的属性定义的是动画初始值，而元素原本的属性用作动画目标值。例如：

~~~javascript
TweenLite.from("#ball1", 2, {
  x: "+=200px",
  backgroundColor: "#2196f3"
});
~~~

效果：

![TweenLite.from()][img_tweenlite_from]

这里可以看到，颜色动画也是可用的。

`TweenLite.fromTo(target, duration, fromVars, toVars)`的参数要多1个，不过从字面意思就很容易理解，即分别让你指定动画的初始和结尾。需要注意的是，前面提到的具有特定意义的属性，如`delay`，`ease`，都要写在`toVars`里，在`fromVars`里定义的无效。

### 动画保存及控制 ###

和`jQuery.animate()`的风格不同，GSAP以动画为主体，你可以这样保存动画：

~~~javascript
var tween = TweenLite.to("#ball1", 2, {
  x: "+=200px"
});
~~~

然后你可以做精细的控制：

~~~javascript
// 暂停
tween.pause();

// 继续播放
tween.resume();

// 反转播放
tween.reverse();

// 跳转到1s进度处开始播放
tween.seek(1);

// 重播
tween.restart();

// 动画变为三倍速
tween.timeScale(3);
~~~

这些可以看做GSAP作为专业动画库的体现。

### 选择器 ###

前面的例子中反复用到了类似jQuery的选择器，但GSAP并没有自带选择器，相关源码如下：

~~~javascript
TweenLite.selector = window.$ || window.jQuery || function(e) {
    var selector = window.$ || window.jQuery;
    if (selector) {
        TweenLite.selector = selector;
        return selector(e);
    }
    return (typeof(document) === "undefined") ? e 
    : (document.querySelectorAll ? document.querySelectorAll(e) 
        : document.getElementById((e.charAt(0) === "#") ? e.substr(1) 
            : e));
};
~~~

GSAP不依赖jQuery，但如果引入了jQuery，GSAP会使用jQuery的选择器，否则回退到`document.querySelectorAll()`及`document.getElementById()`。

## TimelineLite的动画管理 ##

好像`TweenLite` + `css plugin`就已经足够用了，这个TimeLine系列是做什么的呢？

想象你是一个动画的导演，你要按剧本安排演员在一个CUT里依次上场和退场。在前文的例子里，我们只有一个演员（`#ball1`），但现在，我们要拍一个有20+演员的动画大片，要怎么办呢？

你也许曾用css3的`animation`做过类似的事情，做法是，当转换到一个场景（CUT）后，为场景里的所有演员依次设定适当的`delay`。只要`delay`计划好，看起来就是漂亮精彩的大片。

不过，这可没有那么简单，假如你已经安排好了20位演员的上场时间，现在改了下剧本，来了第21位演员要在最开始上场，你会发现你可能要依次调整在它之后的所有演员的`delay`...

GSAP的TweenLite也会有同样的问题，因此，我们需要有一个工具来统一管理多个元素的多个动画，这就是TimelineLite。

### 时间轴 ###

如果你做过视频编辑，你一定很熟悉“时间轴”这个概念。简单来说，每一个元素的单次动画都是一段素材，我们需要把它们分别放置到同一个时间轴的适当位置，才能集合在一起得到有序的动画大片。

现在我们引入`TimelineLite`。下面是一个例子：

~~~javascript
var tl = new TimelineLite();
tl.from("#ball1", 1, {
    y: "-=60px",
    autoAlpha: 0
}).from("#ball2", 1, {
    x: "+=60px",
    autoAlpha: 0
}).from("#ball3", 1, {
    y: "+=60px",
    autoAlpha: 0
}).from("#ball4", 1, {
    x: "-=60px",
    autoAlpha: 0
});
~~~

效果是：

![TimelineLite顺序动画][img_timelinelite_sequence]

以上的`tl.from()`等同于以下代码：

~~~javascript
tl.add(TweenLite.from("#ball1", 1, {
    y: "-=60px",
    autoAlpha: 0
}));
~~~

可见，TimelineLite像一个容器，它可以通过`add()`方法将TweenLite动画添加到自己的时间轴上。然后，动画将以时间轴为整体，进行播放。

在默认情况下，TimelineLite会这样按添加顺序依次排列它们的位置，就这样，我们不借助`delay`做出了这种较复杂的动画组合。

如果画一下这里的时间轴，是这样的：

![TimelineLite图解顺序动画]

### 调整放置位置 ###

如果要让第2个动画不是在第1个刚结束时播放，而是更提前一点，看起来更连贯的话？

这样做：

~~~javascript
var tl = new TimelineLite();
tl.from("#ball1", 1, {
    y: "-=60px",
    autoAlpha: 0
}).from("#ball2", 1, {
    x: "+=60px",
    autoAlpha: 0
}, "-=0.7").from("#ball3", 1, {
    y: "+=60px",
    autoAlpha: 0
}, "-=0.7").from("#ball4", 1, {
    x: "-=60px",
    autoAlpha: 0
}, "-=0.7");
~~~

其中`tl.from(target, duration, vars, position)`等同于`tl.add(TweenLite.from(target, duration, vars), position);`，这里的`position`参数指定动画在时间轴上的位置，默认为`+=0`也就是取前一个动画的结束点。以上的`-=0.7`就是相对这个位置再提前0.7s，这样就让动画互相之间有了重叠，看起来更连贯流畅一些。

效果：

![TimelineLite调整动画][img_timelinelite_adjust]

时间轴像这样：

![TimelineLite图解调整动画]

### 时间轴控制 ###

把多个动画装进时间轴的重要作用是，可以当做一个整体进行控制和调整。时间轴的这些方法类似TweenLite：

~~~javascript

// 暂停
tl.pause();

// 继续播放
tl.resume();

// 反转播放
tl.reverse();

// 跳转到1s进度处开始播放
tl.seek(1);

// 跳转到50%进度处
tl.progess(0.5);

// 重播
tl.restart();

// 变为三倍速
tl.timeScale(3);

~~~

### 相同动画的简便方法 ###

如果多个元素的动画是一样的，而且它们需要有规律地安排在时间轴的不同位置，那么非常适合用`staggerFrom()`、`staggerTo()`及`staggerFromTo()`。

~~~javascript

~~~

jQuery的`animate()`不能处理background-color，需要JQuery.Color插件。

GSAP除了DOM元素的属性之外，还可以为canvas objects等更多东西创建动画。

autoAlpha同时处理visibility和opacity，很有用。可以让开始全透明的opacity: 0 的元素，不触发任何交互事件

## canvas动画 ##

## 文本动画 ##



## TimelineMax和TweenMax ##

## 补充信息 ##

## 结语 ##

asdasdsad

[img_gsap_files]: {{POSTS_IMG_PATH}}/201605/gsap_files.png "GSAP的文件组成"
[img_gsap_modules]: {{POSTS_IMG_PATH}}/201605/gsap_modules.png "GSAP的模块组成"
[img_gsap_files_relations]: {{POSTS_IMG_PATH}}/201605/gsap_files_relations.png "GSAP的源文件关系"
[img_tweenlite_value_update]: {{POSTS_IMG_PATH}}/201605/tweenlite_value_update.png "TweenLIte为object创建动画"
[img_tweenlite_to]: {{POSTS_IMG_PATH}}/201605/tweenlite_to.gif "TweenLite的css动画"
[img_tweenlite_from]: {{POSTS_IMG_PATH}}/201605/tweenlite_from.gif "TweenLite.from()"
[img_timelinelite_sequence]: {{POSTS_IMG_PATH}}/201605/timelinelite_sequence.gif "TimelineLite顺序动画"
[img_timelinelite_adjust]: {{POSTS_IMG_PATH}}/201605/timelinelite_adjust.gif "TimelineLite调整动画"


[GSAP]: http://greensock.com/gsap "GreenSock | GSAP"
[专门的位置]: http://greensock.com/ease-visualizer "GreenSock | Ease Visualizer"
[官方文档]: http://greensock.com/docs/#/HTML5/GSAP/TweenLite/ "GreenSock | Docs - HTML5 GSAP TweenLite "






