---
layout: post
title: "Browserify"
category: "javascript"
description: ""
---
{% include JB/setup %}

##引言##

###1###

以前，我新开一个网页项目，然后想到要用jQuery，我会打开浏览器，然后找到jQuery的官方网站，点击那个醒目的“Download jQuery”按钮，下载到`.js`文件，然后把它丢在项目目录里。在需要用到它的地方，这样用`<script>`引入它：

{% highlight html %}
<script src="path/to/jquery.js"></script>
{% endhighlight %}

###2###

后来，我开始用[Bower][]这样的包管理工具。所以这个过程变成了：先打开命令行用`bower`安装jQuery。

    bower install jquery

再继续用`<script>`引入它。

{% highlight html %}
<script src="bower_components/jquery/dist/jquery.js"></script>
{% endhighlight %}

###3###

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

就模块及依赖管理这个问题而言，已经有[RequireJS][]和国内的[Sea.js][]这些作品。而现在，Browserify又给了我们新的选择。

Browserify参照的是Node中的模块系统，约定用`require()`来引入其他模块，用`module.exports`来引出模块。

Node中的模块系统可以说是一个，也就是CommonJS规范风格，

##Browserify shim##

##简要原理##




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

[Bower]: http://bower.io/ "Bower"
[Browserify]: http://browserify.org/ "Browserify"
[RequireJS]: http://requirejs.org/ "RequireJS"
[Sea.js]: http://seajs.org/ "Sea.js - A Module Loader for the Web"
