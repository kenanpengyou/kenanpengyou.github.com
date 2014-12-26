---
layout: post
title: "HTML5 history API，创造更好的浏览体验"
category: "javascript"
description: "用一个例子告诉你如何用HTML5 history API来做优化。应该，简单，易读。"
---
{% include JB/setup %}

HTML5 history API有什么用呢？

##从Ajax翻页的问题说起##

请想象你正在看一个视频下面的评论，在翻到十几页的时候，你发现一个写得稍长，但非常有趣的评论。正当你想要停下滚轮细看的时候，手残按到了F5。然后，页面刷新了，评论又回到了第一页，所以你又要重新翻一次。

再或者，你想把这个评论发给别人分享，一面给了别人页面地址（为什么不直接复制呢？因为要连带视频等场景啊），一面又要加一句嘱咐：请翻到下面评论的第XX页的XX楼。

这就是问题。试想一下，如果浏览器能记住你当前的状态（比如看到了第十几页），而不是一刷新就还原，是不是就显得智能多了？

###为什么用Ajax？###

用Ajax实现翻页等内容切换是有原因的。在传统的无Ajax的站点里，页面A和页面B可能只有10%的地方是不同的，其他90%的内容（尤其是导航、页脚等公用元素）都是一样的，但却仍然需要浏览器下载并显示新的一整个页面。而如果使用Ajax，不仅节省了浏览器需要下载的资源，而且无刷新切换明显比页面跳转更平滑、流畅。

就视频下面的评论来说，Ajax可以说是必须的。视频这样的重量级元素，动不动给你重新加载一次，不能忍。

###传统的跳转翻页的可取之处###

传统的不使用Ajax的站点，每一个翻页是一个跳转，然后你可以在浏览器地址栏里看到诸如`?page=2`这样的参数。每一页就这样通过地址栏的URL做了标记，每一次请求，浏览器都会根据参数返回正确的页码。

所以，传统的跳转翻页，刷新也不会丢失状态。

###结合两者###

现在我们就可以想到，如果**在Ajax更新页面局部内容的同时，也在地址栏的URL里更新状态参数**，就可以做出更完美的Ajax翻页了。

不过，JavaScript修改`location`的除`hash`外的任意属性，页面都会以新URL重新加载。而唯一不引发刷新的`hash`参数并不会发送到服务器，因此服务器无法获得状态。

然后，HTML5 history API将解决这个问题。

##介绍HTML5 history API##

HTML5 history API只包括2个方法：`history.pushState()`和`history.replaceState()`，以及1个事件：`window.onpopstate`。

###history.pushState()###

它的完全体是 `history.pushState(stateObject, title, url)`，包括三个参数。

第1个参数是**状态对象**，它可以理解为一个拿来存储自定义数据的元素。它和同时作为参数的`url`会关联在一起。

第2个参数是**标题**，是一个字符串，目前各类浏览器都会忽略它（以后才有可能启用，用作页面标题），所以设置成什么都没关系。目前建议设置为空字符串。

第3个参数是**URL地址**，一般会是简单的`?page=2`这样的参数风格的相对路径，它会自动以当前URL为基准。需要注意的是，**本参数URL需要和当前页面URL同源**，否则会抛出错误。

调用`pushState()`方法将新生成一条历史记录，方便用浏览器的“后退”和“前进”来导航（“后退”可是相当常用的按钮）。另外，从URL的同源策略可以看出，HTML5 history API的出发点是很明确的，就是让无跳转的单站点也可以将它的各个状态保存为浏览器的多条历史记录。当通过历史记录重新加载站点时，站点可以直接加载到对应的状态。

###history.replaceState()###

它和`history.pushState()`方法基本相同，区别只有一点，**`history.replaceState()`不会新生成历史记录，而是将当前历史记录替换掉**。

###window.onpopstate###

push的对立就是pop，可以猜到这个事件是在浏览器取出历史记录并加载时触发的。但实际上，它的条件是比较苛刻的，几乎只有点击浏览器的“前进”、“后退”这些导航按钮，或者是由JavaScript调用的`history.back()`等导航方法，且切换前后的两条历史记录都属于同一个网页文档，才会触发本事件。

上面的“同一个网页文档”请理解为JavaScript环境的`document`是同一个，而不是指基础URL（去掉各类参数的）相同。也就是说，只要有重新加载发生（无论是跳转到一个新站点还是继续在本站点），JavaScript全局环境发生了变化，`popstate`事件都不会触发。

`popstate`事件是设计出来和前面的2个方法搭配使用的。一般只有在通过前面2个方法设置了同一站点的多条历史记录，并在其之间导航（前进或后退）时，才会触发这个事件。同时，前面2个方法所设置的状态对象（第1个参数），也会在这个时候通过事件的`event.state`返还回来。

此外请注意，`history.pushState()`及`history.replaceState()`本身调用时是不触发`popstate`事件的。pop和push毕竟不一样！

##如何应用##

HTML5 history API的内容不多，具体如何应用它来改进Ajax翻页呢？

首先，在服务器端添加对URL状态参数的支持，例如`?page=3`将会输出对应页码的内容（后端模板）。也可以是服务器端把对应页码的数据给JavaScript，由JavaScript向页面写入内容（前端模板）。

接下来，使用`history.pushState()`，在任一次翻页的同时，也设置正确的带参数的URL。代码可能是这样：

{% highlight javascript %}
newURL = "?page=" + pageNow;
history.pushState(null, "", newURL);
{% endhighlight %}

到此，就解决了F5刷新状态还原的事了。

不过，还没有结束，在浏览器中点击后退，例如从`?page=3`退到`?page=2`，会发现没有变化。按道理说，这时候也应该对应变化。这就要用到`popstate`事件了。

为`window`添加`popstate`事件，加入这种导航变化时的处理。代码可能是这样（jQuery）：

{% highlight javascript %}
$(window).on("popstate", function(event) {

    // 取得之前通过pushState保存的state object，尽管本示例并不打算使用它。
    // jQuery对event做了一层包装，需要通过originalEvent取得原生event。
    var state = event.originalEvent.state,

        // 本示例直接取URL参数来处理
        reg = /page=(\d+)/,
        regMatch = reg.exec(location.search),

        // 第1页的时候既可以是 ?page=1，也可以根本没有page参数
        pageNow = regMatch === null ? 1 : +regMatch[1];

    updateByPage(pageNow);
});
{% endhighlight %}

这样，就完成了。这样看起来是否会觉得还挺容易的呢？在支持HTML5 history API的浏览器中，以上部分就已经做到了带页码记录的Ajax翻页。

##有待斟酌的兼容性问题##

根据[caniuse][]上的数据，IE10+及其他主流浏览器都支持HTML5 history API。为保证不支持的浏览器不报错，可以加入是否支持HTML5 history API的判断：

{% highlight javascript %}
// 参考自 http://modernizr.com/download/#-history 源码
var isHistoryApi = !!(window.history && history.pushState);

// ...

if(isHistoryApi){
    // ...
}
{% endhighlight %}

这样，一个Ajax翻页，在支持HTML5 history API的浏览器上，将会智能地保存当前页码信息，而不支持的浏览器仍然可以正常使用，只是不保存页码信息（就像改进前那样）。我认为，按照“渐进增强”的思路，这样就是最好的了，也就是：只使用较少的代码优化高级浏览器的使用体验。

如果真的想要在各类浏览器里都表现一致，拥有这样的记录功能呢？

这时候推荐使用Benjamin Lupton的[History.js][]，它提供和HTML5 history API近似的api，会在不支持的浏览器里回退到hash形式去处理历史记录。尽管为了兼容这种hash的回退形式你可能要额外做点事（hash不会发送到服务器端），但它确实可以让你做到更广范围的兼容。

###HTML5 history API并不完美###

即使只考虑支持HTML5 history API的浏览器，它们对HTML5 history API的一些细节处理也会有差异和问题。History.js提供的只针对HTML5浏览器的版本，仍然包含了不少处理兼容问题的代码。

但是，不完美也没有关系。以我的测试结果，本文所介绍的简单的写法，就可以在绝大部分支持HTML5 history API的浏览器上正常运行。如果你担心有哪些浏览器会有潜在问题，去测试那个浏览器就可以了。你最后用于兼容处理的自写代码很可能远比一个JavaScript库少得多，毕竟，你也不一定会喜欢额外引入一个JavaScript库来完成一个功能吧。

##一些相关内容##

地址栏里的hash曾是过去被广泛用来记录页面状态的标记，你可以阅读[W3C Blog的这篇文章][]了解它的经历。

现在可以在不刷新的状况下操作浏览器地址栏和历史记录了，那同一站点的普通链接跳转是否都可以转变为Ajax来提升使用体验？是的，而且已经有了[pjax][]、[turbolinks][]这些专门完成这个功能的作品。

不只是翻页，HTML5 history API将尤其适合用在大量使用Ajax、包含多个视图的单页应用。

为一个页面的每一个状态都生成一条历史记录不一定合适（会让用户的历史记录变多变乱），酌情使用`replaceState()`而不是`pushState()`来控制历史记录的数量。

##结语##

HTML5 history API简单易学，不多的几行代码就可以做到“状态记录”这个小小的改进，如果可以由你选择“渐进增强”，它还真的可以上线！

[caniuse]: http://caniuse.com/#search=history "Can I use... #Session history management"
[History.js]: https://github.com/browserstate/history.js/ "History.js"
[W3C Blog的这篇文章]: http://www.w3.org/blog/2011/05/hash-uris/ "Hash URIs | W3C Blog"
[pjax]: http://pjax.herokuapp.com/ "pjax"
[turbolinks]: https://github.com/rails/turbolinks "turbolinks"
