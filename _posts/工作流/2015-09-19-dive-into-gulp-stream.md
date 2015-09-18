---
layout: post
title: "Gulp的Stream理论"
category: "工作流"
description: ""
---
{% include JB/setup %}

##来自Gulp的难题##

描述Gulp的项目构建过程的代码，并不总是简单易懂的。

比如Gulp的[这份recipe][]：

{% highlight javascript %}
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');

gulp.task('javascript', function () {
  var b = browserify({
    entries: './entry.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js/'));
});
{% endhighlight %}

这是一个使用Browserify及Uglify并生成Source Map的例子。请想一下这样几个问题：

- `b.bundle()`生成了什么，为什么也可以`.pipe()`？
- 为什么不是从`gulp.src()`开始？
- 为什么还要`vinyl-source-stream`和`vinyl-buffer`？它们是什么？
- 添加在中间的`.on('error', gutil.log)`有什么作用？

要回答这些问题，需要对Gulp做更深入的了解，这可以分成几个要素。

##要素之一：Stream##

你可能也在最初开始使用Gulp的时候就听说过：Gulp是一个有关**Stream**（**数据流**）的构建系统。这句话的意思是，**Gulp本身使用了Node的Stream**。

Stream如其名字所示的“流”那样，就像是工厂的流水线。你要加工一个产品，不用全部在一个位置完成，而是可以拆分成多道工序。产品从第一道工序开始，第一道工序完成后，输出然后流入第二道工序，然后再第三道工序...一方面，大批量的产品需求也不用等到全部完工（这通常很久），而是可以完工一个就拿到一个。另一方面，复杂的加工过程被分割成一系列独立的工序，这些工序可以反复使用，还可以在需要的时候进行替换和重组。这就是Stream的理念。

###管道###

Stream有一个很基本的操作叫做**管道**（**pipe**）。Stream是水流，而管道可以从一个流的输出口，接到另一个流的输入口，从而控制流向。如果用前面的流水线工序来说的话，就是连接工序的传输带了。

![pipes][img_pipes]

再来说Node的Stream。

####

##要素之二：vinvl文件系统##




To understand Gulp you need to understand Node Streams. All Gulp plugins are just through streams that read in data and output data. Everything can be processed in memory, with the output of one stream piped as input to another. Much like Unix pipes.

Gulp on the other hand is all about streams and building complex pipelines with ease. 



![weinre in browsersync UI][asd]


##结语##


[img_pipes]: {{POSTS_IMG_PATH}}/201509/pipes.jpg "pipes"

[这份recipe]: https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md "Browserify + Uglify2 with sourcemaps"