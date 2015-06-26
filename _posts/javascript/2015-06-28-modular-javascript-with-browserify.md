---
layout: post
title: "Browserify"
category: "javascript"
description: ""
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

[Browserify][]，正如其名字所体现的动作那样，让原本属于服务器端的Node的npm，在浏览器端也可使用。

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

Browserify并不只是一个让你轻松引用JavaScript包的工具。它的关键能力之一，是JavaScript模块及依赖管理。（~~这才是为师的主业~~）

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

请忽略掉省略号里的部分（~~这能看？？~~），然后，它的结构就清晰多了。可以看到，整体是一个立即执行的函数（[IIFE][]），该函数接收了3个参数。其中第1个参数比较复杂，第2、3个参数在这里分别是`{}`和`[1]`。

###模块map###

第1个参数是一个Object，它的每一个key都是数字，每一个数字key对应的值是长度为2的数组。可以看出，前面的`main.js`中的代码，被`function(require, module, exports){}`这样的结构包装了起来，然后作为了key`1`数组里的第一个元素。类似的，`name.js`中的代码，也被包装，对应到key`2`。

数组的第2个元素，是另一个map对应，它表示的是模块的依赖。`main.js`在key`1`，它依赖`name.js`，所以它的数组的第二个元素是`{"./name": 2}`。而在key`2`的`name.js`，它没有依赖，因此其数组第二个元素是空Object`{}`。

因此，这第1个复杂的参数，携带了所有模块的源码及其依赖关系，所以叫做模块map。

###包装###

前面提到，原有的文件中的代码，被包装了起来。为什么要这样包装呢？

因为，浏览器原生环境中，并没有`require()`。所以，需要用代码去实现它（RequireJS和Sea.js也做了这件事）。这个包装函数提供的3个参数，`require`、`module`、`exports`，正是由Browserify实现了特定功能的3个关键字。

###缓存###

第2个参数几乎总是空的`{}`。它如果有的话，也是一个模块map，表示本次编译之前被加载进来的来自于其他地方的内容。总之，忽略它吧。

###入口模块###

第3个


##Browserify shim##

比如以前的jQuery插件如何通过browserify来使用。

##备用##


到此，你已经看过了这个有意思的变化过程。如今，这三种引入方式都是可用的，你可以根据自己的喜好选择。


##提纲##

在我看来，Browserify很关键的一点是，它为你做了更多的部分，而你需要遵循的事情更少（对比RequireJS，国内的seaJS），当然，Browserify在开发中的工作流也要求更多，会需要自己准备一个一直运行着的随时编译，而不像RequireJS和seaJS那样本身就是模块加载器，开发状态，只需要刷新就可以了。

完全的npm。

 watchify可以增量更新，提高browserify的编译速度。

 browserify包含有transforms，可以将bower也require进来。另外，传统的通过`<script>`引入的如jQuery插件，也就是非CommonJS兼容的js库，可以使用browserify的shim，这也是一个transform。

 Browserify的require并不能使用变量。


##结语##

有了Browserify之后，npm已经可以算作通用的javascript包管理工具。

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
