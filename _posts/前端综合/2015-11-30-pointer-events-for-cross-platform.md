---
layout: post
title: "把鼠标、触摸屏、触控笔统一起来，Pointer Events介绍"
category: "前端综合"
description: "鼠标、触摸屏、触控笔分别是不同的输入方式，Pointer Events将帮助我们以一种更简便的方式处理它们。"
---
{% include JB/setup %}

## 跨设备的问题 ##

平时我们在电脑上访问的网页，大部分情况下是用鼠标来控制的。比如说链接跳转，就是鼠标指针移动到链接文字或图片的位置，然后点击一下。又比如说滚动屏幕，滑动一下鼠标滚轮就可以。

如果是供手机访问的网页呢？这时候的控制就靠触摸屏了。链接跳转就是用手指点上去，滚动屏幕则是手指按在屏幕上动一动。

因为是不同的设备（电脑、手机），所以尽管在浏览网页时是类似的控制需求（链接跳转、滚动屏幕），但就会有不同的交互形式。这些交互形式，也是由设备所能提供的输入方式（鼠标、触摸屏）决定的。

现在流行的响应式设计的网页，追求的是只用一套代码，也保证网页在不同屏幕尺寸的设备上都具有较好的外观。然而，这里的不同设备，可能不仅仅只是差在屏幕尺寸上，它们提供的输入方式也可能不同。因此，想要开发出跨设备通用的网页，还要做一点别的事。

## 把事件统一起来 ##

处理用户的输入要用到事件。鼠标的话，有我们熟悉的`mouseover`、`click`等，触摸的话，也有`touchstart`、`touchend`等。不过，这样看就是要分别对两种输入做处理了，大概有点麻烦？如果逻辑也很近似的话，是不是还觉得有点不划算？

如果能有一类事件，可以同时处理鼠标、触摸屏这些“虽不同但感觉有那么一点相似”的输入就好了。对的，可以有，这就是本文要介绍的Pointer Events了。它已经被W3C加入到[推荐规范][]中。

## 抽象输入：Pointer ##

前面说鼠标、触摸屏它们“虽不同但感觉有那么一点相似”，这其实是有章可循的。**无论是鼠标还是触摸屏，其输入都可以用屏幕上的一个或多个坐标点来概括**。Pointer就是描述这种坐标点集合的抽象概念，代表此类输入。除鼠标和触摸屏之外，还有一种常见的坐标类型的输入，是触控笔，比如数位板或Surface搭配的笔。显然，触控笔也是坐标类型，同样可以用Pointer来表示。

![pointer概念][img_pointer]

就这样，Pointer提取了鼠标（mouse）、触摸屏（touch）、触控笔（pen）的共通之处，以方便开发跨设备的Web应用。Pointer虽然是一个抽象，但它包含了鼠标、触摸屏、触控笔的全部内容。比如，Pointer支持多点触摸，而且还有压力、倾斜度等信息。此外，Pointer还提供具体的输入类型描述，也就是告诉你某个Pointer代表的到底是鼠标、触摸屏还是触控笔，以帮助实现针对特定输入的处理。

引入Pointer还有一个作用，就是如果同时有不同类型的输入，可以更好地去实现符合JavaScript单线程风格的响应。因为输入事件被统一了，会比较有条理，不容易出错。

## Pointer相关的一点术语 ##

了解Pointer之后，还需要注意一些描述Pointer的相关概念，它们算作术语。这里介绍两个最主要的。

### active pointer ###

从名字上看，就是指处于激活状态（active）的Pointer。实际上，这个词是指“可以产生事件”的任意Pointer，这是什么意思呢？下面这些例子会比较容易理解：

- 和设备连接着的鼠标一直是active。
- 手指与触摸屏的屏幕接触着，认定为active。
- 位于数位板的响应距离以内的触控笔，认定为active（如果你用过数位板，你一定知道触控笔只需要悬空在数位板上方一定距离内就可以控制屏幕上的指针，并不需要触碰到数位板）。

### active buttons state ###

这个可以看做在前面的基础上，更进一步状态的Pointer。也同样举对应的例子：

- 鼠标有至少一个按键按下去了。
- 手指接触到触摸屏。
- 触控笔触碰到数位板（有物理接触）。

你可能会发现，手指触摸的例子好像和前面是一样的。这是因为，就触摸屏的设备而言，一般是没有Hover（悬停）状态一说的。也就是说，对于手指触摸输入，一般的认定是，并不能做到在“不产生按下效果”的情况下移动Pointer。

## Pointer事件列表和事件对象 ##

Pointer虽然是新的概念，但如前文所说，它包含了鼠标、触摸屏、触控笔的全部内容。就具体的实现形式来说，它更像是现在常用的鼠标事件的扩展。比如，Pointer的`pointerdown`事件，正好对应鼠标的`mousedown`事件，它们非常近似。

原来的时候你这样为DOM元素添加鼠标事件：

{% highlight javascript %}
elem.addEventListener("mousemove", mousemoveHandler, false);
{% endhighlight %}

现在换成Pointer以支持更多类型的输入，你只需要这样：

{% highlight javascript %}
elem.addEventListener("pointermove", pointermoveHandler, false);
{% endhighlight %}

就一般的使用而言，需要用到的Pointer事件有`pointerover`、`pointerenter`、`pointerdown`、`pointermove`、`pointerup`、`pointerout`、`pointerleave`。它们全部都可以对应上我们熟悉的鼠标事件。不过，平时很常用的`click`并不在此列，但没有关系，用`pointerup`来做就可以。

在事件处理函数里，会有一个`event`对象，包含事件的相关信息。Pointer的`event`对象实际上继承了鼠标的`event`对象，然后新增了一部分只读属性。其中比较重要的几个：

### pointerId ###

这是一个数字，用于分别标识当前处于active状态的各个Pointer。在任何Pointer的事件处理函数内，都可以依靠这个数字标记来确认处理的是否是同一个Pointer。

### pointerType ###

字符串，就是前文所说的告诉你这个Pointer是鼠标（mouse）、触摸屏（touch）还是触控笔（pen）。如果是除这些之外的无法识别的输入，这个属性会是空字符串。

### isPrimary ###

逻辑值，表示这个Pointer是否是“主要的”（primary）。请看下文。

## Primary Pointer ##

前文提到过，Pointer支持多点。所以，这个概念可以帮助确认哪一个是首要的点。具体来说，鼠标是只能一个的，所以代表鼠标的那个Pointer，一定是primary。而对于触摸屏或触控笔，在多点输入的情况下，只有“最初”的那一个算作primary。这里“最初”指的是，在`pointerdown`事件发生的时候，没有其他同类型（触摸对触摸，笔对笔）的active状态的Pointer存在。

因为一种类型就可以有一个Primary Pointer，所以可以有多个Primary Pointer。比如同时有手指触摸和鼠标指针，它们的Pointer都会被认定为primary。

一般来说，应用同一时间只响应一个输入点的情况比较多，因此可以利用Pointer事件对象的`isPrimary`来忽略掉那些额外的输入点。

## 相关的css属性：touch-action ##

在支持手指触摸的设备中，一次手指触摸中的动作，是有默认行为（default behavior）的。比如，缩放（zooming）和平移（panning，和滚动屏幕scrolling同义）。这些默认行为，和完整的Pointer事件是不相容的。根据手指的动作，如果被判定为触摸的默认行为，就不会再按照预想的那样触发Pointer的事件。因此，你可能想要在某些范围内，确保不触发触摸的某些默认行为，保证Pointer事件按照预想进行。

css属性`touch-action`一般用在块元素上，它的取值分别有：

### auto ###

默认值。允许任何设备支持的默认行为。

### none ###

不会触发任何默认行为。

### pan-x ###

只允许“水平方向的平移”这一默认行为。

### pan-y ###

只允许“垂直方向的平移”这一默认行为。

### manipulation ###

只允许“平移”和“缩放”这两种默认行为。设备支持的其他默认行为（也就是`auto`里额外的部分）不会触发。

在手机这样的触摸屏设备里，通过手指平移来滚动浏览网页是很普遍的，所以应谨慎地用这个属性来取消部分默认行为。

## 浏览器兼容性 ##

根据[caniuse上的结果][]，在默认情况下，除了IE11及Windows 10的Edge，其他所有浏览器都不支持。

啊？那怎么投入实用？

## Pointer Events Polyfill ##

类似很多其他新的技术规范，Pointer Events也有Polyfill，就叫做**[Pointer Events Polyfill][]**，由jQuery团队开发，简称**PEP**。

这个Polyfill并不能实现规范的全部内容，而是有些偏差，因此需要注意几个地方：

一是`touch-action`需要用html属性形式使用。例如：

{% highlight html %}
<canvas width="800" height="600" touch-action="none"></canvas>
{% endhighlight %}

二是只有设置了`touch-action`属性的元素内部，才能触发Pointer Events。也就是需要侦听Pointer事件的区域，一定要选至少一个元素加上`touch-action`。

这样设置好之后，就可以像使用鼠标事件那样来使用Pointer Events了，比如结合jQuery的使用示例：

{% highlight javascript %}
$("#canvas").on("pointermove", function(event) {
  draw(event);
});
{% endhighlight %}

加上这个Polyfill后，将支持IE10+及其他各类浏览器（包括手机上的）。

## 和css属性pointer-events的关系 ##

并，没，有，什，么，关，系，请明确地区分它们。

## 结语 ##

像链接跳转、滚动屏幕这样的简单响应，电脑和手机上的浏览器默认就已经做好了处理，并不需要我们做什么。但要做跨设备通用的、更复杂的Web应用，Pointer Events可以很大程度上简化对多种输入方式的处理。

我是因为一次应用开发中不能容忍`click`事件在触摸设备上的延迟，这才找到了Pointer Events。应该说，很赞同Pointer Events的这种化繁为简的整合理念，但从它目前的浏览器兼容性来看，它还有很远的路要走。不过，随着未来更多输入设备的发展，它有可能会以另外的形式再次入场。

[img_pointer]: {{POSTS_IMG_PATH}}/201511/pointer.png "pointer概念"

[推荐规范]: http://www.w3.org/TR/pointerevents "Pointer Events"
[caniuse上的结果]: http://caniuse.com/#search=pointer%20events "caniuse - pointer events"
[Pointer Events Polyfill]: https://github.com/jquery/PEP "jquery/PEP · GitHub"
