---
layout: post
title: "巧妙使用transform实现环形路径平移动画"
category: "css"
description: ""
---
{% include JB/setup %}

最近在[CSS Secrets][CSS Secrets]一书看到了这样一节：让一个元素沿环形路径平移。这是一个css动画的问题，但却没有看上去那么简单，其关键点是**元素是平移的**，也就是说，元素自身并不发生旋转，只是稳定地沿着一个环形的路径移动，像这样：

![环形路径平移][img_movement_impression]

在书中作者Lea Verou已经给出了解答（实际上，可以追溯到作者更早的[这篇博文][这篇博文]），不过，我认为再补充一点周边细节知识可能会更易于理解。因此，本文整理了一些东西，将尝试更详细地解答这个问题。

## 从旋转动画开始 ##

最开始看到这个问题的时候，会很容易想到用`transform-origin`定义圆心的位置，然后用`rotate()`进行旋转。css代码大概是这样（半径为150px）：

~~~css
@keyframes spin {
    to {
        transform: rotate(1turn);
    }
}

.avatar{
    animation: spin 10s infinite linear;
    transform-origin: 50% 150px;
}
~~~

搭配的html很简单：

~~~html
<img class="avatar" src="edwardup_avatar.jpg" alt="" />
~~~

对应的效果是：

![环形旋转][img_circle_rotate]

可以看到，这是一个旋转动画，元素在沿着环形路径移动的同时，自身也会围绕圆心发生旋转。因此，这并不是我们想要的平移效果。

但另一方面，元素沿环形路径移动这一点是符合我们的目标的。所以，可以在这个基础上思考如何改进。

## 利用多元素的变形相消 ##

w3c的[The Transform Function Lists][The Transform Function Lists]里提到：

> If a list of \<transform-function\> is provided, then the net effect is as if each transform function had been specified separately in the order provided.

意思是，**当一个元素的`transform`添加了多个变换函数时，其效果等同于按照这些变换函数的顺序依次分散添加在多层元素中**。例如，以下元素：

~~~html
<div style="transform:translate(-10px,-20px) scale(2) rotate(45deg) translate(5px,10px)"></div>
~~~

其变换结果等效于：

~~~html
<div style="transform:translate(-10px,-20px)">
  <div style="transform:scale(2)">
    <div style="transform:rotate(45deg)">
      <div style="transform:translate(5px,10px)">
      </div>
    </div>
  </div>
</div>
~~~

这是一条非常有用的规则。

现有一个应用了旋转变换函数的元素是：

~~~html
<div style="transform:rotate(45deg) rotate(-45deg)"></div>
~~~

显然，这个元素其实是没有旋转的，因为两个旋转变换函数刚好抵消。这时候，我们再用一下前面的规则，就知道它等同于：

~~~html
<div style="transform:rotate(45deg)">
    <div style="transform:rotate(-45deg)"></div>
</div>
~~~

也就是说，**内层元素可以通过变形来抵消外层的变形效果**。

现在回到旋转动画，既然元素已经是沿环形路径移动了，我们要做的就是抵消掉元素自身的旋转。参考上面的原理，可以得到：

~~~html
<div class="avatar">
    <img src="edwardup_avatar.jpg" alt="" />
</div>
~~~

~~~css
@keyframes spin {
    to { transform: rotate(1turn); }
}
@keyframes spin-reverse {
    from { transform: rotate(1turn); }
}
.avatar {
    animation: spin 10s infinite linear;
    transform-origin: 50% 150px;
}
.avatar > img {
    animation: spin-reverse 10s infinite linear;
}
~~~

这段代码把旋转动画搬到了`div.avatar`这个容器元素上，然后为`<img>`元素添加了一个刚好相反的旋转动画。运行一下就知道，这就是我们想要达到的效果（参见文章开头的图）。

## 解决多transform-origin的问题 ##

在前面的解决方案中，为了让元素自身不发生旋转，增加了额外的容器元素。那么，如果只用单个元素，有办法实现吗？










## 提纲 ##

环形 → 两个元素，内元素抵消 → 2个transform-origin 的问题 → w3c给出的transform-origin的替代做法 → 合并到1个元素上，实现多transform-origin。

## 结语 ##


[img_movement_impression]: {{POSTS_IMG_PATH}}/201611/movement_impression.png "环形路径平移"
[img_circle_rotate]: {{POSTS_IMG_PATH}}/201611/circle_rotate.png "环形旋转"


[CSS Secrets]: https://github.com/cssmagic/CSS-Secrets "CSS Secrets"
[这篇博文]: http://lea.verou.me/2012/02/moving-an-element-along-a-circle/ "Moving an element along a circle | Lea Verou"
[The Transform Function Lists]: https://www.w3.org/TR/css-transforms-1/#transform-function-lists "The Transform Function Lists"