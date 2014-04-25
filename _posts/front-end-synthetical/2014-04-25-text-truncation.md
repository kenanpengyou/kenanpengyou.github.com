---
layout: post
title: "可用的文字截断"
category: "前端综合"
published: false
description: ""
extraCSS: ["posts/201404/text-truncation.css"]
extraJS: ["posts/201404/text-truncation.js"]
---
{% include JB/setup %}

在网页等界面设计中，会有文字排版的问题。其中很常见的问题是，某个文字区域的文字很多，超出设计稿中数据的时候，应该怎样。

文字截断就是应对这种情况的。以及，我们用文字截断，一方面是避免页面内容的排版因为某些地方文字过多而乱掉，另一方面则单纯是美观、整洁、合理性的需要。

##前端或后端谁来做？##

文字过多是一个数据层面的原因。假设文字不是数据，而是固定的文案，那么只要验证一下做出来的网页，然后确认没问题，那就不会有问题。数据一般是后端的工作，所以文字截断也一般由后端完成。

比如，在一个文字区域，1行半是认为的比较合适的极限（超出则截掉，并在后面加上`...`），那就写一份刚好到这个位置的文案，然后看下有多少字符，然后用这个字符数在后端代码中做截断。

看起来很靠谱，那为什么还会有需要前端做截断的情况呢？

这是因为，后端在字符层面的截断实际是不可靠的。这里不是说截的字符数不准，而是说，只保证字符数，网页排版也可能出问题。

下面是一个中英文的字符宽度测试（字体：`Arial, sans-serif`）：

<div id="character" class="post_display character_width_test"></div>

其中红色数字是对应的字符宽度（单位：`px`）。可以看到，不同的英文字符，在网页中占据的宽度可以不同。想象一下同样的字符数目下，全是`l`这种较小宽度的字符的情况，与全是`W`这种较大宽度的字符的情况相比，文字宽度会有多少差距。这个不确定的差距，就可能带来问题。

上面的测试中特意提到了字体。这是因为，字符所占据的宽度与所使用的字体有关。网页常用的如`Arial`，`Helvetica`，`Verdana`等英文字体都是不等宽的。不过，中文汉字，基本都是等宽的（中文字体都是等宽）。所谓汉字称为“方块字”，也正符合这个意思（・ｖ・）。你可以查看[维基百科上对等宽字体的解释][]。

由于我们做文字截断要的都是最后的显示效果，而显示效果正是前端的工作。因此，相对于后端在数据和字符层面的处理，前端的优势是无视内容，直接从显示效果来做最适当的截断，因此是可靠的。

##css文字截断##

css可以做到的文字截断概括为：*单行定宽，多行定高*。如果不是这样，就不能仅依靠css实现。

###单行定宽###

下面的css代码用于单行定宽的截断：

{% highlight css %}
.truncation{
    width: 100px;   /* 假定是文字区域限制为100px */
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
{% endhighlight %}

这样对应的效果是：

![css截断-单行定宽][img_css_truncation_one]

文字后会有`...`，很符合文字截断的需要。

###多行定高###

多行定高的css截断：

{% highlight css %}
.truncation_multiple{
    height:48px; /* 假定限制2行 */
    overflow: hidden;
    line-height:24px; /* 行高自行设置 */
}
{% endhighlight %}

对应的效果是：

![css截断-多行定高][img_css_truncation_multiple]

多行定高只是利用css本身的`overflow: hidden;`把超出部分隐藏掉，看起来有些不够友好，不过确实有一定用途。

##javascript文字截断##

javascript可以实现更高要求的文字截断。一个可行的实现原理是：创建一个用于临时存放文字的可见元素，然后填入原文字，再检测文字的显示情况，如果文字超出了预定范围，则去掉文字的最后一个字符，依次进行直到文字的显示在预定范围内，最后删除临时存放文字的元素。

比如，我尝试实现文字刚好1行半的截断：

{% highlight javascript %}

{% endhighlight %}

[img_css_truncation_one]: {{POSTS_IMG_PATH}}/201404/css_truncation_one.png "css截断-单行定宽"
[img_css_truncation_multiple]: {{POSTS_IMG_PATH}}/201404/css_truncation_multiple.png "css截断-多行定高"

[维基百科上对等宽字体的解释]: http://zh.wikipedia.org/wiki/%E7%AD%89%E5%AE%BD%E5%AD%97%E4%BD%93 "等宽字体 - 维基百科"
