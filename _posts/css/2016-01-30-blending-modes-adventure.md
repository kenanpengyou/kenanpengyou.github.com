---
layout: post
title: "更丰富的网页多图层效果：css混合模式"
category: "css"
description: "和ps的很类似！"
---
{% include JB/setup %}

##图层与图层混合##

在Photoshop等图像编辑软件里，图层是最基础的概念之一。我们平时看一张照片，就可能想到“远处的背景”、“近处的人物”这样的描述，这其实就是在划分图层。多个图层从下到上（从远到近）依次拼合，就得到完整的图像。

分图层很有用。一方面，图层是独立的，修改时不会相互影响，另一方面，图层可以保留原始图像，便于还原或做其他调整。

###网页里的图层###

在网页里，并没有明确的图层的概念，但却可以当做图层去理解。css里的`z-index`，就非常符合多图层相互覆盖的效果。

实际上，决定网页内元素覆盖关系的是**绘制顺序**，绘制顺序靠后的元素，将覆盖绘制顺序靠前的元素。

**[层叠上下文][]**（**stacking context**）是与绘制顺序密切相关的概念。在一个层叠上下文内，浏览器总是遵循[特定的顺序][]去绘制该上下文内的所有元素。

###图层重叠的部分###

为什么有时候我们会很

##透明度混合##



##混合模式是在layout之后，属于视觉渲染部分的效果##

##一些混合模式##

只列举最好用的几种。例如纯白背景的图去除白背景（正片叠底）， 纯黑背景的图去除黑背景（滤色）

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



透明度合成计算：
co = Cs x αs + Cb x αb x (1 - αs)

Multiply 
正片叠底模式。考察每个通道里的颜色信息，并对底层颜色进行正片叠加处理。其原理和色彩模式中的“减色原理”是一样的。这样混合产生的颜色总是比原来的要暗。如果和黑色发生正片叠底的话，产生的就只有黑色。而与白色混合就不会对原来的颜色产生任何影响。 

R  0.91 * 0.56 = 0.5096
G  0.56 * 0.85 = 0.476
B  0.56 * 0.91 = 0.5096

##不同浏览器对混合模式的实现效果有差异，也可能不同于PS##

而且可能会很影响性能。有blending mode的话，就会比较卡。

##具体css说明##

总共3个属性。`background-blend-mode`是单个元素的多背景之间的混合。`mix-blend-mode`是任意元素之间的混合，类似`opacity`，不限于图，元素内的文字等内容，也都会混合。
`isolation`是用于在需要的时候建立新stacking context，以手工控制某些设置了`mix-blend-mode`的元素之间不产生混合。


{% highlight css %}
.background {
  background-image: url("dust-and-scratches.jpg"), url("mountain.jpg");
  background-blend-mode: screen;
}
{% endhighlight %}

一般结合多重背景使用，如果有background-color，则background-color为最底层。blend-mode可以为每一层都指定，按顺序依次是从上层到底层。最底层一定是 normal 混合模式，不可以被更改（也就是即使设置其他的，也没有作用）。不过，由于gradients渐变被认为是 css image，因此可以利用这个在图层集合里添加纯色图层。

If a property doesn’t have enough comma-separated values to match the number of layers, the UA must calculate its used value by repeating the list of values until there are enough.


{% highlight css %}
.img-wrapper {
  isolation: isolate;
}
{% endhighlight %}

`mix-blend-mode`就像`opacity`那样，会作用于一个元素以及它内部的所有子元素。

`isolate`的元素内的各类子元素都不会再和外边的backdrop背景进行混合，但`isolate`元素内的各类子元素之间是可以继续混合的，包括`isolate`元素自己的背景。

`background-blend-mode`不需要搭配`isolate`，它本身就是隔离的。`isolate`是和`mix-blend-mode`搭配使用的。





##结语##

一个有趣的事是，我们在用混合模式的时候，几乎都是去一个一个试，直到找到看起来还不错的效果。而如果对混合模式更理解一点的话，应该可以稍微减少一点我们找到那个“不错”的混合效果的时间。

合成的主要意义是，保留原图。这样，可以在需要的时候还原。在Photoshop里一旦图层经过合并，除非用历史记录撤销，是不能再拆回原来的图层的。

[img_unity3d_impression]: {{POSTS_IMG_PATH}}/201512/unity3d_impression.png "Unity3D"

[层叠上下文]: https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Understanding_z_index/The_stacking_context "The stacking context - Web 开发者指南 | MDN"
https://www.w3.org/TR/compositing-1/
[特定的顺序]: https://www.w3.org/TR/CSS21/zindex.html#painting-order "Elaborate description of Stacking Contexts - Painting order"
