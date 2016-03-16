---
layout: post
title: "WebSocket的简单介绍及应用"
category: "javascript"
description: "WebSocket "
---
{% include JB/setup %}

## 定时刷新的不足与改进 ##

web开发中可能遇到这样的场景：网页里的某一块区域里写了一些内容，但这些内容不是固定的，即使看网页的人没有做任何操作，它们也会随时间不断变化。股票行情、活动或游戏的榜单都是比较常见的例子。

对此，一般的做法是用`setTimeout()`或`setInverval()`定时执行任务，任务内容是Ajax访问一次服务器，并在成功拿到返回数据后去更新页面。

这种定时刷新的做法会有这样一些感觉不足的地方：

- 频繁的定时网络请求对浏览器（客户端）和服务器来说都是一种负担，尤其是当网页里有多个定时刷新区域的时候。
- 某几次的定时任务可能是不必要的，因为服务器可能并没有新数据，还是返回了和上一次一样的内容。
- 页面内容可能不够新，因为服务器可能刚更新了数据，但下一轮定时任务还没有开始。

造成这些不足的原因归结起来，主要还是由于服务器的响应总是被动的。HTTP协议限制了一次通信总是由客户端发起请求，再由服务器端来返回响应。

因此，如果让服务器端也可以主动发送信息到客户端，就可以很大程度改进这些不足。WebSocket就是一个实现这种双向通信的新协议。

## WebSocket是基于HTTP的功能追加协议 ##

WebSocket最初由html5提出，但现在已经发展为一个独立的协议标准。WebSocket可以分为协议（[Protocol][Protocol]）和[API][API]两部分，分别由[IETF][IETF]和W3C制定了标准。

先来看看WebSocket协议的建立过程。

为了实现WebSocket通信，首先需要客户端发起一次普通HTTP请求（也就是说，WebSocket的建立是依赖HTTP的）。请求报文可能像这样：

~~~http
GET ws://websocket.example.com/ HTTP/1.1
Host: websocket.example.com
Upgrade: websocket
Connection: Upgrade
Origin: http://example.com
~~~

支持WebSocket的服务器端在确认以上请求后，返回状态码为`101 Switching Protocols`的响应：

~~~http
HTTP/1.1 101 Switching Protocols
Date: Wed, 16 Mar 2016 10:07:34 GMT
Connection: Upgrade
Upgrade: WebSocket
~~~

这样握手确立了WebSocket连接后，服务器端就可以主动发信息给客户端了。此时的状态比较像服务器端和客户端接通了电话，无论是谁有什么信息想告诉对方，开口就好了。

此外，一旦建立了WebSocket连接，此后的通信就不再使用HTTP了，改为使用WebSocket独立的数据帧（这个帧是什么，怎么看，请看后文）。

## 简单的应用示例 ##

应用WebSocket有这样几件事要做：

- 选用[支持WebSocket的浏览器][支持WebSocket的浏览器]。
- 网页内添加创建websocket的代码。
- 服务器端添加通过websocket通信的代码。

### 服务器端 ###

以Node的服务器为例，我们使用[ws][ws]这个组件。


WebSocket的URL格式是`ws://`与`wss://`

The second, protocols, if present, is either a string or an array of strings. If it is a string, it is equivalent to an array consisting of just that string; if it is omitted, it is equivalent to the empty array. Each string in the array is a subprotocol name. The connection will only be established if the server reports that it has selected one of these subprotocols.

WebSocket包括协议及API，WebSocket协议由IETF（The Internet Engineering Task Force，互联网工程任务组）定为标准。WebSocket API则由W3C定为标准。

## 结语 ##


[img_browserify_logo]: {{POSTS_IMG_PATH}}/201506/browserify_logo.png "Browserify"

[IETF]: https://zh.wikipedia.org/wiki/%E4%BA%92%E8%81%94%E7%BD%91%E5%B7%A5%E7%A8%8B%E4%BB%BB%E5%8A%A1%E7%BB%84 "互联网工程任务组"
[Protocol]: https://tools.ietf.org/html/rfc6455 "RFC 6455 - The WebSocket Protocol"
[API]: https://www.w3.org/TR/websockets/ "The WebSocket API"
[支持WebSocket的浏览器]: http://caniuse.com/#feat=websockets "Can I use - Web Sockets"
[ws]: https://www.npmjs.com/package/ws "ws - npm"