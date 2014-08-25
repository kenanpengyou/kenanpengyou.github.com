---
layout: post
title: "省时省心的自动化工具 - Grunt使用介绍"
category: "前端综合"
description: "Grunt是适用于前端开发的自动化工具，很有用，不过在使用方法上可能存在一些难点。本文希望以更为容易理解的方式，来说明如何使用Grunt。"
---
{% include JB/setup %}

很多人都知道，一个实际的项目，是应该有开发（development）版和发布（released）版的区分的（发布版也常用其他的表达方式，比如线上online，产品production）。真正的线上产品需要经过测试和优化，保证其品质（如访问速度，稳定性）。从开发完成到线上发布，应该经过一些流程，常见的就是错误检查，单元测试，代码压缩。

有一种观点是"Great developers are lazy."，也就是说，开发过程中很多流程性的工作，要想办法让自己更轻松些。对此，普遍认同的做法就是*自动化*（*automation*）。

就一个前端的项目而言，先来看看开发版与发布版的大致差异。

##开发版与发布版##

从直观的感受简单说的话，css的差异是：

![css的差异][img_grunt_contrast_css]

javascript的差异是：

![javascript的差异][img_grunt_contrast_js]

此外，各类格式的图片也可以做一定程度的优化，减小文件大小。可见，作为发布版，主要是从各个层面减小文件大小，提升访问速度。

*Grunt*是一个由node编写的自动化工具。对于我这样从事前端开发的人来说，比起其他的后端语言，Grunt这种使用javascript的工具会显得更亲切，更适合。

##Grunt安装初始##

我自己用的电脑是windows，所以说的是windows下的安装（各位看到的linux/mac安装教程还少么 (｡・д・)ﾉ ）。

首先，如果你还没有安装node，请到[node官网][]下载。windows系统中使用的是一个`.msi`安装包，点击安装即可。

Grunt直接通过[npm][]安装。如果不知道npm是什么，可点击[维基百科-npm][]查看。就算不知道它是什么也没关系，*现在的node安装包已经内置了npm*，直接使用即可。

快捷键`Win`+`R`打开windows中的运行窗口，然后输入`cmd`，打开命令提示符，在其中输入：

    npm install -g grunt-cli

这一步是安装Grunt的命令行支持（command line interface，简称CLI），在这之后，命令提示符中将会识别`grunt`命令。

到此，Grunt并不能称为安装完毕。这是因为，*Grunt本身不是全局使用的，任何具体的工作目录，如果要使用Grunt，都需要安装一次Grunt*。这样做也是因为不同的工作目录，需要通过Grunt做的自动化工作也不同，因此需要独立配置。

使用Grunt必须要配置两个文件。一个是`package.json`，另一个是`Gruntfile.js`（准确地说，还可以是`Gruntfile.coffee`，但本文不介绍这个）。

##文件之一：package.json##

npm对工作目录有一个要求。这个要求是：根目录位置处有一个`package.json`文件。这个文件定义了工作目录对应的一些项目信息（名字，描述），以及包（就是npm模块）依赖关系。它可以很简单，如下：

{% highlight json %}
{
    "name": "huayixia",
    "version": "1.0.0",
    "description": "huayixia website"
}
{% endhighlight %}

你可以复制上面的内容自己手工创建`package.json`文件。如果你希望更官方一些，你可以在该工作目录位置处打开命令提示符：（属于小技巧，请看下图）

![在某一目录打开cmd][img_cmd_in_directory]

然后输入：

    npm init

接下来命令行中会问你一些问题，简单输入答复后（如果要留空，直接回车就可以），就可以在目录中自动生成一个`package.json`。

在有了`package.json`之后，就可以为工作目录安装Grunt。在工作目录位置的命令提示符中输入：

    npm install grunt --save-dev

后面的`--save-dev`不是必须的，但建议写上。它的作用是，在安装的同时，把Grunt的安装信息写入`package.json`。在有`--save-dev`安装操作后，`package.json`的内容会变成这样：

{% highlight json %}
{
  "name": "huayixia",
  "version": "1.0.0",
  "description": "huayixia website",
  "devDependencies": {
    "grunt": "~0.4.1"
  }
}
{% endhighlight %}

从中可以看到`devDependencies`部分，已有Grunt的信息。同时，目录中会多出`node_modules`目录，里面存放的是Grunt的源文件。使用Grunt不需要管这个目录，

Grunt的实际工作，必须要结合各类*Grunt插件*（*Grunt Plugins*）进行。根据工作目录的实际情况，从[Grunt插件列表][]中选择需要的插件安装到目录即可。插件列表中，有星星标识的的"contrib"系列，是官方团队提供的。大部分情况下，推荐使用官方插件（不然怎么叫官方(￣▽￣)）。

插件的安装方式和安装Grunt一样。比如安装"grunt-contrib-uglify"（javascript压缩工具），在目录位置的命令提示符中输入：

    npm install grunt-contrib-uglify --save-dev

同样，建议写上`--save-dev`，以记录到`package.json`文件中。插件的源文件也会存放到`node_modules`目录中。

##文件之二：Gruntfile.js##

`Gruntfile.js`相当于Grunt的配置文件，也必须位于根目录。这个文件建议手工创建（模板也可以创建，但模板的使用并不简单，所以还是复制起来更容易）。我自己的目录需要做的自动化工作分别是：css代码压缩，图片优化，js代码压缩。我选用了3个对应的插件来完成，分别是`grunt-contrib-cssmin`，`grunt-contrib-imagemin`，`grunt-contrib-uglify`。最后我的`Gruntfile.js`的内容是：（为方便说明，精简了细节部分）

{% highlight javascript %}
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    myname: "yuki" //自定义变量
    uglify: {
      options: { //grunt插件都有options
        report: "min"
      },
      minify: { // minify只是一个target命名，可以自定
        expand: true,
        cwd: 'dev/js/',
        src: ['*.js'],
        dest: 'online/js/'
      }
    },
    cssmin: {
      options: {},
      minify: {}
    },
    imagemin: {
      options: {},
      minify: {}
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');

  grunt.registerTask('default', ['cssmin', 'imagemin', 'uglify']);
};
{% endhighlight %}

接下来做详细说明。首先，`module.exports = function(grunt) {};`是一整个函数，它就像一个容器一样（`module.exports`是node中的语法，用于代码导出，以供其他javascript脚本使用）。所有的配置代码都应该写在这个函数内。

然后，在函数内，由空行的分隔，可以看出有三部分。先来说明很简单的后两部分。

`grunt.loadNpmTasks();`是加载插件任务。其实就是说，你如果要使用哪个插件的功能，请在这部分用这句代码把插件任务添加进去。

`grunt.registerTask();`是注册任务，默认有一个`default`。默认的意思就是说，你最后使用的时候，在目录的命令提示符里直接输入：

    grunt

就相当于输入了`grunt default`，然后会执行注册的任务命令。函数第二个参数一般用数组，里面依次对应这个任务命令会执行的各个插件任务，而且会按照指定的顺序进行。比如上面的`Gruntfile.js`配置代码，对应的就是按顺序依次执行`cssmin`，`imagemin`，`uglify`这几个插件任务了。

插件任务可以单独执行，比如只需要图片优化(对应"imagemin")，可以输入：

    grunt imagemin

可以注册更多的任务命令，使用其他的命名。比如

{% highlight javascript %}
grunt.registerTask('custom', ['cssmin', 'imagemin']);
{% endhighlight %}

对应使用的时候，输入：

    grunt custom

##Grunt插件配置##

下面来看比较复杂的`grunt.initConfig();`。这个函数调用的时候使用的Object类别的参数，即包含了配置的全部信息。

这个Object参数中，只要不和插件名冲突，可以任意自定义变量，如上面的`Gruntfile.js`文件中的`pkg`（它调用了Grunt的一个函数读取json文件信息），`myname`。此外的部分，则对应插件各自的配置信息，如`cssmin`，`uglify`。

然后，在每一个插件信息内，可以定义选项`options`，它对应这个插件的具体配置，一般随插件不同，配置信息也不同，需要到插件的说明页查看。此外，是定义*任务目标*（*target*）。大部分Grunt插件都是多任务的，因此可以定义多个，而且都可以自定义命名（除`options`外）。而且，每个任务目标内，也可以定义自己的目标级别的`options`，它会覆盖上一级的插件级别的`options`。

在每个任务目标内，定义的是目标具体的操作内容说明。其中，最常见的就是*文件操作*（*Files*）。文件操作的配置，是指定需要操作的文件，以及如何输出等，*它是所有涉及文件操作的Grunt插件都遵守的*。我最初用的时候，还很奇怪为什么每个插件的说明页贴了一堆示意代码，却没有对其中的配置内容说明完全，原来是因为这些是“公用”的...

以我最终使用的代码为例：
{% highlight javascript %}
grunt.initConfig({
uglify: {
  minify: {
    expand: true,
    cwd: 'dev/js/',
    src: ['*.js'],
    dest: 'online/js/'
  }
});
{% endhighlight %}

这可能是比较常用的配置。其中的`expand`表示动态生成文件，当它为`true`的时候，才可以配置下面几项。`cwd`是指作为来源的所有`src`，都以其作为相对路径。`src`表示实际操作的文件，这里使用通配符，搭配了目录下的所有`.js`文件。`dest`是"destination"，表示目标文件的位置。在按照上面的代码设置后，`uglify`的任务执行效果，就是把所有`dev/js/`下的`.js`文件，都做压缩，处理得到的结果文件对应存放到`online/js/`目录中。

详细的配置指南，请查看官方的[Configuring tasks][]。

回到前面说的任务目标。还需要补充的是，任务目标也可以单独运行，比如输入：

    grunt uglify:foo

则只会运行`uglify`任务的名称为`foo`的任务目标。显然，如果不用`:`指定目标，则会依次运行该任务中的所有任务目标。

##Grunt使用##

在配置好之后，就可以运行Grunt。很简单，在工作目录位置打开命令提示符，然后输入：

    grunt

然后等待执行完毕。你可以看到其中的每一个任务的执行信息，比如我的情况：

![运行grunt][img_grunt_cmd]

这个过程十分迅速。任何时候需要的时候，执行一遍，就可以得到更新后的发布版。所以，真的是很省时省心。

##结语##

Grunt很像是一个工具平台，在看它的插件列表的时候，我发现了一些以前熟悉的东西，比如requireJS，compass，livereload。而原本这些工具，比如compass是ruby语言编写的。但在Grunt中，它就是node，所以，可以理解为，grunt整合了一系列的工具的node实现版。不过，无论怎样，它们都是为开发工作服务，让开发过程更轻松。

很推荐做前端开发的各位试试Grunt。

[img_grunt_contrast_css]: {{POSTS_IMG_PATH}}/201310/grunt_contrast_css.jpg "css的差异"
[img_grunt_contrast_js]: {{POSTS_IMG_PATH}}/201310/grunt_contrast_js.jpg "javascript的差异"
[img_cmd_in_directory]: {{POSTS_IMG_PATH}}/201310/cmd_in_directory.png "在某一目录打开cmd"
[img_grunt_cmd]: {{POSTS_IMG_PATH}}/201310/grunt_cmd.png "运行grunt"

[npm]: https://npmjs.org/ "npm"
[node官网]: http://nodejs.org/ "node.js"
[维基百科-npm]: http://zh.wikipedia.org/zh-cn/Node%E5%8C%85%E7%AE%A1%E7%90%86%E5%99%A8 "维基百科-npm"
[Grunt插件列表]: http://gruntjs.com/plugins "Grunt Plugins"
[Configuring tasks]: http://gruntjs.com/configuring-tasks "Configuring tasks"
