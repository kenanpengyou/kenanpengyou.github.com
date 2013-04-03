---
layout: post
title: "jQuery使用的最佳实践"
category: "javascript"
description: "jQuery是我们平时最为熟悉，实际应用也最多的javascript库，jQuery的使用也应遵循最佳实践，本文介绍的就是这些在jQuery使用上的建议。"
---
{% include JB/setup %}

##引言##

*jQuery*可以说是web开发领域应用最为广泛的轻量级javascript库，不仅专业的web开发者使用它，很多刚入门的web开发者或者web爱好者也通过使用jQuery轻松地融入到了javascript的开发。

而如果你还希望在这方面做得更好，就应学习和了解最佳实践。*最佳实践*（*Best Practice*）是随某一技术领域的发展而逐渐建立起来的关于最新技术和开发方法的信息，在web开发领域也非常有用。

本文内容参考了杰出前端工程师 [Addy Osmani][] 的 [jQuery Performance TIPs & Tricks][] ，如果有兴趣，你也可以自己看看这位大师的这个演说PPT，Addy Osmani本人也是jQuery的核心团队（jQuery Core teams）的成员之一。

##为什么需要遵循jQuery最佳实践##

*web开发领域对于性能的追求是永不停滞的*。jQuery虽然是非常强大的开发工具，但不当的使用方法仍会给浏览器带来额外的工作和负担，也会使开发的web应用占用更多的系统资源，运行起来也更慢。而我们都知道，好的web应用需要的是清爽灵活。

如何判断javascript的性能呢？现在，这种性能测试都可以归纳为运行速度，简单的说，*同一项功能，某一种写法如果比另一种写法运行起来更快，那么这种写法就可以实现更好的性能*。当然，这里只单纯从性能角度来考虑，并不包含代码的可维护性。如果你想自己测试不同的javascript代码段的性能，推荐使用 [jsPerf.com][] ，这个站点可以帮助你轻松创建javascript性能测试用例，还可以保存和分享测试结果。jQuery团队也使用它进行javascript性能测试。

##jQuery使用建议##

###1.使用最新版###

新版本的jQuery提供的API会在性能上有所提升，而且修复了一些存在的bug。由于非常多的网站都在使用jQuery，所以jQuery每一个新版本的更改都会经过非常严格的测试，升级一般都不会带来问题。

此外，新版本的jQuery可能会在API上做非常有用的改动，让开发工作更加简单。比如在jQuery 1.7之前，事件绑定使用`bind()`、`delegate()`以及`live()`这几个方法。虽然都是事件绑定，但每个方法各有针对，这就产生了“什么时候应该使用哪个”的麻烦事。而从jQuery 1.7开始，新增并推荐使用`on()`和`off()`这2个方法来完成所有的事件绑定与移除，理解起来就要容易多了。

###2.理解你的选择符###

在jQuery中，不是所有的选择符（Selectors）都是同等性能的。也就是说，虽然某一些元素你可以用很多种不同的选择符写法来选取，但不要认为它们在性能上也是一样的。

jQuery的选择符的运行速度是不同的，从最快到最慢依次是：

*   ID选择符（`$(#ElementId)`）
*   元素选择符（`$(form)`，`$(input)`等）
*   Class选择符（`$(.someClass)`）
*   伪类和属性选择符（`$(:hidden)`，`$([attribute=value])`等）

由于浏览器支持的原生DOM操作方法（比如`document.getElementById()`）就可用，所以ID选择符和元素选择符是最快的。而稍慢的Class选择符是因为IE6-IE8不支持原生的`getElementsByClassName()`，而在支持这个原生方法的其他现代浏览器中，Class选择符仍是很快的。

至于最慢的伪类和属性选择符，则是因为浏览器并不提供对应功能的可用原生方法。尽管jQuery尝试了使用`querySelector()`和`querySelectorAll()`这两个原生选择符API（属于css查询API）来提升部分jQuery选择符在部分现代浏览器中的性能，但综合起来，仍然是比较慢的。当然，这也是在于jQuery对伪类和属性选择符这个API要求较高，不仅要支持`input[type="text"]`这种css中合法的选择符，还要支持`p:first`这类用于元素过滤，但在css中不合法的选择符。总之，jQuery的伪类和属性选择符功能很强大，但请慎重使用。

###3.缓存你操作的元素###

{% highlight javascript %}
var parents = $('parents');
var children = $('parents').find('.child'); //bad
{% endhighlight %}

缓存是指保存jQuery选择符的返回结果，方便之后再次调用。每一个`$('.whatever')`都会重新从DOM中搜索并返回一个jQuery包装集（jQuery collection），因此要避免重复使用。

原生javascript中，建立局部变量来缓存数据或对象，有利于精简代码、优化性能。这里也是一样的道理。

###4.链式语法###

{% highlight javascript %}
var parents = $('.parents').doSomething().doSomethingElse();
{% endhighlight %}

jQuery中大部分方法都返回jQuery包装集并支持这种链式语法。javasript的性能优化要点之一是最小化语句数，因此链式语法不仅写起来更容易，运行起来也会更快。

###5.使用事件代理###

利用事件冒泡，指定一个位于dom较高层级的元素（比如`document`）的事件处理程序，就可以管理某一类型的所有事件。减少了页面中添加的事件处理程序，自然可以提升整体性能。

###6.最小化现场更新###

如果你进行操作的DOM部分是已经显示的页面的一部分，那么你就是在进行一个*现场更新*。现场更新需要浏览器重新计算尺寸，涉及到重绘（repaint）和回流（reflow），有较高的性能花费，因此应减少使用。

在新增内容时，建议先把要新增的代码段合并完全，最后再使用单个`append()`方法添加到页面。而如果元素存在复杂的交互，比如反复地添加和移除，`detach()`这个针对性的方法就是最佳的选择。

###7.不在不必要的时候使用jQuery方法###

{% highlight javascript %}
$('.nav_link').bind('click', function() {
    console.log('nav id: ' + $(this).attr('id'));   //bad
};
{% endhighlight %}

jQuery方法不一定是最好的方法。这里使用`$(this).attr('id')`获取当前事件元素的ID，为当前事件元素创建了jQuery包装集，然后调用`attr()`属性获取方法。但这都是额外的性能花费。事实上，`this`在事件函数内就表示当前事件元素，直接使用`this.id`就可以获取元素ID，这种原生DOM属性的写法要更快。

###8.适当使用jQuery工具函数###

操作jQuery包装集的方法（也就是写在`$.fn`中的方法），其中一部分也有作为jQuery工具函数（直接写在`$`中的方法）的同类方法。由于jQuery工具函数在使用中不涉及创建jQuery包装集，因此，在部分情况下，可以通过换用jQuery工具函数提升性能。

比如，在DOM中存储数据，一般的做法是：

{% highlight javascript %}
$('#elem').data(key, value);    //common way
{% endhighlight %}

但改为下边的写法会快很多：

{% highlight javascript %}
$.data(elem, key, value);   //significantly faster
{% endhighlight %}

需要的注意的是，虽然下面这种方法更快，但作为参数传入的元素不能用选择符，而要用元素本身。

##结语##

我自己整理和写本文内容时，也感觉很有收获。jQuery是一个很强大的工具，但进一步说，也只提供了web开发的最基本的内容，更高级更复杂的内容，还需要自己不断学习和创作。在这个过程中，遵循最佳实践，养成良好的习惯，会有很大的益处，并逐渐做得更出色！

[Addy Osmani]: http://addyosmani.com/blog/  "Addy Osmani"
[jQuery Performance TIPs & Tricks]: https://speakerdeck.com/addyosmani/jquery-performance-tips-tricks "jQuery Performance TIPs & Tricks"
[jsPerf.com]: http://jsperf.com/ "jsperf.com"