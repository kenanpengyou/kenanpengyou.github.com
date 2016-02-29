---
layout: post
title: "新的acgtofe：手机和平板也可以！"
category: "记录随笔"
description: "之前，本站是只适合于桌面电脑的。随时展示的话，就显得很不方便，所以最近对本站重新做了装修。现在，本站用手机、平板也可以自由浏览了！"
---
{% include JB/setup %}

在你看到本文时，本站点已经是一个更具有智慧的站点了（这么形容也行？！）。具体来说，显示本站点的窗口的尺寸不同的话，布局会对应有所不同。大概就像下面这样：

![不同宽度下的acgtofe][img_acgtofe_multiple_views]

只是做到这种程度，我也很费了一些工夫。这是因为，我在最初制作本站点的设计稿时，完全没有考虑过不同宽度的适应的情况。我只是在做一个桌面电脑上用的网站。

在响应式设计简明教程[Grid][]中，提到了一项原则叫做Mobile First。它的意思是，如果要做一个适应性的网站，要先从手机版本开始考虑。这是因为，手机屏幕尺寸是最小的，可以容纳的东西也少，加上流量等因素，手机版网页应该做到尽可能简单。我们做设计，一般应是一个简单到复杂的过程，所以先做手机版，然后再到稍宽一些的屏幕（平板），再到更宽的屏幕（桌面电脑），是推荐的做法。

所以，我这次所做的事就有些不同，面对的是一个先只考虑了桌面电脑的网站。从结果来看，Mobile First的原则是值得遵循的，因为如果要做适应性的网站，那么显然在最初设计的时候就考虑到是最好的。但如果最初没有考虑到（现在大部分的已有的网站也是如此），也没有关系，费一些心思，仍然是可以实现的。

本站点现在就是这样一个反向修改的例子。如果你能觉得看起来都还不错，那我就很高兴了。

## 版本更新说明？ ##

虽然本文只是一篇记录随笔，我仍然决定写一下我具体做了什么。如果你也在考虑做一个适应性的站点，也许这些可以用作参考。

### 加上视口定义的<meta>标签 ###

这是手机网页必有的东西，不用多说。我写的是：

{% highlight html %}
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
{% endhighlight %}

### 弃用过大的图片资源 ###

对手机来说，上网很可能是消耗流量的。作为桌面电脑站点而言没什么关系的部分图片资源，对手机来说可能就太过。在修改之前，本站点的用到的一个平铺背景在200KB以上（其实最大的图片就是它），因为纹理看起来很漂亮，所以一直留着。这次修改，我用Photoshop对照着做了一个类似的更小的平铺背景，只有5KB。纹理效果上差一些，但是值得。

### 不定宽或使用百分比值 ###

原先的站点的分栏结构，都是很固定的宽度定义，例如 `width:270px;`。我现在把它们修改成了 `width:25%;`这样的百分比的值，这就可以使得部分结构的宽度随整个窗口宽度变化而变化。类似的，不定宽的话，则是取默认的`100%`的宽度，也是一个随窗口变化而变化的对应关系。

此外，我较多地改用了`max-width`和`min-width`，它们对适应性布局很有帮助。

### 图片改用文字 ###

之前有部分图片资源主要由特定字体的文字构成（比如导航）。这种图片实现的文字，一方面在手机屏幕（是的，基本都高清）上清晰度不够，比较模糊，另一方面不易根据窗口宽度更改大小。在修改成文字后，大小修改（用`font-size`），清晰度就都有保证了。

此外，我还使用了`@font-face`做字体嵌入（因为是英文字体，所以字体大小不大，中文字体则不建议使用），保证在设备没有对应字体时的效果。考虑到兼容性，字体是需要多个版本的，这里推荐使用[Font Squirrel][]做多版本生成。

在手机里，用真正的文字的话，看起来往往很清晰漂亮。

### 依照宽度区分定义不同的样式 ###

使用媒体查询，定下几个适当的宽度分界点。网页中的不同部分有着各自不同的设计，因此极限状态发生的位置也会不同。因此，我用了更多的宽度分界点，来实现对变化的更精细的控制。

位于媒体查询`@media`的范围之外的部分，则是任何宽度下都应该有的、保持不变的样式。

### 增加高清图片资源 ###

如果屏幕是高清的，则应该使用更清晰的图片资源（常见的是2倍大小），以保证效果。屏幕的清晰度也是媒体查询来判断的，我所用的代码是：

{% highlight css %}
@media 
(-webkit-min-device-pixel-ratio: 1.5), 
(min-resolution: 144dpi){ 
    /* Retina-specific stuff here */
}
{% endhighlight %}

这段关于屏幕清晰度的媒体查询代码来源于[Cross Browser Retina/High Resolution Media Queries]。

### 不再支持IE6 ###

我较多地用到了`max-width`，`min-width`，不支持它们的IE6是无法维持正常的布局的。因此，IE6会跳转到另一个提示页，告知请至少使用IE7及以上（这要求够低了吧！）。

顺便地，我也省下了hack代码和多余的png8图片资源。

IE7-IE8的媒体查询支持使用了Scott Jehl的[Respond][]，它只提供了min/max-width的媒体查询，但十分轻巧、快速。

## 结语 ##

欢迎试试现在新的acgtofe。如果使用的是桌面电脑的话，简单地把窗口宽度，从最宽一直拖到最窄，就可以看到全部的的变化效果了！

[img_acgtofe_multiple_views]: {{POSTS_IMG_PATH}}/201405/acgtofe_multiple_views.jpg  "不同宽度下的acgtofe"

[Grid]: http://www.adamkaplan.me/grid/ "Grid"
[Font Squirrel]: http://www.fontsquirrel.com/tools/webfont-generator "Create Your Own @font-face Kits | Font Squirrel"
[Cross Browser Retina/High Resolution Media Queries]: http://www.brettjankord.com/2012/11/28/cross-browser-retinahigh-resolution-media-queries/ "Cross Browser Retina/High Resolution Media Queries | Brett Jankord"
[Respond]: https://github.com/scottjehl/Respond "Respond"
