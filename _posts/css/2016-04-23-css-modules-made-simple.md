---
layout: post
title: "简单易懂的CSS Modules"
category: "css"
description: "css modules的"
---
{% include JB/setup %}

## 层叠样式表 ##

我们知道，css的全名叫做层叠样式表，这个“层叠”到底是什么意思呢？

有一种解释是，如果你先写了一条样式规则（选手1）：

~~~css
.title {
    color: silver;
}
~~~

然后又在后边写了一条类似的（选手2）：

~~~css
.title {
    color: gold;
}
~~~

因为名字相同，选手2就会和选手1打起来（让你丫冒充我！）。结果是选手2获胜，class名为`title`的元素，最终的`color`值为`gold`。

css里就像这样，随时可能一言不和就发生战争，结果输掉的一方就会被胜利的一方所覆盖。“层叠”一词可以说形象地描述了这个过程。

那么，为什么会有这样的层叠（zhàn zhēng ）呢？

## css的作用域问题 ##

在javascript里，可以做到这样的搭配：

~~~javascript
var title = "silver";

(function(){
    var title = "gold";
    console.log(title); // gold
}());

console.log(title); // silver
~~~

利用javascript的函数作用域，两位同名的`title`选手也是可以友好相处的。

但回到了css里的样式规则，情况就完全不是这么回事了。

css不是程序语言，但如果说要给它加一个作用域的概念的话，那就是：只有全局作用域。

无论分拆为多少个css文件，无论用怎样的方式引入，**所有的样式规则都位于同一作用域，只要选择符近似，就有发生覆盖的可能**。

## 减少相互影响的策略 ##

为减少相互影响，避免预料之外的样式覆盖，我们一直以来想过很多办法。

比如你接手一个别人留下来的旧项目，接下来要新增一个标题元素的时候，你会有意识地不去使用`.title`这样模糊的class名，因为，它太容易重名了。最终，你用的名称可能是：

~~~css
.module-sp-title {
    color: deepskyblue;
}
~~~

即使你决定要用`.title`这个名字，你也会加上包含选择符作为限定：

~~~css
.module-1 .title { 
    font-size: 18px;
}
/* ... */
.module-2 .title {
    font-size: 14px;
}
~~~

其中`.module-1`和`.module-2`的名字应该是唯一的，这样的代码在组件化（模块化）的开发风格里很常见。

此外，一些有名的css理论，如[SMACSS][SMACSS]，会建议你为所有布局样式使用`l-`或`layout-`的前缀，以示区分。

类似的做法还有很多，但归结起来，都是在尝试**提供一种合理的命名约定**。而合理的命名约定，的确是组织css代码的有效策略。

现在，我们有了新的可用策略，CSS Module就是其中之一。

## 技术流的模块化 ##

**CSS Module**的字面意义是css模块，但它并不是字面意思，而是特指一种组织css代码的技术手段。技术流的东西是不是听起来挺酷？

创建一个CSS Module和新建一个普通css文件是一样的，只不过为class起名字时会更有底气，不用担心会影响其他的CSS Module。



CSS Module的写法有一个要求，就是单class应该具备对应的元素所需的全部样式。它的意思是：

这一点可能和普通css的写法风格不太一样，


CSS modules是一套技术策略，它要求使用动态生成的选择符。

## 适用的场景 ##



## 结语 ##

目的都是 maintainable css

CSS Module仍然是在写css，很简单。

development的时候  ._1rJwx92-gmbvaLiDdzgXiJ { … } 这种class名就太难调试，也不知道是哪里了。所以一般会带上原来的name，只是附带一个hash。比如
.MyComponent__foo___1rJwx { … }

They generate locally scoped class names that are easy to reason about, without introducing complex conventions.


所以，我们在一个Bootstrap的项目里，很难再使用[Materialize][Materialize]等其他框架。

A CSS Module is a CSS file in which all class names and animation names are scoped locally by default. 这也指CSS Module只对class名做处理。

生产环境下可以用混淆的更小的class名。

The benefits of global CSS — style re-use between components via utility classes, etc. — are still achievable with this model. The key difference is that, just like when we work in other technologies, we need to explicitly import the classes that we depend on. Our code can’t make many, if any, assumptions about the global environment.

CSS Module开始看来是有一个重大问题，即原本css有一个好处是一部分样式可以反复在多个地方使用，但CSS Module这样好像就都隔离了。然而，并没有，CSS Module里的compose就是做这个用的。当然，需要声明依赖关系。

Letting the build tool handle the generation of class names has some potentially huge implications.

核心在于class名是生成的。

缺陷：

每次写css的时候给class起名字可真是一件费心的事。当class名被程序管理起来之后，可就真的可以做点别的了。一些原来是我们自己想到的优化，可以交给电脑的编译来做了，这大概是CSS Module提供的很有意思的思路吧。

[img_blending_modes_in_photoshop]: {{POSTS_IMG_PATH}}/201601/blending_modes_in_photoshop.png "web混合模式"

[Materialize]: http://materializecss.com/ "Materialize"
[SMACSS]: https://smacss.com/ "Home - Scalable and Modular Architecture for CSS"
