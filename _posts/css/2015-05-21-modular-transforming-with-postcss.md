---
layout: post
title: "在css预编译器之后，PostCSS"
category: "css"
description: "可替代css预编译器的PostCSS，有兴趣尝试一下吗？"
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

我个人推荐结合[Gulp][]使用，本文在此只介绍[gulp-postcss][]的用法。

`gulp-postcss`及插件都是[npm][]，首先，使用`npm install`将它们分别安装到项目目录中（会位于`node_modules`）。然后，编辑`glupfile.js`，将PostCSS注册为Gulp的一个任务。以下是一个结合使用了`Autoprefixer`、`postcss-simple-vars`、`postcss-mixins`、`postcss-nested`4个插件，且生成source map文件的例子：

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

在上面这段代码中，`processors`是一个数组，定义了用到的PostCSS插件。PostCSS会按照定义顺序依次执行插件，因此，在结合多个插件使用时，请注意它们的位置。

###自定义转换###

此外，你可以很容易地创建你自己的转换（还记得前面说过PostCSS的插件都是JavaScript函数吧？）。例如，下面是一个自定义的转换方法，它将css代码中的带有`rem`单位的值，更改为`px`的值。

{% highlight javascript %}
var custom = function(css, opts){
    css.eachDecl(function(decl){
        decl.value = decl.value.replace(/\d+rem/, function(str){
            return 16 * parseFloat(str) + "px";
        });
    });
};
{% endhighlight %}

然后，你将这个方法直接添加到`processors`中（就像`postcssMixins`那些那样）就可以使用。如果原来有值是`3rem`，将变成`48px`。

以上只是一个简单的转换，如果要正式做一个插件，请参考[PostCSS插件指南][]。

##性能##

PostCSS宣称，由JavaScript编写的PostCSS比C++编写的[libsass][]（Sass原本是Ruby编写的，但后来出了C++的引擎，也就是libsass，它更快）还要快3倍。这里的具体数字我觉得不用多关心，可以感受到“PostCSS的运行速度很快”就足够了。

实际运行起来大概这样：

![Run PostCSS with Gulp][img_postcss_console]

##做到更多##

基于PostCSS，可以做到许多现有的css预编译器做不到的事。例如，插件系列[cssnext][]可以让你使用CSS4+的语法（增加了变量等许多特性），它会帮你转化为目前可用的CSS3。

##一点问题##

PostCSS有一个问题，那就是它是零散的，所以我无法找到一个编辑器能正确地解析并高亮准备使用PostCSS的css代码。例如在WebStorm中我把它当做普通的css文件，结果就会收到很多红色的错误提示。

##所以，css预编译器过时了吗？##

当然不会。就像其他流行的框架和工具那样，css预编译器是已经验证过的可用工具，我们完全可以根据需要选用。

Sass等css预编译器的特点是成熟可靠。一方面，它们已经是流行的模板语言，有完善的文档和周边支持，相对稳定，新加入团队的人也能比较容易地理解。另一方面，集成的风格有它的方便之处，就像你可能会懒得去组装一个模型，但能找到专业的人替你完成。

PostCSS的特点则是模块化。从长远来看，PostCSS可以做到更多类型的css转换。而可定制的风格非常适合追求个性的人（更快捷，而且可以自己做出很有趣的插件）。

此外，css预编译器和PostCSS可以协同使用。有一个流行的用法就是Sass编译后再接PostCSS的`Autoprefixer`（毕竟这是PostCSS的招牌插件）。

##结语##

PostCSS的风格可以说是在打造一个改变css开发方式的生态系统。所以如果说到未来，还是挺期待的。


[img_postcss_logo]: {{POSTS_IMG_PATH}}/201505/postcss_logo.png "Philosopher’s stone, logo of PostCSS"
[img_postcss_process]: {{POSTS_IMG_PATH}}/201505/postcss_process.png "postcss process"
[img_postcss_console]: {{POSTS_IMG_PATH}}/201505/postcss_console.png "Run PostCSS with Gulp"

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
[PostCSS插件指南]: https://github.com/postcss/postcss/blob/master/docs/guidelines/plugin.md "PostCSS Plugin Guidelines"
[libsass]: http://libsass.org/ "LibSass | A C implementation of a Sass compiler"
[cssnext]: http://cssnext.io/ "cssnext"
