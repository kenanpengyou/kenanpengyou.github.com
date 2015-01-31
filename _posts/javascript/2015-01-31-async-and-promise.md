---
layout: post
title: "异步JavaScript与Promise"
category: "javascript"
description: "异步JavaScript有时候会给我们带来难题，Promise就是来解决这些的！"
---
{% include JB/setup %}

##异步？##

我在很多地方都看到过**异步(Asynchronous)**这个词，但在我还不是很理解这个概念的时候，却发现自己常常会被当做“已经很清楚”(*￣ﾛ￣)。

如果你也有类似的情况，没关系，搜索一下这个词，就可以得到大致的说明。在这里，我会对JavaScript的异步做一点额外解释。

看一下这段代码：

{% highlight javascript %}
var start = new Date();
setTimeout(function(){
    var end = new Date();
    console.log("Time elapsed: ", end - start, "ms");
}, 500);
while (new Date - start < 1000) {};
{% endhighlight %}

这段代码运行后会得到类似`Time elapsed: 1013ms`这样的结果。 `setTimeout()`所设定的在未来500ms时执行的函数，实际等了比1000ms更多的时间后才执行。

要如何解释呢？调用`setTimeout()`时，一个延时事件被排入队列。然后，继续执行这之后的代码，以及更后边的代码，直到没有任何代码。没有任何代码后，JavaScript线程进入空闲，此时JavaScript执行引擎才去翻看队列，在队列中找到“应该触发”的事件，然后调用这个事件的处理器（函数）。处理器执行完成后，又再返回到队列，然后查看下一个事件。

单线程的JavaScript，就是这样通过队列，以事件循环的形式工作的。所以，前面的代码中，是用`while`将执行引擎拖在代码运行期间长达1000ms，而在全部代码运行完回到队列前，任何事件都不会触发。这就是JavaScript的异步机制。

##JavaScript的异步难题##

JavaScript中的异步操作可能不总是简单易行的。

Ajax也许是我们用得最多的异步操作。以jQuery为例，发起一个Ajax请求的代码一般是这样的：

{% highlight javascript %}
// Ajax请求示意代码
$.ajax({
    url: url,
    data: dataObject,
    success: function(){},
    error: function(){}
});
{% endhighlight %}

这样的写法有什么问题吗？简单来说，不够轻便。为什么一定要在发起请求的地方，就要把`success`和`error`这些回调给写好呢？假如我的回调要做很多很多的事情，是要我想起一件事情就跑回这里添加代码吗？

再比如，我们要完成这样一件事：有4个供Ajax访问的url地址，需要先Ajax访问第1个，在第1个访问完成后，用拿到的返回数据作为参数再访问第2个，第2个访问完成后再第3个...以此到4个全部访问完成。按照这样的写法，似乎会变成这样：

{% highlight javascript %}
$.ajax({
    url: url1,
    success: function(data){
        $.ajax({
            url: url2,
            data: data,
            success: function(data){
                $.ajax({
                    //...
                });
            }    
        });
    }
})
{% endhighlight %}

你一定会觉得这种称为Pyramid of Doom（金字塔厄运）的代码看起来很糟糕。习惯了直接附加回调的写法，就可能会对这种一个传递到下一个的异步事件感到无从入手。为这些回调函数分别命名并分离存放可以在形式上减少嵌套，使代码清晰，但仍然不能解决问题。

另一个常见的难点是，同时发送两个Ajax请求，然后要在两个请求都成功返回后再做一件接下来的事，想一想如果只按前面的方式在各自的调用位置去附加回调，这是不是好像也有点难办？

适于应对这些异步操作，可以让你写出更优雅代码的就是Promise。

##Promise上场##

Promise是什么呢？先继续以前面jQuery的Ajax请求示意代码为例，那段代码其实可以写成这个样子：

{% highlight javascript %}
var promise = $.ajax({
    url: url,
    data: dataObject
});
promise.done(function(){});
promise.fail(function(){});
{% endhighlight %}

这和前面的Ajax请求示意代码是等效的。可以看到，Promise的加入使得代码形式发生了变化。Ajax请求就好像变量赋值一样，被“保存”了起来。这就是封装，封装将真正意义上让异步事件变得容易起来。

###封装是有用的###

Promise对象就像是一个封装好的对异步事件的引用。想要在这个异步事件完成后做点事情？给它附加回调就可以了，不管附加多少个也没问题！

jQuery的Ajax方法会返回一个Promise对象（这是jQuery1.5重点增加的特性）。如果我有`do1()`、`do2()`两个函数要在异步事件成功完成后执行，只需要这样做：

{% highlight javascript %}
promise.done(do1);
// Other code here.
promise.done(do2);
{% endhighlight %}

这样可要自由多了，我只要保存这个Promise对象，就在写代码的任何时候，给它附加任意数量的回调，而不用管这个异步事件是在哪里发起的。这就是Promise的优势。

###正式的介绍###

Promise应对异步操作是如此有用，以至于发展为了CommonJS的一个规范，叫做[Promises/A][]。Promise代表的是某一操作结束后的返回值，它有3种状态：

- **肯定（fulfilled或resolved）**，表明该Promise的操作成功了。
- **否定（rejected或failed）**，表明该Promise的操作失败了。
- **等待（pending）**，还没有得到肯定或者否定的结果，进行中。

此外，还有1种名义上的状态用来表示Promise的操作已经成功或失败，也就是肯定和否定状态的集合，叫做**结束（settled）**。Promise还具有以下重要的特性：

- 一个Promise只能从等待状态转变为肯定或否定状态一次，一旦转变为肯定或否定状态，就再也不会改变状态。
- 如果在一个Promise结束（成功或失败，同前面的说明）后，添加针对成功或失败的回调，则回调函数会立即执行。

想想Ajax操作，发起一个请求后，等待着，然后成功收到返回或出现错误（失败）。这是否和Promise相当一致？

进一步解释Promise的特性还有一个很好的例子：jQuery的`$(document).ready(onReady)`。其中`onReady`回调函数会在DOM就绪后执行，但有趣的是，如果在执行到这句代码之前，DOM就已经就绪了，那么`onReady`会立即执行，没有任何延迟（也就是说，是同步的）。

##Promise示例##

###生成Promise###

[Promises/A][]里列出了一系列实现了Promise的JavaScript库，jQuery也在其中。下面是用jQuery生成Promise的代码：

{% highlight javascript %}
var deferred = $.Deferred();
deferred.done(function(message){console.log("Done: " + message)});
deferred.resolve("morin");  // Done: morin
{% endhighlight %}

jQuery自己特意定义了名为Deferred的类，它实际上就是Promise。`$.Deferred()`方法会返回一个新生成的Promise实例。一方面，使用`deferred.done()`、`deferred.fail()`等为它附加回调，另一方面，调用`deferred.resolve()`或`deferred.reject()`来肯定或否定这个Promise，且可以向回调传递任意数据。

###合并Promise###

还记得我前文说的同时发送2个Ajax请求的难题吗？继续以jQuery为例，Promise将可以这样解决它：

{% highlight javascript %}
var promise1 = $.ajax(url1),
promise2 = $.ajax(url2),
promiseCombined = $.when(promise1, promise2);
promiseCombined.done(onDone);
{% endhighlight %}

`$.when()`方法可以合并多个Promise得到一个新的Promise，相当于在原多个Promise之间建立了AND（逻辑与）的关系，如果所有组成Promise都已成功，则令合并后的Promise也成功，如果有任意一个组成Promise失败，则立即令合并后的Promise失败。

###级联Promise###

再继续我前文的依次执行一系列异步任务的问题。它将用到Promise最为重要的`.then()`方法（在Promises/A规范中，也是用“有`then()`方法的对象”来定义Promise的）。代码如下：

{% highlight javascript %}
var promise = $.ajax(url1);
promise = promise.then(function(data){
    return $.ajax(url2, data);
});
promise = promise.then(function(data){
    return $.ajax(url3, data);
});
// ...
{% endhighlight %}

Promise的`.then()`方法的完整形式是`.then(onDone, onFail, onProgress)`，这样看上去，它像是一个一次性就可以把各种回调都附加上去的简便方法（`.done()`、`.fail()`可以不用了）。没错，你的确可以这样使用，这是等效的。

但`.then()`方法还有它更为有用的功能。如同then这个单词本身的意义那样，它用来清晰地指明异步事件的前后关系：“先这个，然后（then）再那个”。这称为Promise的级联。

要级联Promise，需要注意的是，在传递给`then()`的回调函数中，一定要返回你想要的代表下一步任务的Promise（如上面代码的`$.ajax(url2, data)`）。这样，前面被赋值的那个变量才会变成新的Promise。而如果`then()`的回调函数返回的不是Promise，则`then()`方法会返回最初的那个Promise。

应该会觉得有些难理解？从代码执行的角度上说，上面这段带有多个`then()`的代码其实还是被JavaScript引擎运行一遍就结束。但它就像是写好的舞台剧的剧本一样，读过一遍后，JavaScript引擎就会在未来的时刻，依次安排演员按照剧本来演出，而演出都是异步的。`then()`方法就是让你能写出异步剧本的笔。

##将Promise用在基于回调函数的API##

前文反复用到的`$.ajax()`方法会返回一个Promise对象，这其实只是jQuery特意提供的福利。实际情况是，大多数JavaScript API，包括Node.js中的原生函数，都基于回调函数，而不是基于Promise。这种情况下使用Promise会需要自行做一些加工。

这个加工其实比较简单和直接，下面是例子：

{% highlight javascript %}
var deferred = $.Deferred();
setTimeout(deferred.resolve, 1000);
deferred.done(onDone);
{% endhighlight %}

这样，将Promise的肯定或否定的触发器，作为API的回调传入，就变成了Promise的处理模式了。

##Promise是怎么实现出来的？##

本文写Promise写到这里，你发现了全都是基于已有的实现了Promise的库。那么，如果要自行构筑一个Promise的话呢？

位列于[Promises/A][]的库列表第一位的[Q][]可以算是最符合Promises/A规范且相当直观的实现。如果你想了解如何做出一个Promise，可以参考Q提供的[设计模式解析][]。

限于篇幅，本文只介绍Promise的应用。我会在以后单独开一篇文章来详述Promise的实现细节。

作为JavaScript后续版本的ECMAScript 6将原生提供Promise，如果你想知道它的用法，推荐阅读[JavaScript Promises: There and back again][]。

##结语##

Promise这个词顽强到不适合翻译，一眼之下都会觉得意义不明。不过，在JavaScript里做比较复杂的异步任务时，它的确可以提供相当多的帮助。

[Promises/A]: http://wiki.commonjs.org/wiki/Promises/A "Promises/A - CommonJS Spec Wiki"
[Q]: https://github.com/kriskowal/q "Q"
[设计模式解析]: https://github.com/kriskowal/q/tree/v1/design "Promise design of Q"
[JavaScript Promises: There and back again]: http://www.html5rocks.com/zh/tutorials/es6/promises/ "JavaScript Promises: There and back again - HTML5 Rocks"