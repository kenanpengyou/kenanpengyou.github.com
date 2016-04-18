---
layout: post
title: "简单易懂的CSS Modules"
category: "css"
description: "css modules的"
---
{% include JB/setup %}

css的全名叫做层叠样式表，这个“层叠”是什么意思呢？

有一种解释是，如果你先写了一条样式规则：

~~~css
.title {
    color: silver;
}
~~~

然后又在后边写了一条类似的：

~~~css
.title {
    color: gold;
}
~~~

那么，class名为`title`的元素，最终的`color`值为`gold`。因此，在css里，有的规则会被其他的规则覆盖。这种覆盖也可以叫做层叠。

为什么会有这样的层叠呢？

## css的作用域 ##

在javascript里，可以有这样的搭配：

~~~javascript
var title = "silver";

(function(){
    var title = "gold";
    console.log(title); // gold
}());

console.log(title); // silver
~~~

利用javascript里的函数作用域，同名的`title`也可以协调共存。然而，到了css里的样式规则，就完全不是这么回事了。

css并不是程序语言，但如果说要给它加一个作用域的概念的话，那就是：只有全局作用域。

也就是说，无论分拆为多少个css文件，无论用怎样的方式引入，**所有的样式规则都位于同一作用域，只要选择符近似，就有发生覆盖的可能**。

## 减少相互影响的策略 ##

为减少相互影响，避免预料之外的覆盖，我们其实已经做过很多事。

比如你接手了一个别人留下来的旧项目，那么项目里要新增一个标题元素的时候，你会有意识地不去使用`.title`这样模糊的class名，因为它太容易重名了。最终你用的名称可能是：

~~~css
.module-sp-title {
    color: deepskyblue;
}
~~~

如果你坚持要用`.title`这个名字，你也会用包含选择符来做一些限定：

~~~css
.module-1 .title { 
    font-size: 18px;
}
/* ... */
.module-2 .title {
    font-size: 14px;
}
~~~

这在组件化（模块化）的开发风格里很常用，其中`.module-1`和`.module-2`的名字应该是唯一的。

一些有名的css理论，如[SMACSS][SMACSS]，会建议你为所有布局样式使用`l-`或`layout-`的前缀，

## 适用的场景 ##



## 结语 ##

所以，我们很少使用`.title`、`.header`这样模糊的class名。

所以，我们在一个Bootstrap的项目里，很难再使用[Materialize][Materialize]等其他框架。

我们一直以来还做了哪些事呢？

[img_blending_modes_in_photoshop]: {{POSTS_IMG_PATH}}/201601/blending_modes_in_photoshop.png "web混合模式"

[Materialize]: http://materializecss.com/ "Materialize"
[SMACSS]: https://smacss.com/ "Home - Scalable and Modular Architecture for CSS"
