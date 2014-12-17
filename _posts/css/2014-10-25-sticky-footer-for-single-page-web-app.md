---
layout: post
title: "在移动Web单页应用中实现固定页脚"
category: "css"
description: "固定页脚是一个很有用的功能，保证页面内容较少时页脚也能在底部。在现在流行的移动Web单页应用中，要如何做才能实现它呢？"
---
{% include JB/setup %}

##一种单页应用的页面结构##

面向移动端的单页应用（Single Page Web Application），从页面代码上来说，会使用较一般网页不同的结构。单页应用并不是说应用只需要一个视图，而是说可以将组成应用的多个视图集合在一个网页内呈现，且在视图之间能够自由切换（平滑的动画形式居多）。

我制作单页应用使用的是一种常见方法，像下面这样：

{% highlight html %}
<body>
    <div class="view-page view-current"></div>
    <div class="view-page"></div>
    <div class="view-page"></div>
</body>
{% endhighlight %}

{% highlight css %}
.view-page{
    display: none;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
}
.view-current{
    display: block;
}
{% endhighlight %}

可以看出，其原理是视图都由绝对定位的覆盖屏幕大小（可见视口）的元素构成，在某一时间点，只会显示一个视图。

##固定页脚的问题##

那么，固定页脚是一个什么问题呢？请看下图：

![img_sticky_footer_explain][img_sticky_footer_explain]

先说说什么是固定页脚吧。上图右可以看到，当页面内容较多，超出一屏的高度时，页脚是“自然地”紧跟在内容后边，滚动到底部时，才会看到位于最下方的页脚。同时，上图左可以看到，当页面内容较少时，页脚则直接位于屏幕最下方，剩余区域则是空白。这就是固定页脚，它可以算是一种比较理想的“总是在它应该在的位置”的页脚。

那么，问题来了。参考上图左，**除了固定页脚的效果之外，现在还要求当页面内容较少时，页面内容（Content）可以水平垂直居中于剩余的空间（Container）**。在上述单页应用的页面结构中，应该如何实现呢？

##方法探讨##

###水平垂直居中与Flexbox###

让我们一步一步来。先完成“水平垂直居中”。由于内容高度不确定，所以这里适合使用*弹性盒模型*（*Flexbox*）。

关于弹性盒模型的指南，推荐阅读[A Complete Guide to Flexbox][] 和[Dive into Flexbox][] 。

应用Flexbox实现水平垂直居中可以先得到这样的代码（由于其他视图不再需要，这里只保留一个视图）：

{% highlight html %}
<body>
    <div class="view-page view-current">
        <div class="container flex-container justify-content-center align-items-center">
            <div class="content"></div>
        </div>
    </div>
</body>
{% endhighlight %}

上面的`div.container`对应前面图中的剩余空间（作为容器），`div.content`则是需要水平垂直居中的内容。对应的css是：

{% highlight css %}
.container{
    min-height: 100%;
}
{% endhighlight %}

`flex-container`、`justify-content-center`、`align-items-center`都是弹性盒模型的辅助class（熟悉了Flexbox就可以很快理解）。使用辅助class是因为弹性盒模型从前到后几经变化，兼容处理需要稍多代码。这些辅助class的css是：

{% highlight css %}
.flex-container{
    display: -webkit-box;
    display: -webkit-flexbox;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
}

.justify-content-center{
    -webkit-box-pack: center;
    -webkit-flex-pack: center;
    -ms-flex-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
}

.align-items-center{
    -webkit-box-align: center;
    -webkit-flex-align: center;
    -ms-flex-align: center;
    -webkit-align-items: center;
    align-items: center;
}
{% endhighlight %}

到此，水平垂直居中就完成了。

###实现固定页脚###

现在加入页脚的部分。这时候html代码变成：

{% highlight html %}
<body>
    <div class="view-page view-current">
        <div class="container flex-container justify-content-center align-items-center">
            <div class="content"></div>
        </div>
        <div class="footer"></div>
    </div>
</body>
{% endhighlight %}

注意，`div.view-page`是绝对定位，且定义了`height: 100%;`，而此时`div.container`也定义了`min-height: 100%;`。考虑到要“为页脚留空间”，结合传统网页中的固定页脚的做法，得到**完整的css**：

{% highlight css %}
.container{
    min-height: 100%;
    margin-bottom: -120px;
    padding-bottom: 120px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
.footer{
    height: 120px;  /*假定页脚的高度为120px*/
}
{% endhighlight %}

以上就是在这种条件下的固定页脚的实现方法。虽然最后看起来只是这样一小段代码，但我还是思考了相当一段时间加上试验才得到。其中`padding-bottom`和负值的`margin-bottom`的结合应用很关键。此外，作为移动端的网页，要想到使用`box-sizing`这个配合百分比会非常有用的CSS3属性。

###其他形式的尝试？###

我也试过使用主轴为垂直方向的Flexbox来实现，但可惜经过测试，`flex-direction: column;`还没有被现在的主流手机浏览器所支持。

##传统网页的固定页脚##

关于传统网页的固定页脚，有一个专门的站点[HTML5 CSS Sticky Footer][]介绍了其实现方法和原理，你也可以阅读我以前写的[简单实现固定在页面底部的页脚][]。

##结语##

移动Web单页应用的页面结构是比较特别，所以固定页脚这么有用的东西做起来又是一个新话题了。想到并试验成功后，我第一反应就是赶紧记下来，真是担心以后忘掉了还得费劲重想...

如果你也碰到过类似的需求或有过类似的想法，相信本文可以提供一点参考！

[img_sticky_footer_explain]: {{POSTS_IMG_PATH}}/201410/sticky_footer_explain.png "单页应用中的固定页脚示意"

[A Complete Guide to Flexbox]: http://css-tricks.com/snippets/css/a-guide-to-flexbox/  "A Complete Guide to Flexbox | CSS-Tricks"
[Dive into Flexbox]: http://bocoup.com/weblog/dive-into-flexbox/ "Dive into Flexbox - Bocoup"
[HTML5 CSS Sticky Footer]: http://ryanfait.com/html5-sticky-footer/ "HTML5 CSS Sticky Footer"
[简单实现固定在页面底部的页脚]: http://acgtofe.com/posts/2013/03/sticky-footer/ "简单实现固定在页面底部的页脚 - acgtofe"
