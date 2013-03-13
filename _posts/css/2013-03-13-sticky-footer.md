---
layout: post
title: "简单实现固定在页面底部的页脚"
category: "css"
description: "网页的页脚一般都会有一个要求，就是应当位于页面的底部。但在实际网页中，由于网页内容的影响，页脚的位置可能不会在底部，这里将给出一个简单可靠的实现页脚始终在页面底部的方法。"
---
{% include JB/setup %}

##页脚的位置问题##

网页的页脚（footer），也就是通常用来放置帮助链接及版权信息的地方。页脚自然是应该位于页面底部的，但依照一般的做法，如果位于页脚之前的网页内容比较少，或者说使用了一个垂直分辨率较大的显示器，就有可能出现页脚看起来不在页面底部的情况，如下图。

![页脚不能贴到底部][img1]

由于页脚基本上是一个网站的所有页面公用的部分，不同页面的内容量有所差异，因此确实有可能某些页面内容不够而出现这样的问题。另外，尤其是包含了底色的页脚（比如本站的页脚），发生这种问题会很影响美观。

所以，我们希望页脚能够无论网页内容量多少，都能够*准确地位于底部*。

##固定页脚到底部的方法##

###绝对定位可行吗？###

也许有人想到过把页脚设置为`position:fixed`，然后定位在底部。先不考虑不支持这个属性值的IE6，从效果上说，如果网页本身内容就很充足，这样的写法就会让页脚一开始就出现在浏览器的底部，而在滚动网页时，页脚会一直保持原位置。这样的效果，显然对大部分的网站都是不适宜的。

可以想见，我们需要的效果是：

*   网页内容较多时，在滚动到底部的时候才看到位于最下方的页脚。
*   网页内容较少时，页脚仍然位于整个页面的最下方，其余部分都是空白。

###常规、简单的实现方法###

[CSS Sticky Footer][]提供了这个固定页脚在底部的合理的实现方法。不过一方面这是一个英文站点，另一方面它所提供的写法还存在些许可以改善的地方，所以本文会参考它的内容，给出一个合理的实现方法。

首先需要这样一个html结构：

{% highlight html %}
<body>
    <div class="wrapper">
        <!--网页内容-->
        <div class="footer_placeholder"></div>
    </div>
    <div class="footer">
        <!--页脚-->
    </div>
</body>
{% endhighlight %}

`div.wrapper`是网页中除页脚之外的所有内容的外层容器，页脚`div.footer`和它位于同一层级。`div.footer_placeholder`必须放在网页所有内容的最后，即作为`div.wrapper`的最后一个子元素，它的作用会在后文中说明。

接下来写css，依次做说明。

{% highlight css %}
html, body{height:100%;}
{% endhighlight %}

当网页内容不足的时候，`body`和`html`的实际高度可能小于浏览器的可视范围，因此给`body`和`html`写上高度100%。

{% highlight css %}
.wrapper{
    min-height:100%;
    _height:100%;
    margin-bottom:-120px;   /*假定页脚的高度为120px*/
}
{% endhighlight %}

所有网页内容都在这个`div.wrapper`中，定义最小高度（IE6使用hack），由于这个元素的父元素就是定义了100%高度的`body`，因此无论内容多少，`div.wrapper'这个元素的高度都会占据整个浏览器可视范围。然后，依照页脚的高度，设置相等的下边距负值，这样页脚就会恰好出现在页面内容的最后。

{% highlight css %}
.footer, .footer_placeholder{height:120px;}    /*假定页脚的高度为120px*/
{% endhighlight %}

`div.footer_placeholder`，如字面意义，页脚的占位元素，它只是一个空的`div`，定义高度和页脚相同。如果没有它，可能会发生这样的事情↓

![页脚占位符的作用][img2]

到此，这个固定页脚就完成了。css部分合起来就是：

{% highlight css %}
html, body{height:100%;}
.wrapper{
    min-height:100%;
    _height:100%;
    margin-bottom:-120px;   /*假定页脚的高度为120px*/
}
.footer, .footer_placeholder{height:120px;}
{% endhighlight %}

如果还需要考虑css初始化和清理浮动，可能你还需要添加下面这部分css：

{% highlight css %}
body{margin:0;}
.footer_placeholder{clear:both;}
{% endhighlight %}

你现在正在看的本博客，就使用了本文的方法，以保证无论内容多少，页脚都能位于页面底部。我也觉得这是一个非常实用的方法！

[CSS Sticky Footer]: http://ryanfait.com/sticky-footer/  "A CSS Sticky Footer"

[img1]: {{POSTS_IMG_PATH}}/201303/footer_distance.jpg "页面内容不足的时候，页脚将不能贴到底部"
[img2]: {{POSTS_IMG_PATH}}/201303/footer_placeholder.jpg "页脚占位符的作用"