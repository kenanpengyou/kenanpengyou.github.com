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

因此，如果想要简单地引入GSAP的所有功能模块，使用`TweenMax.js`这一个文件即可（请看前一张图中反映出的这个文件的大小）。而如果要争取更小的库文件大小，应该使用`TweenLite.js`（必需）+ 其他文件的组合。

这4个文件分别包含了什么东西呢？

`TweenLite`是GSAP的主体核心，它用于创建基本动画，是其他各类模块的基础。一般都会搭配`plugins/CSSPlugin`以实现DOM元素的动画（也就是我们最熟悉的动画了）。

`TimelineLite`是一个叫做时间轴的动画容器，它用于对多个动画进行有序的组织与控制。

`TimeLineMax`是`TimelineLite`的升级版，在`TimelineLite`的基础之上，可以有更高级的组织与控制。

`TweenMax`是GSAP集合包，除前面3个之外，还包括`plugins`里的常用插件以及`easing`里的缓动函数补充。

GSAP在Customize里是这样描述自己拥有的模块的：

![GSAP的模块组成][img_gsap_modules]

默认勾选的`TweenLite` + `css plugin`是最简单的应用组合，本文就先从它们开始。

## TweenLite的基本动画 ##

一切动画，都从值的变化开始。

`TweenLite`可以做什么呢？请看下面这段：

~~~javascript
var obj = {myProp:0};
TweenLite.to(obj, 0.2, {myProp:100});
~~~

动画保存，并且可以pause()和resume()，以及瞬间跳到一个进度seek()



timeline

什么时候需要用到timeline呢，当你像导演一样需要安排演员在一个cut里依次上场，退场的时候，也就是比较长的，有剧本的动画集。如果只是用默认的，需要自己计算安排delay，是非常困难的。如果你已经安排好了20个依次上场的演员，发现最开始还有一个人要最前边上场，那所有人的delay都要更新，这太费事了。


## 时间轴TimelineLite ##

jQuery的`animate()`不能处理background-color，需要JQuery.Color插件。

GSAP除了DOM元素的属性之外，还可以为canvas objects等更多东西创建动画。

autoAlpha同时处理visibility和opacity，很有用。可以让开始全透明的opacity: 0 的元素，不触发任何交互事件

## canvas动画 ##

## 文本动画 ##

text 插件试试

## TimelineMax和TweenMax ##

## 结语 ##



[img_gsap_files]: {{POSTS_IMG_PATH}}/201605/gsap_files.png "GSAP的文件组成"
[img_gsap_modules]: {{POSTS_IMG_PATH}}/201605/gsap_modules.png "GSAP的模块组成"
[img_gsap_files_relations]: {{POSTS_IMG_PATH}}/201605/gsap_files_relations.png "GSAP的源文件关系"

[GSAP]: http://greensock.com/gsap "GreenSock | GSAP"







