---
layout: post
title: "Browserify"
category: "javascript"
description: ""
---
{% include JB/setup %}

####




##提纲##

在我看来，Browserify很关键的一点是，它为你做了更多的部分，而你需要遵循的事情更少（对比RequireJS，国内的seaJS），当然，Browserify在开发中的工作流也要求更多，会需要自己准备一个一直运行着的随时编译，而不像RequireJS和seaJS那样本身就是模块加载器，开发状态，只需要刷新就可以了。

完全的npm。

 watchify可以增量更新，提高browserify的编译速度。

 browserify包含有transforms，可以将bower也require进来。另外，传统的通过<script>引入的如jQuery插件，也就是非CommonJS兼容的js库，可以使用browserify的shim，这也是一个transform。

 Browserify的require并不能使用变量。




##结语##

[异步JavaScript与Promise]: http://acgtofe.com/posts/2015/01/async-and-promise/
