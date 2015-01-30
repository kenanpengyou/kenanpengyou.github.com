---
layout: post
title: "异步JavaScript与Promise"
category: "javascript"
description: "来讲讲Promise啦！"
---
{% include JB/setup %}

##异步？##

我在很多地方都看到过”异步”这个词，但在我还不是很理解这个概念的时候，却发现自己常常会在这些地方被当做“很清楚”(*￣ﾛ￣)。

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

单线程的JavaScript，就是这样通过队列，以事件循环的形式工作的。所以，前面的代码中，是用`while`将执行引擎拖在代码运行期间长达1000ms，而在全部代码运行完回到队列前，任何事件都不会触发。

##JavaScript的异步难题##

Ajax可能是我们用得最多的异步操作。以jQuery为例，发起一个Ajax请求的代码一般是这样的：

{% highlight javascript %}
// Ajax请求示意代码
$.ajax({
    url: url,
    data: dataObject,
    success: function(){},
    error: function(){}
});
{% endhighlight %}

这样的写法有什么问题吗？简单地说，不够轻便。为什么一定要在发起请求的地方，就要把`success`和`error`这些回调给写好呢？假如我的回调要做很多很多的事情，是要我想起一件事情就跑回这里添加代码吗？

再比如我们要完成这样一件事：有4个供Ajax访问的url地址，需要先Ajax访问第1个，在第1个访问完成后，用拿到的返回数据作为参数再访问第2个，第2个访问完成后再第3个...以此到4个全部访问完成。按照这样的写法，似乎会变成这样：

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

你一定会觉得这种称为Pyramid of Doom（金字塔厄运）的代码看起来很糟糕。习惯了直接附加回调的写法，就可能会对这种一个传递到下一个的异步事件感到无从入手。即便为这些回调函数分别命名（可以使形式上好看一点），也仍然无法解决问题。

还有一个常见的难点是同时发送两个Ajax请求，然后要在两个请求都成功返回后再做一件接下来的事，这是不是好像也有点难办？

适于应对这些异步的难题，并让代码变得优雅的就是Promise。

##优雅的Promise##

Promise是什么呢？先这样说，前面jQuery的Ajax请求示意代码，其实可以写成这样：

{% highlight javascript %}
var promise = $.ajax({
    url: url,
    data: dataObject
});
promise.done(function(){});
promise.fail(function(){});
{% endhighlight %}

它们是等效的。可以看到，Promise的加入使得代码形式发生了变化。而这个变化，将真正意义上让异步事件变得容易起来。

###封装是有用的###

Promise对象就像是一个封装好的对异步事件的引用。想要在这个异步事件完成后做点事情？给它附加回调就可以了，不管附加多少个也没问题！

jQuery的Ajax方法会返回一个Promise对象（这是jQuery1.5重点增加的特性）。如果我有`do1()`、`do2()`两个函数要在异步事件成功完成后执行，只需要这样做：

{% highlight javascript %}
promise.done(do1);
// Other code here.
promise.done(do2);
{% endhighlight %}

这样可要自由多了，我只要保存这个Promise对象，就在写代码的任何时候，给它附加任意数量的回调，而不用管这个异步事件是在哪里发起的。

###正式的介绍###

Promise已经是CommonJS的一个规范，叫做[Promises/A][]。Promise代表的是某一操作结束后的返回值，它有3种状态：

- **肯定（fulfilled或resolved）**，表明该Promise的操作成功了。
- **否定（rejected或failed）**，表明该Promise的操作失败了。
- **等待（pending）**，还没有得到肯定或者否定的结果，进行中。

还有1种状态是用来概念上表示Promise的操作已经成功或失败，也就是肯定和否定状态的集合，叫做**结束（settled）**。要理解Promise，还需要知道它有以下的特性：

- 一个Promise只能从等待状态转变为肯定或否定状态一次，一旦转变为肯定或否定状态，就再也不会改变状态。
- 如果在一个Promise结束（成功或失败，同前面的说明）后，添加针对成功或失败的回调，则回调函数会立即执行。

看过这些介绍用的概念后，再想想Ajax操作本身。发起一个请求后，等待着，然后成功收到返回或出现错误（失败）。这些，都和Promise非常一致。

进一步解释Promise的特性还有一个很有用的例子：jQuery的`$(document).ready(onReady)`。其中`onReady`回调函数会在DOM就绪后执行，但有趣的是，如果在执行到这句代码之前，DOM就已经就绪了，那么`onReady`会立即执行，没有任何延迟（也就是说，是同步的）。

###Promise示例###

[Promises/A][]里列出了一系列实现了Promise的JavaScript库，jQuery也在其中。下面是用jQuery生成Promise的代码：

{% highlight javascript %}
var deferred = $.Deferred();
deferred.done(function(message){console.log("Done: " + message)});
deferred.resolve("morin");  // Done: morin
{% endhighlight %}

可以看到，jQuery自己定义了名为Deferred的对象，它实际上就是Promise。`$.Deferred()`方法会生成一个Promise对象，除了通过`deferred.done()`、`deferred.fail()`等为它附加回调以外，还可以调用`deferred.resolve()`来肯定（或者`deferred.reject()`来否定）这个Promise，且可以向回调传递任意数据。








##结语##


[Promises/A]: http://wiki.commonjs.org/wiki/Promises/A "Promises/A - CommonJS Spec Wiki"


[原生JavaScript的Promise]: http://www.html5rocks.com/zh/tutorials/es6/promises/ "JavaScript Promises: There and back again - HTML5 Rocks"