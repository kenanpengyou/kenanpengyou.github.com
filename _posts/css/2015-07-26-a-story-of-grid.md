---
layout: post
title: "有关css栅格系统的故事"
category: "css"
description: "有用过Bootstrap或Foundation的栅格系统但感觉不太理解、不太熟练？本文将比较详细地介绍它们，告诉你正确的姿势。"
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

虽然看起来都是这样的思路，但不同的栅格样式库，在做法上却是各有各的点子。下面，本文将介绍几个比较有代表性的栅格样式库，讲述它们的简要原理和用法（~~正确的打开方式~~）。

##Bootstrap中的栅格##

[Bootstrap][]把它的栅格放在CSS这个分类下，并称它为[Gird system][]。默认分为12列。

###容器、行与列###

要理解Bootstrap中的栅格，最好从掌握正确的使用方法开始。这其中有2个要点。

第1个要点是容器（container），行（row）和列（column）之间的层级关系。一个正确的写法示例如下：

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

Bootstrap栅格虽然很强大，但也不应过度使用。例如，当你需要一个占据一整行宽度的元素时，请不要也想着让Bootstrap栅格参和进来，加入类似`.col-xs-12`这样的元素。实际上，你不需要任何栅格类，你需要的只是一个块元素。

##Foundation中的栅格##

[Foundation][]栅格叫做[Grid][]，它和Bootstrap栅格的设计十分近似，只是在类名和结构上有所差异。Foundation栅格同样默认12列。

###行与列###

类比之前Bootstrap栅格的例子，Foundation栅格的一个正确的写法示例如下：

{% highlight html %}
<div class="row">
    <div class="medium-6 columns"></div>
    <div class="medium-6 columns"></div>
</div>
{% endhighlight %}

Foundation栅格的行用`.row`表示，而列由至少两个类名组成，一是`.columns`或`.column`（2种写法完全相同，单纯为了支持语法偏好）表明这是列元素，二是`.medium-6`这种用于表示断点类型和对应宽度。在默认情况下，Foundation栅格的断点类型从小到大依次是`small`、`medium`、`large`，其中`small`类似Bootstrap栅格的`xs`，也是指任意屏幕尺寸下都水平排列。

Foundation栅格没有container，只需要row和column，因此显得比Bootstrap栅格更简单一些。其中row定义了最大宽度（可以认为承担了container的部分功能），column定义了`0.9375rem`的水平内边距。如果要嵌套，仍然是column内续接row，再继续接column。

组合使用多个断点类型，其方法也和Bootstrap栅格相同。需要注意的是，Foundation栅格的断点值是用的`em`而不是`px`，对应的，它们转换后的像素值也有别于Bootstrap栅格。

###Block Grid###

作为栅格系统的补充，Foundation还提供了另外一个叫做[Block Grid][]的栅格。不过，它并不是一个超出传统栅格的新东西，而只是一个针对特定栅格应用场景的方法糖。

下面是一个Block Grid的示例：

{% highlight html %}
<ul class="small-block-grid-2 medium-block-grid-3 large-block-grid-4">
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
</ul>
{% endhighlight %}

其中，`ul`和`li`这样的特定标签组合是必须的。在这个示例中，屏幕宽度从小到大的变化过程中，列元素将依次是一行两列、一行三列、一行四列的排版方式。

可以看到，Block Grid的结构也是行和列，但只需要在行上有一个类名。和Foundation的Grid相比，它的确有一些不同。一方面，Block Grid的行并没有定义最大宽度。另一方面，Block Grid的列一定是等宽的（毕竟`li`不需要任何类名）。

##Toast栅格##

前面介绍的两个栅格样式库都来源于流行前端框架，并不是独立的。本文接下来要介绍的[Toast][]，则是一个独立的、很有想法的栅格样式库。

###特别的实现方式###

为什么说很有想法呢？请看它的一个正确的写法示例：

{% highlight html %}
<div class="grid">
    <div class="grid__col grid__col--1-of-2"></div>
    <div class="grid__col grid__col--1-of-2"></div>
</div>
{% endhighlight %}

类似的，这也是一行均分两列的排版。可以看到，Toast栅格的结构同样是行（`.grid`）与列（`.grid__col`）。但是，不同于始终以12列为参考的模式，它可以用`1-of-2`这样更为直观的类名。事实上，这里用`3-of-6`、`6-of-12`等也可以，它们是相同的。

当然，这并不是Toast最特别的地方。现在，请想一下，Bootstrap及Foundation的栅格系统的column原本都是块元素，它们是如何实现水平排列的？

对的，用的是`float`。但Toast是如何做的呢？它想法独特，选用了`display: inline-block;`。如果你有了解过这个属性，你应该知道`inline-block`的元素会彼此之间存在缝隙。Toast在选择这个属性的基础之上，巧妙使用了负外边距（例如`margin-right: -.25em;`），消除了缝隙对栅格column水平排列的影响。在我做了一些测试和应用后，我只能说，这个强行完成的策略要给个赞。

###非Mobile First###

在前面Toast栅格的示例中，并没有类似`md`、`medium`这样体现断点类型的词。这是因为，Toast采用了“存在默认”的风格。绝大部分情况下，只需要使用形如`.grid__col--x-of-y`的类名。Toast已经为这个类设置了断点（默认700px），低于这个断点为`display: block;`，高于这个断点为`display: inline-block;`。

意外的是，不同于Bootstrap和Foundation默认取`block`的mobile first原则（竖直堆叠更符合小尺寸屏幕的排版要求），Toast则是把`display: inline-block;`放在了`@media`范围之外，当做默认属性。这应该只是风格偏好差异，就我个人而言，我还是更赞同mobile first的设计风格的。

有关mobile first的响应式设计的实现，推荐阅读[Grid](http://adamkaplan.me/grid/)。

如果要加入多个断点变化，Toast是这样做：

{% highlight html %}
<div class="grid">
    <div class="grid__col grid__col--1-of-4 grid__col--m-1-of-2">
    </div>
</div>
{% endhighlight %}

上面这段代码的效果是，该栅格列在480px以下为`block`，占据满宽，481px~700px之间为`inline-block`，占据1/2宽度，701px以上为`inline-block`，占据1/4宽度。

##对栅格系统的补充##

前面介绍的这些栅格样式库，源码都使用Less、Sass这些css预编译工具，因此其中的12列、断点值、列间距等都是可配置的，只不过大部分情况下默认的就足够使用。

虽然栅格样式库很棒，但它们并不是响应式设计的全部。要使同一个应用在不同屏幕尺寸的设备上都具有较好的浏览体验，还有很多其他手段可用（比如在尺寸更大的屏幕上使用更大的字体），栅格系统只是方式之一。

##结语##

借助css栅格系统，我们可以很容易地创建响应式的页面布局。但在这个过程中，理解各类栅格样式库的工作原理，正确使用它们，才能做出稳定、可靠的页面结构。

[img_grid_design]: {{POSTS_IMG_PATH}}/201507/grid_design.png "grid system for design"
[img_responsive_design_impression]: {{POSTS_IMG_PATH}}/201507/responsive_design_impression.png "grid system for design"
[img_bootstrap_grid_example]: {{POSTS_IMG_PATH}}/201507/bootstrap_grid_example.png "bootstrap grid example"

[Bootstrap]: http://getbootstrap.com/ "Bootstrap · The world's most popular mobile-first and responsive front-end framework."
[Gird system]: http://getbootstrap.com/css/#grid  "Grid system"
[The Subtle Magic Behind Why the Bootstrap 3 Grid Works]: http://www.helloerik.com/the-subtle-magic-behind-why-the-bootstrap-3-grid-works "The Subtle Magic Behind Why the Bootstrap 3 Grid Works | Experience Design at Hello Erik"
[Foundation]: http://foundation.zurb.com/ "Foundation | The Most Advanced Responsive Front-end Framework from ZURB"
[Grid]: http://foundation.zurb.com/docs/components/grid.html "Grid | Foundation Docs"
[Block Grid]: http://foundation.zurb.com/docs/components/block_grid.html "Block Grid | Foundation Docs"
[Toast]: http://daneden.github.io/Toast/ "Toast • The no-nonsense CSS grid"
