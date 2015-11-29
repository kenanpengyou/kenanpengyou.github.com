---
layout: post
title: "Pointer Events"
category: "前端综合"
description: "Pointer Events"
---
{% include JB/setup %}

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

[AngularJS TodoMVC Example]: https://github.com/tastejs/todomvc/tree/gh-pages/examples/angularjs "AngularJS TodoMVC Example"
