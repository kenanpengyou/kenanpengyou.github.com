---
layout: post
title: "来点CoffeeScript吗？"
category: "javascript"
description: "听名字就觉得很有怡然自得的氛围的CoffeeScript，如果还没有了解过，就认真了解一下吧！"
---
{% include JB/setup %}

## 简单易懂的介绍 ##

CoffeeScript是什么？

首先，它是一门**小巧的编程语言**。有一本关于CoffeeScript的指南，写作“The Little Book on CoffeeScript”：

![The Little Book on CoffeeScript][img_little_book_cover]

很小，是吗？

然后，它是一门**JavaScript的转译语言**。这个转译过程看起来像这样：

![CoffeeScript to Javascript][img_coffee_simple_compile]

`.coffee`的文件将会被编译为`.js`的文件，然后，就像使用JavaScript那样使用它！

在[coffeescript.org][]上有这样一句话：

 > The golden rule of CoffeeScript is: "It's just JavaScript".

也就是说，良好的面对CoffeeScript的心态是，“它只是JavaScript”！

## 更少代码 ##

CoffeeScript可以让你少写一点代码。请看下图：

![.js to .coffee][img_coffee_less_code]

可见，CoffeeScript精简了JavaScript的`{}`、`()`、`;`等符号的使用，并为`function`、`this`等关键字定义了简单的符号表示法。这些风格转换都使得CoffeeScript代码量更少。

一般来说，CoffeeScript可以缩短大约1 / 3的代码长度。

## 语言特性增强 ##

CoffeeScript较JavaScript在语言特性上进行了改善。在CoffeeScript中，所有的变量声明都不再使用`var`关键字：

{% highlight coffee %}
number = 1.0
{% endhighlight %}

CoffeeScript在编译时会自动分析上面这样的语句，如果被赋值的变量未被定义，会在作用域顶部用`var`定义变量（由`.coffee`编译得到的`.js`）。这就避免了意外创建全局变量。如果要在CoffeeScript中声明全局变量，必须用显式的代码定义：

{% highlight coffee %}
window.paintSize = 10
{% endhighlight %}

CoffeeScript为字符串拼接提供了更方便的写法，例如：

{% highlight coffee %}
drawTitle = "Start from #{number}."
{% endhighlight %}

其中`number`会取作用域中的对应变量。

CoffeeScript使用`is`表示`===`，不推荐的`==`和`!=`将不能使用。例如：

{% highlight coffee %}
"draw" if 1 is true
{% endhighlight %}

其他的语义化的转化：

![CoffeeScript语义转化][img_coffee_keyword]

CoffeeScript默认将最后一条语句作为返回值（受启发于Ruby），例如：

{% highlight coffee %}
description = ->
    console.log "Thinking."
    @
{% endhighlight %}

将等同于：

{% highlight javascript %}
description = function() {
    console.log("Thinking.");
    return this;
};
{% endhighlight %}

## 可能有用的一些说明 ##

### 隐式括号 ###

在CoffeeScript中，允许用空格的形式来表示括号，这称为**隐式括号**。但是，隐式括号使用不当会带来一些问题，例如：

{% highlight coffee %}
console.log Math.floor 1.7, Math.ceil 1.7
{% endhighlight %}

编译为`.js`将是：

{% highlight javascript %}
console.log(Math.floor(1.7, Math.ceil(1.7)));
{% endhighlight %}

这可能不是你想要的结果。关于隐式括号需要理解的一点是：**直到表达式末尾，隐式括号才会闭合**。所以，建议的写法是，单条语句只在第一处位置使用隐式括号，其他位置都显式地把括号写出来。例如：

{% highlight coffee %}
console.log Math.floor(1.7), Math.ceil(1.7)
{% endhighlight %}

将正确编译为：

{% highlight javascript %}
console.log(Math.floor(1.7), Math.ceil(1.7));
{% endhighlight %}

此外，不带参数的函数调用，将不能省略括号。例如你想要`init();`语句，那么在CoffeeScript中你也需要写作`init()`。

### 语句都是表达式 ###

**在CoffeeScript中，所有的语句都视为表达式**。请看这样的语句：

{% highlight coffee %}
name = if 1 is true 
    "green tea" 
else 
    "black tea"
{% endhighlight %}

这在CoffeeScript中是合法的，将被编译为：

{% highlight javascript %}
name = 1 === true ? "green tea" : "black tea";
{% endhighlight %}

因此可以正常运行。类似的，其他种类的语句也可以这样使用，CoffeeScript都会很好地处理它们。

## 从CoffeeScript中学习JavaScript ##

CoffeeScript所做的很多语言特性增强，都来源于JavaScript的最佳实践。看一看编译后的JavaScript，就可以了解到CoffeeScript是如何实现的，这可能对学习JavaScript也有所帮助。例如，CoffeeScript可使用`?`在赋值之前检查变量是否存在：

{% highlight coffee %}
draw?.tool = "pencil"
{% endhighlight %}

编译后的代码：

{% highlight javascript %}
if (typeof draw !== "undefined" && draw !== null) {
    draw.tool = "pencil";
}
{% endhighlight %}

这里CoffeeScript展示了JavaScript的“空比较”的最正确的方法。

再例如，CoffeeScript可使用`=>`来定义绑定上下文（`this`）的函数：

{% highlight coffee %}
rest = (drink) =>
    @status = "Have a #{drink}!"
{% endhighlight %}

对应`.js`是：

{% highlight javascript %}
rest = (function(_this) {
    return function(drink) {
        return _this.status = "Have a " + drink + "!";
    };
})(this);
{% endhighlight %}

可以看到CoffeeScript用了一个特定结构实现了函数绑定，这个写法也同样是有用的参考。

## CoffeeScript调试的问题 ##

你可能也想到了，如果需要调试，浏览器的错误提示是针对编译后的JavaScript而不是原CoffeeScript，因此调试分析会比较麻烦。这是事实，但我认为影响不大，有以下几点原因：

* 语法错误会在CoffeeScript编译时提示，这个提示针对CoffeeScript源码，可以预先看到（如果不修正，是不能得到编译后的JavaScript的）。
* CoffeeScript和JavaScript实现同一逻辑功能的结构差异较小，如果有错误，可以类比推断。
* CoffeeScript支持Source Maps，可以在编译同时生成`.map`文件，帮助调试。

## 其他JavaScript的转译语言 ##

可以转译为JavaScript的语言一般称为**altJS**（**Alternative JavaScript**）。JavaScript语言本身有较多不方便、有缺陷的地方，且自由度过高，因人和JavaScript库的不同，代码风格可能会相差很大，难于维护。因此，使用altJS将是有效的解决方法之一。

除本文介绍的CoffeeScript外，主流alsJS还有[TypeScript][]和[Haxe][]。其中Haxe除JavaScript外，还可以编译为其他各类平台的语言，如C++、C#、Java等，算是通用型编程语言。根据实际开展工作的需要，这些altJS也都值得尝试。

![altJS][img_altJS]

## 结语 ##

总的来说，CoffeeScript相比JavaScript，写起来代码会少一点，好用的语言特性要多一点，大概就像是在用一种更标准的形式使用JavaScript。

“它只是JavaScript”，保持这样的心态，CoffeeScript也许可以帮到你。

![休息一下...][img_coffee_chino_draw]

[img_little_book_cover]: {{POSTS_IMG_PATH}}/201411/little_book_cover.jpg "The Little Book on CoffeeScript"
[img_coffee_simple_compile]: {{POSTS_IMG_PATH}}/201411/coffee_simple_compile.png "CoffeeScript to Javascript" 
[img_coffee_less_code]: {{POSTS_IMG_PATH}}/201411/coffee_less_code.gif ".js to .coffee" 
[img_altJS]: {{POSTS_IMG_PATH}}/201411/altJS.png "altJS"
[img_coffee_keyword]: {{POSTS_IMG_PATH}}/201411/coffee_keyword.png "CoffeeScript语义转化"
[img_coffee_chino_draw]: {{POSTS_IMG_PATH}}/201411/coffee_chino_draw.jpg "休息一下..."

[coffeescript.org]: http://coffeescript.org/ "CoffeeScript"
[TypeScript]: http://www.typescriptlang.org/ "TypeScript"
[Haxe]: http://haxe.org/ "Haxe - The Cross-platform Toolkit"
