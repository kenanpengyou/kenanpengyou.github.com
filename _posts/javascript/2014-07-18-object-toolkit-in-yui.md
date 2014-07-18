---
layout: post
title: "YUI中对象合并的方法与原理"
category: "javascript"
description: "封装的功能模块都会有参数配置，这其中又有默认配置和用户配置之分。实际代码中，需要对默认配置和用户配置进行合并，这就是对象合并的问题。本文将初步分析YUI中的对象合并方法。"
---
{% include JB/setup %}

##起因：配置选项##

**“配置”（Config | Options | Settings）**对大家来说一定是非常熟悉的词。就以一般玩的游戏为例，很多游戏的主界面，搭配的菜单会是"start"，"load"，"config"，"exit"这样的搭配。在"config"中，我们可以调整游戏参数，比如音量、控制按键等，以更符合自己的游戏习惯。不过，也有游戏并没有"config"，这些游戏其实就是只有一个不允许修改的**“默认”（Defaults）**配置，而即使如此，这些游戏至少也会给你一份指南，告诉你应该如何按照预设进行游戏。

![游戏菜单示例][img_game_menu]

应用的配置这一环节的设计，其实就是要求要将配置数据从代码中分离出来。也就是说，那些可以被修改，或者将来可能会被修改的内容（这些内容也是代码），应该和指令类的代码区别开来，单独放在一个地方。这样，源码修改可以减少很多意外的错误。

javascript编写的封装的功能模块，比如常见的jQuery插件，一般都会这样分离出配置数据。下面是[slidesjs][]的使用范例：

{% highlight javascript %}
$("#slides").slidesjs({
    width: 940,
    height: 528
});
{% endhighlight %}

这里的`{width: 940, height: 528}`即是配置数据。不过，只是这些数据是不能独立支撑起完整的功能的。在封装的代码之内的，还隐藏着完整的初始配置数据，这就是**默认配置**。而像上面这样在实际使用时传入的配置数据，一般叫做**用户配置**。它们之间的关系是，如果同时包含对某一选项的配置值，用户配置会覆盖掉默认配置。

比如在Sublime Text中，就是这种设计（Default和User）：

![Sublime Text中的Settings][img_settings_in_sublime_text]

可以想到，**实际功能运行时，使用的配置数据既不是默认配置，也不是用户配置，而是这两个配置的结合**。在javascript中，配置数据都是对象（Object）的形式，因此，我们需要做**对象合并**。

在YUI的核心包（yui-core）中，就提供了对象合并有关的方法。

##YUI中的对象合并方法##

###浅合并的Y.merge()###

YUI提供了合并一个或更多对象到一个新的合并对象上的方法`Y.merge()`，在这里先使用它。假如有一个封装的功能模块（简单的游戏？），然后内部通过`Y.merge()`进行配置对象的合并：

{% highlight javascript %}
var myModule = function(userConfig){
    var defaults = {
        volume: 0,
        quality: "normal",
        control: {
            left: "left",
            right: "right",
            attack: "space"
        }  
    };

    var config = Y.merge(defaults, userConfig);

    // use the merged config to run this module...
};
{% endhighlight %}

对应上面已有的默认配置的形式，给出如下的用户配置：

{% highlight javascript %}
var userConfig = {
    quality: "high",
    control: {
        left: "a",
        right: "d",
        extra: "z"
    }
};
{% endhighlight %}

这里通过`Y.merge()`合并得到的`config`，输出结果是：

{% highlight javascript %}
{
    volume: 0,
    quality: "high",
    control: {
        left: "a",
        right: "d",
        extra: "z"
    }
}
{% endhighlight %}

可以看到，`volume`和`quality`的属性合并都达到了预想的要求。但是，属性`control`却像是忽略了默认值的部分，并不符合预想结果。这是因为，属性`control`的值并不是基本数据类型，而是引用数据类型（例如对象、数组或函数），因此这里的配置对象是包含多层次的复杂配置对象。`Y.merge()`并没有处理这样的情况，它的[源码][code_link_1]如下：

{% highlight javascript %}
Y.merge = function () {
    var i      = 0,
        len    = arguments.length,
        result = {},
        key,
        obj;
 
    for (; i < len; ++i) {
        obj = arguments[i];
 
        for (key in obj) {
            if (hasOwn.call(obj, key)) {
                result[key] = obj[key];
            }
        }
    }
 
    return result;
};
{% endhighlight %}

其中`hasOwn`是`Object.prototype.hasOwnProperty`。从上面的源码可以看出，`Y.merge()`只对直接属性（层级数为1）进行赋值，并没有分析属性的值类别。因此，在前面的对象合并中，`config`的`control`属性，实际上就和`userConfig`的`control`是同一个引用，如果在`config`上修改`control`对象，则也会改变`userConfig`的`control`对象。

不过，`Y.merge()`仍然是很有价值的对象合并方法。如果是单层次的配置对象，它足以实现预想的要求，这是它很有用的一个模式。此外，请注意这个方法创建了一个空对象`result`用作最终返回，而不是直接对参数进行操作，所以，`Y.merge()`方法不会影响作为参数的任一对象。

###更细致的Y.mix()###

为了应对更为复杂的对象合并要求，YUI提供了方法`Y.mix()`。`Y.mix()`不能像`Y.merge()`那样同时合并2个以上的对象，它的合并对象数目限定为2个，对应前2个参数，此外的参数都用作合并模式、方法的设置。`Y.mix()`搭配其多种模式和配置的控制，可以实现相当精细的两个对象的合并（方法叫做"mix"，所以也称为混合吧）。

`Y.mix()`的[源码][code_link_2]较多，不直接贴在本文中。YUI官方的注释写得很详细，不过在这里我也说一些我自己的理解。它的源码形式是：

{% highlight javascript %}
Y.mix = function(receiver, supplier, overwrite, whitelist, mode, merge) {
    // Y.mix() detail
);
{% endhighlight %}

`Y.mix()`有很多参数。前2个参数`receiver`和`supplier`如字面意思，分别对应合并操作的接收者和提供者。其余4个参数的意义分别是：

* `overwrite`，默认为`false`。如果为`true`则会开启属性覆盖。也就是说，默认情况下，提供者的属性是不会覆盖接受者的同名属性的。
* `whitelist`，白名单。可以指定一个数组，只有当提供者的属性名包含于白名单数组内时，属性才会被拷贝到接受者。
* `mode`，混合模式。可选值0、1、2、3、4分别对应5个模式。默认值为0，是object to object的合并方式。
* `merge`，默认为`false`。如果为`true`，对象上的值为引用数据类型的属性（也就是，当这是一个多层次的复杂对象时），每一个层级上的对象都会依次被合并，而不是被忽略（`overwrite`为`false`）或被直接覆盖（`overwrite`为`true`）。

上面的参数中，`overwrite`和`merge`的意义比较重要，其他的则一般使用`null`或默认值。为了理解`overwrite`和`merge`，直接进行不同搭配的合并测试（配置变量和前文一样）。测试代码和结果如下：

{% highlight javascript %}
// overwrite = false , merge = false | Y.mix()的最简单形式，默认值
var config = Y.mix(defaults, userConfig);
// 结果输出:
// {volume => 0, quality => normal, control => {left => left, right => right, attack => space}}

// overwrite = true , merge = false
var config = Y.mix(defaults, userConfig, true, null, 0, false);
// 结果输出:
// {volume => 0, quality => high, control => {left => a, right => d, extra => e}}

// overwrite = false , merge = true
var config = Y.mix(defaults, userConfig, false, null, 0, true);
// 结果输出:
// {volume => 0, quality => normal, control => {left => left, right => right, attack => space, extra => e}}

// overwrite = true , merge = true
var config = Y.mix(defaults, userConfig, true, null, 0, true);
// 结果输出:
// {volume => 0, quality => high, control => {left => a, right => d, attack => space, extra => e}}
{% endhighlight %}

可以看出，4个结果各不相同。从这些结果的具体情况，可以分析体会`overwrite`和`merge`的意义。注意到，当两者都为`true`时，得到的正是在配置对象合并中的一个理想结果。而当`overwrite = true, merge = false`时，得到的结果和`Y.merge()`相同。

阅读`Y.mix()`的源码，可以了解到，`merge`决定是否进行深合并。深合并的实现原理是递归，也就是对那些需要多层次合并的属性值（对象、数组），再次调用`Y.mix()`。`overwrite`决定是否进行覆盖，这就类似于电脑里做复制操作时，会提示同名文件是否覆盖的选项。

对于用作配置数据的对象而言，预期的最佳的合并方式就是允许覆盖，而且进行深合并。因此，`Y.mix(defaults, userConfig, true, null, 0, true)`即可以得到最适当的合并后的配置数据。

需要注意的是，`Y.mix()`直接对接收者进行操作，并返回接收者。所以，和`Y.merge()`不同，它一定会影响到作为第一个参数的对象。

如果可以确定配置数据是单层次的简单配置对象，那么使用`Y.merge()`要更简单方便。

##更多的工具##

YUI除了核心包内的上面两个方法外，还在`oop`模块中提供了一些处理对象的附加工具。其中包括了`Y.extend()`（单词意义：扩展），`Y.augment()`（单词意义：增强），`Y.aggregate()`（单词意义：聚合）。它们都类似于对象合并，而且有趣的是，其源码中都调用了`Y.mix()`方法。

这几个方法和前面的有哪些不同呢？本文限于篇幅，只简单说一些。`Y.aggregate()`是开启深合并的`Y.mix()`的一个方法糖，`Y.extend()`则要求参数是构造函数，它操作的是传入对象的`prototype`，并通过`prototype`建立继承关系（原型链），`Y.augment()`是从提供者拷贝方法到接收者，但它巧妙地隔离了所有拷贝的方法并延迟调用提供者的构造函数，直到你第一次调用被拷贝上去的新方法。

##有些关系的jQuery.extend()##

因为比较近似，所以在这里也提一下jQuery。

如果你写过jQuery插件，你肯定知道`jQuery.extend()`这个方法。事实证明，不同的javascript库，在命名理念上也是各有想法，在此请注意，`jQuery.extend()`和`Y.extend()`是完全不同的两个方法。阅读`jQuery.extend()`的源码可知，它仍然是在做传统的对象合并，而且同时允许声明一个可选的逻辑参数`deep`，来指定是否进行深合并。其深合并的实现方法依然是递归。

此外，类似于`Y.mix()`，`jQuery.extend()`也会影响到作为接收者的对象。官方文档对此还给了明确说明，如果希望不影响原来的对象，就使用`var object = $.extend({}, object1, object2);`这样以空对象作为接收者的写法。

##结语##

之所以想到写这个话题，大概就是因为YUI里有关对象合并很有几个不同的方法，我已经相当被它们弄晕了。所以，果断读源码，才能理清这其中的区别，也算是体会一下javascript库设立这些不同的方法的本因吧。

默认配置 + 用户配置 → 实际配置，结果来看也是一个不简单的转化计算式。

[img_settings_in_sublime_text]: {{POSTS_IMG_PATH}}/201407/settings_in_sublime_text.png "Sublime Text中的Settings"
[img_game_menu]: {{POSTS_IMG_PATH}}/201407/game_menu.png "游戏菜单示例"

[slidesjs]: http://slidesjs.com/  "SlidesJS"
[code_link_1]: http://yuilibrary.com/yui/docs/api/files/yui_js_yui-core.js.html#l86  "File: yui_js_yui-core.js - YUI Library"
[code_link_2]: http://yuilibrary.com/yui/docs/api/files/yui_js_yui-core.js.html#l118 "File: yui_js_yui-core.js - YUI Library"
