---
layout: post
title: "从jQuery分析隐藏元素的尺寸获取方法"
category: "javascript"
description: "元素的尺寸获取很常用，而处于隐藏状态的元素，尺寸获取似乎需要一些额外的工序。来看看jQuery里是怎么做的吧！"
extraJS: ["posts/201311/getting-the-dimension-of-a-hidden-element.js"]
---
{% include JB/setup %}

##元素显示动画的疑点##

曾经想要做这样的一个效果：鼠标点击某一处后，另一处的原本为隐藏（即`display`为`none`）的元素，以一个平滑的动画效果，从高度0开始，渐渐完整显示出来。就像下边这样：

<div class="post_display" style="height:70px;">
    <div id="demo-hidden" style="display:none;background:#">这是原本隐藏着的文字！((っ･ω･)っ</div>
    <div style="padding-top:10px;"><a id="demo-show-link" href="javascript:;" title="" style="display:inline-block;padding:4px 10px;background:#34495e;color:#fff;">点击我</a></div>
</div>

但是，参照一般的动画API（自己写的，或使用现有的javascript库的）的用法，会觉得一定要指定对应的属性值。比如MooTools的动画API的语法是：

    myElement.tween(property, startValue[, endValue]);

其中`startValue`和`endValue`代表的分别是属性在动画执行前后的值，也就是初始值和结束值。其中结束值对于一个动画来说是必须的（在上面的API中，如果不指定endValue，startValue会被作为endValue使用）。现在，重新考虑一下刚才说的隐藏的元素，既然要为这个元素添加一个高度渐显动画，似乎这个元素在正常显示状态时的高度就是必须知道的了。有了这个数值，就可以调用动画API为其添加显示动画了。

好了，需要知道高度，那获取即可。最为常用的元素尺寸获取相关的属性是`offsetWidth`和`offsetHeight`，但是，你也许知道，*在`display`设置为`none`的情况下，获取元素尺寸值得到的会是0*。所以，必须寻求对应的解决方法。

##有些相关的jQuery的.show()方法##

我在考虑这个解决方法的时候，回想起了jQuery中的`.show()`方法。这个方法的功能就是让隐藏的元素显示出来，但有趣的是，这个方法可以接受参数，比如指定`.show(500)`，元素会以一个500ms的动画完成显示过程，这期间，宽度、高度、透明度等属性都是平滑过渡的，这不就非常类似我想要做的效果么？

jQuery既然做到了，那么jQuery里的具体实现方法将会是一个非常有用的参考。

##源码分析##

首先，直观一点地想，jQuery的`.show()`方法，在给定时间参数后，可以推断是调用了jQuery的动画API，也就是`.animate()`来完成动画的。在写本文的时间点，jQuery的最新版是jQuery-1.10.2，以它的源码为基础，可以简单分析一下。

首先是源头：

{% highlight javascript %}
jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
    var cssFn = jQuery.fn[ name ];
    jQuery.fn[ name ] = function( speed, easing, callback ) {
        return speed == null || typeof speed === "boolean" ?
            cssFn.apply( this, arguments ) :
            this.animate( genFx( name, true ), speed, easing, callback );
    };
});
{% endhighlight %}

从这里可以看到，和推断相同，`.show()`方法对第一个参数`speed`做了判断，当`speed`不为空，且不为逻辑值时，执行`.animate()`方法。传给`.animate()`方法的第一个参数是通过函数`genFx()`得到的，这个函数在源码中可以找到定义，如下：

{% highlight javascript %}
// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
    var which,
        attrs = { height: type },
        i = 0;

    // if we include width, step value is 1 to do all cssExpand values,
    // if we don't include width, step value is 2 to skip over Left and Right
    includeWidth = includeWidth? 1 : 0;
    for( ; i < 4 ; i += 2 - includeWidth ) {
        which = cssExpand[ i ];
        attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
    }

    if ( includeWidth ) {
        attrs.opacity = attrs.width = type;
    }

    return attrs;
}
{% endhighlight %}

这个`genFx()`如其中的注释所说，用于生成标准动画参数。我做了测试，在调用`.show(500)`方法后，这个函数返回的结果值是：

![genFx()的返回值][img_result_of_genFx]

可见，实质上，确实是调用了jQuery的`.animate()`方法来实现了动画效果。...等下，数值竟然可以是"show"这种不着边际的值？我果断重新查看了jQuery的文档，原来在jQuery的`.animate()`方法中，确实可以指定这样的值，而且，如名字所示，"show"用作动画参数属性值时，就代表元素在正常显示时候的对应数值。

看来，获取隐藏元素的尺寸的方法，似乎隐藏在`.animate()`的方法定义中。然后，我经过反复调试和分析这部分代码，得到了jQuery对于隐藏元素的动画的做法：

* 当元素是隐藏状态，且有任意动画终点属性值为"show"时，先调用元素无参数的`.show()`方法，让元素不再隐藏。
* 获取此时处于正常显示状态的相关属性值，并将这些属性值作为动画的终点属性值。

也就是说，其实jQuery对隐藏元素做动画，且动画最终会让元素显示出来时，jQuery的做法就是在一开始就让元素不再隐藏，然后立即进行动画。由于不再隐藏的元素是可以获取宽高的，而且动画是随后立即进行的，所以仍然看到的是一个平滑的显示动画效果。

##历史上的问题##

等下！到这里，还是没有解决最初的问题吧？对的，其实在很早的时候，就有人问到过[使用jQuery获取隐藏元素的尺寸的问题][stack_overflow_question]，提问题的这个人使用了当时的jQuery的`.width()`方法，发现无法获取隐藏元素的宽度。下面的最佳答案的回复者Tim Banks给了一个类似hack的处理方法，漂亮地解决了这个问题。Tim Banks后来还专门为此写了一篇博文（[详情][blog_link]）。有趣的是，jQuery从1.4.4版本开始，支持了对隐藏元素的尺寸获取，而且使用的正是这位Tim Banks的方法。

如果你现在试一试新版jQuery的`.width()`和`.height()`，你会发现即使是隐藏的元素，它也会给你返回正确的数值。所以，最初的问题的真正的解决方法，应该在jQuery的这部分的代码中。

##明确的解决方案##

jQuery中宽高的获取也通过一个定义在jQuery上的对象`cssHooks`处理，其中对于宽高的处理代码如下（为方便阅读，删去了`set`部分）：

{% highlight javascript %}
jQuery.each([ "height", "width" ], function( i, name ) {
    jQuery.cssHooks[ name ] = {
        get: function( elem, computed, extra ) {
            if ( computed ) {
                // certain elements can have dimension info if we invisibly show them
                // however, it must have a current display style that would benefit from this
                return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
                    jQuery.swap( elem, cssShow, function() {
                        return getWidthOrHeight( elem, name, extra );
                    }) :
                    getWidthOrHeight( elem, name, extra );
            }
        }
    };
});
{% endhighlight %}

这里最关键的一点是，判断如果元素是隐藏的，则调用`jQuery.swap()`，这个函数的作用是，临时为元素替换一些css属性，然后执行一个指定的函数，最后还原元素的css属性。其中参数`cssShow`对应了用于获取宽高所临时设置的属性，它的值是：

{% highlight javascript %}
var cssShow = { position: "absolute", visibility: "hidden", display: "block" };
{% endhighlight %}

这即是Tim Banks最初给出的处理方法。所以，获取隐藏元素的宽高的可行的做法是：*临时为元素设置特定的显示样式，然后读取元素的尺寸信息，最后再还原元素的样式*。

##补充信息##

MooTools一般所用的尺寸获取方法是`myElement.getSize();`，这个方法是不能获取隐藏元素的尺寸的。但是，MooTools在它的扩展包（mootools-more）内提供了一个`element.measure(fn);`，这个方法可以获取隐藏元素的尺寸。它是怎么做的呢，源码的一部分如下：

{% highlight javascript %}
Element.implement({

    measure: function(fn){
        if (isVisible(this)) return fn.call(this);
        var parent = this.getParent(),
            toMeasure = [];
        while (!isVisible(parent) && parent != document.body){
            toMeasure.push(parent.expose());
            parent = parent.getParent();
        }
        var restore = this.expose(),
            result = fn.call(this);
        restore();
        toMeasure.each(function(restore){
            restore();
        });
        return result;
    },

    expose: function(){
        if (this.getStyle('display') != 'none') return function(){};
        var before = this.style.cssText;
        this.setStyles({
            display: 'block',
            position: 'absolute',
            visibility: 'hidden'
        });
        return function(){
            this.style.cssText = before;
        }.bind(this);
    }
};
{% endhighlight %}

简单来说，`.meature()`方法调用了另一个`.expose()`方法，稍微看一下`.expose()`的定义就可以知道，也是使用了相同的临时样式设置，在读取尺寸信息后还原的做法。

MooTools的动画虽然不支持"show"作为属性值，但它支持一个特别的"100%"，正如这个数字所表示的那样，它也能满足你“动画执行到元素常规的样子”的要求。

啊？说了这么多，原来只是因为作者你不知道它支持这个值...

嗯...这就是过程啊...

##结语##

获取`display`为`none`的元素的尺寸，确实只是一个挺小的问题。不过，它却能在各大javascript库中有所体现。对源码做一些学习，也算是方便自己以后需要独自处理的时候能多些经验。


[img_result_of_genFx]: {{POSTS_IMG_PATH}}/201311/result_of_genFx.png "genFx()的返回值"

[stack_overflow_question]: http://stackoverflow.com/questions/1472303/jquery-get-width-of-element-when-not-visible-display-none  "jQuery - Get Width of Element when Not Visible (Display: None) - Stack Overflow"
[blog_link]: http://www.foliotek.com/devblog/getting-the-width-of-a-hidden-element-with-jquery-using-width/  "Getting the width of a hidden element with jQuery using width()"
