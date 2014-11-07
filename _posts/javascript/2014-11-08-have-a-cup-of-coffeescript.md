---
layout: post
title: "CoffeeScript"
category: "javascript"
description: "来点CoffeeScript吗？"
---
{% include JB/setup %}

##简单易懂的介绍##

CoffeeScript是什么？

首先，它是一门**小巧的编程语言**。有一本关于CoffeeScript的指南，写作“The Little Book on CoffeeScript”：

![The Little Book on CoffeeScript][img_little_book_cover]

很小，是吗？

然后，它是一门**JavaScript的转译语言**。这个转译过程看起来像这样：

![CoffeeScript to Javascript][img_coffee_simple_compile]

`.coffee`的文件将会被编译为`.js`的文件，然后，就像使用JavaScript那样使用它！

在[coffeescript.org][]上有这样一句话：

 > The golden rule of CoffeeScript is: "It's just JavaScript".

也就是说，良好的面对CoffeeScript的心态是，“它只是JavaScript！”

##更少代码##

CoffeeScript可以让你少写一点代码。请看下图：

![.js to .coffee][img_coffee_less_code]

可见，CoffeeScript精简了JavaScript的`{}`、`()`、`;`等符号的使用，并为`function`、`this`等关键字定义了简单的符号表示法。这些风格转换都使得CoffeeScript代码量更少。

一般来说，CoffeeScript可以缩短大约1 / 3的代码长度。

##语言特性增强##

CoffeeScript对JavaScript语言本身所存在的一些缺陷进行了改善。在CoffeeScript中，所有的变量声明都不再使用`var`关键字：

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

##可能有用的几点说明##

###空格与括号###

CoffeeScript允许你使用空格来表示函数调用，例如：

{% highlight coffee %}
# alert("pencil");
alert "pencil"

# also valid
alert("pencil")
{% endhighlight %}

但同时，CoffeeScript也




##结语##

最近在完成某个日期和时间有关的功能时，发现自己对诸如UTC这样的概念都没有什么印象。所以，果断地自己补习了一下，然后整理成了这篇文章。

[img_little_book_cover]: {{POSTS_IMG_PATH}}/201411/little_book_cover.jpg "The Little Book on CoffeeScript"
[img_coffee_simple_compile]: {{POSTS_IMG_PATH}}/201411/coffee_simple_compile.png "CoffeeScript to Javascript" 
[img_coffee_less_code]: {{POSTS_IMG_PATH}}/201411/coffee_less_code.gif ".js to .coffee" 

[coffeescript.org]: http://coffeescript.org/ "CoffeeScript"

