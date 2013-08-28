---
layout: post
title: "写给初学者的javascript知识"
category: "javascript"
description: "对初学者而言，如何学习javascript可能是一件困惑的事。javascript作为一门网络浏览器中建立起来的程序设计语言，发展到现在却已经包含了非常丰富的内容。可以用javascript实现简单的交互功能，和专业的使用javascript开发web应用之间，差距是非常巨大的。我自己在javascript的后续学习中的感触是：如果在开始的时候就对javascript有一个更深刻、准确的认识，会更有利于后续的深入学习。本文是我根据自己的学习经历，所总结的适于初学者了解的javascript知识。"
extraJS: ["posts/201307/javascript-for-beginners.js"]
---
{% include JB/setup %}

最初学习javascript时，我还没有想到它是一门包含丰富内容的独立程序设计语言。和过去可以找到的很多javascript教程中描述的一样，我对它的看法就是它对应于web网页的行为层，用于实现在网页中的各种交互效果。这的确是对javascript的正确描述，在如今看来也是。

只是，这样的认识容易产生对javascript的低估。web领域的发展是迅速的，javascript也一样。javascript最初只是被设计为用来实现表单验证的客户端语言，现在你却可以看到有许多杰出的开发者使用它做出了非常出色的应用，而且已不再限于浏览器客户端的范围。这些都展现了javascript的巨大威力。因此，要以新的观念来看待javascript。

javascript所包含的知识和内容是非常多的，即使只介绍基础部分，也远非一篇文章的篇幅可以做到的。因此，本文会较多地从轮廓的角度来描述知识点，但也会针对一部分内容做细节说明，希望对准备学习，或正在学习javascript的你有所帮助。

##javascript是什么##

*javascript是一门程序设计语言*。此外，在很多的地方，你都可以看到有描述称javascript是*灵活的*（*flexible*），这种灵活体现在javascript的语法和结构上（后文会有说明）。还有一个有趣的点是你可以看到javascript包含了java一词，但事实是它们之间几乎没有什么关系。

##javascript可以做什么##

在过去，javascript被认定为是一种由浏览器解释运行的客户端语言，因此存在一些固有限制，如javascript不能写服务器机器上的文件，某一网页中的javascript不能从来自另一个服务器的已经打开的网页中读取信息（很显然，这是为了用户安全）。如今，浏览器已经不是解释运行javascript的唯一环境，而且新的浏览器也在保证用户安全的基础上，考虑允许javascript实现更多的功能。在现在的web网页开发中，javascript可以实现的，可以说几乎包含了你可以想到的任何事情。

javascript作为一门独立的程序设计语言，也已被应用到了更多领域。[CommonJS][]是一个项目团队，致力于为javascript创建可用于更广泛的应用程序编程的环境（提供运行环境和API），并制定规范。其宗旨是javascript: not just for browsers any more!。其目标是使javascript也可以像其他程序设计语言一样实现服务器端操作，命令行，文件读取等功能。比较有名的[Node.js][]，可以看做是CommonJS的其中一部分的实现。

![CommonJS][img_CommonJS_Logo]

##如何使用javascript##

在web网页开发中，javascript的引入是使用`<script>`标签，如果是在html中直接写，则是：

{% highlight html %}
<script type="text/javascript">
    alert("The quick brown fox jumps over the lazy dog.");
</script>
{% endhighlight %}

更常用的方式是写在单独的.js文件中（实际上，拓展名也不是必须的），然后通过`<script>`标签引用：

{% highlight html %}
<script type="text/javascript" src="example.js"></script>
{% endhighlight %}

上面两段代码中，`<script>`的`type`属性不是必须的。出于性能优化的考虑，`<script>`最好放在页面代码最下部，也即`</body>`标签之前。

`<script>`是把代码加载和执行合并在一起的，每一段`<script>`都会在加载完成后立即执行（严格的说，是在不写`async`和`defer`属性的情况下）。

##javascript中可以介绍的语法##

###区分大小写###

比如`yuki`和`Yuki`是两个不同的变量。

###松散类型的变量###

变量的声明是javascript代码中最常见的，使用关键字`var`。javascript尤其特别的是，它的变量是*松散类型*的。也就是说，任一声明的变量都可以存储任何类型的数据。这也一定程度上体现了javascript的高自由度。

变量声明中，不使用`var`也是有效的，但这样会一般造成定义额外的全局变量。根据javascript的最佳实践，全局变量应该尽量避免，因此在变量声明中一定要使用`var`关键字。

javascript中一共有5种简单数据类型（也称为*基本数据类型*），和1种复杂数据类型（也称为*引用数据类型*），如下：

{% highlight javascript %}
var typeA = undefined, //Undefined类型 这里写成 var typeA; 也是一样的
    typeB = null, //Null类型 空
    typeC = false, //Boolean类型 逻辑值
    typeD = "twitter", //String类型 字符串
    typeE = 1.5, //Number类型 数字

    typeF = new Object(), //Object类型 对象
    typeG = ["elem1", "elem2"], //Array类型 数组
    typeH = new Date(2013, 7, 19), //Date类型 日期
    typeI = /^\stext\s$/, //RegExp类型 正则表达式
    typeJ = function(){}; //Function类型 函数
{% endhighlight %}

像这样在变量初始化的时候通过初始值说明变量的数据类型，是一个好的实践。变量在未做初始化时，默认值为`undefined`（未定义）。上面这段代码中，空行之上的正好对应5种基本数据类型，之下的都属于引用数据类型。你可能会惊奇下面看起来应该是多种类型，但事实上，它们虽然有不同，但都属于引用数据类型，即Object。

[Douglas Crockford][]在[Private Members in JavaScript][]一文中提到：

> JavaScript is fundamentally about objects. Arrays are objects. Functions are objects. Objects are objects. 

意思是说，javascript是以Object为基础的语言，除基本数据类型外，其他所有的引用数据类型，本质上都是Object。

函数是特殊的Object，通过关键字`function`声明。它比Object多的一个功能是可以存储任意数量的语句，并且可以通过在函数名后加`()`的形式调用，从而执行自身所存储的语句（而且可以传递任意数量的参数）。

###理解Object###

*Object是一组数据和功能的集合*。一个简单的Object的示例：

{% highlight javascript %}
var myObject = {}; //和 new Object() 相同
myObject.name = "yuki"; //属性
myObject.sayHello = function() { //方法
    alert("Hello! My name is " + this.name);
};
alert(myObject.name); // "yuki"
myObject.sayHello(); // "Hello! My name is yuki"
{% endhighlight %}

这里`name`是`myObject`的一个属性，而`sayHello`是它的一个方法。可以看到，访问属性，或者调用方法，都是通过点语法`.`来实现的。这种使用方法你一定非常熟悉，jQuery就是全局创建了一个名为`jQuery`（如果不冲突，还有别名`$`）的Object，然后把所有的方法都定义在了这个Object中。

###对象字面量###

Object的定义还有一种方式，称为对象字面量表示法，它是定义Object的一种简写形式。比如前面的`myObject`，用对象字面量表示法来写的话，是：

{% highlight javascript %}
var myObject = {
    name: "yuki",
    sayHello: function() {
        alert("Hello! My name is " + this.name);
    }
};
{% endhighlight %}

可以看出，这种写法是，从花括号`{`开始，到花括号`}`结束，通过 属性名：属性值 的形式，依次定义不同的属性。不同的属性之间以逗号`,`分隔，但最后一个属性定义后面没有逗号。

对象字面量被极多地运用于各类javascript库中，因为这种语法要求的代码量少，而且有封装数据的感觉，更受开发人员青睐。

数据交换格式JSON（JavaScript Object Notation）的写法和对面字面量非常近似。比如下面这段JSON数据：（自动化工具[Grunt][]用到的`package.json`配置文件）

{% highlight json %}
{
    "name": "Test App",
    "version": "1.0.0",
    "devDependencies": {
        "grunt": "~0.4.1",
        "grunt-contrib-concat": "~0.1.1"
    }
}
{% endhighlight %}

和对象字面量相比，JSON对象还是有一些不同。JSON中没有声明变量，同时因为不是javascript语句，末尾没有分号。而且，JSON中，只能使用双引号（javascript中，字符串用单引号和双引号都是可行的），而且属性名也必须有双引号。

虽然具有相同的语法形式，但JSON并不从属于javascript。关于JSON的更多信息，你可以阅读官方的[JSON介绍][]。

##如何写javascript来实现功能##

在学习javascript中，我们更关注的是如何实现一些想要的功能。一般来说，需要实现的功能都是*事件驱动*（*Event Driven*）的。在初期，这种功能实现会有一个常用的流程写法。jQuery设计的语法非常贴合这个流程。请看下面这个示例：

<div class="post_display" style="width:30px;height:30px;padding:5px;border:1px solid #aaa;">
    <div id="box" style="width:30px;height:30px;background:#a1e466;"></div>
</div>

框中的填充矩形会在点击后消失。对应的使用jQuery的javascript代码是：

{% highlight javascript %}
$("#box").on("click",function(event){
    this.style.display="none";
});
{% endhighlight %}

可以看出，实现一个事件驱动的功能分为三部分，如下：

![事件驱动的功能的初级实现流程][img_elementary_procedure_of_event_driven]

参照这样的逻辑，按照顺序写代码就可以实现初级的事件驱动。如果前面的功能使用原生javascript来实现，则是：

{% highlight javascript %}
//获取元素
var box = document.getElementById("box");
//为元素添加事件处理
box.onclick = function(event) {
    //事件处理内容：该元素不再显示， display = "none"
    this.style.display = "none";
};
{% endhighlight %}

你可能会觉得原生javascript也并没有多复杂。这是因为这个示例的功能非常简单，而且没有触及存在浏览器兼容性差异的部分。jQuery提供的是简化的、方便的高层次接口，而为了做到这一点，jQuery实际在我们视线之外的区域做了很多复杂的工作，帮助处理原生javascript的浏览器兼容和功能不足等问题。因此，使用jQuery这类javascript库可以让我们的精力更好地集中在程序实现逻辑上。

##完整的javascript实现的其他组成部分##

前面所提到语法和实现属于javascript核心（称为ECMAScript，是一种语言标准）。除此以外，完整的javascript还包括另外两部分：*浏览器对象模型*（*BOM*）和*文档对象模型*（*DOM*）。

###BOM###

*BOM*（*Browser Object Model*）提供了很多Object对象，用于访问浏览器的功能。其中核心对象是`window`，javascript中的一些全局方法，如`setTimeout()`、`alert()`等，都是定义在`window`对象上。

比如下面一个使用BOM的示例：

{% highlight javascript %}
setTimeout(function() {
    window.location = "http://acgtofe.com";
}, 1000);
{% endhighlight %}

其功能是1s后跳转到其他网页。

###DOM###

*DOM*（*Document Object Model*）已是W3C的一个推荐标准，为基本的文档结构和查询提供的接口，它本质上是独立于javascript的，不过，在javascript中可以而且经常需要使用它。

DOM很容易理解，它描述的就是任何HTML或XML文档中的由各个节点构成的树形结构。比如下面这段HTML：

{% highlight html %}
<div class="wrapper">
    <h3 class="title">Sample Title</h3>
    <p class="content">Introduction.</p>
</div>
{% endhighlight %}

对应的树形结构是：

![dom树形结构][img_dom_tree]

##javascript调试##

javascript调试最常用的是全局方法`console.log()`，可以用它输出想要跟踪查看的变量，或者单纯地输出一些字符串说明调试语句所在的代码段有没有被执行到。

浏览器的开发者工具，在控制台中可以查看到当前页面的输出信息（通过`console.log()`），以及javascript错误。错误信息还会说明错误位置（文件名，行，列），错误类别，错误说明。

![javascript错误信息][img_javascript_debug_in_firebug]

##Ajax##

*Ajax*（*Asynchronous JavaScript and XML*）可以说是真正让javascript流行起来的原因。Ajax的技术核心是XMLHttpRequest对象，它使得javascript可以在任何时候和服务器进行通讯而不必刷新整个页面。

比如服务器端的一个`test.php`文件内容如下：

{% highlight php %}
<?php
    echo "Here is the server.";
?>
{% endhighlight %}

实现Ajax的javascript代码（原生javascript需要较为繁琐的代码，因此这里使用了javascript库Mootools）：

{% highlight javascript %}
var myRequest = new Request({
    method: "get",
    url: "test.php",
    onSuccess: function(responseText) {
        $("elem").set("text", responseText);
    }
});
myRequest.send();
{% endhighlight %}

这段代码所要做的是，获取`test.php`返回的文本信息，然后把它写入到一个id是`elem`的元素内。这个实例的效果是：

![Ajax实例效果][img_ajax_result]

这个简单的Ajax实例是为了说明，Ajax虽然概念看上去比较复杂，但理解起来是不难的。

##进阶的javascript##

要成为更专业的前端开发者，则需要对javascript有更深刻的认识和理解。javascript虽然能实现各种各样的功能，但只是初级的写法是难以应付更为复杂庞大的web应用的。很多直接按过程编写下来的代码（一般也称为硬编码 hard coded），会因为对情况的限定和依赖较强（高耦合），无法被复用。所以，在javascript的进阶学习阶段，需要考虑的就是编写可维护的javascript。看一下这段代码：

{% highlight javascript %}
function SuperType(name) {
    this.name = name;
}
SuperType.prototype.sayName = function() {
    alert(this.name);
};
function SubType(name, age) {
    SuperType.call(this, name);
    this.age = age;
}
SubType.prototype = new SuperType();
//使用时
var instance1 = new SubType("AIR", 17);
{% endhighlight %}

这段代码表述的是javascript的面向对象的程序设计（即非过程）中的组合继承。与它有关的概念对于javascript的初学者来说很有一定难度，但它们对于javascript模块化和独立复用有很大的帮助。如果你开始理解并使用它们，你会感受到javascript语言本身的独特魅力。前面说过javascript比较自由，而越是自由的程序设计语言，越能够体现程序编写者的出色的代码设计构思。

对javascript有一定的功能实现的经验后，就应该学习*javascript设计模式*。设计模式是针对程序设计语言中的各类问题的解决方案，可以帮助你了解专业的javascript代码是如何规划和设计的。如果你希望读懂jQuery这类javascript库的源码，就一定要懂得设计模式。

##结语##

看到这里，你可能会觉得这篇文章好像什么也没说。事实上，我在整理这些信息的时候，就确切的感到，javascript的知识真的是很多的，本文只是在尝试以一个全局的视野来描述这门程序设计语言。我也是javascript的学习者之一，所以这些也是我目前对javascript的理解。

以后关于javascript的一些有趣的细节，我会再做详细的探讨。（目前肯定是还有很多待学习的点的... ￣▽￣ ）

[img_CommonJS_Logo]: {{POSTS_IMG_PATH}}/201307/CommonJS_Logo.png "CommonJS"
[img_elementary_procedure_of_event_driven]: {{POSTS_IMG_PATH}}/201307/elementary_procedure_of_event_driven.png "事件驱动的功能的初级实现流程"
[img_javascript_debug_in_firebug]: {{POSTS_IMG_PATH}}/201307/javascript_debug_in_firebug.png "javascript错误信息"
[img_dom_tree]: {{POSTS_IMG_PATH}}/201307/dom_tree.png "javascript错误信息"
[img_ajax_result]: {{POSTS_IMG_PATH}}/201307/ajax_result.png "Ajax实例效果"

[CommonJS]: http://commonjs.org/  "CommonJS"
[Node.js]: http://www.nodejs.org/ "Node.js"
[Douglas Crockford]: http://www.crockford.com/ "Douglas Crockford"
[Private Members in JavaScript]: http://javascript.crockford.com/private.html "Private Members in JavaScript"
[Grunt]: http://gruntjs.com/ "Grunt"
[JSON介绍]: http://www.json.org/json-zh.html "JSON"