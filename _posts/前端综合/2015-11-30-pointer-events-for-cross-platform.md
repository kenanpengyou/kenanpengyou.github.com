---
layout: post
title: "把鼠标、触摸屏、触控笔统一起来，Pointer Events介绍"
category: "前端综合"
description: "Pointer Events"
---
{% include JB/setup %}

##跨设备的问题##

平时我们在电脑上访问的网页，大部分情况下是用鼠标来控制的。比如说链接跳转，就是鼠标指针移动到链接文字或图片的位置，然后点击一下。又比如说滚动屏幕，滑动一下鼠标滚轮就可以。

如果是供手机访问的网页呢？这时候的控制就靠触摸屏了。链接跳转就是用手指点上去，滚动屏幕则是手指按在屏幕上动一动。

因为是不同的设备（电脑、手机），所以尽管在浏览网页时是类似的控制需求（链接跳转、滚动屏幕），但就会有不同的交互形式。这些交互形式，也是由设备所能提供的输入方式（鼠标、触摸屏）决定的。

现在流行的响应式设计的网页，追求的是只用一套代码，也保证网页在不同屏幕尺寸的设备上都具有较好的外观。然而，这里的不同设备，可能不仅仅只是差在屏幕尺寸上，它们提供的输入方式也可能不同。因此，想要开发出跨设备通用的网页，还要做一点别的事。

##把事件统一起来##

处理用户的输入要用到事件。鼠标的话，有我们熟悉的`mouseover`、`click`等，触摸的话，也有`touchstart`、`touchend`等。不过，这样看就是要分别对两种输入做处理了，大概有点麻烦？如果逻辑也很近似的话，是不是还觉得有点不划算？

如果能有一类事件，可以同时处理鼠标、触摸屏这些“虽不同但感觉有那么一点相似”的输入就好了。对的，可以有，这就是本文要介绍的Pointer Events了。它已经被W3C加入到推荐规范中。

##抽象输入：Pointer##

前面说鼠标、触摸屏它们“虽不同但感觉有那么一点相似”，这其实是有章可循的。无论是鼠标还是触摸屏，其输入都可以用屏幕上的一个或多个坐标点来概括。Pointer就是描述这种坐标点集合的抽象概念，代表此类输入。除鼠标和触摸屏之外，还有一种常见的坐标类型的输入，是触控笔，比如数位板或Surface搭配的笔。显然，触控笔也是坐标类型，同样可以用Pointer来表示。

![pointer概念][img_pointer]

就这样，Pointer提取了鼠标、触摸屏、触控笔的共通之处，以方便开发跨设备的Web应用。Pointer虽然是一个抽象，但它包含了鼠标、触摸屏、触控笔的全部内容。比如，Pointer支持多点触摸，而且还有压力、倾斜度等信息。



要说普通的只是链接跳转如果你想做的是具有更多



把鼠标、触摸屏、触控笔这些输入，转为一个更抽象的输入概念，叫pointer。pointer的概括其实很有道理，不管是鼠标、触摸屏、还是触控笔，其实都可以概括为屏幕上的一个或多个特定坐标的点。

如果需要针对特定输入做一点特别的功能，从pointer可以得知输入是什么类别。

处理跨设备的不同输入，同时保留处理特定输入设备的支持，作为扩展。

此外还有一个作用，如果同时有不同类别的输入，很好地保证单线程的风格去做反应（比如滚动）。

pointerdown, pointermove, pointerup, pointerover, pointerout看下这些事件名，是不是和鼠标的那些很相似呢？所以即使转换为使用pointer，也会觉得很容易。


目前

在当前的各类浏览器中，触摸操作也会触发Click。这虽然方便你做简单的应用时，click事件在触摸设备上依然有效，但从另一角度来说，这是很让人困惑的，明明是触摸的输入，结果却触发了一次鼠标的事件。


{% highlight html %}

{% endhighlight %}

##术语##

active button state 对触摸来说是有屏幕接触，对鼠标来说是鼠标的按键被按下。

##几种情况##

已经有action button的时候，同时多个键按下，并不触发多次pointerdown和pointerup。

多点触摸，其中一个是primary pointer。如果只想要允许单点触摸，忽略掉那些不为primary的pointer事件即可。

primary是什么判定的呢？

鼠标的话，一定算。touch的话，当前不存在其他任何touch类型的active pointer。pen的话，类似，也是当前不存在其他任何pen类型的active pointer。
primary也可能多个，只是对于某一个pointerType只会有一个primary。比如鼠标和触摸同时发生，就可能产生两个primary的pointer，分别属于mouse和touch的类别。






##和css的pointer-events属性的关系##

并没有什么关系，请明确地分开它们。

##结语##

[img_pointer]: {{POSTS_IMG_PATH}}/201511/pointer.png "pointer概念"

[AngularJS TodoMVC Example]: https://github.com/tastejs/todomvc/tree/gh-pages/examples/angularjs "AngularJS TodoMVC Example"
