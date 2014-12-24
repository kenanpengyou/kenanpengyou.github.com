---
layout: post
title: "HTML5 history API，创造更好的浏览体验"
category: "javascript"
description: ""
---
{% include JB/setup %}

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
