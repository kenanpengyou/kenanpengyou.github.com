---
layout: post
title: "有关CSRF的安全小册子"
category: "前端综合"
description: "CSRF的故事"
---
{% include JB/setup %}

## 故事 ##

小可刚登录了一下




**CSRF**（**Cross-Site Request Forgery，跨站请求伪造**）



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

### 应对方法 ###

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

如果想进一步提高安全性，可以每个请求一个csrf token，不过这样做也有坏处，就是很容易因为用户一个back按钮，就使得当前页token失效，从而提交表单会失败。


2. 即便POST也能被伪造，但POST的csrf的成本也要高一些，所以改为POST就是一个很好的建议。

3. Double Submit Cookie
跨站请求的一方无法读取cookie或发送时的cookie（cookie是一个forbidden http header），因此double submit cookie里要求 Cookie 字段值和 请求参数的某个值要一致，就没法得到。

4. 对于REST api 风格的，则可以简单一点，使用一个自定义header来完成。由于CORS的设置，只要有自定义header，就算作非简单请求，非简单请求一定会有一个预请求，这个预请求的时候是不会携带自定义Header的，由于目标网站肯定不会配合CORS，所以跨站攻击将无法成功。

比如，很多js库的ajax请求都会携带 X-Requested-With: XMLHttpRequest 这个Header，检查这个Header是否存在，如果不存在就拒绝，这就可以防御 CSRF 攻击。有一个漏洞是flash的跨域可以自定义Header，但是即使是flash也不能自定Origin或Referer，因此同时检查它们应该就是一个很不错的 CSRF 安全策略了。

5. 还有一个偏向用户动作的策略，就是确认操作。
比如用户做了一次转账，首先为这一次转账生成一个随机的ID，然后用户点击确认后再带着这个ID作为参数发送，来正式执行这一次操作。由于真正转账的请求涉及到一个站点自己生成的ID（类似流水号），跨站攻击方是得不到这个值的，也就无从在参数中加入这个值。

### 对用户来说，一些可以帮助预防CSRF的tips ###

用完一些web服务后记得立即退出，尤其是银行的一些服务。
不要让浏览器记住你的一些比较重要的web服务的账号/密码。
不要用同一个浏览器在使用一些重要web应用的同时，开新标签做别的。可以考虑直接分浏览器，比如firefox只开一个银行，chrome拿来随便上网。



[img_components_in_frameworks]: {{POSTS_IMG_PATH}}/201701/components_in_frameworks.png "前端框架里的组件"


[rscss]: http://rscss.io/ "rscss"
