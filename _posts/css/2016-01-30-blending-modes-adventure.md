---
layout: post
title: "更丰富的网页多图层效果：css混合模式"
category: "css"
description: "css混合模式和Photoshop里的图层混合模式非常近似，本文将带你做对比了解。"
---
{% include JB/setup %}

##图层##

在Photoshop等图像编辑软件里，图层是最基础的概念之一。我们平时看一张照片，就可能想到“远处的背景”、“近处的人物”这样的描述，这其实就是在划分图层。多个图层从下到上（从远到近）依次拼合，就得到完整的图像。

分图层很有用。一方面，图层是独立的，修改时不会相互影响，另一方面，图层可以保留原始图像，便于还原或做其他调整。

###网页里的图层###

在网页里，并没有明确的图层的概念，但却很适合当做图层去理解。网页内的每个元素，都可以看做有一个自己的图层。css里的`z-index`，也很像是调整图层顺序的工具。

准确地说，决定网页内元素覆盖关系的是**绘制顺序**，绘制顺序靠后的元素，将覆盖绘制顺序靠前的元素。

与绘制顺序密切相关的概念是**层叠上下文**（**stacking context**）。在一个层叠上下文内，浏览器总是遵循[特定的顺序][]去绘制该上下文内的所有元素。

##重叠与合成##

我们有时候会很仔细地去调整`z-index`，这是因为网页内的元素会有重叠：

<div class="post_display">
    <div style="position: relative; width: 60px; height: 60px;">
        <div style="position: relative; width: 50px; height: 50px; background: #51bdb0;"></div>
        <div style="position: absolute; width: 50px; height: 50px; background: #0084a7; left: 20px; top: 20px;"></div>
    </div>
</div>

像这样重叠时，一个元素就挡住另一个元素的一部分。我们可能想改变一下覆盖关系：

<div class="post_display">
    <div style="position: relative; width: 60px; height: 60px;">
        <div style="position: relative; width: 50px; height: 50px; background: #51bdb0; z-index: 5;"></div>
        <div style="position: absolute; width: 50px; height: 50px; background: #0084a7; left: 20px; top: 20px;"></div>
    </div>
</div>

在这里，它们的差异只有元素的重叠部分。如果重叠部分和其中一个元素一致，那么看起来就是这个元素更靠上，覆盖了另一个元素。

实际上，网页里的重叠远不只有这样一小部分。上面的示例里的两个元素除了相互重叠外，各自也与本文的背景元素存在重叠。如果在`<body>`元素上设置一个背景，那么可以说页面内的所有可见元素的最终显示效果，都和这个背景关联了起来。

网页是如何决定在这样多的重叠关系下，最终呈现的效果的？这也是一个有一定章法的过程，叫做**合成**（**compositing**）。

##简单透明度合成##

**简单透明度合成**（**simple alpha compositing**）是我们很容易理解的一种合成方式。它是在本文接下来要介绍的混合模式出现之前，唯一在网页里应用的合成方式。它在当前各类浏览器内都可用。

之所以说容易理解，是因为它和我们平时的视觉感受很一致。比如前文的例子里改变一下其中一个元素的透明度：

<div class="post_display">
    <div style="position: relative; width: 60px; height: 60px;">
        <div style="position: relative; width: 50px; height: 50px; background: #51bdb0; z-index: 5; opacity: 0.5; filter: alpha(opacity=50);"></div>
        <div style="position: absolute; width: 50px; height: 50px; background: #0084a7; left: 20px; top: 20px;"></div>
    </div>
</div>

当一个元素是半透明的，那么即便它遮挡了在它后面的元素的一部分，那一部分也是可见的。透明度越高（`opacity`越接近`0`），则重叠区域越偏向于被遮挡的元素。完全透明（`opacity`为`0`）时，则看起来没有元素被遮挡。

##新的合成：混合模式##

**混合模式**一直是Photoshop等图像编辑软件内的图层面板的重要功能，现在它也存在于[w3c的推荐规范][]。

网页中可用的混合模式如下：

![web混合模式][img_blending_modes_in_photoshop]

上图是对照Photoshop里的混合模式来标注的，其中紫红色部分是网页里可用的混合模式，最右边则是混合模式的群组分类。默认的“正常”，实际就是前面说的简单透明度合成，因此可以认为是新增了15种混合模式。把“正常”也算上的话，现在网页里可用的混合模式一共16种。

虽然混合模式种类不少，但最为常用的并不多，它们分别是正片叠底（Multiply）、滤色（Screen）、叠加（Overlay）和柔光（Soft Light）。

##混合模式的简要原理##

混合模式本质是分别取前景和背景（参与混合的两个图层）的像素点，然后用它们的颜色值进行数学运算，从而得到一个新的颜色值。每一个重叠区域的像素点都会经过这个计算过程。

下面以正片叠底为例，说明一下这个过程。

###颜色值归一化###

混合模式既然拿颜色值来做数学计算，那么颜色值一定是数字的形式。不过，颜色值会对应怎样的数字呢？在混合模式计算里，所有的颜色值都是从0到1的小数（区间`[0, 1]`）。因此，颜色值在参与计算前，都会转换为这样的小数。

颜色都可以用RGB来表示，如纯白色在css里可以表示为`rgb(255, 255, 255)`。注意RGB三通道的最大值为`255`，最小值为`0`，因此可以用`通道色值÷255`的计算式转换为`0`到`1`的数字。比如纯白色将是`rgb(1, 1, 1)`。

###分通道进行计算###

正片叠底（Multiply，日语版写作“乗算”）的计算式是：

x = a × b

可以看到，这就是一个简单的乘法。由于都是0到1之间的小数，因此乘法运算会使结果值更接近`0`（比如`0.8 x 0.5 = 0.4`）。因此，正片叠底是一个变暗的混合模式。

每一种混合模式，都会对应这样一个计算式，其中a表示前景图层（Active Layer），b表示背景图层（Background Layer）。RGB三通道分别进行一次运算后，就可以得到混合后的颜色值。整个过程如下：

![正片叠底的计算过程][img_math_example]

在图层设置了透明度的情况下，混合的计算式中的数字仍然取图层原本的像素颜色（也就是`opacity: 1;`时看到的颜色）。

##css用法说明##

与混合模式有关的一共3个属性，`background-blend-mode`、`mix-blend-mode`和`isolation`。

###background-blend-mode###

这个属性一般和多重背景的`background-image`搭配使用，它和`background-image`一样可以指定多个值。这将在某一个元素的多个背景之间形成混合，比如：

{% highlight css %}
.blending-element-0 {
    background-image: url(1.jpg), url(2.jpg), url(3.jpg);
    background-blend-mode: multiply, screen;
}
{% endhighlight %}

可以看到，这个元素指定了多个背景，从上到下依次是`1.jpg`、`2.jpg`、`3.jpg`。下面的`background-blend-mode`则是与它对应的，它表示`1.jpg`的混合模式是`multiply`，`2.jpg`的混合模式是`screen`，`3.jpg`的混合模式是`multiply`（当`background-blend-mode`的数目比`background-image`少时，会按照值列表进行重复）。

需要注意的是，其中`3.jpg`这个位于最下层的背景（该元素无背景色），它的混合模式`multiply`其实是没有作用的，可以认为就是默认值`normal`。你可以试试在Photoshop里只留一个图层，然后切换各种混合模式，会发现图像不会有任何变化。

如果元素指定了背景色（`background-color`），那么背景色将成为最下层的背景。

如果有使用`background`这个简写属性，那么`background-blend-mode`的值将会被重置为默认。

###mix-blend-mode与isolation###

这2个属性是搭配使用的。相比前面的`background-blend-mode`是应用在单个元素的多背景之间，`mix-blend-mode`则是应用于多个元素，而且除背景外，元素内的文字等其他内容也会被混合。

`mix-blend-mode`比较类似`opacity`，作用于一个元素的同时也会作用于这个元素的全部子元素。因此，如果不想要子元素内容也受到影响（就像设置半透明时可能希望里面的文字仍是不透明的），改用`background-blend-mode`会更合适。

使用`mix-blend-mode`的代码大致这样：

{% highlight html %}
<div class="container">
    <div class="blending-element-1"></div>
    <div class="blending-element-2"></div>
</div>
{% endhighlight %}

{% highlight css %}
.blending-element-1,
.blending-element-2{
    mix-blend-mode: soft-light;
}
{% endhighlight %}

在这个例子中，只要`div.blending-element-1`和`div.blending-element-2`存在重叠，就可以有混合效果。那么，只是这2个元素之间混合吗？父元素`div.container`有背景，甚至前面还有其他的位于下方的元素的话，它们也参与混合吗？

这就是如何界定哪些元素参与混合的问题。网页里是这样做的：**以层叠上下文（stacking context）为依据，为元素进行分组，位于同一个层叠上下文内的元素算作同一组，同一组内才能发生混合**。

请再看这样一个例子（只列出了相关的css）：

{% highlight html %}
<div class="container">
    <div class="inner-wrapper">
        <img class="blending-image" src="1.jpg" alt="Rorona">
    </div>
</div>
{% endhighlight %}

{% highlight css %}
.container {
    background: gray;
}
.blending-image {
    mix-blend-mode: multiply;
}
{% endhighlight %}

效果是：

![mix-blend-mode][img_mix_blend_mode_example_1]

可以看到`div.container`的灰色背景和`img.blending-image`的图片内容已经有了混合效果。这时候，再给中间的元素`div.inner-wrapper`稍作改变：

{% highlight css %}
.inner-wrapper{
    isolation: isolate;
}
{% endhighlight %}

会看到混合模式失效了：

![mix-blend-mode + isolation][img_mix_blend_mode_example_2]

可以看到，在有了`isolation: isolate`这个属性后，好像就有了字面上“隔离”的效果。

事实上，并没有“隔离”这种特殊效果，它的本质是创建新的层叠上下文。在元素合成这一点上，你可以理解为是新开一个分组。分组有什么用呢？请看下图：

![为图层分组][img_stacking_context_to_group]

这种层级关系非常像html的DOM树，只不过，每一个节点（分组）的生成，都需要有对应元素创建新的层叠上下文。如果没有元素创建新层叠上下文，那么无论DOM树多么复杂，它们都属于同一个层叠上下文内（也就是上图没有任何group，layer1~6平铺）。

分组会改变元素参与混合的先后顺序。在复杂的DOM树中，可能有多个元素都设置了混合模式，这时候，**总是组内的图层先相互混合，然后把整个组看作一个整体，再和组外的其他元素混合**。由于DOM元素默认的混合方式都是`normal`，也就是上层遮挡下层的风格，因此看起来就好像组内和组外隔离了开来，这就是`isolation`的意思。

前面说`isolation`可以和`mix-blend-mode`搭配使用，就是因为它可以为元素之间的混合增加一层控制。对于`background-blend-mode`而言，`isolation`并没有用，因为`background-blend-mode`作用的多个背景都位于同一个元素内部，相当于一定在一个独立的分组内，和外部的其他元素无关。

关于更多的创建新的层叠上下文的条件，推荐查看[MDN的文档][]。你可以看到`isolation: isolate;`只是其中的一种情况。

##附带的一点补充##

###浏览器兼容性###

- [background-blend-mode](http://caniuse.com/#search=background-blend-mode)
- [mix-blend-mode](http://caniuse.com/#search=mix-blend-mode)

就本文的时间点而言，浏览器的支持范围还是有些不足。不过，混合模式只是一个视觉效果，要做兼容的话，先看看那些不支持的浏览器里的效果吧。如果差得不多，你也许可以接受。如果情况并不能接受，那就做一些调整，比如图片素材等，直到它看起来不是太难看。

###合成的另一个步骤###

w3c文档里提到合成（compositing）实际上分为两步，第一步是混合（blending），紧接着还有第二步叫[Porter-Duff compositing][]。如果你有兴趣，可以自行查看。

这个Porter-Duff compositing虽然包含了很多种类，但就css而言，其实只有`source-over`可用（也就是说，固定的）。这也正是和我们视觉感受最一致的前景覆盖后景的效果。

前文有提到混合模式的计算式所取的颜色值是不考虑透明度的，但实际我们知道在应用混合模式的同时设置透明度是可以改变效果的。这就是因为透明度会在这第二步合成里参与计算。

###更多混合模式的计算原理###

推荐阅读[Photoshop Blend Modes Explained][]。

##结语##

一个有趣的事情是，我们在用混合模式的时候，几乎都是会去一个一个试，直到找到看起来还不错的效果。而不是说，我能一眼知道应该用哪个混合模式。不过即便如此，了解一点混合模式的原理，也还是应该有助于我们更快地找到那个不错的混合模式的，大概。

在我看来，网页的混合模式可以减少某些图像素材的编辑工作。另外，因为原图被保留了下来，所以可以在任何需要的时候还原，或者重新参与合成。

[img_blending_modes_in_photoshop]: {{POSTS_IMG_PATH}}/201601/blending_modes_in_photoshop.png "web混合模式"
[img_math_example]: {{POSTS_IMG_PATH}}/201601/math_example.png "正片叠底的计算过程"
[img_stacking_context_to_group]: {{POSTS_IMG_PATH}}/201601/stacking_context_to_group.png "为图层分组"
[img_mix_blend_mode_example_1]: {{POSTS_IMG_PATH}}/201601/mix_blend_mode_example_1.jpg "mix-blend-mode"
[img_mix_blend_mode_example_2]: {{POSTS_IMG_PATH}}/201601/mix_blend_mode_example_2.jpg "mix-blend-mode + isolation"

[特定的顺序]: https://www.w3.org/TR/CSS21/zindex.html#painting-order "Elaborate description of Stacking Contexts - Painting order"
[w3c的推荐规范]: https://www.w3.org/TR/compositing-1/#blending "Compositing and Blending Level 1 - blending"
[MDN的文档]: https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context "The stacking context - Web 开发者指南 | MDN"
[Photoshop Blend Modes Explained]: http://photoblogstop.com/photoshop/photoshop-blend-modes-explained "Photoshop Blend Modes Explained"
[Porter-Duff compositing]: https://www.w3.org/TR/compositing-1/#advancedcompositing "Compositing and Blending Level 1 - Porter-Duff compositing"
