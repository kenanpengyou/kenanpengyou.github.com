---
layout: post
title: "在Video.js播放器中定制自己的控件"
category: "前端综合"
description: "Video.js是一个很棒的视频播放功能第三方库。但是想要更深度的定制自己的控件有一定门槛，希望本文给你带来一点帮助。"
---
{% include JB/setup %}

视频播放是网页上常见的一个比较重量级的功能。作为html5的内容之一，`<video>`标签已经出现了很久了。但是，仅使用`<video>`标签的话，不同的浏览器会有不同的原生播放器界面，而且在部分功能上也可能有所缺失。一般来说，我们都想要一个统一外观的视频播放器，而且能够对播放器界面做深度的定制。



## 从旋转动画开始 ##

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


## 结语 ##

在书中作者Lea Verou已经给出了解答（实际上，可以追溯到作者更早的[这篇博文][这篇博文]），不过，我认为再补充一点周边细节知识可能会更易于理解。因此，本文整理了一些东西，将尝试更详细地解答这个问题。

[img_movement_impression]: {{POSTS_IMG_PATH}}/201611/movement_impression.png "环形路径平移"

[这篇博文]: http://lea.verou.me/2012/02/moving-an-element-along-a-circle/ "Moving an element along a circle | Lea Verou"
