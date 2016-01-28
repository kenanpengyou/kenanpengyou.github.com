---
layout: post
title: "图层混合模式"
category: "css"
description: "和ps的很类似！"
---
{% include JB/setup %}

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

`isolate`的元素内的各类子元素都不会再和外边的backdrop背景进行混合，但`isolate`元素内的各类子元素之间是可以继续混合的，包括`isolate`元素自己的背景。

`background-blend-mode`不需要搭配`isolate`，它本身就是隔离的。`isolate`是和`mix-blend-mode`搭配使用的。





##结语##

一个有趣的事是，我们在用混合模式的时候，几乎都是去一个一个试，直到找到看起来还不错的效果。而如果对混合模式更理解一点的话，应该可以稍微减少一点我们找到那个“不错”的混合效果的时间。

合成的主要意义是，保留原图。这样，可以在需要的时候还原。在Photoshop里一旦图层经过合并，除非用历史记录撤销，是不能再拆回原来的图层的。

[img_unity3d_impression]: {{POSTS_IMG_PATH}}/201512/unity3d_impression.png "Unity3D"

[3D rendering context]: http://www.w3.org/TR/css-transforms-1/#3d-transform-rendering "CSS Transforms Module Level 1"
https://www.w3.org/TR/compositing-1/
