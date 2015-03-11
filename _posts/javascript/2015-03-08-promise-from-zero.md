---
layout: post
title: "深入理解Promise实现细节"
category: "javascript"
description: ""
---
{% include JB/setup %}

在之前的[异步JavaScript与Promise][]一文中，我介绍了Promise以及它在异步JavaScript中的使用意义。一般来说，我们是通过各种JavaScript库来应用Promise的。随着使用Promise的机会越来越多，你也可能像我这样会关心Promise到底是如何工作的。显然，了解Promise的实现细节，可以帮助我们更好地应用它。在碰到一些Promise的问题时，可以更快速、更准确地定位原因，并解决它。

非常庆幸，在[Promises/A wiki][]中位于库列表第一位的[Q][]，提供了它作为一个Promise库的[基本设计原理解析][]。本文将主要根据Q的这篇文章，探讨Promise的实现细节。

##Promise核心说明##

尽管Promise已经有自己的规范，但目前的各类Promise库，在Promise的实现细节上是有差异的，部分API甚至在意义上完全不同。但Promise的核心内容，是相通的，它就是`then`方法。在相关术语中，`promise`指的就是一个有`then`方法，且该方法能触发特定行为的对象或函数。

有关Promise核心说明的细节，推荐阅读[Promises/A+][]。这篇文章是写给Promise库的开发者的，你可以找到各种对Promise特性的说明。[Promises/A+][]希望开发者遵从这些特性，以实现可以共同使用的Promise（也就是说，不同的Promise库也可共用）。

Promise可以有不同的实现方式，因此Promise核心说明并不会讨论任何具体的实现代码。

先阅读Promise核心说明的意思是：看，这就是需要写出来的结果，请参照这个结果想一想怎么用代码写出来吧。

##起步：用这一种方式理解Promise##

回想一下Promise解决的是什么问题？回调。例如，函数`doMission1()`代表第一件事情，现在，我们想要在这件事情完成后，再做下一件事情`doMission2()`，应该怎么做呢？

先看看我们常见的回调模式。`doMission1()`说：“你要这么做的话，就把`doMission2()`交给我，我在结束后帮你调用。”所以会是：

{% highlight javascript %}
doMission1(doMission2);
{% endhighlight %}

Promise模式又是如何呢？你对`doMission1()`说：“不行，控制权要在我这里。你应该改变一下，你先返回一个特别的东西给我，然后我来用这个东西安排下一件事。”这个特别的东西就是Promise，这会变成这样：

{% highlight javascript %}
doMission1().then(doMission2);
{% endhighlight %}

可以看出，Promise将回调模式的主从关系调换了一个位置（翻身做主人！），多个事件的流程关系，就可以这样集中到主干道上（而不是分散在各个事件函数之内）。

好了，如何做这样一个转换呢？从最简单的情况来吧，假定`doMission1()`的代码是：

{% highlight javascript %}
function doMission1(callback){
    var value = 1;
    callback(value);
}
{% endhighlight %}

那么，它可以改变一下，变成这样：

{% highlight javascript %}
function doMission1(){
    return {
        then: function(callback){
            var value = 1;
            callback(value);
        }
    };
}
{% endhighlight %}

这就完成了转换。虽然并不是实际有用的转换，但到这里，其实已经触及了Promise最为重要的实现要点，即**Promise将返回值转换为带`then`方法的对象**。

##进阶：Q的设计路程##

`design/q0.js`是Q初步成型的第一步。它创建了一个名为`defer`的工具函数，用于创建Promise：

{% highlight javascript %}
var defer = function () {
    var pending = [], value;
    return {
        resolve: function (_value) {
            value = _value;
            for (var i = 0, ii = pending.length; i < ii; i++) {
                var callback = pending[i];
                callback(value);
            }
            pending = undefined;
        },
        then: function (callback) {
            if (pending) {
                pending.push(callback);
            } else {
                callback(value);
            }
        }
    }
};
{% endhighlight %}

这段源码可以看出，运行`defer()`将得到一个对象，该对象包含`resolve`和`then`两个方法。请回想一下jQuery的Deferred（同样有`resolve`和`then`），这两个方法将会是近似的效果。`then`会参考`pending`的状态，如果是等待状态则将回调保存（`push`方法），否则立即调用回调。`resolve`则将肯定这个Promise，更新值的同时运行完所有保存的回调。`defer`的使用示例如下：

{% highlight javascript %}
var oneOneSecondLater = function () {
    var result = defer();
    setTimeout(function () {
        result.resolve(1);
    }, 1000);
    return result;
};

oneOneSecondLater().then(callback);
{% endhighlight %}

这里`oneOneSecondLater()`包含异步内容（注意`setTimeout`），但这里让它立即返回了一个`defer()`生成的对象，然后将对象的`resolve`方法放在异步结束的地方调用（并附带上值，或者说结果）。
    



{% highlight javascript %}

{% endhighlight %}

[img_amplifyjs_logo]: {{POSTS_IMG_PATH}}/201502/amplifyjs_logo.jpg "AmplifyJS"

[异步JavaScript与Promise]: http://acgtofe.com/posts/2015/01/async-and-promise/
[Promises/A wiki]: http://wiki.commonjs.org/wiki/Promises/A#Implementations
[Q]: https://github.com/kriskowal/q
[基本设计原理解析]: https://github.com/kriskowal/q/blob/v1/design/README.js
[Promises/A+]: https://promisesaplus.com/
