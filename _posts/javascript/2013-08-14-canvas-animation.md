---
layout: post
title: "使用html5画布元素canvas绘制动画"
category: "javascript"
description: "canvas是html5中用于在网页上绘制图形的元素。而更进一步，通过合理的方法，即可以在网页上实现流畅的图形动画。本文将探讨一种可行的实现方法。"
---
{% include JB/setup %}

html5新增的canvas无疑是一个非常出彩的设计。网页由此只需要引入一个html元素（正是`<canvas>`），即可进行图形绘制。相应地，flash动画是网页中一直以来很常见的内容，它的特色也是矢量图形绘制。因此，很容易联想到，是不是也可以用canvas来制作动画。

canvas并不像flash那样是被设计为做动画的。但是，通过一定的方法，确实可以使用canvas制作出flash那样的图形动画，而且效果同样很棒。

##动画的原理##

动画的原理相信很多人也听说过，就是把绘制好的多张静态图，以一定的频率，按照一定的顺序依次切换显示，即形成动态的画面。当频率高于一定数值后，人眼就察觉不出切换的过程，这时也就形成了连贯的动画。同时，在同一场景（也称为分镜）中，相邻的静态图只会有微小差异，由此通过相当数量的静态图的组合创建过渡（一般称为动画分格），使画面平滑自然。

在动画中，每一张静态图对应的静态画面，称为*帧*。静态画面的切换频率，则称为*帧频*。在flash的时间轴面板中，可以很容易找到它们。

![flash时间轴][img_timeline_in_flash]

##canvas动画的实现##

###图形绘制###

使用canvas绘图的做法是：先在html中加入`<canvas>`元素。

{% highlight html %}
<canvas id="drawing" width="400" height="400"></canvas>
{% endhighlight %}

然后，获取这个`<canvas>`元素对应的context（可以称为*绘图上下文*）。

{% highlight javascript %}
var drawing = document.getElementById("drawing");
if (drawing.getContext) {
    var context = drawing.getContext("2d");
}
{% endhighlight %}

这里的变量`context`表示的绘图上下文，是canvas图形绘制的核心，它有一系列的绘图属性和绘图方法。简单地说，所有的绘图都是操作这个`context`实现。

###动画中的图形###

canvas的`context`有一个`clearRect()`方法，可以清除画布上的某一矩形区域内的所有图形。联系前文所述的动画的原理，可以知道，如果以某一频率不断地先清除，再绘制，而且每一次绘制的内容稍有不同，就可以看到变化的图形，形成动画。

如何让每一次绘制的内容稍有不同呢？对此，较为合理的做法是，为需要绘制的图形，创建类，每一个类对应一种图形。任意一种图形，都有自己的一些属性，而且有一个属性指向canvas的绘图上下文。同时，图形类都定义了一个绘图方法`draw()`（这只是我用的命名，可以自定），这个绘图方法`draw()`包含了一系列代码，依次做以下两件事：依照当前的属性值（或者叫状态）操作绘图上下文把自己绘制在canvas画布上，以及更新当前属性值。

比如，下面是可以移动的球体（其实就是圆）的类的定义：

{% highlight javascript %}
// 类定义，球体
var Ball = function(config, context) {
    this.x = config.x; // X坐标
    this.y = config.y; // Y坐标
    this.color = config.color; //  例如rgba(0,0,0,1)
    this.radius = config.radius; // 半径
    this.speedX = config.speedX; // 水平方向速度
    this.speedY = config.speedY; // 垂直方向速度
    this.context = context; // 获取context的引用
};
Ball.prototype.move = function() {
    this.x += this.speedX;
    this.y += this.speedY;
};
Ball.prototype.draw = function() {
    // 绘图
    var context = this.context;
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    context.fill();
    // 移动，更新位置
    this.move();
};
{% endhighlight %}

可以看出，每一次调用这个类的`draw()`方法，都会把这个图形绘制上去。而每一次`draw()`的调用，也会更新实例的属性值，从而使下一次绘制的时候，图形有所不同（这里的示例是位置的移动）。

###舞台###

在画布中以动画形式展现的图形，应该有一个元素对它们做管理。参考flash中的动画结构，这个元素就是舞台。因此，建立一个舞台类（Stage）。Stage类的定义是：

{% highlight javascript %}
var Stage = function(config, context) {
    this.stageWidth = config.stageWidth; // 舞台宽
    this.stageHeight = config.stageHeight; // 舞台高
    this.playFlag = false; // 播放标识，初始为false
    this.childs = {}; // 存放舞台中的元素
    this.context = context; // 保存context的引用
};
Stage.prototype = {
    constructor: Stage,
    // 添加舞台元素
    addChild: function(name, elem) {
        this.childs[name] = elem;
    },
    // 移除舞台元素
    removeChild: function(name) {
        delete this.childs[name];
    },
    // 渲染，绘制每一帧的舞台中有的所有图形
    render: function() {
        this.context.clearRect(0, 0, this.stageWidth, this.stageHeight); // 清除上一帧绘制的图形
        var childs = this.childs;
        for (var i in childs) {
            childs[i].draw(); // 调用舞台中的所有图形的draw()方法
        }
        if (this.playFlag) {
            requestAnimationFrame((function(thisReplace) {
                return function() {
                    thisReplace.render(); // 循环调用
                };
            })(this));
        }
    },
    // 播放
    play: function() {
        if (!this.playFlag) {
            this.playFlag = true;
            this.render();
        }
    },
    // 停止
    stop: function() {
        if (this.playFlag) {
            this.playFlag = false;
        }
    }
};
{% endhighlight %}

在这段定义中，Stage类的`render()`方法最为重要。`render()`调用时，首先清除上一帧，然后通过一个循环，调用了舞台中的所有图形的`draw()`方法，从而完成当前帧的绘图，并且更新了所有图形的属性值，由此确定了下一帧的所有图形的状态。然后通过一个对自身的循环调用，实现连续的逐帧绘制。这样，动画就产生了。

连续逐帧绘制是需要参照一个频率的，一般会想到的就是使用`setTimeout()`和`setInterval()`。但是，现代浏览器考虑到动画实现的需要，专门为此提供了一个API，就是`requestAnimationFrame()`。这个方法在不同浏览器下的写法不同，因此应该使用一个跨浏览器的动画运行控制函数：（来源于Paul Irish的[requestAnimationFrame for Smart Animating][]）

{% highlight javascript %}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback, element) {
                window.setTimeout(callback, 1000 / 60);
        };
    })();
}
{% endhighlight %}

至于为什么应该使用`requestAnimationFrame()`，请看[基于脚本的动画的计时控制][]。简单的表述理由的话，就是“我们更专业”（￣∇￣）。

###动画过程###

在有了前面的类定义后，实现动画的方法就很明晰了。首先创建舞台和动画图形的实例，然后把动画图形实例通过舞台的`addChild()`方法添加进去，然后调用舞台的`play()`方法。这部分对应的代码示例：

{% highlight javascript %}
// 假定stageConfig, ballConfig已有适当定义，context也已获得绘图上下文引用
var stage = new Stage(stageConfig, context),
    ball = new Ball(ballConfig.context);
stage.addChild("ball", ball); // 添加到舞台（显示）
stage.play(); // 动画播放
{% endhighlight %}

这样，canvas元素就开始了连贯的动态绘制，也就是能看到的动画了。每一帧的绘制过程可以表示如下：

![每一帧的绘制][img_frame_render_process]

到这里，希望你能够明白整个动画的实现过程。

##结语##

canvas动画在网页上可以有非常棒的效果。如果想体验一下canvas动画，你可以看看本博客内的[打砖块][]。

期待在未来会有更多的关于canvas动画的作品。

[img_timeline_in_flash]: {{POSTS_IMG_PATH}}/201308/timeline_in_flash.png "flash时间轴"
[img_frame_render_process]: {{POSTS_IMG_PATH}}/201308/frame_render_process.png "每一帧的绘制"

[requestAnimationFrame for Smart Animating]: http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/  "requestAnimationFrame for Smart Animating"
[基于脚本的动画的计时控制]: http://msdn.microsoft.com/zh-cn/library/ie/hh920765%28v=vs.85%29.aspx  "基于脚本的动画的计时控制"
[打砖块]: http://acgtofe.com/demo_pages/demos/brick-breaker/brick.html "打砖块"
