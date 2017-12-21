---
layout: post
title: "巧妙使用transform实现环形路径平移动画"
category: "css"
description: "环形路径平移动画是一个看上去简单，但实际上包含了很多学问的课题。本文将尝试详细解读如何用css的transform完成这个课题。"
---
{% include JB/setup %}

最近在[CSS Secrets][CSS Secrets]一书看到了这样一节：让一个元素沿环形路径平移。这是一个css动画的问题，但却没有看上去那么简单，其关键点是**元素是平移的**，也就是说，元素自身并不发生旋转，只是稳定地沿着一个环形的路径移动，像这样：

![环形路径平移][img_movement_impression]

在书中作者Lea Verou已经给出了解答（实际上，可以追溯到作者更早的[这篇博文][这篇博文]），不过，我认为再补充一点周边细节知识可能会更易于理解。因此，本文整理了一些东西，将尝试更详细地解答这个问题。

## 从旋转动画开始 ##

最开始看到这个问题的时候，会很容易想到用`transform-origin`定义圆心的位置，然后用`rotate()`进行旋转。css代码大概是这样（半径为150px）：

~~~css
@keyframes spin {
    to {
        transform: rotate(1turn);
    }
}

.avatar{
    animation: spin 10s infinite linear;
    transform-origin: 50% 150px;
}
~~~

搭配的html很简单：

~~~html
<img class="avatar" src="edwardup_avatar.jpg" alt="" />
~~~

对应的效果是：

![环形旋转][img_circle_rotate]

可以看到，这是一个旋转动画，元素在沿着环形路径移动的同时，自身也会围绕圆心发生旋转。因此，这并不是我们想要的平移效果。

但另一方面，元素沿环形路径移动这一点是符合我们的目标的。所以，可以在这个基础上思考如何改进。

## 利用多元素的变形相消 ##

w3c的[The Transform Function Lists][The Transform Function Lists]里提到：

> If a list of \<transform-function\> is provided, then the net effect is as if each transform function had been specified separately in the order provided.

意思是，**当一个元素的`transform`添加了多个变换函数时，其效果等同于按照这些变换函数的顺序依次分散添加在多层元素中**。例如，以下元素：

~~~html
<div style="transform:translate(-10px,-20px) scale(2) rotate(45deg) translate(5px,10px)"></div>
~~~

其变换结果等效于：

~~~html
<div style="transform:translate(-10px,-20px)">
  <div style="transform:scale(2)">
    <div style="transform:rotate(45deg)">
      <div style="transform:translate(5px,10px)">
      </div>
    </div>
  </div>
</div>
~~~

这是一条非常有用的规则。现在，假如有一个应用了旋转变换函数的元素是：

~~~html
<div style="transform:rotate(45deg) rotate(-45deg)"></div>
~~~

显然，这个元素其实是没有旋转的，因为两个旋转变换函数刚好抵消。这时候，我们再用一下前面的规则，就知道它等同于：

~~~html
<div style="transform:rotate(45deg)">
    <div style="transform:rotate(-45deg)"></div>
</div>
~~~

也就是说，**内层元素可以通过变形来抵消外层的变形效果**。

现在回到旋转动画，既然元素已经是沿环形路径移动了，我们要做的就是抵消掉元素自身的旋转。参考上面的原理，我们可以增加一个容器元素：

~~~html
<div class="avatar">
    <img src="edwardup_avatar.jpg" alt="" />
</div>
~~~

然后为它们搭配不同的动画：

~~~css
@keyframes spin {
    to { transform: rotate(1turn); }
}
@keyframes spin-reverse {
    from { transform: rotate(1turn); }
}
.avatar {
    animation: spin 10s infinite linear;
    transform-origin: 50% 150px;
}
.avatar > img {
    animation: spin-reverse 10s infinite linear;
}
~~~

这段代码把旋转动画搬到了`div.avatar`这个容器元素上，然后为`<img>`元素添加了一个刚好相反的旋转动画。

运行一下，会发现这就是我们想要达到的效果（参见文章开头的图）。

## 只使用单个元素 ##

在前面的解决方案中，为了让元素自身不发生旋转，增加了额外的容器元素。那么，如果**只用单个元素**，有办法实现吗？

### 多transform-origin的问题 ###

前面说过，一个元素的多个变换函数可以分散给多层元素。反过来，多层元素的变换函数，也可以集中到单个元素。

这个思路是可行的，只不过，有一个必须解决的问题，就是`transform-origin`。

在两个元素的解决方案中，`div.avatar`设置了`transform-origin`为另一个点（环形路径的圆心），而`<img>`的`transform-origin`则取默认值，也就是图片的中心（`50%, 50%`），这两个变形原点是不一样的：

![多个transform-oirgin][img_multiple_transform_origin]

在现在的css中，我们并不能为单个元素同时指定多个`transform-origin`（尽管在`@keyframes`的不同关键帧可以设置不同的值），所以，我们需要一点特别的技巧。

### transform-origin的本质 ###

我们知道，一个元素最终的变形效果，与`transform`及`transform-origin`都有关。事实上，在w3c规范中，使用了**transformation matrix**一词来代表这个最终变形效果（从数学角度来说，一般用一个矩阵来表示从一个坐标系到另一个坐标系的变换效果）。

参考w3c的[Transformation Matrix Computation][Transformation Matrix Computation]，我们可以知道transformation matrix是这样计算的：

*  [1] 从一个单位矩阵（identity matrix）开始
*  [2] 根据`transform-origin`的x、y、z坐标值，进行平移（translate）
*  [3] 从左向右依次对`transform`里的变换函数执行乘法
*  [4] 根据`transform-origin`的x、y、z坐标值，进行**反向**平移

注意`transform-origin`在这里被表述为两次方向相反的平移，也就是说，`transform-origin`并不是什么特别的东西，它可以被`translate()`替代。

在CSS Secrets一书中，作者Lea Verou也引用了css变形规范的当时的一位编辑Aryeh Gregor的这样一句话：

> **transform-origin 只是一个语法糖而已。实际上你总是可以用 translate() 来代替它**。

举例来说，这段代码：

~~~css
.avatar{
    transform: rotate(30deg);
    transform-origin: 200px 300px;
}
~~~

等效于：

~~~css
.avatar{
    transform: translate(200px, 300px) rotate(30deg) translate(-200px, -300px);
    transform-origin: 0 0;
}
~~~

了解到这一点，我们就有办法继续了。

### 精简的单元素解决方案 ###

利用前面的原理，我们把前面两个元素的`transform-origin`的差异抹去（全部变为`transform-origin: 0 0;`的等效），转移到`transform`上：

~~~css
@keyframes spin {
    from { transform: translate(50%, 150px) rotate(0turn) translate(-50%, -150px); }
    to { transform: translate(50%, 150px) rotate(1turn) translate(-50%, -150px); }
}
@keyframes spin-reverse {
    from { transform: translate(50%, 50%) rotate(1turn) translate(-50%, -50%); }
    to { transform: translate(50%, 50%) rotate(0turn) translate(-50%, -50%); }
}
.avatar {
    animation: spin 10s infinite linear;
}
.avatar > img {
    animation: spin-reverse 10s infinite linear;
}
~~~

现在这段代码中，两个元素的`transform-origin`已经一致了，然后我们根据变换函数合并规则，将它们集中到一个元素上，此时html重新变为单个元素：

~~~html
<img class="avatar" src="edwardup_avatar.jpg" alt="" />
~~~

对应的css：

~~~css
@keyframes spin {
    from { transform: 
        translate(50%, 150px) rotate(0turn) translate(-50%, -150px)
        translate(50%, 50%) rotate(1turn) translate(-50%, -50%); }
    to { transform: 
        translate(50%, 150px) rotate(1turn) translate(-50%, -150px)
        translate(50%, 50%) rotate(0turn) translate(-50%, -50%); }
}
.avatar {
    animation: spin 10s infinite linear;
}
~~~

上面的代码特意把`transform`的值分成两行，分别代表原来的两个元素各自的变换函数。到此，这段代码就已经可以让单个元素达成前文的两个元素的效果了。不过，这段代码还比较冗长，可以再做一点简化。

我们很清楚`transform`的变换函数的顺序很重要，不能随意交换，但相邻的同类变换函数可以考虑合并。

首先，可以找到位于中间的`translate(-50%, -150px)`和`translate(50%, 50%)`可以合并，得到`translateY(-150px) translateY(50%)`（百分比和像素值则不能再合并）。

然后，以`from`的部分为例，注意`rotate(0turn)`和`rotate(1turn)`分别来自原来的两个元素，它们的角度值是为了互相抵消准备的，因此必须和为`360deg`（`1turn` = `360deg`）：其中一个的角度值为**x**，另一个则为**360 - x**。

也就是说，元素在`rotate(0turn)`之前（未发生旋转），和`rotate(1turn)`之后（发生了两次旋转），元素的角度是一致的（合计刚好转了`360deg`），此时发生的`translate()`也可以合并。以此找到最前的`translate(50%, 150px)`和最后的`translate(-50%, -50%)`，它们可以合并，得到`translateY(150px) translateY(-50%)`。

至此，代码变为：

~~~css
@keyframes spin {
    from { transform: 
        translateY(150px) translateY(-50%) rotate(0turn) 
        translateY(-150px) translateY(50%) rotate(1turn); }
    to { transform: 
        translateY(150px) translateY(-50%) rotate(1turn) 
        translateY(-150px) translateY(50%) rotate(0turn); }
}
.avatar {
    animation: spin 10s infinite linear;
}
~~~

代码虽然看起来没怎么变短，但变换函数更细致明确了。最后，注意最开始的两个`translateY()`，它们在`from`和`to`里都是一样的，因此，完全可以在动画之外，一开始就把元素放在那个位置，从而消除这两个`translateY()`。

实际上，这两个`translateY()`的位移做的事就是把这个元素放到环形路径的圆心。

这样，代码再变为：

~~~css
@keyframes spin {
    from { transform: 
        rotate(0turn) 
        translateY(-150px) translateY(50%)
        rotate(1turn); }
    to { transform: 
        rotate(1turn) 
        translateY(-150px) translateY(50%) 
        rotate(0turn); }
}
.avatar {
    animation: spin 10s infinite linear;
}
~~~

这就是精简后的单元素环形路径平移的解决方案了。代码直观看上去，可能会觉得比较难理解，毕竟它是我们经过前面这样一大段的分析推理得到的。

尽管如此，也有[一篇文章][一篇文章]介绍了如何直接理解这段环形路径平移的代码，推荐有兴趣的你看看。

## 一点额外的尝试 ##

### 螺旋路径平移 ###

在环形平移路径的代码的基础上，改变起点或终点的圆环半径，可以得到螺旋路径：

~~~css
@keyframes spin {
    from { transform: 
        rotate(0turn) 
        translateY(-150px) translateY(50%)
        rotate(2turn); }
    to { transform: 
        rotate(2turn) 
        translateY(-50px) translateY(50%) 
        rotate(0turn); }
}
~~~

对应的效果：

![螺旋路径平移][img_spiral_path_movement]

这里为了体现螺旋效果，把圈数增加到了2圈。

### S形路径 ###

把两个环形各取一半拼在一起，就可以得到S型路径。参考环形路径平移的方案，做一些调整，就可以得到S型路径平移的写法：

~~~css
@keyframes spin{
    0%{
        transform: 
            rotate(-90deg) translateX(50px) rotate(90deg);}
    49.9%{
        transform: 
            rotate(-270deg) translateX(50px) rotate(270deg);}
    50.0% {
        transform: 
            translateY(100px) rotate(-90deg) translateX(50px) rotate(90deg);}
    100% {
        transform:
            translateY(100px) rotate(90deg) translateX(50px) rotate(-90deg);}
}
~~~

这里初始把元素放在了上面那个半圆环的圆心，然后在`50.0%`的关键帧位置切换为下面的半圆环路径。由于这个切换过程会让元素小小地停滞一下，并不是我们想要的动画，所以这里用带小数的关键帧位置来尽可能缩短它的时长，使整个动画更平滑。最终效果是：

![S路径平移][img_s_path_movement]

## 一点补充 ##

`matrix()`是`transform`里一个特殊的变换函数，它可以通过矩阵乘法把`rotate()`、`translate()`等其他变换函数全部合并在一起。但是，`matrix()`并不能简化本文的动画代码，因为css动画将无法确认如何生成关键帧之间的补间动画，如果关键帧里只有一个合并后的`matrix()`，css动画只会按照平铺的方式去完成过渡。

以文章最开始的旋转动画为例，`rotate(1turn)`转换后是`matrix(1, 0, 0, 1, 0, 0)`，但如果直接写：

~~~css
@keyframes spin {
    to {
        transform: matrix(1, 0, 0, 1, 0, 0);
    }
}
~~~

结果就是，什么也不会发生。

## 结语 ##

只通过一个`transform`加上一段神秘代码，就可以做这样特别的动画，我觉得是很有意思的。希望本文的这样一番解读，可以帮助你加深对css的`transform`的理解。

[img_movement_impression]: {{POSTS_IMG_PATH}}/201611/movement_impression.png "环形路径平移"
[img_circle_rotate]: {{POSTS_IMG_PATH}}/201611/circle_rotate.png "环形旋转"
[img_multiple_transform_origin]: {{POSTS_IMG_PATH}}/201611/multiple_transform_origin.png "多个transform-oirgin"
[img_s_path_movement]: {{POSTS_IMG_PATH}}/201611/s_path_movement.gif "S路径平移"
[img_spiral_path_movement]: {{POSTS_IMG_PATH}}/201611/spiral_path_movement.gif "螺旋路径平移"

[CSS Secrets]: https://github.com/cssmagic/CSS-Secrets "CSS Secrets"
[这篇博文]: http://lea.verou.me/2012/02/moving-an-element-along-a-circle/ "Moving an element along a circle | Lea Verou"
[The Transform Function Lists]: https://www.w3.org/TR/css-transforms-1/#transform-function-lists "The Transform Function Lists"
[Transformation Matrix Computation]: https://www.w3.org/TR/css-transforms-1/#transformation-matrix-computation "Transformation Matrix Computation"
[一篇文章]: http://www.useragentman.com/blog/2013/03/03/animating-circular-paths-using-css3-transitions/ "Animating Circular Paths Using CSS3 Animations."
