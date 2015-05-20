---
layout: post
title: "PostCSS"
category: "css"
description: "PostCSS"
---
{% include JB/setup %}

提到css预编译器（css preprocessor），你可能想到[Sass][]、[Less][]以及[Stylus][]。而本文要介绍的PostCSS，正是一个这样的工具：css预编译器可以做到的事，它同样可以做到。

“你说的我都懂，那为什么要用它？”

##套装与单件##

如果Sass等预编译器是新定义了一种模板语言，然后将其转化为css的话，[PostCSS][]则是更纯粹地对css本身做转换。

回想一下你是如何学习使用css预编译器的：了解到有这样一种可以转化为css的语言，它有很多特性，变量、嵌套、继承等等，每一种特性都通过一定语法实现。大概就像是递给你一个已经封装好的工具箱（量产型？），你可以在里面找有用的东西。

那PostCSS是怎样呢？PostCSS就像只递给你一个盒子，但告诉你你可以从旁边的陈列柜取走自己想要的工具放进盒子打包带走。如果你觉得陈列柜里的不够好，PostCSS还可以帮你打造你自己的工具。所以，使用PostCSS，你可以仅取所需。

![postcss logo][img_postcss_logo]

这就是PostCSS的**模块化**（**modular**）风格。它作为一个css转换工具，自身很小，其所有的转换功能都是插件，因此可以个性化配置。

##PostCSS的简要原理##

PostCSS自身只包括css分析器，css节点树API，source map生成器以及css节点树拼接器。

css的组成单元是一条一条的样式规则（rule），每一条样式规则又包含一个或多个属性&值的定义。所以，PostCSS的执行过程是，先css分析器读取css字符内容，得到一个完整的节点树，接下来，对该节点树进行一系列转换操作（基于节点树API的插件），最后，由css节点树拼接器将转换后的节点树重新组成css字符。期间可生成source map表明转换前后的字符对应关系：

![postcss process][img_postcss_process]

比较有意思的是，PostCSS的插件其实都是JavaScript函数，它们使用PostCSS的节点树API，对css节点树进行不同的转换。

##插件预览##

所有插件都可以在[PostCSS的主页][]中查询到，这里只选取一小部分示意一下。

###Autoprefixer###

PostCSS最有名的插件是[Autoprefixer][]。如名所示，可以自动为你添加浏览器私有前缀。它的添加值会参考[Can I Use][]及你设定的浏览器支持范围，因此相当可靠。下面是一个示例（以我设定的浏览器支持范围）：

<div class="code_before_note">Autoprefixer - src</div>
{% highlight css %}
.container{
    display: flex;
}
{% endhighlight %}

<div class="code_before_note">Autoprefixer - dest</div>
{% highlight css %}
.container{
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
}
{% endhighlight %}

###postcss-nested&postcss-mixins###

在刚开始使用PostCSS时，我就想到要用PostCSS实现我在Sass中最常用的特性。所以，我找到了`postcss-nested`和`postcss-mixins`。将它们结合起来后，就可以做到这样：

<div class="code_before_note">nested&mixins - src</div>
{% highlight css %}
@define-mixin clearfix{
    &:after{
        display: table;
        clear: both;
        content: " ";
    }
}

.column-container{
    color: #333;
    @mixin clearfix;
}
{% endhighlight %}

<div class="code_before_note">nested&mixins - dest</div>
{% highlight css %}
.column-container{
    color: #333;
}

.column-container:after{
    display: table;
    clear: both;
    content: " ";
}
{% endhighlight %}

到这里，你是否已经有了“预编译器可以做到的它也可以做到”的感觉呢？

##如何使用PostCSS##

我个人推荐结合[Gulp][]使用，所以本文只介绍[gulp-postcss][]的用法。

`gulp-postcss`及插件都是[npm][]，将它们通过`npm install`安装到项目目录后，再分别

{% highlight javascript %}
var gulp = require("gulp");
var postcss = require("gulp-postcss");
var autoprefixer = require('autoprefixer-core');
var postcssSimpleVars = require("postcss-simple-vars");
var postcssMixins = require("postcss-mixins");
var postcssNested = require("postcss-nested");
var sourcemaps = require("gulp-sourcemaps");

// Css process.
gulp.task("postcss", function(){
    var processors = [
        postcssMixins,
        postcssSimpleVars,
        postcssNested,
        autoprefixer({
            browsers: ["Android 4.1", "iOS 7.1", "Chrome > 31", "ff > 31", "ie >= 10"]
        })];

    return gulp.src(["./stylesheets/src/*.css"])
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./stylesheets/dest"));
});
{% endhighlight %}

##性能##

##做到更多##

##结语##


[img_postcss_logo]: {{POSTS_IMG_PATH}}/201505/postcss_logo.png "Philosopher’s stone, logo of PostCSS"
[img_postcss_process]: {{POSTS_IMG_PATH}}/201505/postcss_process.png "postcss process"

[Sass]: http://sass-lang.com/  "Sass: Syntactically Awesome Style Sheets"
[Less]: http://lesscss.org/ "Less.js"
[Stylus]: http://learnboost.github.io/stylus/ "Stylus — expressive, robust, feature-rich CSS preprocessor"
[PostCSS]: https://github.com/postcss/postcss "PostCSS"
[Autoprefixer]: https://github.com/postcss/autoprefixer "Autoprefixer"
[Can I Use]: http://caniuse.com/ "Can I use... Support tables for HTML5, CSS3, etc"
[PostCSS的主页]: https://github.com/postcss/postcss#plugins "PostCSS Plugins"
[Gulp]: http://gulpjs.com/ "gulp.js - the streaming build system"
[gulp-postcss]: https://github.com/postcss/gulp-postcss "gulp-postcss"
[npm]: https://www.npmjs.com/ "npm"
