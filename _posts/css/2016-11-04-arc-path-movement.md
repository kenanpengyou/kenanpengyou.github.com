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

最开始看到这个问题的时候，会很容易想到用`transform-origin`定义圆心的位置，然后用`rotate()`进行旋转。css代码大概是这样：

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





环形 → 两个元素，内元素抵消 → 2个transform-origin 的问题 → w3c给出的transform-origin的替代做法 → 合并到1个元素上，实现多transform-origin。

## 结语 ##


[img_movement_impression]: {{POSTS_IMG_PATH}}/201611/movement_impression.png "环形路径平移"
[img_circle_rotate]: {{POSTS_IMG_PATH}}/201611/circle_rotate.png "环形旋转"


[CSS Secrets]: https://github.com/cssmagic/CSS-Secrets "CSS Secrets"
[这篇博文]: http://lea.verou.me/2012/02/moving-an-element-along-a-circle/ "Moving an element along a circle | Lea Verou"