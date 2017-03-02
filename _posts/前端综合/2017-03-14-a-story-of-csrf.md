---
layout: post
title: "有关CSRF的安全小册子"
category: "前端综合"
description: "CSRF的故事"
---
{% include JB/setup %}



## 提纲 ##

Cross-Site Request Forgery (CSRF)

1. 攻击者以 具有写效果 的请求为攻击目标，而不是窃取数据，因为攻击者没有办法拿到伪造的请求的返回（同源策略）。

自绘插图（用微博里的教你轻松画表情的某个视频的风格）

2. CSRF的危害，取决于受害方在某一web应用上的权限。如果是普通的，也无非就是一些用户功能，可以篡改用户信息。如果是管理员，就可能毁掉整个web应用。社交网站，或银行等涉及金钱的网站，更可能被CSRF攻击盯上。

3. XSS和CSRF也有一定关系，因为XSS把恶意代码铺到了目标站点自身，因此token，referer等常规的CSRF防御手段也都会失效。因为XSS的恶意代码就在站点自身，所以不受同源策略限制，是很危险的。如果要防护好CSRF，XSS的防护也是必需的。

4. 有部分Header 是不可被程序修改的，参见 https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name，只要你用的不是假的浏览器（被篡改过的）。一般的跨域请求会携带Origin（但image的src等许多是不会携带的）。这个也可以用来防范CSRF。一般还有一个建议是，如果一个请求没有同时携带Origin和Referer，应拒绝。

这篇论文有很不错的图：
https://seclab.stanford.edu/websec/csrf/csrf.pdf

5. 如果没有Origin，检查Referer（它很常被用来对抗CSRF）

应对方法

1. 一系列如下，从上到下依次效果减弱。
1. Synchronizer (i.e.,CSRF) Tokens (requires session state)
Approaches that do require no server side state:
2. Double Cookie Defense
3. Encrypted Token Pattern
4. Custom Header - e.g., X-Requested-With: XMLHttpRequest
These are listed in order of strength of defense.

CSRF Token是最有效也最常用的方法。生成的Token必须是随机的，以保证不被攻击者猜到。
一般来说，token刚创建后，就存储在该sessoin了，只要session未过期，这个token就不变，在初始创建后，就一直用于后续的请求。

如果收到了一个伪造的请求，比如跨站POST过来，但没有携带正确的token，则这条请求将被log记录，标识为潜在的CSRF攻击，并且重置这个token。

如果想进一步提高安全性，可以每个请求一个csrf token。


2. 即便POST也能被伪造，但POST的csrf的成本也要高一些，所以改为POST就是一个很好的建议。

[img_components_in_frameworks]: {{POSTS_IMG_PATH}}/201701/components_in_frameworks.png "前端框架里的组件"


[rscss]: http://rscss.io/ "rscss"
