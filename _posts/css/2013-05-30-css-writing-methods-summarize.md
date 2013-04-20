---
layout: post
title: "css写法综述"
category: "css"
description: ""
published: false
---
{% include JB/setup %}




##css继承层级##

如果继承层级比较多，这些被定义的东西的权重就较大，如果要更改它们，就要用更长的继承层级来保证优先级，这就会造成更长的继承层级。而长的css选择符是不利于网页性能的。


##hack的使用##

使用hack来解决问题的恶果是：以后做改变，要继续用hack来改，很麻烦。

[img1]: {{POSTS_IMG_PATH}}/201303/footer_distance.jpg "页面内容不足的时候，页脚将不能贴到底部"
[img2]: {{POSTS_IMG_PATH}}/201303/footer_placeholder.jpg "页脚占位符的作用"