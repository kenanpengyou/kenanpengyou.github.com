---
layout: post
title: "更丰富的网页多图层效果：css混合模式"
category: "css"
description: "和ps的很类似！"
---
{% include JB/setup %}

##图层##

在Photoshop等图像编辑软件里，图层是最基础的概念之一。我们平时看一张照片，就可能想到“远处的背景”、“近处的人物”这样的描述，这其实就是在划分图层。多个图层从下到上（从远到近）依次拼合，就得到完整的图像。

分图层很有用。一方面，图层是独立的，修改时不会相互影响，另一方面，图层可以保留原始图像，便于还原或做其他调整。

###网页里的图层###

在网页里，并没有明确的图层的概念，但却很适合当做图层去理解。网页内的每个元素，都可以看做有一个自己的图层。css里的`z-index`，也很像是调整图层顺序的工具。

准确地说，决定网页内元素覆盖关系的是**绘制顺序**，绘制顺序靠后的元素，将覆盖绘制顺序靠前的元素。

与绘制顺序密切相关的概念是**[层叠上下文][]**（**stacking context**）。在一个层叠上下文内，浏览器总是遵循[特定的顺序][]去绘制该上下文内的所有元素。

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

###mix-blend-mode与isolation###

这2个属性是搭配使用的。相比前面的`background-blend-mode`是应用在单个元素的多背景之间，`mix-blend-mode`则是应用于多个元素，而且除背景外，元素内的文字等其他内容也会被混合。

`mix-blend-mode`比较类似`opacity`，作用于一个元素时也会作用于这个元素的全部子元素。因此

总共3个属性。`background-blend-mode`是单个元素的多背景之间的混合。`mix-blend-mode`是任意元素之间的混合，类似`opacity`，不限于图，元素内的文字等内容，也都会混合。
`isolation`是用于在需要的时候建立新stacking context，以手工控制某些设置了`mix-blend-mode`的元素之间不产生混合。

{% highlight css %}
.img-wrapper {
  isolation: isolate;
}；
{% endhighlight %}

`mix-blend-mode`就像`opacity`那样，会作用于一个元素以及它内部的所有子元素。

`isolate`的元素内的各类子元素都不会再和外边的backdrop背景进行混合，但`isolate`元素内的各类子元素之间是可以继续混合的，包括`isolate`元素自己的背景。

`background-blend-mode`不需要搭配`isolate`，它本身就是隔离的。`isolate`是和`mix-blend-mode`搭配使用的。


##一些混合模式##

只列举最好用的几种。例如纯白背景的图去除白背景（正片叠底）， 纯黑背景的图去除黑背景（滤色）

混合模式是在layout之后，属于视觉渲染部分的效果

Multiply 
正片叠底模式。考察每个通道里的颜色信息，并对底层颜色进行正片叠加处理。其原理和色彩模式中的“减色原理”是一样的。这样混合产生的颜色总是比原来的要暗。如果和黑色发生正片叠底的话，产生的就只有黑色。而与白色混合就不会对原来的颜色产生任何影响。 

##不同浏览器对混合模式的实现效果有差异，也可能不同于PS##

而且可能会很影响性能。有blending mode的话，就会比较卡。


##附加细节##

The source is what you want to draw, and the destination is what is already drawn (the backdrop).

Typically, the blending step is performed first, followed by the Porter-Duff compositing step. In the blending step, the resultant color from the mix of the element and the the backdrop is calculated. The graphic element’s color is replaced with this resultant color. The graphic element is then composited with the backdrop using the specified compositing operator.
(这段话好像是说有两步，第一步是我们一般说的混合模式，blending，由上面的元素和下面的背景先计算得到一个混合色，然后，上边的元素的颜色替换成这个合成色，再最后这个合成色和背景通过某种指定特定运算再进行混合，最后这一步混合不是混合模式，而是决定是取元素和背景的相交部分，还是并集部分，或者只取元素部分这种选区性质的)

Porter-Duff compositing是决定元素（前景）和背景在一起后最终得到的内容区域范围。而blending只决定元素和背景的重叠部分（overlap）的像素点的值。

In CSS, we have no way to specify a composite operation. The default composite operation used is source-over

The blending calculations must not use pre-multiplied color values.(blending的运算一定是用的纯色值，不包含对alpha的考虑，alpha仍然是通过blending之后的Porter-Duff compositing来体现作用)。

Everything in CSS that creates a stacking context must be considered an ‘isolated’ group.

Also note that if the background shorthand is used, the background-blend-mode property for that element must be reset to its initial value.

和opacity类似，`mix-blend-mode`值不为`normal`，以及`isolation`的值为`isolate`，都会触发层叠上下文（stacking context）。

相互混合的图像，必须处于同一个stacking context里。 而例如`isolation`为`isolate`，其实就是会新创建一个stacking context，从而实现隔离。



##结语##

一个有趣的事是，我们在用混合模式的时候，几乎都是去一个一个试，直到找到看起来还不错的效果。而如果对混合模式更理解一点的话，应该可以稍微减少一点我们找到那个“不错”的混合效果的时间。

合成的主要意义是，保留原图。这样，可以在需要的时候还原。在Photoshop里一旦图层经过合并，除非用历史记录撤销，是不能再拆回原来的图层的。

[img_blending_modes_in_photoshop]: {{POSTS_IMG_PATH}}/201601/blending_modes_in_photoshop.png "web混合模式"
[img_math_example]: {{POSTS_IMG_PATH}}/201601/math_example.png "正片叠底的计算过程"

[层叠上下文]: https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context "The stacking context - Web 开发者指南 | MDN"
[特定的顺序]: https://www.w3.org/TR/CSS21/zindex.html#painting-order "Elaborate description of Stacking Contexts - Painting order"
[w3c的推荐规范]: https://www.w3.org/TR/compositing-1/ "Compositing and Blending Level 1"

