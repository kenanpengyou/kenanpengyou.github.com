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

要视图，要动画。如果想要很快速地制作出这样一个基础单页应用，应该怎样做？

[Angular][]正是一个不错的选择。下面，本文将说明如何用Angular来完成制作。你会发现，这个过程相当简单。

##ngSwitch的DOM切换##

{% highlight html %}
<body ng-app="morin" ng-strict-di>
<div class="view-container" ng-controller="viewController as view" ng-switch="view.current">
    <div class="view-page view-1" ng-switch-when="haru"></div>
    <div class="view-page view-2" ng-switch-when="natsu"></div>
    <div class="view-page view-3" ng-switch-when="aki"></div>
    <div class="view-page view-4" ng-switch-when="fuyu"></div>
</div>
<!-- scripts -->
</body>
{% endhighlight %}

<div class="post_display">
    <div class="view-container"></div>
</div>



{% highlight javascript %}

{% endhighlight %}

##结语##


[img_css_truncation_one]: {{POSTS_IMG_PATH}}/201404/css_truncation_one.png "css截断-单行定宽"

[Angular]: https://angularjs.org/ "AngularJS — Superheroic JavaScript MVW Framework"
http://tympanus.net/Development/PageTransitions/