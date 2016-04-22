---
layout: post
title: "简单易懂的CSS Modules"
category: "css"
description: "CSS Modules是一个新的编写可维护css代码的策略，有趣的是，它还是在让你写css，那它到底做了什么？请看本文给出解答。"
---
{% include JB/setup %}

不要误会，CSS Modules可不是在说“css模块化”这个好像在某些地方见过的词，它其实是特指一种近期才出现的技术手段。

什么技术手段呢？请待后文说明。

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

利用javascript的函数作用域，两位同样名为`title`的选手可以友好相处。

但回到css里的样式规则，情况就完全不是这么回事了。

css不是程序语言，但如果说要给它加一个作用域的概念的话，那就是：只有全局作用域。

无论分拆为多少个css文件，无论用怎样的方式引入，**所有的样式规则都位于同一作用域，只要选择符近似，就有发生覆盖的可能**。

## 减少相互影响的策略 ##

为减少相互影响，避免预料之外的样式覆盖，我们一直以来想过很多办法。

比如你接手一个别人留下来的旧项目，接下来要新增一个标题元素的时候，你会有意识地不去使用`.title`这样模糊的class名，因为它太容易重名了。最终，你用的名称可能是：

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

现在，我们有了新的可用策略，CSS Modules就是其中之一。

## 技术流的模块化 ##

**[CSS Modules][CSS Modules]**是一种技术流的组织css代码的策略，它将为css提供默认的局部作用域。

CSS Modules是如何做到的呢？来看一个CSS Modules的简单例子吧。

有这样的一个html元素：

~~~html
<h2 id="example_title" class="title">a title for CSS Modules</h2>
~~~

按照普通css的写法，我们可以这样为它添加样式：

~~~css
.title {
    background-color: snow;
}
~~~

现在我们改用CSS Modules。首先，css保持不变。然后，修改html的写法。不再这样直接写html，而是改为在javascript文件里动态添加，这样做（css文件名为`main.css`）：

~~~javascript
var styles = require("./main.css");

var el = document.getElementById("example_title");
el.outerHTML = '<h2 class="' + styles.title + '">a title for CSS Modules</h2>';
~~~

咦，`require`了一个css文件？对的，所以要用到webpack。编译后，html和css会变成这样：

![CSS Modules的示例][img_css_modules_example]

看到这样不太美观的class名你大概就明白了，CSS Modules无法改变css全局作用域的本性，它是依靠动态生成class名这一手段，来实现局部作用域的。显然，这样的class名就可以是唯一的，不管原本的css代码写得有多随便，都可以这样转换得到不冲突的css代码。

模拟的局部作用域也没有关系，它是可靠的。

这个CSS Modules的例子说完了，但你一定跟我最初看到的时候一样有很多问题。

## CSS Modules的应用细节 ##

### 如何启用CSS Modules ###

“webpack编译css我也用过，怎么我用的时候不长这样？”

一般来说，`require`一个css文件的写法是：

~~~javascript
require("./main.css");
~~~

但在前面的例子中，用了`var styles = require("./main.css");`的写法。这就好像是在说，我要这个css文件里的样式是局部的，然后我根据需要自行取用。

在项目里应用CSS Modules有很多方法，目前比较常用的是使用webpack的[css-loader][css-loader]。在webpack配置文件里写`css-loader?modules`就可以开启CSS Modules，例如前面的例子所用的：

~~~javascript
module: {
    loaders: [{
        test: /\.css$/,
        loader: 'style!css?modules'
    }]
}
~~~

才发现一直用着的css-loader原来有这功能？其实，CSS Modules确实是一个后来才并入css-loader的新功能。

### 自定义生成的class名 ###

“名字都这样了，还怎么调试？”

为css-loader增加`localIdentName`参数，是可以指定生成的名字。`localIdentName`的默认值是`[hash:base64]`，一般开发环境建议用类似这样的配置：

~~~javascript
{
    test: /\.css$/,
    loader: 'style!css?modules&localIdentName=[name]__[local]___[hash:base64:5]'
}
~~~

同样应用到前面的例子里，这时候就会变成这样的结果：

![CSS Modules指定名字][img_css_modules_example_custom_name]

这样是不是要有意义多了？

如果是线上环境，可以考虑用更短的名字进一步减小css文件大小。

### CSS Modules下的html ###

（看了前面例子里的`el.outerHTML = ...`后）

“什么，outerHTML？class名还要拼接？你家html才这么写呢！”

很遗憾，CSS Modules官方的例子，也是这个意思：**要使用CSS Modules，必须想办法把变量风格的class名注入到html中**。也就是说，html模板系统是必需的，也正是如此，相比普通css的情况，CSS Modules的html写起来要更为费劲。

如果你搜一下CSS Modules的demo，可以发现大部分都是基于React的。显然，虚拟DOM风格的React，搭配CSS Modules会很容易（ES6）：

~~~javascript
import styles from './ScopedSelectors.css';

import React, { Component } from 'react';

export default class ScopedSelectors extends Component {

  render() {
    return (
      <div className={ styles.root }>
        <p className={ styles.text }>Scoped Selectors</p>
      </div>
    );
  }

};
~~~

如果不使用React，还是那句话，只要有办法把变量风格的class名注入到html中，就可以用CSS Modules。原始的字符串拼接的写法显然很糟糕，但我们可以借助各种模板引擎和编译工具做一些改进。下面请看一个用[Jade][Jade]的参考示例。

想象一下你有一个用普通css的页面，但你想在一小块区域使用CSS Modules。这一块区域在一个容器元素里：

~~~html
<div id="module_sp_container"></div>
~~~

然后用jade来写html（关联的css文件为`module_sp.css`）：

~~~jade
- styles = require("./module_sp.css");
h2(class=styles.title) a title for CSS Modules
~~~

接下来，仍然是在javascript里添加这段jade生成的html：

~~~javascript
var el = document.getElementById("module_sp_container");
var template = require("./main.jade");
el.innerHTML = template();
~~~

最后，记得在css-loader启用CSS Modules的同时，增加jade-loader：

~~~javascript
{
    test: /\.jade$/,
    loader: 'jade'
}
~~~

编译运行，就可以得到想要的结果。除Jade以外，还有些其他CSS Modules的html应用方案，推荐参考[github上的这篇issue][github上的这篇issue]。

目前CSS Modules还在发展中，而且也在考虑改进CSS Modules下的html写作体验。CSS Modules团队成员有提到一个叫[CSS Modules Injector][CSS Modules Injector]的未来规划项目，目的是让开发者不用javascript也可以使用CSS Modules（这就很接近原生html + css的组合了）。

### CSS Modules下的样式复用 ###

“样式都是唯一的了，怎么复用？”

我们已经说了挺多普通css单个全局作用域的坏处。但对应的，这也有一个很大的好处，就是便于实现样式的复用。css理论[OOCSS][OOCSS]也是在追求这一点。

CSS Modules提供一个`composes`方法用于样式复用。例如，你有一个`btn.css`里有一条：

~~~css
.btn{
    display: inline-block;
}
~~~

然后，你在另一个CSS Module的`module_sp.css`里可以这样引入它：

~~~css
.btn-sp{
    composes: btn from "./btn.css";
    font-size: 16px;
}
~~~

那么，这个`div.btn-sp`的DOM元素将会是：

![CSS Modules compose][img_css_modules_compose]

可以看到，`composes`的用法比较类似sass的`@extend`，但不同于`@extend`的是，`composes`并不增加css里的选择符总量，而是采用组合多个class名的形式。在这个例子里，原本仅有1个class的`div.btn-sp`，变成了2个class。

因此，CSS Modules建议只使用1个class就定义好对应元素所需的全部样式。它们会再由CSS Modules转换为适当的class组合。

CSS Modules团队成员认为`composes`是CSS Modules里最强大的功能：

> For me, the most powerful idea in CSS Modules is composition, where you can deconstruct your visual inventory into atomic classes, and assemble them at a module level, without duplicating markup or hindering performance.

更详细的`composes`的用法及其理解，推荐阅读[CSS Modules: Welcome to the Future][CSS Modules: Welcome to the Future]。

## 其他可能有用的补充 ## 

### 和已有的普通css共存 ###

很多项目会引入Bootstrap、[Materialize][Materialize]等框架，它们是普通的、全局的css。此外，你也可能自己会写一些普通css。如何共存呢？CSS Modules团队成员对此提到过：

> a CSS Module should only import information relative to it

意思是，建议把CSS Modules看做一种新的css，和原来的普通css区分开来。比如，`composes`的时候，不要从那些普通的css里去取。

在css-loader里通过指定`test`、`include`、`exclude`来区分它们。保持CSS Modules的纯净，只有想要应用CSS Modules的css文件，才启用CSS Modules。

### 只转换class和id ###

经过我自己的测试，CSS Modules只转换class和id，此外的标签选择符、伪类等都不会被转换。

建议只使用class。

### 一个CSS Module的输出 ###

简单用`console.log()`就可以查看CSS Module的输出：

~~~javascript
var styles = require("./main.css");
console.log("styles = ", styles);
~~~

结果类似这样：

~~~javascript
{
    "btn-sp":  "_2SCQ7Kuv31NIIiVU-Q2ubA _2r6eZFEKnJgc7GLy11yRmV",
    title: "_1m-KkPQynpIso3ofWhMVuK"
}
~~~

这可以帮助理解CSS Modules是怎样工作的。

### 预编译器 ###

sass等预编译器也可以用CSS Modules，对应的loader可能是这样：

~~~javascript
{
    test: /\.scss$/,
    loader: 'style!css?modules!resolve-url!sass?sourceMap'
}
~~~

注意不要因为是sass就习惯性地用嵌套写法，CSS Modules并不适合使用包含选择符。

### 建议的命名方式 ###

CSS Modules会把`.title`转换为`styles.title`，由于后者是用在javascript中，因此驼峰命名会更适合。

如果像我之前那样写`.btn-sp`，需要注意在javascript中写为`styles["btn-sp"]`。

此外，你还可以为css-loader增加`camelCase`参数来实现自动转换：

~~~javascript
{
    test: /\.css$/,
    loader: 'style!css?modules&camelCase',
}
~~~

这样即便你写`.btn-sp`，你也可以直接在javascript里用`styles.btnSp`。

## 结语 ##

无论是一直以来我们认真遵循的命名约定，还是这个新的CSS Modules，目的都是一样的：可维护的css代码。我觉得就CSS Modules基本还是在写css这一点来说，它还是很友好的。

虽然本文为了严谨，结果写了相当长的篇幅，但希望你读过之后，还能觉得CSS Modules是简单易懂的。因为这样，我就达成我的目的：扣题，了。

[img_css_modules_example]: {{POSTS_IMG_PATH}}/201604/css_modules_example.png "CSS Modules的示例"
[img_css_modules_example_custom_name]: {{POSTS_IMG_PATH}}/201604/css_modules_example_custom_name.png "CSS Modules指定名字"
[img_css_modules_compose]: {{POSTS_IMG_PATH}}/201604/css_modules_compose.png "CSS Modules compose"

[Materialize]: http://materializecss.com/ "Materialize"
[SMACSS]: https://smacss.com/ "Home - Scalable and Modular Architecture for CSS"
[CSS Modules]: https://github.com/css-modules/css-modules "CSS Modules"
[css-loader]: https://github.com/webpack/css-loader#css-modules "css loader for webpack"
[Jade]: http://jade-lang.com/ "Jade - Template Engine"
[github上的这篇issue]: https://github.com/zhouwenbin/blog/issues/15 "css modules的几种技术方案"
[CSS Modules Injector]: https://github.com/geelen/css-modules-injector "CSS Modules Injector"
[OOCSS]: https://github.com/stubbornella/oocss/wiki "OOCSS"
[CSS Modules: Welcome to the Future]: http://glenmaddern.com/articles/css-modules "CSS Modules: Welcome to the Future"
