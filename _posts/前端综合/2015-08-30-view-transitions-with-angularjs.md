---
layout: post
title: "用Angular制作单页应用视图切换动画"
category: "前端综合"
description: ""
extraCSS: ["posts/201508/view-transitions-with-angularjs.css"]
extraJS: ["angular.min", "angular-animate.min", "posts/201508/view-transitions-with-angularjs.js"]
---
{% include JB/setup %}

##视图，动画##

单页应用（Single Page Web Application）往往有一个基本的要点，那就是把多个视图集成到一个网页内，然后去控制这些视图的显示和隐藏。此外，视图的切换动作几乎都会引入动画效果，以获得更平滑、流畅的浏览体验。

如果想要很快速地制作出包含视图动画的单页应用？

[Angular][]会是一个不错的选择。下面，本文将说明如何用Angular（v1.4.3）来完成制作。你也许会觉得这个过程相当简单。

##切换DOM的ngSwitch##

视图切换，其实就是切换DOM显示。Angular有一个[ngSwtich][]，从名字就可以看出，正是拿来做“切换”工作的。

参考Angular的ngSwitch用法，可以想到这样的html：

{% highlight html %}
<body ng-app="morin" ng-strict-di>
<div class="view-container" ng-controller="viewController as view" ng-switch="view.current">
    <div class="view-page view-1" ng-switch-when="1"></div>
    <div class="view-page view-2" ng-switch-when="2"></div>
</div>
<!-- scripts -->
</body>
{% endhighlight %}

在这段代码中，`div.view-page`分别代表不同的视图，它们都被包含在`div.view-container`这样一个视图容器中。视图容器元素上创建了名为`viewController`的Controller，并定义了关联名`view`（或者叫简称）。

视图容器上的`ng-switch`，指定了一个变量`view.current`，用来判断当前显示哪个视图。对应的，在已有的两个视图内，分别用`ng-swtich-when`指定了`1`和`2`这样的值。想一想JavaScript的switch语句，这个结构会是怎样的效果，就很好理解了。

这些视图对应的css是：

{% highlight css %}
.view-page{
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
}
.view-1{
    background: #b3c589;
}
.view-2{
    background: #8fc241;
}
{% endhighlight %}

这里的`background`是给每个视图带上背景，用作标识。 

##引入动画的ngAnimate##

[ngAnimate][]是Angular的一个附属module，可以为Angular应用增加动画支持。在加入ngAnimate后，ngSwitch的切换过程所涉及的两个元素，会分别被Angular添加不同的class。其中，`ng-enter`代表进场，`ng-enter-active`代表进场动画终点，`ng-leave`代表退场，`ng-leave-active`代表退场动画终点。只需要借助这些class，我们就可以用css创建切换过程的动画（浏览器私有前缀已省略）：

{% highlight css %}
.view-page.ng-enter{
    transition: transform .5s;
    transform: translateX(100%);
}
.view-page.ng-enter.ng-enter-active{
    transform: translateX(0);
}
.view-page.ng-leave{
    transition: transform .5s;
}
.view-page.ng-leave.ng-leave-active{
    transform: translateX(-100%);
}
{% endhighlight %}

这段代码是一个使用`transition`制作了简单的平移动画的例子。其中每一段定义都有的`.view-page`，是为了限定只有视图元素才获得这个动画效果。

`transition`动画的要点是，`transition`属性本身必须定义在`ng-enter`或`ng-leave`这样表示动画起点的class上。然后，动画终点class上再定义终点样式。

如果使用`animation`的css动画，则只需要用到动画起点的class：

{% highlight css %}
.view-page.ng-enter{
    animation: moveFromRight .5s both;
}
.view-page.ng-leave{
    animation: moveToLeft .5s both;
}
@keyframes moveFromRight{
    from { transform: translateX(100%); }
}
@keyframes moveToLeft{
    to { transform: translateX(-100%); }
}
{% endhighlight %}

这段使用`animation`的代码将可以获得和前面相同的动画效果。

如果想要视图1和视图2各自有不同的进场和退场动画，用class去限定即可：

{% highlight css %}
.view-1.ng-enter{ }
.view-2.ng-enter{ }
/* ... */
{% endhighlight %}

有关更多的视图切换动画，推荐参考[A Collection of Page Transitions][]。

##让一切工作起来##

下面加入JavaScript完成功能。代码是（外层包装函数已省略）：

{% highlight javascript %}
angular
    .module("morin", ["ngAnimate"])
    .controller("viewController", viewController);

function viewController(){
    var view = this;
    view.current = "1";

    // Here, change "view.current" to switch views with animation.
}
{% endhighlight %}

没错，只需要这样一小段。然后，在`viewController`函数的代码范围内，**只要更改`view.current`这一个变量，就可以完成带动画效果的视图切换**。

需要注意的是，最初在html内用`ng-switch-when`指定的值，只会被当做字符串进行识别（所以这里是字符串的`"1"`）。

真的很方便吗？现在，视图1内有一个按钮元素，我们希望它点击后切换到视图2，那么这样做就搞定了：

{% highlight html %}
<a class="m-btn" href="javascript:" ng-click="view.current='2'"></a>
{% endhighlight %}

如果除了切换，还要做点别的，一般这样做：

{% highlight html %}
<a class="m-btn" href="javascript:" ng-click="view.doSomething()"></a>
{% endhighlight %}

对应JavaScript：

{% highlight javascript %}
function viewController(){
    // ... (the same as before)
    view.doSomething = doSomething;

    function doSomething(){
        // Do what you want.
        view.current = "2";
    }
}
{% endhighlight %}

到此，带有视图切换动画的单页应用就完成了。在此基础上，

<div class="post_display">
    <div class="view-container"></div>
</div>

##一些需要注意的地方##

##结语##


[img_css_truncation_one]: {{POSTS_IMG_PATH}}/201404/css_truncation_one.png "css截断-单行定宽"

[Angular]: https://angularjs.org/ "AngularJS — Superheroic JavaScript MVW Framework"
[ngSwtich]: https://docs.angularjs.org/api/ng/directive/ngSwitch "AngularJS: API: ngSwitch"
[ngAnimate]: https://docs.angularjs.org/api/ngAnimate "AngularJS: API: ngAnimate"
[A Collection of Page Transitions]: http://tympanus.net/Development/PageTransitions/ "A Collection of Page Transitions"
