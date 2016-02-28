---
layout: post
title: "Express结合Webpack的全栈自动刷新"
category: "工作流"
description: "如今，强大的Webpack可以说改变了前端开发的工作流程，这种时候，还想要附带自动刷新的开发体验要怎么做呢？本文将讲述Express&Webpack项目的一个可行的配置过程，让你修改的文件无论属于前端还是后端，都可以得到适当的自动刷新。"
---
{% include JB/setup %}

在以前的一篇文章[BrowserSync，迅捷从免F5开始][BrowserSync，迅捷从免F5开始]中，我介绍了BrowserSync这样一个出色的开发工具。通过BrowserSync我感受到了这样一个理念：如果在一次`ctrl + s`保存后可以自动刷新，然后立即看到新的页面效果，那会是很棒的开发体验。

现在，[webpack][webpack]可以说是最流行的模块加载器（module bundler）。一方面，它为前端静态资源的组织和管理提供了相对较完善的解决方案，另一方面，它也很大程度上改变了前端开发的工作流程。在应用了webpack的开发流程中，想要继续“自动刷新”的爽快体验，就可能得额外做一些事情。

##webpack与自动刷新##

本文并不打算介绍webpack，如果你还不清楚它是什么，推荐阅读下面几篇入门文章：

- [Beginner’s guide to Webpack][Beginner’s guide to Webpack]
- [Developing with Webpack][Developing with Webpack]
- [webpack-howto][webpack-howto]

webpack要求静态资源在被真正拿来访问之前，都要先完成一次编译，即运行完成一次`webpack`命令。因此，自动刷新需要调整到适当的时间点。也就是说，修改了css等源码并保存后，应该先触发一次webpack编译，在编译完成后，再通知浏览器去刷新。

##开发Express项目的问题##

现在有这样的一个应用了webpack的[Express][Express]项目，目录结构如下：

![Express应用的目录结构][img_app_directory]

其中，`client`内是前端的静态资源文件，比如css、图片以及浏览器内使用的javascript。`server`内是后端的文件，比如express的routes、views以及其他用node执行的javascript。根目录的`app.js`，就是启动express的入口文件了。

开发的时候我们会怎样做呢？

先启动Express服务器，然后在浏览器中打开某个页面，接下来再编辑源文件。那么，问题就来了，比如我编辑`.scss`源文件，即使我只改了一小点，我也得在命令行里输入`webpack`等它编译完，然后再切到浏览器里按一下F5，才能看到修改后的效果。

再比如，我修改了`routes`里的`.js`文件想看看结果，我需要到命令行里重启一次Express服务器，然后同样切到浏览器里按一下F5。

这可真是太费事了。

所以，我们要让开发过程愉快起来。

##改进目标##

我们希望的Express&Webpack项目的开发过程是：

- 如果修改的是`client`里的css文件（包括`.scss`等），保存后，浏览器不会整页刷新，新的样式效果直接更新到页面内。
- 如果修改的是`client`里的javascript文件，保存后，浏览器会自动整页刷新，得到更新后的效果。
- 如果修改的是`server`里的文件，保存后，服务器将自动重启，浏览器会在服务器重启完毕后自动刷新。

经过多次尝试，我最终得到了一个实现了以上这些目标的项目配置。接下来，本文将说明这个配置是如何做出来的。

##从webpack-dev-server开始##

首先，webpack已经想到了开发流程中的自动刷新，这就是webpack-dev-server。它是一个静态资源服务器，只用于开发环境。

一般来说，对于纯前端的项目（全部由静态html文件组成），简单地在项目根目录运行webpack-dev-server，然后打开html，修改任意关联的源文件并保存，webpack编译就会运行，并在运行完成后通知浏览器刷新。

和直接在命令行里运行`webpack`不同的是，webpack-dev-server会把编译后的静态文件全部保存在内存里，而不会写入到文件目录内。这样，少了那个每次都在变的webpack输出目录，会不会觉得更清爽呢？

如果在请求某个静态资源的时候，webpack编译还没有运行完毕，webpack-dev-server不会让这个请求失败，而是会一直阻塞它，直到webpack编译完毕。这个对应的效果是，如果你在不恰当的时候刷新了页面，不会看到错误，而是会在等待一段时间后重新看到正常的页面，就好像“网速很慢”。

webpack-dev-server的功能看上去就是我们需要的，但如何把它加入到包含后端服务器的Express项目里呢？

##webpack-dev-middleware和webpack-hot-middleware##

Express本质是一系列middleware的集合，因此，适合Express的webpack开发工具是[webpack-dev-middleware][webpack-dev-middleware]和[webpack-hot-middleware][webpack-hot-middleware]。

webpack-dev-middleware是一个处理静态资源的middleware。前面说的webpack-dev-server，实际上是一个小型Express服务器，它也是用webpack-dev-middleware来处理webpack编译后的输出。

webpack-hot-middleware是一个结合webpack-dev-middleware使用的middleware，它可以实现浏览器的无刷新更新（hot reload）。这也是webpack文档里常说的HMR（Hot Module Replacement）。

参考webpack-hot-middleware的[文档][webpack-hot-middleware]和[示例][webpack-hot-middleware示例]，我们把这2个middleware添加到Express中。

###webpack配置文件部分###

首先，修改webpack的配置文件（为了方便查看，这里贴出了`webpack.config.js`的全部代码）：

{% highlight javascript %}
var webpack = require('webpack');
var path = require('path');

var publicPath = 'http://localhost:3000/';
var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';

var devConfig = {
    entry: {
        page1: ['./client/page1', hotMiddlewareScript],
        page2: ['./client/page2', hotMiddlewareScript]
    },
    output: {
        filename: './[name]/bundle.js',
        path: path.resolve('./public'),
        publicPath: publicPath
    },
    devtool: 'source-map',
    module: {
        loaders: [{
            test: /\.(png|jpg)$/,
            loader: 'url?limit=8192&context=client&name=[path][name].[ext]'
        }, {
            test: /\.scss$/,
            loader: 'style!css?sourceMap!resolve-url!sass?sourceMap'
        }]
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ]
};

module.exports = devConfig;
{% endhighlight %}

这是一个包含多个entry的较复杂的例子。其中和webpack-hot-middleware有关的有两处。一是`plugins`的位置，增加3个插件，二是`entry`的位置，每一个entry后都增加一个`hotMiddlewareScript`。

`hotMiddlewareScript`的值是`webpack-hot-middleware/client?reload=true`，其中`?`后的内容相当于为webpack-hot-middleware设置参数，这里`reload=true`的意思是，如果碰到不能hot reload的情况，就整页刷新。

在这个配置文件中，还有一个要点是`publicPath`不是`/`这样的值，而是`http://localhost:3000/`这样的绝对地址。这是因为，在使用`?sourceMap`的时候，style-loader会把css的引入做成这样：

![style-loader的效果][img_style_loader_issue]

这种`blob`的形式可能会使得css里的`url()`引用的图片失效，因此建议用带`http`的绝对地址（这也只有开发环境会用到）。有关这个问题的详情，你可以查看[github上的issue][github上的issue]。

###Express启动文件部分###

接下来是Express启动文件内添加以下代码：

{% highlight javascript %}
var webpack = require('webpack'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    webpackDevConfig = require('./webpack.config.js');

var compiler = webpack(webpackDevConfig);

// attach to the compiler & the server
app.use(webpackDevMiddleware(compiler, {

    // public path should be the same with webpack config
    publicPath: webpackDevConfig.output.publicPath,
    noInfo: true,
    stats: {
        colors: true
    }
}));
app.use(webpackHotMiddleware(compiler));
{% endhighlight %}

以上这段代码应该位于Express的routes代码之前。其中，webpack-dev-middleware配置的`publicPath`应该和webpack配置文件里的一致。

webpack-dev-middleware和webpack-hot-middleware的静态资源服务只用于开发环境。到了线上环境，应该使用`express.static()`。

到此，`client`部分的目标就完成了。现在到网页里打开控制台，应该可以看到`[HMR] connected`的提示。这个项目中我只要求css使用HMR，如果你希望javascript也使用HMR，一个简单的做法是在entry文件内添加以下代码：

{% highlight javascript %}
if(module.hot) {
    module.hot.accept();
}
{% endhighlight %}

这样，与这个entry相关的所有`.js`文件都会使用hot reload的形式。关于这一点的更多详情，请参考[hot module replacement][hot module replacement]。

接下来是`server`部分。

##reload和supervisor##

`server`部分的自动刷新，会面临一个问题：自动刷新的消息通知依靠的是浏览器和服务器之间的web socket连接，但在`server`部分修改代码的话，一般都要重启服务器来使变更生效（比如修改`routes`），这就会断开web socket连接。

所以，这需要一个变通的策略：浏览器这边增加一个对web socket断开的处理，如果web socket断开，则开启一个稍长于服务器重启时间的定时任务（`setTimeout`），相当于等到服务器重启完毕后，再进行一次整页刷新。

[reload][reload]是一个应用此策略的组件，它可以帮我们处理服务器重启时的浏览器刷新。

现在，还差一个监听`server`文件，如果有变更就重启服务器的组件。参考reload的推荐，我们选用[supervisor][supervisor]。

下面将reload和supervisor引入到Express项目内。

###监听文件以重启服务器###

通过以下代码安装`supervisor`（是的，必须`-g`）：

    npm install supervisor -g

然后，在`package.json`里设置新的`scripts`：

{% highlight json %}
"scripts": {
    "start": "cross-env NODE_ENV=dev supervisor -i client app"
}
{% endhighlight %}

这里的主要变化是从`node app`改为`supervisor -i client app`。其中`-i`等于`--ignore`，这里表示忽略`client`，显然，我们可不希望在改前端代码的时候服务器也重启。

这里的`cross-env`也是一个npm组件，它可以处理windows和其他Unix系统在设置环境变量的写法上不一致的问题。

###把会重启的服务器和浏览器关联起来###

把Express启动文件最后的部分做这样的修改：

{% highlight javascript %}
var reload = require('reload');
var http = require('http');

var server = http.createServer(app);
reload(server, app);

server.listen(3000, function(){
    console.log('App (dev) is now running on port 3000!');
});
{% endhighlight %}

Express启动文件的最后一般是`app.listen()`。参照reload的说明，需要这样用`http`再增加一层服务。

然后，再到Express的视图文件views里，在底部增加一个`<script>`：

{% highlight html %}
<% if (env !== "production") { %>
    <script src="/reload/reload.js"></script>
<% } %>
{% endhighlight %}

所有的views都需要这样一段代码，因此最好借助模板引擎用include或extends的方式添加到公共位置。

这里的`reload.js`和前面webpack的开发环境`bundle.js`并不冲突，它们一个负责前端源文件变更后进行编译和刷新，另一个负责在服务器发生重启时触发延时刷新。

到此，`server`也完成了。现在，修改项目内的任意源文件，按下`ctrl + s`，浏览器里的页面都会对应地做一次“适当”的刷新。

##完整示例##

完整示例已经提交到github：[express-webpack-full-live-reload-example][express-webpack-full-live-reload-example]

效果如下：

![示例效果][img_example_preview]

##附加的可选方案##

前面说的`server`部分，分为views和routes，如果只修改views，那么服务器并不需要重启，直接刷新浏览器就可以了。

针对这样的开发情景，可以把views文件的修改刷新变得更快。这时候我们不用reload和supervisor，改为用browsersync，在Express的启动文件内做如下修改：

{% highlight javascript %}
var bs = require('browser-sync').create();
app.listen(3000, function(){
    bs.init({
        open: false,
        ui: false,
        notify: false,
        proxy: 'localhost:3000',
        files: ['./server/views/**'],
        port: 8080
    });
    console.log('App (dev) is going to be running on port 8080 (by browsersync).');
});
{% endhighlight %}

然后，使用browsersync提供的新的访问地址就可以了。这样，修改views（html）的时候，由browsersync帮忙直接刷新，修改css和javascript的时候继续由webpack的middleware来执行编译和刷新。

##结语##

有了webpack后，没有自动刷新怎么干活？

说起来，能做出像这样的全栈刷新，大概也是得益于Express和Webpack都是javascript，可以很容易地结合、协作的缘故吧。

[img_app_directory]: {{POSTS_IMG_PATH}}/201602/app_directory.png "Express应用的目录结构"
[img_style_loader_issue]: {{POSTS_IMG_PATH}}/201602/style_loader_issue.png "style-loader的效果"
[img_example_preview]: {{PURE_ASSET_PATH}}/used-images/projects/express-webpack-full-live-reload-example/preview.gif "示例效果"

[BrowserSync，迅捷从免F5开始]: http://acgtofe.com/posts/2015/03/more-fluent-with-browsersync/ "BrowserSync，迅捷从免F5开始"
[webpack]: http://webpack.github.io/ "webpack module bundler"
[Express]: http://expressjs.com/ "Express - Node.js web application framework"
[Beginner’s guide to Webpack]: https://medium.com/@dabit3/beginner-s-guide-to-webpack-b1f1a3638460 "Beginner’s guide to Webpack — Medium"
[Developing with Webpack]: http://survivejs.com/webpack_react/developing_with_webpack/ "SurviveJS - Developing with Webpack"
[webpack-howto]: https://github.com/petehunt/webpack-howto/blob/master/README-zh.md "petehunt/webpack-howto"
[webpack-dev-middleware]: https://www.npmjs.com/package/webpack-dev-middleware "webpack-dev-middleware"
[webpack-hot-middleware]: https://www.npmjs.com/package/webpack-hot-middleware "webpack-hot-middleware"
[webpack-hot-middleware示例]: https://github.com/glenjamin/webpack-hot-middleware/blob/master/example/ "Webpack Hot Middleware Example"
[github上的issue]: https://github.com/webpack/style-loader/issues/55 "Generated image urls *must* be absolute for style!css?sourceMap to work? · Issue #55 · webpack/style-loader"
[hot module replacement]: http://webpack.github.io/docs/hot-module-replacement.html "hot module replacement"
[reload]: https://www.npmjs.com/package/reload "reload"
[supervisor]: https://www.npmjs.com/package/supervisor "supervisor"
[express-webpack-full-live-reload-example]: https://github.com/kenanpengyou/express-webpack-full-live-reload-example "express-webpack-full-live-reload-example"