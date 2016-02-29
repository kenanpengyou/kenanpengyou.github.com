---
layout: post
title: "处理Webkit硬件加速引发的文字外观变化"
category: "前端综合"
description: "在Webkit及Blink系列浏览器，比如Chrome中，存在两种不同的渲染模式：较新的硬件加速模式和传统的软件模式。硬件加速模式可以优化渲染性能，但如果使用不当，也会带来一些意外的问题，文字外观变化就是其中之一。如果你有碰到过类似的问题，那么本文的内容非常适合你。"
extraCSS: ["posts/201402/text-appearance-changes-with-webkit-hardware-compositing-mode-on.css"]
---
{% include JB/setup %}

*硬件加速*是Chrome等Webkit浏览器（新的Chrome采用的Blink也是由Webkit发展而来的，为表示方便，后文只用Webkit一词）新引入的渲染模式。

和传统的软件模式相比，硬件加速会使GPU也参与到渲染工作中（而不是全部交给CPU），因此在大部分情况下，可以较多地提升渲染性能。不过，毕竟在原理上存在差异，硬件加速的渲染模式也可能会带来一些并不希望的变化。

## 意外的文字外观变化 ##

下面你可以看到一个小球和一段文字。点击这个小球，然后小球会开始跳动。再随便点击其他的地方，小球会停止。

<div class="post_display">
  <div class="exhibit_stage">
      <div class="exhibit_ball" tabindex="0"></div>
      <div class="exhibit_text">Attention! 请注意本段文字的变化</div>
  </div>
</div>

请在Webkit浏览器中查看本页。在小球跳动和静止的切换中，认真观察小球后面的一段文字（Webkit浏览器中），你可能还需要放大当前页（`ctrl` + `+`）来看到这段文字的外观变化。这个变化是细微的。

“我看到文字好像是变化了那么一点”，你可能会这样说。是的，这个小小的文字变化，就是一个只在Webkit浏览器发生的问题，而它的引发原因，就和硬件加速的渲染模式有关。

## 发生了什么？ ##

请注意，上面的小球，以及随后的文字，都写了`position: relative`（没有定义`z-index`）。由于小球和文字是同级元素，而文字元素位置更靠后，因此从层叠关系上说，文字是在小球之上的。

除小球后面的文字之外，本文的其他文字并不会发生变化。层叠关系上说，它们都位于小球之下。

为什么这样不同的层叠关系就会带来不同的结果呢？这需要从*层*（*Layer*）的概念说起。

## 层 Layer ##

作为web开发人员，DOM我们很熟悉。不过，浏览器在渲染页面时，实际还用到了很多不可见（也就是不给开发者用）的中间表现形式，其中最重要的就是层。

与层密切相关的另一个概念叫做*backing surface*（后表面，目前没有官方翻译，所以使用英文原词）它是和层关联的。但是，并不是所有层都会有一个属于自己的backing surface，部分层会共用同一个。

backing surface是一个*图形上下文*（*graphics context*），用于绘制层。在硬件加速模式下，每个backing surface都会作为一个*纹理*（*texture*）被传送到GPU，由GPU整合。

GPU整合到最后的结果是一个完整的图片，即你看到的网页。你可以把backing surface看做一块一块的拼图，如果拼图里的层不发生变化，改变拼图的位置或透明度等操作就可以很简单地由GPU实现，这也就使CPU可以有状态去做更多其他的事情。

一个拥有自己的backing surface的层，也叫做*复合层*（*compositing layer*）。打开Webkit开发者工具（以写本文的时间点，Chrome最新版33为例），在控制台的"Rendering"中勾选上"Show composited layer borders"，如下图：

![查看复合层][img_show_layers_in_webkit_dev_tools]

然后，页面中的复合层会用橙色边框标注出来。比如，前面的小球跳动时，你就可以看到这个小球周围的橙色边框。可以注意到，此时小球后的文字也有橙色边框。当小球停下时，边框则都消失。

关于层的更多信息，请阅读[Accelerated Rendering in Chrome - The Layer Model][]。

## backing surface判定标准 ##

前文说到，部分层会共用同一个backing surface。那么，什么时候浏览器会为一个层创建一个对应的的backing surface呢？具体的判定标准如下（来源于[GPU Accelerated Compositing in Chrome][]）：

* 层拥有3D或透视变换的CSS属性
* 层包含使用加速视频解码的`<video>`元素
* 层包含有加速2D上下文或3D（WebGL）上下文的`<canvas>`元素
* 层包含混合插件，如Flash或Silverlight
* 层应用了关于`opacity`或`transform`的CSS动画
* 层应用了加速CSS filters
* 层有一个是复合层的子元素，而且层包含需要存在于复合层的内容，比如裁剪和反射（clip or reflection，这条我也理解不能...）
* 层有一个兄弟元素（sibling）是复合层，且兄弟元素的z-index较小（换句话说，这个层在一个复合层的上方）

现在，再分析一下前面的小球和文字。小球的动画使用了`transform`的`translate`，因此小球的层会有自己的backing surface（第5条）。文字和小球是兄弟元素，且文字在上，所以文字的层也需要有自己的backing surface（最后1条）。

拥有自己的backing surface意味着会被单独作为一个纹理绘制，文字在这种时候，其外观就会发生变化。

## 解决文字问题 ##

现在可以知道，文字外观变化是因为意外地创建了文字层的backing surface。所以，更改层叠关系，让文字层位于小球层的下方即可。例如，为小球元素增加一个`z-index: 50`，然后就可以看到无论小球跳动与否，文字都不会变化。

如果以后有碰到类似的问题，请记住：**让那些有可能有自己的backing surface的元素，摆放在其他普通元素的上边**。你也可以理解为：在舞台上，让那些有丰富动作的主角（有特别动画的你还不主角么）站在最前边！

## 附加内容 ##

问题处理到此结束，不过，由这个问题还可以引出其他的一些内容。

### 文字平滑 ###

在本文的问题中，文字的细微变化到底是什么呢？这个变化实际是文字平滑处理的变化。这里有一个新的概念：*subpixel rendering*（*亚像素渲染*）。

[Wiki上用了很长的篇幅][]解释了subpixel rendering。你可能不太有兴致读下去，所以我在这里简单地解释一下。我们知道，显示屏幕是以像素为单位来显示内容的，但每一个像素又是由更小的人眼无法分辨的多个颜色单元组成，例如最常见的RGB，即红绿蓝三原色。这些更小的显示单元，就称为亚像素。subpixel rendering是一种显示处理方法，它通过有效地结合使用这些更小的亚像素，可以平滑文字主体，锐化文字边缘，使文字看起来分辨率更高（对，只是看起来），更清晰，也因此具有更好的可读性。各类浏览器对文字默认都有这种处理。

在Webkit浏览器中，如果文字层有了自己的backing surface，文字平滑的处理方法就会发生变化，因此文字外观会有细微改变。

有趣的是，Webkit浏览器曾支持一个修改文字平滑处理模式的css属性`-webkit-font-smoothing`。它有3个值，如下：

    -webkit-font-smoothing: none;
    -webkit-font-smoothing: subpixel-antialiased; // 默认
    -webkit-font-smoothing: antialiased;

你可以在[-webkit-font-smoothing][]一文中看到它们各自的效果。后两种抗锯齿的平滑处理模式的区别是，`subpixel-antialiased`即一般的subpixel rendering，而`antialiased`会禁用subpixel rendering，重新在像素级别对文字进行平滑处理。注意，`subpixel-antialiased`使用的是亚像素，比`antialiased`更为精细。

文字平滑是肯定需要的，不过用哪一种更好呢？Dmitry Fadeyev在[Please Stop "Fixing" Font Smoothing][]一文中详细探讨了这个问题。结论是，请不要因为有这么一个属性让你可以改掉默认的平滑，就一定要去用。为了文字的可读性，默认值仍然是最合适的。

这个属性在新版的Chrome中已经不再有效（可参考[stackoverflow上的提问][]，我也自己做过测试），也许是Chrome团队也赞同应该保持默认的subpixel rendering。

### 有关translate3d的性能提升技巧 ###

硬件加速的渲染模式的确为Webkit浏览器带来了更好的性能，因此，出现了一个有趣的帮助提升性能的技巧（应该叫做hack）。最常使用的两种代码是：

    -webkit-transform: translateZ(0); // one
    -webkit-transform: translate3d(0,0,0); // another

它们之中任选一种即可。可以看出，当应用在页面元素上后，页面元素实际上不会有任何改变（因为数值是0），但是，联系前文，就可以知道这里的代码会有两个作用。

* 启动浏览器的硬件加速模式，如果浏览器支持它，而且还没有启动。
* 为该元素所在的层创建一个属于它的backing surface。

这就是这个曾经被多次提到的技巧的原理。

你已经知道硬件加速模式也可能引发一些问题，所以，这个技巧在使用时，也请多加注意。

## 结语 ##

前一段时间在写网页动画效果时，注意到了Chrome中独特的元素外观变化，觉得很意外。在搜集资料寻求解答的过程中，我找到了[Accidental layer creation][]这篇简短而精致的文章。本文大概就是在结合了Webkit硬件加速知识点后，对它的一点扩展。

是不是应该庆祝一下能解决这令人不快的文字问题？（笑）

[img_show_layers_in_webkit_dev_tools]: {{POSTS_IMG_PATH}}/201402/show_layers_in_webkit_dev_tools.png "查看复合层"

[Accelerated Rendering in Chrome - The Layer Model]: http://www.html5rocks.com/en/tutorials/speed/layers/ "Accelerated Rendering in Chrome - The Layer Model"
[GPU Accelerated Compositing in Chrome]: http://www.chromium.org/developers/design-documents/gpu-accelerated-compositing-in-chrome "GPU Accelerated Compositing in Chrome"
[Wiki上用了很长的篇幅]: http://en.wikipedia.org/wiki/Subpixel_rendering "Subpixel rendering - Wikipedia, the free encyclopedia"
[-webkit-font-smoothing]: http://maxvoltar.com/archive/-webkit-font-smoothing "maxvoltar - -webkit-font-smoothing"
[Please Stop "Fixing" Font Smoothing]: http://www.usabilitypost.com/2012/11/05/stop-fixing-font-smoothing/ "Please Stop "Fixing" Font Smoothing"
[stackoverflow上的提问]: http://stackoverflow.com/questions/18786829/webkit-font-smoothing-property-has-no-effect-in-chrome "css - -webkit-font-smoothing property has no effect in Chrome - Stack Overflow"
[Accidental layer creation]: http://jsbin.com/efirip/5/quiet "Accidental layer creation"
