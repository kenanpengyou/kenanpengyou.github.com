---
layout: post
title: "不只是平面：css三维变换的应用"
category: "css"
description: "三维效果是一个听起来很酷的名词，对于长期以来以平面示人的网页来说，css的三维变换似乎能带来一些不一样的观感。本文的内容就是有关把三维效果做到网页中的正确方式..."
extraCSS: ["posts/201309/css-3d-transform.css"]
---
{% include JB/setup %}

##坐标系统##

我们所看到的网页的布局，遵循的是坐标系统的概念。这是在说，浏览器在实际地渲染和显示一个网页前，会先进行布局计算，得到网页中所有元素对应的坐标位置以及尺寸信息。如果有任意元素的坐标位置或尺寸信息发生了改变，浏览器都会重新进行布局计算。这个重新计算的过程也称为回流（reflow）。

css的变换对应属性`transform`，它的作用是修改元素自身的坐标空间。这个修改实际对应了一个坐标系统映射转换的矩阵。通过变换，元素可以实现在二维或三维的空间内的平移、旋转和缩放。需要注意的是，虽然也是关于坐标系统，但变换改变的只是元素的视觉渲染，是在元素的布局计算后起作用的，因此在布局层面没有影响。一般情况下，变换也不会引发回流。

网页中使用的坐标系统是：

![坐标系统][img_coordinate_space]

`transform`的值包含了一系列*变换函数*（*transform function*），其中一部分变换函数可以产生三维变换。但是，只是这样做，是不能得到可用的三维变换效果的。要想正确地应用css三维变换，还需要理解并使用其他和三维变换有关的css属性。

##三维效果之perspective##

正确的三维效果，是建立在一定的透视变化的基础之上的。所谓透视变化，就是指以人眼看实际的景物时会有的“近大远小”的效果。此外，还有一个概念是*灭点*（*vanishing point*），请看下面这张图：

![照片中的灭点][img_vanishing_point_explain_photo]

这里，你会有一个直观的感受：当景物离自己的位置越远时，就会越趋于集中到某一个点上。这个点就是灭点，它对于建立三维效果是非常关键的。

现在再来考虑网页中的三维效果。请不要认为网页真的可以把元素排列在离屏幕前的你不同距离的位置(￣Д￣lll)。网页仍然只会显示在你眼前的屏幕上，其中的元素仍然位于同一平面。但是，元素会依照自己在虚拟三维空间中的位置，调整自己的位置和尺寸，从而创造出正确的三维效果。这个从虚拟三维空间转换到平面中的显示过程，也常称为投影。

perspective就是控制这个投影的参数。它表示的是假想的观察点到元素的绘制平面（也就是显示网页的平面）的距离，浏览器会根据这个距离值，以及元素的Z轴坐标，计算出用于投影缩放的比例。下图中的d对应的就是perspective的值：

![perspective与元素Z轴坐标][img_perspective_distance]

这就是透视变化的“近大远小”的效果的原理。因此，要产生三维效果，必须要指定perspective。这个参数有两种指定方法：直接使用`perspective`属性（本文在代码中省略了属性的前缀，实际使用时，请加上前缀）：

{% highlight css %}
.aya{perspective: 400px;}
{% endhighlight %}

以及作为`transform`的一个变换函数使用：

{% highlight css %}
.aya{transform: perspective(400px);}
{% endhighlight %}

这两种指定方法是很有区别的。当perspective作为`transform`的一个变换函数使用时，透视变化只作用于应用了此变换的单一元素。而`perspective`属性的写法，则一般用在需要三维变换的多个元素的父元素上，它会使对应元素的子元素共享同一个透视变化（包括灭点位置）。此外，当使用`perspective`属性时，还可以使用`perspective-origin`属性修改透视变化中的灭点的位置（默认是中心点）：

![perspective-origin通过改变观察点位置改变灭点][img_perspective_origin]

perspective指定的值是观察点到绘制平面的距离。因此，当这个值越大，看到的三维效果就越细微，当这个值越小，就越可以看到明显的三维效果。*perspective的值必须为正数*（也就是说，不包括0）。

##三维效果之transform-style##

css属性`transform-style`只有两个取值`flat`（默认）和`preserve-3d`。当它的取值为`preserve-3d`时，会关联影响到一个状态，称为*三维渲染上下文*（*3D rendering context*）。

在默认情况下，是不存在三维渲染上下文的。元素创建或加入一个三维渲染上下文遵循以下原则：

* 当一个元素原本不处于三维渲染上下文中，而属性`transform-style`的计算值为`preserve-3d`时，这个元素将创建一个三维渲染上下文。在创建之后，这个元素自己也加入到这个上下文中。
* 当一个元素已处于三维渲染上下文中，而属性`transform-style`的计算值为`preserve-3d`，这个元素将扩展这个三维渲染上下文，而不是新创建一个。
* 如果一个元素的包含块（containing block，[详情][link_containing_block_detail]）创建或扩展了一个三维渲染上下文，则判定这个元素处于这个三维渲染上下文中。

以上是非常严谨的判断原则。那么，这个三维渲染上下文是做什么用的呢？

前文说到，为一个元素指定`perspective`属性，就可以使它的子元素共享同一个透视变化。但是，如果不创建三维渲染上下文，只有指定了`perspective`的元素的直接子元素，可以产生透视变化。而要使更深层级的子元素，也共享同一个透视变化，则需要使用`transform-style`。位于同一个三维渲染上下文的元素，它们的透视变化都是相同的，灭点也相同，就好像它们都位于同一个三维空间内。

在没有这个三维渲染上下文时（也就是不设置`transform-style`），三维变换的元素也是可以看到三维效果的（单独使用perspective）。但是，这时候的三维变换其实只是一种绘制效果（painting effect），就像二维变换那样。我们知道，在网页中，元素之间的覆盖关系取决于绘制顺序，绘制顺序靠后的元素将显示在前面。更专业一点说，是网页中的堆叠上下文（stacking context，详细见[Elaborate description of Stacking Contexts][]）。常用的`z-index`属性，也是控制元素的堆叠上下文。

这里就会有一个问题，按照真实三维空间的情况，应该是Z坐标值较大（也就是更靠近观察者）的元素，显示在Z坐标值较小的元素的前边。但`z-index`这时候又会如何呢？我们来看一个例子。html：

{% highlight html %}
<div class="paint_stage">
    <div class="paint_plane paint_plane_1"></div>
    <div class="paint_plane paint_plane_2"></div>
</div>
{% endhighlight %}

对应的css：

{% highlight css %}
.paint_stage{position:relative;width:100px;height:100px;perspective:300px;}
.paint_plane{position:absolute;width:100%;height:100%;left:0;top:0;}
.paint_plane_1{background:orange;transform:translateZ(20px);z-index:10;}
.paint_plane_2{background:purple;transform:translateZ(-20px);z-index:20;}
{% endhighlight %}

这时候的效果是：

![不设置transform-style时的覆盖关系][img_transform_style_result_1]

然后修改css，为`.paint_stage`增加`transform-style:preserve-3d;`：

{% highlight css %}
.paint_stage{position:relative;width:100px;height:100px;perspective:300px;transform-style:preserve-3d;}
.paint_plane{position:absolute;width:100%;height:100%;left:0;top:0;}
.paint_plane_1{background:orange;transform:translateZ(20px);z-index:10;}
.paint_plane_2{background:purple;transform:translateZ(-20px);z-index:20;}
{% endhighlight %}

得到新的覆盖效果：

![设置transform-style后的覆盖关系][img_transform_style_result_2]

可以看到，此时，橙色的平面因Z轴坐标更大，显示在了紫色的平面的前边，并遮挡住了紫色平面（越靠近观察点，尺寸越大）。

这就是说，如果不设置`transform-style`创建三维渲染上下文，那么三维变换就只能说是元素的一个绘制效果，绘制顺序依然用传统的堆叠上下文来判断。*只有创建了三维渲染上下文之后，其中的元素才真正按照三维空间的排布，确定正确的绘制顺序*。

##三维效果之backface-visibility##

你可能注意到，网页中用作三维变换的都是平面。处于三维空间中的平面，是存在一个朝向问题的。在初始情况下，规定平面的朝向为正向。当使用`transform`做变换时，平面的朝向就会发生改变。如果把平面想象为一个厚度极小的三维物体，那么变化过程中，这个三维物体的另一面就可能朝向观察者。

css的三维变换对此也做了处理。当认为是平面的“背面”朝向观察者时，平面内的内容会变为对应的镜像。css属性`backface-visibility`有2个取值，`visible`（默认）和`hidden`。显然，设置`backface-visibility:hidden;`的意思，就是说当认为平面是“背面”朝向观察者时，不再显示这个平面：

![backface-visibility的作用][img_backface_visibility_explain]

在三维建模中，三维物体实际都是由多个平面围成。从某一观察点来观察三维物体，只应该看到一部分可见的平面。因此，这个属性可以让处于背面的平面不作显示，从而形成更合理的三维效果。

还需要注意的是，`backface-visibility`*不是可继承属性，必须定义在有三维变换的元素本身才有效*。

##应用三维变换的实例##

现在，我们可以考虑通过三维建模的方法，为网页加入三维切换效果。这比起只使用`transform`和perspective得到三维效果更困难，因为它需要我们按照三维建模的方式，搭建真正的三维物体。

如果不是深刻理解了前面所述的几个三维变换的相关属性，很可能会对三维物体的创建方法有很多困惑。但幸运的是，已有前辈为我们提供了基本的、可靠的三维物体的创建模式，请看下面这个实例。html：

{% highlight html %}
<div class="container">
    <div class="object_3d">
        <div class="surface surface_front">Hello,</div>
        <div class="surface surface_up">I'm Alice.</div>
    </div>
</div>
{% endhighlight %}

css：

{% highlight css %}
.container {
    position: relative;
    width: 80px;
    height: 80px;
    perspective: 300px;
}
.object_3d {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: translateZ(-40px) rotateX(0deg);
    transition: transform .5s ease-out;
}
.object_3d .surface {
    position: absolute;
    width: 76px;
    height: 76px;
    border: 2px solid #e43a2e;
    background: #ff6b38;
    backface-visibility: hidden;
}
.surface_front {
    transform: rotateX(0deg) translateZ(40px);
}
.surface_up {
    transform: rotateX(90deg) translateZ(40px);
}
.object_3d:hover {
    transform: translateZ(-40px) rotateX(-90deg);
}
{% endhighlight %}

这样三层级的DOM，即可实现在三维空间中搭建三维物体。实际效果如下（移上去看效果，限支持的浏览器）：

<div class="post_display transform_3d_demo">
    <div class="container">
        <div class="object_3d">
            <div class="surface surface_front">Hello,</div>
            <div class="surface surface_up">I'm Alice.</div>
        </div>
    </div>
</div>

这里其实只用了两个平面，并不是完整的立方体，但仍然是实实在在的三维切换效果。

关于这个创建模式的有关知识，欢迎你阅读David DeSandro的[Intro to CSS 3D transforms][]，本文的实例就是参照了他介绍的做法。

##其他补充说明##

###变换函数的叠加原理###

在属性`transform`的值中，你可以使用一系列的变换函数。存在多个变换函数时，最终效果与排列顺序有关，比如`transform:rotateX(45deg) translateZ(30px);`和`transform:translateZ(30px) rotateX(45deg);`得到的变换效果是不同的（这是因为矩阵乘法是不可交换的）。而且，多个变换函数以某一顺序写在一个`transform`的最终变换效果，和多个变换函数保持原顺序分开作用于存在变换关联的不同DOM元素的最终变换效果是相同的。举例来说，就是：

{% highlight html %}
<div style="transform:translate(-10px,-20px) scale(2) rotate(45deg) translate(5px,10px)"/>
{% endhighlight %}

从功能上说等同于：

{% highlight html %}
<div style="transform:translate(-10px,-20px)">
  <div style="transform:scale(2)">
    <div style="transform:rotate(45deg)">
      <div style="transform:translate(5px,10px)">
      </div>
    </div>
  </div>
</div>
{% endhighlight %}

这个例子来自[The Transform Function Lists][]。

###浏览器兼容性###

最新的浏览器对三维变换的支持情况，以及是否需要使用前缀写法，都请到[caniuse.com/#feat=transforms3d][]。

###与动画的结合###

三维变换和其他的一般属性一样，都可以用于制作动画：

<div class="post_display">
    <div class="badge_container">
        <div class="angel_beats_badge"><img width="150" height="165" src="{{POSTS_IMG_PATH}}/201309/angel_beats_badge.png "alt="Angel Beats!"></div>
    </div>
</div>

##结语##

三维变换的确是新的提供给我们前端开发用的很酷的东西。不过，不推荐使用css的三维变换来制作完全的3D网页。css是被定义用来为网页添加样式的，而不是用来生成虚拟空间的。因此，适当地在网页中的一部分地方，考虑应用三维变换即可，这说不定会让你的网站看起来非常棒。

不只是平面的网页，是不是很值得做一些尝试呢？

[img_coordinate_space]: {{POSTS_IMG_PATH}}/201309/coordinate_space.png "坐标系统"
[img_vanishing_point_explain_photo]: {{POSTS_IMG_PATH}}/201309/vanishing_point_explain_photo.jpg "照片中的灭点"
[img_perspective_distance]: {{POSTS_IMG_PATH}}/201309/perspective_distance.png "perspective与元素Z轴坐标"
[img_perspective_origin]: {{POSTS_IMG_PATH}}/201309/perspective_origin.png "perspective-origin通过改变观察点位置改变灭点"
[img_transform_style_result_1]: {{POSTS_IMG_PATH}}/201309/transform_style_result_1.png "不设置transform-style时的覆盖关系"
[img_transform_style_result_2]: {{POSTS_IMG_PATH}}/201309/transform_style_result_2.png "设置transform-style后的覆盖关系"
[img_backface_visibility_explain]: {{POSTS_IMG_PATH}}/201309/backface_visibility_explain.png "backface-visibility的作用"

[Elaborate description of Stacking Contexts]: http://www.w3.org/TR/CSS2/zindex.html "Elaborate description of Stacking Contexts"
[link_containing_block_detail]: http://www.w3help.org/zh-cn/kb/008/ "包含块( Containing block )  - W3Help"
[Intro to CSS 3D transforms]: http://desandro.github.io/3dtransforms/docs/introduction.html "Intro to CSS 3D transforms"
[The Transform Function Lists]: http://dev.w3.org/csswg/css-transforms/#transform-function-lists "The Transform Function Lists"
[caniuse.com/#feat=transforms3d]: http://caniuse.com/#feat=transforms3d "caniuse.com/#feat=transforms3d"