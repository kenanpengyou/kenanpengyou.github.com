---
layout: post
title: "AmplifyJS源码简析：事件分发"
category: "javascript"
description: "AmplifyJS是一个非常简单的JavaScript库，来读一读它的源码吧。"
---
{% include JB/setup %}

## 事件分发的作用 ##

在为页面添加各类交互功能时，我们熟知的最简单的做法就是为页面元素绑定事件，然后在事件处理函数中，做我们想要做的动作。就像这样的代码：

{% highlight javascript %}
element.onclick = function(event){
    // Do anything.
};
{% endhighlight %}
    
如果我们要做的动作不复杂，那么实际逻辑功能的代码，放在这里是可以的。如果今后需要修改，再到这段事件处理函数的位置来修改。

再进一步，为了做适当的代码复用，我们可能会把逻辑功能中的一部分分拆到一个函数内：

{% highlight javascript %}
element.onclick = function(event){
    // Other code here.
    doSomethingElse();
};
{% endhighlight %}
    
这里的函数`doSomethingElse`对应的功能可能会在其他地方用到，所以会这样做分拆。此外，可能会有设定坐标这样的功能（假定函数名为`setPosition`），则还需要用到浏览器事件对象`event`提供的诸如指针位置一类的信息：

{% highlight javascript %}
element.onclick = function(event){
    // Other code here.
    doSomethingElse();
    setPosition(event.clientX, event.clientY);
};
{% endhighlight %}
    
此处有一个不推荐的做法是直接把`event`对象传递给`setPosition`。这是因为，分清逻辑功能和事件侦听两种职责，是一种良好的实践。只让事件处理函数本身接触到浏览器事件对象`event`，有利于降低代码耦合，方便独立测试及维护。

那么，功能越来越多，越来越复杂了会怎么样呢？如果沿用之前的做法，可能是这个样子：

{% highlight javascript %}
element.onclick = function(event){
    doMission1();
    doMission2(event.clientX, event.clientY);
    doMission3();
    // ...
    doMissionXX();
};
{% endhighlight %}
    
虽然这样用也没问题，但这种时候其实就可以考虑更优雅的写法：

{% highlight javascript %}
element.onclick = function(event){
    amplify.publish( "aya:clicked", {
        x: event.clientX,
        y: event.clientY
    });
};
{% endhighlight %}
    
这种形式就是**事件分发**，请注意，这里的事件并不是指浏览器原生的事件（`event`对象），而是逻辑层面的**自定义事件**。上面的`aya:clicked`就是一个随便写（really?）的自定义事件名称。

显然到这还没结束，为了完成之前的复杂的功能，我们还需要将自定义事件和要做的事关联在一起：

{% highlight javascript %}
amplify.subscribe( "aya:clicked", doMission1);
// ...
amplify.subscribe( "aya:clicked", doMission2);
// ...
{% endhighlight %}

看起来又绕了回来？没错，但这是有用的。一方面，浏览器原生事件的侦听被分离并固化了下来，以后如果逻辑功能有变化，例如减少几个功能，则只需要到自定义事件的关联代码部分做删减，而不需要再关心原生事件。另一方面，逻辑功能的调整变得更为灵活，可以在任意的代码位置通过`subscribe`添加功能，而且可以自行做分类管理（自定义的事件名）。

简单来说，事件分发通过增加一层自定义事件的冗余（在只有简单的逻辑功能时，你就会觉得它是冗余），降低了代码模块之间的耦合度，使得逻辑功能更为清晰有条理，便于后续维护。

等下，前面那个出境了好几次的很有存在感的`amplify`是干什么的？

Nice，终于是时候介绍这个了。

## AmplifyJS ##

事件分发是需要一定的方法来实现的。实现事件分发的设计模式之一，就是**发布/订阅(Publish/Subscribe)**。

[AmplifyJS][]是一个简单的JavaScript库，主要提供了Ajax请求、数据存储、发布/订阅三项功能（每一项都可独立使用）。其中，发布/订阅是核心功能，对应命名是`amplify.core`。

![AmplifyJS][img_amplifyjs_logo]

`amplify.core`是发布/订阅设计模式的一个简洁的、清晰的实现，加上注释一共100多行。读完amplify的源码，就可以比较好地理解如何去实现一个发布/订阅的设计模式。

### 代码全貌 ###

`amplify.core`的源码整体结构如下：

{% highlight javascript %}
(function( global, undefined ) {

var slice = [].slice,
    subscriptions = {};

var amplify = global.amplify = {
    publish: function( topic ) {
        // ...
    },

    subscribe: function( topic, context, callback, priority ) {
        // ...
    },

    unsubscribe: function( topic, context, callback ) {
        // ...
    }
};

}( this ) );
{% endhighlight %}
    
可以看到，amplify定义了一个名为`amplify`的全局变量（作为`global`的属性），它有3个方法`publish`、`subscribe`、`unsubscribe`。此外，`subscriptions`作为一个局部变量，它将保存发布/订阅模式涉及的所有自定义事件名及其关联函数。

### publish ###

`publish`即发布，它要求指定一个`topic`，也就是自定义事件名（或者就叫做话题），调用后，所有关联到某个`topic`的函数，都将被依次调用：

{% highlight javascript %}
publish: function( topic ) {
    // [1]
    if ( typeof topic !== "string" ) {
        throw new Error( "You must provide a valid topic to publish." );
    }
    // [2]
    var args = slice.call( arguments, 1 ),
        topicSubscriptions,
        subscription,
        length,
        i = 0,
        ret;

    if ( !subscriptions[ topic ] ) {
        return true;
    }
    // [3]
    topicSubscriptions = subscriptions[ topic ].slice();
    for ( length = topicSubscriptions.length; i < length; i++ ) {
        subscription = topicSubscriptions[ i ];
        ret = subscription.callback.apply( subscription.context, args );
        if ( ret === false ) {
            break;
        }
    }
    return ret !== false;
},
{% endhighlight %}

`[1]`，参数`topic`必须要求是字符串，否则抛出一个错误。

`[2]`，`args`将取得除`topic`之外的其他所有传递给`publish`函数的参数，并以数组形式保存。如果对应`topic`在`subscriptions`中没有找到，则直接返回。

`[3]`，`topicSubscriptions`作为一个数组，取得某一个`topic`下的所有关联元素，其中每一个元素都包括`callback`及`context`两部分。然后，遍历元素，调用每一个关联元素的`callback`，同时带入元素的`context`和前面的额外参数`args`。如果任意一个关联元素的回调函数返回`false`，则停止运行其他的并返回`false`。

### subscribe ###

订阅，如这个词自己的含义那样（就像订本杂志什么的），是建立`topic`和`callback`的关联的步骤。比较特别的是，amplify在这里还加入了`priority`（优先级）的概念，优先级的值越小，优先级越高，默认是`10`。优先级高的`callback`，将会在`publish`的时候，被先调用。这个顺序的原理可以从前面的`publish`的源码中看到，其实就是预先按照优先级从高到低依次排列好了某一`topic`的所有关联元素。

{% highlight javascript %}
subscribe: function( topic, context, callback, priority ) {
        if ( typeof topic !== "string" ) {
            throw new Error( "You must provide a valid topic to create a subscription." );
        }
        // [1]
        if ( arguments.length === 3 && typeof callback === "number" ) {
            priority = callback;
            callback = context;
            context = null;
        }
        if ( arguments.length === 2 ) {
            callback = context;
            context = null;
        }
        priority = priority || 10;
        // [2]
        var topicIndex = 0,
            topics = topic.split( /\s/ ),
            topicLength = topics.length,
            added;
        for ( ; topicIndex < topicLength; topicIndex++ ) {
            topic = topics[ topicIndex ];
            added = false;
            if ( !subscriptions[ topic ] ) {
                subscriptions[ topic ] = [];
            }
            // [3]
            var i = subscriptions[ topic ].length - 1,
                subscriptionInfo = {
                    callback: callback,
                    context: context,
                    priority: priority
                };
            // [4]
            for ( ; i >= 0; i-- ) {
                if ( subscriptions[ topic ][ i ].priority <= priority ) {
                    subscriptions[ topic ].splice( i + 1, 0, subscriptionInfo );
                    added = true;
                    break;
                }
            }
            // [5]
            if ( !added ) {
                subscriptions[ topic ].unshift( subscriptionInfo );
            }
        }

        return callback;
    },
{% endhighlight %}
        
`[1]`，要理解这一部分，请看amplify提供的API示意：

{% highlight javascript %}
amplify.subscribe( string topic, function callback )
amplify.subscribe( string topic, object context, function callback )
amplify.subscribe( string topic, function callback, number priority )
amplify.subscribe(
    string topic, object context, function callback, number priority )
{% endhighlight %}
        
可以看到，amplify允许多种参数形式，而当参数数目和类型不同的时候，位于特定位置的参数可能会被当做不同的内容。这也在其他很多JavaScript库中可以见到。像这样，通过参数数目和类型的判断，就可以做到这种多参数形式的设计。

`[2]`，订阅的时候，`topic`是允许空格的，空白符将被当做分隔符，认为是将一个`callback`关联到多个`topic`上，所以会使用一个循环。`added`用作标识符，表明新加入的这个元素是否已经添加到数组内，初始为`false`。

`[3]`，每一个`callback`的保存，实际是一个对象，除`callback`外还带上了`context`（默认为`null`）和`priority`。

`[4]`，这个循环是在根据`priority`的值，找到关联元素应处的位置。任何`topic`的关联元素都是从无到有，且依照`priority`数值从小到大排列（已排序的）。因此，在比较的时候，是先假设新加入的元素的`priority`数值较大（优先级低），从数组尾端向前比较，只要原数组中有关联元素的`priority`数值比新加入元素的小，循环就可以中断，且可以确定地用数组的`splice`方法将新加入的元素添加在此。如果循环一直运行到完毕，则可以确定新加入的元素的`priority`数值是最小的，此时`added`将保持为初始值`false`。

`[5]`，如果到这个位置，元素还没有被添加，那么执行添加，切可以确定元素应该位于数组的最前面（或者是第一个元素）。

### unsubscribe ###

虽然发布和订阅是最主要的，但也会有需要退订的时候（杂志不想看了果断退！）。所以，还会需要一个`unsubscribe`。

{% highlight javascript %}
unsubscribe: function( topic, context, callback ) {
    if ( typeof topic !== "string" ) {
        throw new Error( "You must provide a valid topic to remove a subscription." );
    }

    if ( arguments.length === 2 ) {
        callback = context;
        context = null;
    }

    if ( !subscriptions[ topic ] ) {
        return;
    }

    var length = subscriptions[ topic ].length,
        i = 0;

    for ( ; i < length; i++ ) {
        if ( subscriptions[ topic ][ i ].callback === callback ) {
            if ( !context || subscriptions[ topic ][ i ].context === context ) {
                subscriptions[ topic ].splice( i, 1 );
                
                // Adjust counter and length for removed item
                i--;
                length--;
            }
        }
    }
}
{% endhighlight %}

读过前面的源码后，这部分看起来就很容易理解了。根据指定的`topic`遍历关联元素，找到`callback`一致的，然后删除它。由于使用的是`splice`方法，会直接修改原始数组，因此需要手工对`i`和`length`再做一次调整。

### Amplify使用示例 ###

官方提供的其中一个使用示例是：

{% highlight javascript %}
amplify.subscribe( "dataexample", function( data ) {
    alert( data.foo ); // bar
});

//...

amplify.publish( "dataexample", { foo: "bar" } );
{% endhighlight %}
    
结合前面的源码部分，是否对发布/订阅这一设计模式有了更明确的体会呢？

## 补充说明 ##

你可能也注意到了，AmplifyJS所实现的典型的发布/订阅是**同步的（synchronous）**。也就是说，在运行`amplify.publish(topic)`的时候，是会没有任何延迟地把某一个`topic`附带的所有回调，全部都运行一遍。

## 结语 ##

Pub/Sub是一个比较容易理解的设计模式，但非常有用，可以应对大型应用的复杂逻辑。本文简析的AmplifyJS是我觉得写得比较有章法而且简明切题（针对单一功能）的JavaScript库，所以在此分享给大家。

[img_amplifyjs_logo]: {{POSTS_IMG_PATH}}/201502/amplifyjs_logo.jpg "AmplifyJS"

[AmplifyJS]: http://amplifyjs.com/