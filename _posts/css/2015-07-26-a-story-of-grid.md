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

要理解Bootstrap中的栅格，最好从掌握正确的使用方法开始。这其中有2个要点。

第1个要点是容器（container），行（row）和列（column）之间的层级关系。例如，这是一个正确的写法示例：

{% highlight html %}
<div class="container">
    <div class="row">
        <div class="col-md-6"></div>
        <div class="col-md-6"></div>
    </div>
</div>
{% endhighlight %}

Bootstrap栅格的容器有两种，`.container`（固定像素值的宽度）和`.container-fluid`（100%的宽度），在这里，把它们都称为container。需要注意的是，row（`.row`）必须位于container的内部，column（如`.col-md-6`）必须位于row的内部。也就是说，container、row、column必须保持特定的层级关系，栅格系统才可以正常工作。

为什么需要这样？查看这些元素的样式，会发现container有15px的水平内边距，row有-15px的水平负外边距，column则有15px的水平内边距。这些边距是故意的、相互关联的，也因此就像齿轮啮合那样，限定了层级结构。这些边距其实也是Bootstrap栅格的精巧之处，如果你想进一步了解，推荐阅读[The Subtle Magic Behind Why the Bootstrap 3 Grid Works][]。

如果要嵌套使用栅格，正确的做法是在column内直接续接row，然后再继续接column，而不再需要container：

{% highlight html %}
<div class="container">
    <div class="row">
        <div class="col-md-8">
            <div class="row">
                <div class="col-md-6"></div>
                <div class="col-md-6"></div>
            </div>
        </div>
        <div class="col-md-4"></div>
    </div>
</div>
{% endhighlight %}

###断点类型###

第2个要点，是不同的断点类型的意义及其搭配。

Bootstrap栅格的column对应的类名形如`.col-xx-y`。`y`是数字，表示该元素的宽度占据12列中的多少列。而`xx`只有特定的几个值可供选择，分别是`xs`、`sm`、`md`、`lg`，它们就是断点类型。

在Bootstrap栅格的设计中，断点的意义是，当视口（viewport）宽度小于断点时，column将竖直堆叠（`display: block`的默认表现），而当视口宽度大于或等于断点时，column将水平排列（`float`的效果）。按照`xs`、`sm`、`md`、`lg`的顺序，断点像素值依次增大，其中`xs`表示极小，即认为视口宽度永远不小于`xs`断点，column将始终水平浮动。

有时候，会需要将多种断点类型组合使用，以实现更细致的响应式设计。此时不同的断点类型之间会有怎样的相互作用呢？

先看看Bootstrap的sass源码是如何定义栅格的：

{% highlight sass %}
@include make-grid-columns;
@include make-grid(xs);
@media (min-width: $screen-sm-min) {
  @include make-grid(sm);
}
@media (min-width: $screen-md-min) {
  @include make-grid(md);
}
@media (min-width: $screen-lg-min) {
  @include make-grid(lg);
}
{% endhighlight %}

可以看到，用了`min-width`的写法，而且断点像素值越大的，对应代码越靠后。所以，如果有这样的一些元素：

{% highlight html %}
<div class="container">
    <div class="row">
        <div class="col-sm-6 col-lg-3">1</div>
        <div class="col-sm-6 col-lg-3">2</div>
        <div class="col-sm-6 col-lg-3">3</div>
        <div class="col-sm-6 col-lg-3">4</div>
    </div>
</div>
{% endhighlight %}

那么它们应该是这样的效果：

!["bootstrap grid example"][img_bootstrap_grid_example]

结合前面的源码，可以想到，在上面这样视口宽度由小变大的过程中，首先是保持默认的竖直堆叠，然后超过了`sm`的断点，`sm`的样式生效，变为一行两列的排版，再继续超过`lg`的断点后，`lg`的样式也生效，由于`lg`的样式代码定义在`sm`之后，所以会覆盖掉`sm`的样式，从而得到一行四列的排版。

所以，结合使用多个断点类型，就可以引入多个断点变化，把响应式做得更加细致。

###适度使用###

Bootstrap栅格虽然很强大，但也不应过度使用。例如，当你需要一个占据一整行宽度的元素时，请不要也想着让Bootstrap栅格参和进来，加入`.col-xs-12`这样的类。你不需要任何栅格类，你需要的只是一个块元素。

##Foundation中的栅格##

[Foundation][]栅格有两种，分别称为[Grid][]和[Block Grid][]。

相比Bootstrap，Foundation的Grid所用的类名不同，但原理近似。

######

##Toast栅格##

##补充##

栅格系统不是响应式设计的全部，而只是其实现方式之一。

##结语##

##提纲##

mobile first。原则是最小屏幕时候的样式，是默认样式。然后仅当屏幕尺寸大于一定尺寸后，再开始增加其他额外样式。也就是从小到大，是一个加法。

不是设计意义上的栅格系统，而是通过css可以设定好的一个方便随时取用的样式库，这个样式库用于按照栅格的风格进行布局。


[img_grid_design]: {{POSTS_IMG_PATH}}/201507/grid_design.png "grid system for design"
[img_responsive_design_impression]: {{POSTS_IMG_PATH}}/201507/responsive_design_impression.png "grid system for design"
[img_bootstrap_grid_example]: {{POSTS_IMG_PATH}}/201507/bootstrap_grid_example.png "bootstrap grid example"

[Bootstrap]: http://getbootstrap.com/ "Bootstrap · The world's most popular mobile-first and responsive front-end framework."
[Gird system]: http://getbootstrap.com/css/#grid  "Grid system"
[The Subtle Magic Behind Why the Bootstrap 3 Grid Works]: http://www.helloerik.com/the-subtle-magic-behind-why-the-bootstrap-3-grid-works "The Subtle Magic Behind Why the Bootstrap 3 Grid Works | Experience Design at Hello Erik"
[Foundation]: http://foundation.zurb.com/ "Foundation | The Most Advanced Responsive Front-end Framework from ZURB"
[Grid]: http://foundation.zurb.com/docs/components/grid.html "Grid | Foundation Docs"
[Block Grid]: http://foundation.zurb.com/docs/components/block_grid.html "Block Grid | Foundation Docs"

