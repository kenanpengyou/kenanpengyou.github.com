---
layout: post
title: "深入理解Promise实现细节"
category: "javascript"
description: "各种各样的Promise库大概是怎样做出来的？本文将以其中一个作为代表，较详细地探讨Promise的实现细节。"
---
{% include JB/setup %}

在之前的[异步JavaScript与Promise][]一文中，我介绍了Promise以及它在异步JavaScript中的使用意义。一般来说，我们是通过各种JavaScript库来应用Promise的。随着使用Promise的机会越来越多，你也可能像我这样会关心Promise到底是如何工作的。显然，了解Promise的实现细节，可以帮助我们更好地应用它。尤其是碰到一些Promise的问题时，也许可以更快速、更准确地定位原因，并解决它。

非常庆幸，在[Promises/A wiki][]中位于库列表第一位的[Q][]，提供了它作为一个Promise库的[基本设计原理解析][]。本文将主要根据Q的这篇文章，探讨Promise的实现细节。

## Promise核心说明 ##

尽管Promise已经有自己的规范，但目前的各类Promise库，在Promise的实现细节上是有差异的，部分API甚至在意义上完全不同。但Promise的核心内容，是相通的，它就是`then`方法。在相关术语中，`promise`指的就是一个有`then`方法，且该方法能触发特定行为的对象或函数。

有关Promise核心说明的细节，推荐阅读[Promises/A+][]。这篇文章是写给Promise库的开发者的，你可以找到各种对Promise特性的说明。[Promises/A+][]希望开发者遵从这些特性，以实现可以共同使用的Promise（也就是说，不同的Promise库也可共用）。

Promise可以有不同的实现方式，因此Promise核心说明并不会讨论任何具体的实现代码。

先阅读Promise核心说明的意思是：看，这就是需要写出来的结果，请参照这个结果想一想怎么用代码写出来吧。

## 起步：用这一种方式理解Promise ##

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

## 进阶：Q的设计路程 ##

### 从defer开始 ###

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

这段源码可以看出，运行`defer()`将得到一个对象，该对象包含`resolve`和`then`两个方法。请回想一下jQuery的Deferred（同样有`resolve`和`then`），这两个方法将会是近似的效果。`then`会参考`pending`的状态，如果是等待状态则将回调保存（`push`），否则立即调用回调。`resolve`则将肯定这个Promise，更新值的同时运行完所有保存的回调。`defer`的使用示例如下：

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

这里`oneOneSecondLater()`包含异步内容（`setTimeout`），但这里让它立即返回了一个`defer()`生成的对象，然后将对象的`resolve`方法放在异步结束的位置调用（并附带上值，或者说结果）。

到此，以上代码存在一个问题：`resolve`可以被执行多次。因此，`resolve`中应该加入对状态的判断，保证`resolve`只有一次有效。这就是Q下一步的`design/q1.js`（仅差异部分）：

{% highlight javascript %}
resolve: function (_value) {
    if (pending) {
        value = _value;
        for (var i = 0, ii = pending.length; i < ii; i++) {
            var callback = pending[i];
            callback(value);
        }
        pending = undefined;
    } else {
        throw new Error("A promise can only be resolved once.");
    }
}
{% endhighlight %}

对第二次及更多的调用，可以这样抛出一个错误，也可以直接忽略掉。

### 分离defer和promise ###

在前面的实现中，`defer`生成的对象同时拥有`then`方法和`resolve`方法。按照定义，promise关心的是`then`方法，至于触发promise改变状态的`resolve`，是另一回事。所以，Q接下来将拥有`then`方法的promise，和拥有`resolve`的defer分离开来，各自独立使用。这样就好像划清了各自的职责，各自只留一定的权限，这会使代码逻辑更明晰，易于调整。请看`design/q3.js`：（`q2`在此跳过）

{% highlight javascript %}
var isPromise = function (value) {
    return value && typeof value.then === "function";
};

var defer = function () {
    var pending = [], value;
    return {
        resolve: function (_value) {
            if (pending) {
                value = _value;
                for (var i = 0, ii = pending.length; i < ii; i++) {
                    var callback = pending[i];
                    callback(value);
                }
                pending = undefined;
            }
        },
        promise: {
            then: function (callback) {
                if (pending) {
                    pending.push(callback);
                } else {
                    callback(value);
                }
            }
        }
    };
};
{% endhighlight %}

如果你仔细对比一下`q1`，你会发现区别很小。一方面，不再抛出错误（改为直接忽略第二次及更多的`resolve`），另一方面，将`then`方法移动到一个名为`promise`的对象内。到这里，运行`defer()`得到的对象（就称为defer吧），将拥有`resolve`方法，和一个`promise`属性指向另一个对象。这另一个对象就是仅有`then`方法的promise。这就完成了分离。

前面还有一个`isPromise()`函数，它通过是否有`then`方法来判断对象是否是promise（duck-typing的判断方法）。为了正确使用和处理分离开的promise，会像这样需要将promise和其他值区分开来。

### 实现promise的级联 ###

接下来会是相当重要的一步。到前面到`q3`为止，所实现的promise都是不能级联的。但你所熟知的promise应该支持这样的语法：

{% highlight javascript %}
promise.then(step1).then(step2);
{% endhighlight %}

以上过程可以理解为，promise将可以创造新的promise，且取自旧的promise的值（前面代码中的`value`）。要实现`then`的级联，需要做到一些事情：

* `then`方法必须返回promise。
* 这个返回的promise必须用传递给`then`方法的回调运行后的返回结果，来设置自己的值。
* 传递给`then`方法的回调，必须返回一个promise或值。

`design/q4.js`中，为了实现这一点，新增了一个工具函数`ref`：

{% highlight javascript %}
var ref = function (value) {
    if (value && typeof value.then === "function")
        return value;
    return {
        then: function (callback) {
            return ref(callback(value));
        }
    };
};
{% endhighlight %}

这是在着手处理与promise关联的value。这个工具函数将对任一个value值做一次包装，如果是一个promise，则什么也不做，如果不是promise，则将它包装成一个promise。注意这里有一个递归，它确保包装成的promise可以使用`then`方法级联。为了帮助理解它，下面是一个使用的例子：

{% highlight javascript %}
ref("step1").then(function(value){
    console.log(value); // "step1"
    return 15;
}).then(function(value){
    console.log(value); // 15
});
{% endhighlight %}

你可以看到value是怎样传递的，promise级联需要做到的也是如此。

`design/q4.js`通过结合使用这个`ref`函数，将原来的defer转变为可级联的形式：

{% highlight javascript %}
var defer = function () {
    var pending = [], value;
    return {
        resolve: function (_value) {
            if (pending) {
                value = ref(_value); // values wrapped in a promise
                for (var i = 0, ii = pending.length; i < ii; i++) {
                    var callback = pending[i];
                    value.then(callback); // then called instead
                }
                pending = undefined;
            }
        },
        promise: {
            then: function (_callback) {
                var result = defer();
                // callback is wrapped so that its return
                // value is captured and used to resolve the promise
                // that "then" returns
                var callback = function (value) {
                    result.resolve(_callback(value));
                };
                if (pending) {
                    pending.push(callback);
                } else {
                    value.then(callback);
                }
                return result.promise;
            }
        }
    };
};
{% endhighlight %}

原来`callback(value)`的形式，都修改为`value.then(callback)`。这个修改后效果其实和原来相同，只是因为`value`变成了promise包装的类型，会需要这样调用。

`then`方法有了较多变动，会先新生成一个defer，并在结尾处返回这个defer的promise。请注意，`callback`不再是直接取用传递给`then`的那个，而是在此基础之上增加一层，并把新生成的defer的`resolve`方法放置在此。此处可以理解为，`then`方法将返回一个新生成的promise，因此需要把promise的resolve也预留好，在旧的promise的resolve运行后，新的promise的resolve也会随之运行。这样才能像管道一样，让事件按照`then`连接的内容，一层一层传递下去。

### 加入错误处理 ###

promise的`then`方法应该可以包含两个参数，分别是肯定和否定状态的处理函数（`onFulfilled`与`onRejected`）。前面我们实现的promise还只能转变为肯定状态，所以，接下来应该加入否定状态部分。

请注意，promise的`then`方法的两个参数，都是可选参数。`design/q6.js`（`q5`也跳过）加入了工具函数`reject`来帮助实现promise的否定状态：

{% highlight javascript %}
var reject = function (reason) {
    return {
        then: function (callback, errback) {
            return ref(errback(reason));
        }
    };
};
{% endhighlight %}

它和`ref`的主要区别是，它返回的对象的`then`方法，只会取第二个参数的`errback`来运行。`design/q6.js`的其余部分是：

{% highlight javascript %}
var defer = function () {
    var pending = [], value;
    return {
        resolve: function (_value) {
            if (pending) {
                value = ref(_value);
                for (var i = 0, ii = pending.length; i < ii; i++) {
                    value.then.apply(value, pending[i]);
                }
                pending = undefined;
            }
        },
        promise: {
            then: function (_callback, _errback) {
                var result = defer();
                // provide default callbacks and errbacks
                _callback = _callback || function (value) {
                    // by default, forward fulfillment
                    return value;
                };
                _errback = _errback || function (reason) {
                    // by default, forward rejection
                    return reject(reason);
                };
                var callback = function (value) {
                    result.resolve(_callback(value));
                };
                var errback = function (reason) {
                    result.resolve(_errback(reason));
                };
                if (pending) {
                    pending.push([callback, errback]);
                } else {
                    value.then(callback, errback);
                }
                return result.promise;
            }
        }
    };
};
{% endhighlight %}

这里的主要改动是，将数组`pending`只保存单个回调的形式，改为同时保存肯定和否定的两种回调的形式。而且，在`then`中定义了默认的肯定和否定回调，使得`then`方法满足了promise的2个可选参数的要求。

你也许注意到defer中还是只有一个`resolve`方法，而没有类似jQuery的`reject`。那么，错误处理要如何触发呢？请看这个例子：

{% highlight javascript %}
var defer1 = defer(),
promise1 = defer1.promise;
promise1.then(function(value){
    console.log("1: value = ",  value);
    return reject("error happens"); 
}).then(function(value){
    console.log("2: value = ", value);
}).then(null, function(reason){
    console.log("3: reason = ", reason);
});
defer1.resolve(10);

// Result:
// 1: value = 10
// 3: reason = error happens
{% endhighlight %}

可以看出，每一个传递给`then`方法的返回值是很重要的，它将决定下一个`then`方法的调用结果。而如果像上面这样返回工具函数`reject`生成的对象，就会触发错误处理。

### 融入异步 ###

终于到了最后的`design/q7.js`。直到前面的`q6`，还存在一个问题，就是`then`方法运行的时候，可能是同步的，也可能是异步的，这取决于传递给`then`的函数（例如直接返回一个值，就是同步，返回一个其他的promise，就可以是异步）。这种不确定性可能带来潜在的问题。因此，Q的后面这一步，是确保将所有`then`转变为异步。

`design/q7.js`定义了另一个工具函数`enqueue`：

{% highlight javascript %}
var enqueue = function (callback) {
    //process.nextTick(callback); // NodeJS
    setTimeout(callback, 1); // Naïve browser solution
};
{% endhighlight %}

显然，这个工具函数会将任意函数推迟到下一个事件队列运行。

`design/q7.js`其他的修改点是（只显示修改部分）：

{% highlight javascript %}
var ref = function (value) {
    // ...
    return {
        then: function (callback) {
            var result = defer();
            // XXX
            enqueue(function () {
                result.resolve(callback(value));
            });
            return result.promise;
        }
    };
};

var reject = function (reason) {
    return {
        then: function (callback, errback) {
            var result = defer();
            // XXX
            enqueue(function () {
                result.resolve(errback(reason));
            });
            return result.promise;
        }
    };
};

var defer = function () {
    var pending = [], value;
    return {
        resolve: function (_value) {
            // ...
                    enqueue(function () {
                        value.then.apply(value, pending[i]);
                    });
            // ...
        },
        promise: {
            then: function (_callback, _errback) {
                    // ...
                    enqueue(function () {
                        value.then(callback, errback);
                    });
                    // ...
            }
        }
    };
};
{% endhighlight %}

即把原来的`value.then`的部分，都转变为异步。

到此，Q提供的Promise设计原理`q0`~`q7`，全部结束。

## 结语 ##

即便本文已经是这么长的篇幅，但所讲述的也只到基础的Promise。大部分Promise库会有更多的API来应对更多和Promise有关的需求，例如`all()`、`spread()`，不过，读到这里，你已经了解了实现Promise的核心理念，这一定对你今后应用Promise有所帮助。

在我看来，Promise是精巧的设计，我花了相当一些时间才差不多理解它。Q作为一个典型Promise库，在思路上走得很明确。可以感受到，再复杂的库也是先从基本的要点开始的，如果我们自己要做类似的事，也应该保持这样的心态一点一点进步。

[异步JavaScript与Promise]: http://acgtofe.com/posts/2015/01/async-and-promise/
[Promises/A wiki]: http://wiki.commonjs.org/wiki/Promises/A#Implementations
[Q]: https://github.com/kriskowal/q
[基本设计原理解析]: https://github.com/kriskowal/q/blob/v1/design/README.js
[Promises/A+]: https://promisesaplus.com/
