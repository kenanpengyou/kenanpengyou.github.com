---
layout: post
title: "前端模块及依赖管理的新选择：Browserify"
category: "javascript"
description: "前端开发模块化是一个很有意义的课题，在此之前，已有RequireJS、Sea.js这样的作品。而现在，我们又有了新的选择：Browserify。本文将较详细地解读Browserify这个新的模块及依赖管理工具。"
---
{% include JB/setup %}

##引言##

###1. manually###

以前，我新开一个网页项目，然后想到要用jQuery，我会打开浏览器，然后找到jQuery的官方网站，点击那个醒目的“Download jQuery”按钮，下载到`.js`文件，然后把它丢在项目目录里。在需要用到它的地方，这样用`<script>`引入它：

{% highlight html %}
<script src="path/to/jquery.js"></script>
{% endhighlight %}

###2. Bower###

后来，我开始用[Bower][]这样的包管理工具。所以这个过程变成了：先打开命令行用`bower`安装jQuery。

    bower install jquery

再继续用`<script>`引入它。

{% highlight html %}
<script src="bower_components/jquery/dist/jquery.js"></script>
{% endhighlight %}

###3. npm&Browserify###

现在，我又有了新的选择，大概是这样：

命令行用`npm`安装jQuery。

    npm install jquery

在需要用到它的JavaScript代码里，这样引入它：

{% highlight javascript %}
var $ = require("jquery");
{% endhighlight %}

没错，这就是使用npm的包的一般方法。但特别的是，这个npm的包是我们熟知的`jquery`，而它将用在浏览器中。

[Browserify][]，正如其名字所体现的动作那样，让原本属于服务器端的Node及npm，在浏览器端也可使用。

显然，上面的过程还没结束，接下来是Browserify的工作（假定上面那段代码所在的文件叫`main.js`）：

    browserify main.js -o bundle.js

最后，用`<script>`引用Browserify生成的`bundle.js`文件。

{% highlight html %}
<script src="bundle.js"></script>
{% endhighlight %}

这就是依托Browserify建立起来的第三选择。

等下，怎么比以前变复杂了？

##CommonJS风格的模块及依赖管理##

其实，在这个看起来更复杂的过程中，`require()`具有非凡的意义。

Browserify并不只是一个让你轻松引用JavaScript包的工具。它的关键能力，是JavaScript模块及依赖管理。（~~这才是为师的主业~~）

就模块及依赖管理这个问题而言，已经有[RequireJS][]和国内的[Sea.js][]这些优秀的作品。而现在，Browserify又给了我们新的选择。

![Browserify][img_browserify_logo]

Browserify参照了Node中的模块系统，约定用`require()`来引入其他模块，用`module.exports`来引出模块。在我看来，Browserify不同于RequireJS和Sea.js的地方在于，它没有着力去提供一个“运行时”的模块加载器，而是强调进行预编译。预编译会带来一个额外的过程，但对应的，你也不再需要遵循一定规则去加一层包裹。因此，相比较而言，Browserify提供的组织方式更简洁，也更符合CommonJS规范。

像写Node那样去组织你的JavaScript，Browserify会让它们在浏览器里正常运行的。

##安装及使用##

###命令行形式###

命令行形式是官方贴出来的用法，因为看起来最简单。

Browserify本身也是npm，通过npm的方式安装：

    npm install -g browserify

这里`-g`的参数表示全局，所以可以在命令行内直接使用。接下来，运行`browserify`命令到你的`.js`文件（比如`entry.js`）：

    browserify entry.js -o bundle.js

Browserify将递归分析你的代码中的`require()`，然后生成编译后的文件（这里的`bundle.js`）。在编译后的文件内，所有JavaScript模块都已合并在一起且建立好了依赖关系。最后，你在html里引用这个编译后的文件（喂，和引言里的一样啊）：

{% highlight html %}
<script src="bundle.js"></script>
{% endhighlight %}

有关这个编译命令的配置参数，请参照[node-browserify#usage][]。如果你想要做比较精细的配置，命令行形式可能会不太方便。这种时候，推荐结合Gulp使用。

###+ Gulp形式###

结合Gulp使用时，你的Browserify只安装在某个项目内：

    npm install browserify --save-dev

建议加上后面的`--save-dev`以保存到你项目的`package.json`里。

接下来是`gulpfile.js`的部分，下面是一个简单示例：

{% highlight javascript %}
var gulp = require("gulp");
var browserify = require("browserify");
var sourcemaps = require("gulp-sourcemaps");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task("browserify", function () {
    var b = browserify({
        entries: "./javascripts/src/main.js",
        debug: true
    });

    return b.bundle()
        .pipe(source("bundle.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./javascripts/dist"));
});
{% endhighlight %}

可以看到，Browserify是独立的，我们需要直接使用它的API，并将它加入到Gulp的任务中。

在上面的代码中，`debug: true`是告知Browserify在运行同时生成内联sourcemap用于调试。引入`gulp-sourcemaps`并设置`loadMaps: true`是为了读取上一步得到的内联sourcemap，并将其转写为一个单独的sourcemap文件。`vinyl-source-stream`用于将Browserify的`bundle()`的输出转换为Gulp可用的[vinyl][]（一种虚拟文件格式）流。`vinyl-buffer`用于将vinyl流转化为buffered vinyl文件（`gulp-sourcemaps`及大部分Gulp插件都需要这种格式）。

这样配置好之后，直接运行`gulp browserify`就可以得到结果了，可能像这样：

![Gulp + Browserify结果示例][img_browserify_console]

如果你的代码比较多，可能像上图这样一次编译需要1s以上，这是比较慢的。这种时候，推荐使用[watchify][]。它可以在你修改文件后，只重新编译需要的部分（而不是Browserify原本的全部编译），这样，只有第一次编译会花些时间，此后的即时变更刷新则十分迅速。

有关更多Browserify + Gulp的示例，请参考[Gulp Recipes][]。

##特性及简要原理##

使用Browserify来组织JavaScript，有什么要注意的地方吗？

要回答这个问题，我们先看看Browserify到底做了什么。下面是一个比较详细的例子。

项目内现在用到2个`.js文件`，它们存在依赖关系，其内容分别是：

<div class="code_before_note">name.js</div>
{% highlight javascript %}
module.exports = "aya";
{% endhighlight %}

<div class="code_before_note">main.js</div>
{% highlight javascript %}
var name = require("./name");

console.log("Hello! " + name);
{% endhighlight %}

然后对`main.js`运行Browserify，得到的`bundle.js`的文件内容是这样的：

<div class="code_before_note">bundle.js</div>
{% highlight javascript %}
(function e(t, n, r) {
    // ...
})({
    1: [function (require, module, exports) {
        var name = require("./name");

        console.log("Hello! " + name);
    }, {"./name": 2}],
    2: [function (require, module, exports) {
        module.exports = "aya";
    }, {}]
}, {}, [1])

//# sourceMappingURL=bundle.js.map
{% endhighlight %}

请先忽略掉省略号里的部分。然后，它的结构就清晰多了。可以看到，整体是一个立即执行的函数（[IIFE][]），该函数接收了3个参数。其中第1个参数比较复杂，第2、3个参数在这里分别是`{}`和`[1]`。

###模块map###

第1个参数是一个Object，它的每一个key都是数字，作为模块的id，每一个数字key对应的值是长度为2的数组。可以看出，前面的`main.js`中的代码，被`function(require, module, exports){}`这样的结构包装了起来，然后作为了key`1`数组里的第一个元素。类似的，`name.js`中的代码，也被包装，对应到key`2`。

数组的第2个元素，是另一个map对应，它表示的是模块的依赖。`main.js`在key`1`，它依赖`name.js`，所以它的数组的第二个元素是`{"./name": 2}`。而在key`2`的`name.js`，它没有依赖，因此其数组第二个元素是空Object`{}`。

因此，这第1个复杂的参数，携带了所有模块的源码及其依赖关系，所以叫做模块map。

###包装###

前面提到，原有的文件中的代码，被包装了起来。为什么要这样包装呢？

因为，浏览器原生环境中，并没有`require()`。所以，需要用代码去实现它（RequireJS和Sea.js也做了这件事）。这个包装函数提供的3个参数，`require`、`module`、`exports`，正是由Browserify实现了特定功能的3个关键字。

###缓存###

第2个参数几乎总是空的`{}`。它如果有的话，也是一个模块map，表示本次编译之前被加载进来的来自于其他地方的内容。现阶段，让我们忽略它吧。

###入口模块###

第3个参数是一个数组，指定的是作为入口的模块id。前面的例子中，`main.js`是入口模块，它的id是1，所以这里的数组就是`[1]`。数组说明其实还可以有多个入口，比如运行多个测试用例的场景，但相对来说，多入口的情况还是比较少的。

###实现功能###

还记得前面忽略掉的省略号里的代码吗？这部分代码将解析前面所说的3个参数，然后让一切运行起来。这段代码是一个函数，来自于browser-pack项目的[prelude.js][]。令人意外的是，它并不复杂，而且写有丰富的注释，很推荐你自行阅读。

###所以，到底要注意什么？###

到这里，你已经看过了Browserify是如何工作的。是时候回到前面的问题了。首先，**在每个文件内，不再需要自行包装**。

你可能已经很习惯类似下面这样的写法：

{% highlight javascript %}
;(function(){
    // Your code here.
}());
{% endhighlight %}

但你已经了解到，Browserify的编译会将你的代码封装在局部作用域内，所以，你不再需要自己做这个事情，像这样会更好：

{% highlight javascript %}
// Your code here.
{% endhighlight %}

类似的，如果你想用`"use strict";`启用严格模式，直接写在外面就可以了，这表示在某个文件的代码范围内启用严格模式。

其次，**保持局部变量风格**。我们很习惯通过`window.jQuery`和`window.$`这样的全局变量来访问jQuery这样的库，但如果使用Browserify，它们都应只作为局部变量：

{% highlight javascript %}
var $ = require("jquery");

$("#alice").text("Hello!");
{% endhighlight %}

这里的`$`就只存在于这个文件的代码范围内（独立的作用域）。如果你在另一个文件内要使用jQuery，需要按照同样的方式去`require()`。

然而，新的问题又来了，既然jQuery变成了这种局部变量的形式，那我们熟悉的各种jQuery插件要如何使用呢？

##browserify-shim##

你一定熟悉这样的jQuery插件使用方式：

{% highlight html %}
<script src="jquery.js"></script>
<script src="jquery.plugin.js"></script>
<script>
    // Now the jQuery plugin is available.
</script>
{% endhighlight %}

很多jQuery插件是这样做的：默认`window.jQuery`存在，然后取这个全局变量，把自己添加到jQuery中。显然，这在Browserify的组织方式里是没法用的。

为了让这样的“不兼容Browserify”（其实是不兼容CommonJS）的JavaScript模块（如插件）也能为Browserify所用，于是有了[browserify-shim][]。

下面，以jQuery插件[jquery.pep.js][]为例，请看browserify-shim的使用方法。

###使用示例###

安装browserify-shim：

    npm install browserify-shim --save-dev

然后在`package.json`中做如下配置：

{% highlight json %}
"browserify": {
    "transform": [ "browserify-shim" ]
},
"browser": {
    "jquery.pep" :  "./vendor/jquery.pep.js"
},
"browserify-shim": {
    "jquery.pep" :  { "depends": ["jquery:jQuery"] }
}
{% endhighlight %}

最后是`.js`中的代码：

{% highlight javascript %}
var $ = require("jquery");
require("jquery.pep");

$(".move-box").pep();
{% endhighlight %}

完成！到此，经过Browserify编译后，将可以正常运行这个jQuery插件。

这是一个怎样的过程呢？

在本例中，jQuery使用的是npm里的，而jquery.pep.js使用的是一个自己下载的文件（它与很多jQuery插件一样，还没有发布到npm）。查看`jquery.pep.js`源码，注意到它用了这样的包装：

{% highlight javascript %}
;(function ( $, window, undefined ) {
    // ...
}(jQuery, window));
{% endhighlight %}

可以看出，它默认当前环境中已存在一个变量`jQuery`（如果不存在，则报错）。`package.json`中的`"depends": ["jquery:jQuery"] `是为它添加依赖声明，前一个`jquery`表示`require("jquery")`，后一个`jQuery`则表示将其命名为`jQuery`（赋值语句）。这样，插件代码运行的时候就可以正常找到`jQuery`变量，然后将它自己添加到jQuery中。

实际上，browserify-shim的配置并不容易。针对代码包装（尽管都不兼容CommonJS，但也存在多种情况）及使用场景的不同，browserify-shim有不同的解决方案，本文在此只介绍到这。

关于配置的更多说明，请参照[browserify-shim官方文档][]。更多参考可以查看[browserify shim recipes][]。此外，如果你觉得browserify-shim有些难以理解或者对它的原理也有兴趣，推荐阅读[这篇Stack Overflow上的回答][]。

当然，对于已经处理了CommonJS兼容的库或插件（比如已经发布到npm），browserify-shim是不需要的。

###其实还有的更多transform###

在前面browserify-shim的例子中，`"browserify": {"transform": [ "browserify-shim" ]}`其实是Browserify的配置。可以看出，browserify-shim只是Browserify的其中一种transform。在它之外，还有[很多的transform][]可用，分别应对不同的需求，使Browserify的体系更为完善。

比如，还记得本文引言里的Bower吗？[debowerify][]可以让通过Bower安装的包也可以用`require()`引用。~~npm和bower同为包管理工具，Browserify表示你们都是我的翅膀。~~

##一点提示##

Browserify是静态分析编译工具，因此不支持动态`require()`。例如，下面这样是不可以的：

{% highlight javascript %}
var lang = "zh_cn";
var i18n = require("./" + lang);
{% endhighlight %}

##文档资料##

有关Browserify更详细的说明文档，请看[browserify-handbook][]。

##结语##

我觉得Browserify很有趣，它用了这样一个名字，让你觉得它好像只是一个Node的浏览器端转化工具。为此，它还完成了Node中大部分核心库的浏览器端实现。但实际上，它走到了更远的地方，并在JavaScript模块化开发这个重要的领域中，创立了一个全新的体系。

喜欢CommonJS的简洁风格？请尝试Browserify！

[img_browserify_logo]: {{POSTS_IMG_PATH}}/201506/browserify_logo.png "Browserify"
[img_browserify_console]: {{POSTS_IMG_PATH}}/201506/browserify_console.png "Gulp + Browserify结果示例"

[Bower]: http://bower.io/ "Bower"
[Browserify]: http://browserify.org/ "Browserify"
[RequireJS]: http://requirejs.org/ "RequireJS"
[Sea.js]: http://seajs.org/ "Sea.js - A Module Loader for the Web"
[node-browserify#usage]: https://github.com/substack/node-browserify#usage "node-browserify#usage"
[vinyl]: https://github.com/wearefractal/vinyl "vinyl"
[watchify]: https://github.com/substack/watchify "watchify"
[Gulp Recipes]: https://github.com/gulpjs/gulp/tree/master/docs/recipes "Gulp Recipes"
[IIFE]: http://benalman.com/news/2010/11/immediately-invoked-function-expression/ "Ben Alman » Immediately-Invoked Function Expression (IIFE)"
[prelude.js]: https://github.com/substack/browser-pack/blob/master/prelude.js "prelude.js"
[browserify-shim]: https://github.com/thlorenz/browserify-shim "browserify-shim"
[jquery.pep.js]: http://pep.briangonzalez.org/ "jquery.pep.js | kinetic drag for mobile & desktop"
[browserify-shim官方文档]: https://github.com/thlorenz/browserify-shim "browserify-shim"
[browserify shim recipes]: https://github.com/thlorenz/browserify-shim/wiki/browserify-shim-recipes "browserify shim recipes"
[这篇Stack Overflow上的回答]: http://stackoverflow.com/questions/24835954/configure-a-generic-jquery-plugin-with-browserify-shim#answer-25585778 "javascript - Configure a generic jQuery plugin with Browserify-shim? - Stack Overflow"
[很多的transform]: https://github.com/substack/node-browserify/wiki/list-of-transforms "list of transforms · substack/node-browserify Wiki · GitHub"
[debowerify]: https://github.com/eugeneware/debowerify "eugeneware/debowerify · GitHub"
[browserify-handbook]: https://github.com/substack/browserify-handbook "substack/browserify-handbook · GitHub"
