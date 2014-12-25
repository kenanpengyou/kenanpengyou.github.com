---
layout: post
title: "HTML5 history API，创造更好的浏览体验"
category: "javascript"
description: ""
---
{% include JB/setup %}

HTML5 history API有什么用呢？

##从Ajax翻页的问题说起##

请想象你正在看一个视频下面的评论，在翻到十几页的时候，你发现一个写得稍长，但非常有趣的评论。正当你想要停下滚轮细看的时候，手残按到了F5。然后，页面刷新了，评论又回到了第一页，所以你又要重新翻一次。

再或者，你想把这个评论发给别人分享，一面给了别人页面地址，一面又要加一句嘱咐：请翻到下面评论的第XX页的XX楼。

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

##如何应用##

HTML5 history API只包括2个方法：`history.pushState()`和`history.replaceState()`，以及1个事件：`window.onpopstate`。

###history.pushState()###

它的完全体是 `history.pushState(stateObject, title, url)`，包括三个参数。

第1个参数是状态对象，它可以理解为一个拿来存储自定义数据的元素。它和同时作为参数的`url`会关联在一起。

第2个参数是标题，是一个字符串，目前各类浏览器都会忽略它（以后才有可能启用，用作页面标题），所以设置成什么都没关系。目前建议设置为空字符串。

第3个参数是URL地址，一般会是简单的`?page=2`这样的参数风格的相对路径，它会自动以当前URL为基准。需要注意的是，本参数URL需要和当前页面URL同源，否则会抛出错误。

调用`pushState()`方法将新生成一条历史记录，方便用浏览器的“后退”和“前进”来导航（“后退”可是相当常用的按钮）。另外，从URL的同源策略可以看出，HTML5 history API的出发点是很明确的，就是让无跳转的单站点也可以将它的各个状态保存为浏览器的多条历史记录。当通过历史记录重新加载站点时，站点可以立即转变为对应的状态。

###history.replaceState()###

它和`history.pushState()`方法基本相同，区别只有一点，`history.replaceState()`不会新生成历史记录，而是将当前历史记录直接替换掉。

###window.onpopstate###

从`pop`和`push`的对立感可以猜到，这个事件是在浏览器取出历史记录加载时触发的。但实际上它的条件更苛刻一些，只有点击浏览器的“前进”、“后退”这些导航按钮，或者是由JavaScript调用的`history.back()`等导航方法，且切换前后的两条历史记录都属于同一个网页文档，才会触发本事件。

上面的“同一个网页文档”请理解为JavaScript环境的`document`是同一个，而不是指基础URL（去掉各类参数的）相同。也就是说，只要有重新加载发生（无论是跳转到一个新站点还是继续在本站点），JavaScript的环境发生了变化，`popstate`事件都不会触发。

虽然这样说起来








##提纲##

重点是3个：

history.pushState(stateObj, title, url);
history.replaceState(stateObj, title, url);
window.onpopstate 事件（区分window.onload、onhashchange事件）

ajax的翻页的问题：

1. 无法保持当前位于“哪一页”的状态，一旦F5刷新后，都将返回初始状态（第一页）。

处理方法：

1. 首先，让服务器端代码支持 ? 形式作为参数的页码。输入对应的页码，可以直接得到对应的页的内容。
2. 使用history.pushState()，在任一次翻页的同时，也设置正确的带 ? 参数的URL。
3. 到此，就可以得到会保存状态的ajax翻页了。
4. 但是，还没有结束，在浏览器中点击后退，（例如从?page=3退到?page=2），会发现没有变化，因为js还没有处理好这种情况下的变化。
5. 这时候就要用到onpopstate事件了。
6. 在onpopstate事件里加入翻页的处理。
7. HTML5浏览器完成。
8. 接下来再处理不支持HTML5 history的浏览器，降级到Hash。
9. 


pushState()和window.location="#foo"有一些相似，但pushState()有以下特点：

1. pushState()的地址必须同源，否则会报错。而window.location只有在仅修改hash时，才不改变document。
2. window.location仅修改hash，仅当hash的确有改变时，才能生成历史记录。
3. pushState()可以将任意数据关联到一个url上。如果用hash的形式，可能需要将所有数据编码成一个字符串来保存。

pushState() 不会触发 hashchange 事件。即使新URL和旧URL的差别只是hash。






{% highlight javascript %}
hi();
{% endhighlight %}

##一点总结##


![休息一下...][img_coffee_chino_draw]

[img_coffee_chino_draw]: {{POSTS_IMG_PATH}}/201411/coffee_chino_draw.jpg "休息一下..."

[coffeescript.org]: http://coffeescript.org/ "CoffeeScript"
