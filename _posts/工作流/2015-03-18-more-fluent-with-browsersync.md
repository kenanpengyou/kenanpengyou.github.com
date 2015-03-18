---
layout: post
title: "BrowserSync，福利从免F5开始"
category: "工作流"
description: "Go"
---
{% include JB/setup %}

请想象这样一个场面：你开着两个显示器，一边是IDE里的代码，另一边是浏览器里的你正在开发的应用。此时桌上还放着你的手机，手机里也是这个开发中的应用。然后，你新写了一小段代码，按下了`ctrl`+`s`保存。紧接着，你的手机和另一个显示器里的应用，就变成了更新后的效果。你可以马上检查效果是否和你预想的一致，甚至都不需要动一下鼠标...

想起来还不错？嗯，这只是简单地省略掉那个开发过程中会按好多遍的`F5`刷新。

##自动刷新##

“自动刷新”并不是新的概念，但对关注“可见”的预览效果的前端开发者来说，它非常好用，可以节约很多时间。

我也不是现在才知道这个概念。在这之前，我一直在用[LiveReload][]，它是一个名字上更明显地写着“自动刷新”的工具。LiveReload主要搭配浏览器插件使用，是很棒的自动刷新工具。

不过，现在我要介绍的是[BrowserSync][]。你会在接下来的内容里看到，它是一个更新、更方便的开发工具。

##BrowserSync##

LiveReload有所不足的地方是，需要搭配浏览器插件。但是，插件是取决于浏览器的，Chrome和Firefox都有可用插件（见[这页][]），但IE，或者我手机上的浏览器，就不能这样了。这时候只能手工向页面里添加一段`<script>`代码（其实插件也是做了这件事），而且还要记得结束后再手工移除。

BrowserSync的一般用法则不需要浏览器插件，也不用手工添加代码（尽管也提供那样的用法）。一句控制台的命令之后，无论是在手机里还是电脑，无论用多少个浏览器（经测试，IE8+及其它），都可以拥有自动刷新的功能。

BrowserSync是怎么做到的？请看它的安装及使用。

###安装及使用###

安装[Node][]后，通过[npm][]安装BrowserSync：

    npm install -g browser-sync

然后，就可以开始使用了。打开控制台进入项目所在的目录，然后输入像这样的命令：

    browser-sync start --server --files "css/*.css"

这个命令用于纯静态站点，也就是仅一些`.html`文件的情况。后面的`--files "css/*.css"`，是指监听`css`目录中的后缀名为`.css`的文件。请注意这个命令里的`start --server`，这其实是BrowserSync自己启动了一个小型服务器。

如果是动态站点，则使用代理模式。例如PHP站点，已经建立了一个本地服务器如`http://localhost:8080`，会是这样的命令：

    browser-sync start --proxy "localhost:8080" --files "css/*.css"

BrowserSync会提供一个新地址（如未被占用的话，`http://localhost:3000`）用于访问。

好了，为什么BrowserSync不需要浏览器插件？因为它使用了服务器的形式（直接或代理）来处理项目文件。默认情况下，访问它的服务器上的网页，可以看到这样的提示签：

![hint tag: Connected to BrowserSync][img_hint_tag]

这说明当前浏览的网页已连接到BrowserSync。查看一下源码，会发现它们都被添加了与BrowserSync有关的一段`<script>`代码，就像LiveReload浏览器插件做的那样。这些代码会在浏览器和BrowserSync的服务器之间建立web socket连接，一旦有监听的文件发生变化，而且和当前网页有关，BrowserSync会通知浏览器。

如果发生变化的文件是css，BrowserSync不会刷新整页，而是直接重新请求这个css文件，并更新到当前页中，效果像这样：

![css injection][img_browsersync_preview_1]

显然，这感觉更加快捷。如果你正在开发的是一个单页应用，刷新整页会回到初始视图，而你又需要修改后面的某一个视图时，这一功能尤其有用。

###文件匹配###

从BrowserSync的命令来看，很重要的一点就是通过`--files`指定需要监听的文件。有关这里的文件匹配模式（称为`glob`）的详情，请参考[isaacs's minimatch][]。

经过我自己的尝试，如果简单只是想要监听整个项目，可以写成这样：

    browser-sync start --server  --files "**"

此时，BrowserSync仍然会正确地判断文件变化是否是css。

###加入到Gulp使用###

[Gulp][]是现在流行的自动化工具，但BrowserSync并没有Gulp插件版，因为并不需要。BrowserSync有自己独立的API，将它注册为gulp的一个task即可。下面是一段`gulpfile.js`的示例：

{% highlight javascript %}
var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
    browserSync({
        files: "**",
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('default', ["browser-sync"]);
{% endhighlight %}

这时候运行`gulp`将等同于前文的`browser-sync start --server  --files "**"`。更多的用法示例请查看[gulp-browser-sync][]。

###完整选项###

到此为止，介绍的都是BrowserSync的基本用法。在控制台里尝试只输入：

    browser-sync

你会看到BrowserSync完整的控制台命令指南。其中可以看到有这个命令：

    browser-sync init

运行它，将在当前目录生成一个配置文件`bs-config.js`。

参照[官方文档][]修改这个文件，然后运行

    browser-sync start --config bs-config .js

就将以`bs-config.js`的完整配置信息运行BrowserSync。

##不仅是自动刷新##

然而，BrowserSync做得很出色



![synchronize form actions][img_browsersync_preview_2]

![console output of browsersync with glup][img_gulp_browsersync_console]




[img_hint_tag]: {{POSTS_IMG_PATH}}/201503/hint_tag.png "hint tag: Connected to BrowserSync"
[img_browsersync_preview_1]: {{POSTS_IMG_PATH}}/201503/browsersync_preview_1.gif "css injection"
[img_browsersync_preview_2]: {{POSTS_IMG_PATH}}/201503/browsersync_preview_2.gif "synchronize form actions"
[img_gulp_browsersync_console]: {{POSTS_IMG_PATH}}/201503/gulp_browsersync_console.png "console output of browsersync with glup"

[LiveReload]: http://livereload.com/ "LiveReload"
[BrowserSync]: http://www.browsersync.io/ "BrowserSync - Time-saving synchronised browser testing"
[这页]: http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions- "How do I install and use the browser extensions? – LiveReload Help & Support"
[Node]: https://nodejs.org/ "Node"
[npm]: http://zh.wikipedia.org/zh-cn/Node%E5%8C%85%E7%AE%A1%E7%90%86%E5%99%A8 "npm"
[isaacs's minimatch]: https://github.com/isaacs/minimatch "isaacs/minimatch · GitHub"
[Gulp]: http://gulpjs.com/ "Gulp"
[gulp-browser-sync]: https://github.com/BrowserSync/gulp-browser-sync "BrowserSync/gulp-browser-sync · GitHub"
[官方文档]: http://www.browsersync.io/docs/options/ "BrowserSync options"