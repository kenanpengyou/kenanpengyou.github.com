---
layout: post
title: "css栅格系统"
category: "css"
description: ""
---
{% include JB/setup %}

说到**栅格系统**（**grid system**），你也许见过这样的概念：

![grid system for design][img_grid_design]

像这样，通过固定的格子结构，来进行布局设计。这是一种设计风格，而且一直以来很广泛地应用于网页设计领域。这样的风格清晰、工整，可以让网页具有更友好的浏览体验。

而随着**响应式设计**（**responsive design**）的流行，栅格系统开始被赋予新的意义，那就是，**一种响应式设计的实现方式**。

##栅格与响应式##

响应式的要点是为同一个页面设计多种布局形态，分别适配不同屏幕尺寸的设备。一般来说，是这样的感觉：

![responsive design impression][img_responsive_design_impression]

可以看到，一个页面可以拆分成多个区块来理解，而正是这些区块共同构成了这个页面的布局。根据不同的屏幕尺寸情况，调整这些区块的排版，就可以实现响应式设计。另外，屏幕宽度较大的时候，区块倾向于水平分布，而屏幕宽度较小的时候，区块倾向于竖直堆叠。

这些方方正正的区块是不是和栅格系统的格子挺相似？对的，为了让响应式设计更简单易用，于是有了很多称为“栅格”（grid）的样式库。

栅格样式库一般是这样做的：将页面划分为若干等宽的列（column），然后推荐你通过等宽列来创建响应式的页面区块。

虽然看起来都是这样的思路，但不同的栅格样式库，在做法上却是各有各的点子。下面，本文将介绍几个比较有代表性的栅格样式库。了解它们的原理和用法（~~正确的打开方式~~），你也许会对栅格系统有更深刻的理解。

##Bootstrap中的栅格##

[Bootstrap][]把它的栅格放在CSS这个分类下，并称它为[Gird system][]。默认分为12列。

###容器、行与列###

要理解Bootstrap中的栅格，最好从掌握正确的使用方法开始。

有关Bootstrap栅格的用法，第1个要点是容器（container），行（row）和列（column）之间的层级关系。例如，这是一个正确的写法示例：

{% highlight html %}
<div class="container">
    <div class="row">
        <div class="col-md-6"></div>
        <div class="col-md-6"></div>
    </div>
</div>
{% endhighlight %}

Bootstrap栅格的容器有两种，`.container`（固定像素值的宽度）和`.container-fluid`（100%的宽度）。现在把它们都称为container，请注意，row（对应的类名是`.row`）必须位于container的内部，以及，column（对应的类名形如`.col-xx-y`）必须位于row的内部。也就是说，container、row、column必须保持示例这样的层级关系，栅格系统才可以正常工作。

为什么需要这样？查看这些元素的样式，会发现container有15px的水平内边距，row有-15px的水平负外边距，column则有15px的水平内边距。这些边距是故意的、相互关联的，也因此就像齿轮啮合那样，限定了层级结构。这些边距其实也是Bootstrap栅格的精巧之处，如果你想做更进一步的了解，推荐阅读[The Subtle Magic Behind Why the Bootstrap 3 Grid Works][]。

如果要嵌套使用栅格，正确的做法是在column内直接续接row，然后再继续接column，而不再需要container：

{% highlight html %}
<div class="row">
    <div class="col-md-8">
        <div class="row">
            <div class="col-md-6"></div>
            <div class="col-md-6"></div>
        </div>
    </div>
    <div class="col-md-4"></div>
</div>
{% endhighlight %}

###断点类型###

有关Bootstrap栅格的用法，第2个要点是不同的断点类型的意义及其搭配。

前面说到，Bootstrap栅格的column对应的类名形如`.col-xx-y`。`y`是数字，表示该元素的宽度占据12列中的多少列。而`xx`只有特定的几个值可供选择，分别是`xs`、`sm`、`md`、`lg`，它们就是断点类型。



##Foundation中的栅格##

##Toast栅格##

##补充##

栅格系统不是响应式设计的全部，而只是其实现方式之一。

##结语##

##提纲##

不是设计意义上的栅格系统，而是通过css可以设定好的一个方便随时取用的样式库，这个样式库用于按照栅格的风格进行布局。


[img_grid_design]: {{POSTS_IMG_PATH}}/201507/grid_design.png "grid system for design"
[img_responsive_design_impression]: {{POSTS_IMG_PATH}}/201507/responsive_design_impression.png "grid system for design"

[Bootstrap]: 
[Gird system]: http://getbootstrap.com/css/#grid  "Grid system"
[The Subtle Magic Behind Why the Bootstrap 3 Grid Works]: http://www.helloerik.com/the-subtle-magic-behind-why-the-bootstrap-3-grid-works "The Subtle Magic Behind Why the Bootstrap 3 Grid Works | Experience Design at Hello Erik"
