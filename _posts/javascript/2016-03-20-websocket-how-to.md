---
layout: post
title: "WebSocket的简单介绍及应用"
category: "javascript"
description: "只是HTTP协议的话，某些场景下浏览器和服务器的通信会比较难做，那么WebSocket这个新协议可以带来怎样的改进呢？"
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
Sec-WebSocket-Key:pAloKxsGSHtpIHrJdWLvzQ==
Sec-WebSocket-Version:13
~~~

其中HTTP头部字段`Upgrade: websocket`和`Connection: Upgrade`很重要，告诉服务器通信协议将发生改变，转为WebSocket协议。支持WebSocket的服务器端在确认以上请求后，应返回状态码为`101 Switching Protocols`的响应：

~~~http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: nRu4KAPUPjjWYrnzxDVeqOxCvlM=
~~~

其中字段`Sec-WebSocket-Accept`是由服务器对前面客户端发送的`Sec-WebSocket-Key`进行确认和加密后的结果，相当于一次验证，以帮助客户端确信对方是真实可用的WebSocket服务器。

验证通过后，这个握手响应就确立了WebSocket连接，此后，服务器端就可以主动发信息给客户端了。此时的状态比较像服务器端和客户端接通了电话，无论是谁有什么信息想告诉对方，开口就好了。

一旦建立了WebSocket连接，此后的通信就不再使用HTTP了，改为使用WebSocket独立的数据帧（这个帧有办法看到，见后文）。

整个过程像这样：

![Websocket协议建立过程][img_websocket_process]

## 简单的应用示例 ##

应用WebSocket有这样几件事要做：

- 选用[支持WebSocket的浏览器][支持WebSocket的浏览器]。
- 网页内添加创建WebSocket的代码。
- 服务器端添加使用WebSocket通信的代码。

### 服务器端 ###

以Node的服务器为例，我们使用[ws][ws]这个组件，这样搭建一个支持WebSocket的服务器端：

~~~javascript
var request = require("request");
var dateFormat = require("dateformat");
var WebSocket = require("ws"),
    WebSocketServer = WebSocket.Server,
    wss = new WebSocketServer({
        port: 8080,
        path: "/guest"
    });

// 收到来自客户端的连接请求后，开始给客户端推消息
wss.on("connection", function(ws) {
    ws.on("message", function(message) {
        console.log("received: %s", message);
    });
    sendGuestInfo(ws);
});

function sendGuestInfo(ws) {
    request("http://uinames.com/api?region=china",
        function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var jsonObject = JSON.parse(body),
                    guest = jsonObject.name + jsonObject.surname,
                    guestInfo = {
                        guest: guest,
                        time: dateFormat(new Date(), "HH:MM:ss")
                    };

                if (ws.readyState === WebSocket.OPEN) {

                    // 发，送
                    ws.send(JSON.stringify(guestInfo));

                    // 用随机来“装”得更像不定时推送一些
                    setTimeout(function() {
                        sendGuestInfo(ws);
                    }, (Math.random() * 5 + 3) * 1000);
                }
            }
        });
}
~~~

这个例子使用了姓名生成站点[uinames][uinames]的API服务，来生成`{guest: "人名", time: "15:26:01"}`这样的数据。函数`sendGuestInfo()`会不定时执行，并把包含姓名和时间的信息通过`send()`方法发送给客户端。另外，注意`send()`方法需要以字符串形式来发送json数据。

这就像是服务器自己在做一些事，然后在需要的时候会通知客户端一些信息。

### 客户端 ###

客户端我们使用原生javascript来完成（仅支持WebSocket的浏览器）：

~~~javascript
var socket = new WebSocket("ws://localhost:8080/guest");

socket.onopen = function(openEvent) {
    console.log("WebSocket conntected.");
};

socket.onmessage = function(messageEvent) {
    var data = messageEvent.data,
        dataObject = JSON.parse(data);
    console.log("Guest at " + dataObject.time + ": " + dataObject.guest);
};

socket.onerror = function(errorEvent) {
    console.log("WebSocket error: ", errorEvent);
};

socket.onclose = function(closeEvent) {
    console.log("WebSocket closed.");
};
~~~

WebSocket的URL格式是`ws://`与`wss://`。因此，需要注意下URL地址的写法，这也包括注意WebSocket服务器端的路径（如这里的`/guest`）等信息。因为是本地的示例所以这里是`localhost`。

客户端代码的流程很简单：创建`WebSocket`对象，然后指定`onopen`、`onmessage`等事件的回调即可。其中`onmessage`是客户端与服务器端通过WebSocket通信的关键事件，想要在收到服务器通知后做点什么，写在`onmessage`事件的回调函数里就好了。

### 效果及分析 ###

通过`node server`（假定服务器端的文件名为`server.js`）启动WebSocket服务器后，用浏览器打开一个引入了前面客户端代码的html（直接文件路径`file:///`就可以），就可以得到像这样的结果：

![websocket的即时姓名][img_websocket_preview]

联系前面客户端的代码可以想到，实际从创建`WebSocket`对象的语句开始，连接请求就会发送，并很快建立起WebSocket连接（不出错误的话），此后就可以收到来自服务器端的通知。如果此时客户端还想再告诉服务器点什么，这样做：

~~~javascript
socket.send("Hello, server!");
~~~

服务器就可以收到：

![服务器端已收到][img_server_recevied_via_websocket]

当然，这也是因为前面服务器端的代码内同样设置了`message`事件的回调。在这个客户端和服务器都是javascript的例子中，无论是服务器端还是客户端，都用`send()`发送信息，都通过`message`事件设置回调，形式上可以说非常一致。

## 其他可用的数据类型 ##

WebSocket的`send()`可以发送的消息，除了前面用的字符串类型之外，还有两种可用，它们是[Blob][Blob]和[ArrayBuffer][ArrayBuffer]。

它们都代表二进制数据，可用于原始文件数据的发送。比如，这是一个发送Blob类型数据以完成向服务器上传图片的例子：

~~~javascript
var fileEl = document.getElementById("image_upload");
var file = fileEl.files[0];
socket.send(file);
~~~

然后服务器端可以这样把文件保存下来：

~~~javascript
var fs = require("fs");

wss.on("connection", function(ws) {
    ws.on("message", function(message) {
        fs.writeFile("upload.png", message, "binary", function(error) {
            if (!error) {
                console.log("File saved.");
            }
        });
    });
});
~~~

在客户端接收二进制数据时，需注意WebSocket对象有一个属性`binaryType`，初始值为`"blob"`。因此，如果接收的二进制数据是`ArrayBuffer`，应在接收之前这样做：

~~~javascript
socket.binaryType = "arraybuffer";
~~~

## 其他WebSocket服务器端 ##

其他语言来做WebSocket服务器是怎样的呢？下面是一个php的WebSocket服务器的例子（使用[Ratchet][Ratchet]）：

~~~php
<?php
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

require __DIR__ . '/vendor/autoload.php';

class GuestServer implements MessageComponentInterface {

    public function onOpen(ConnectionInterface $conn) {
        $conn->send('The server is listening to you now.');
    }

    public function onMessage(ConnectionInterface $conn, $msg) {
        $conn->send($this->generateGuestInfo());
    }

    public function onClose(ConnectionInterface $conn) {
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        $conn->close();
    }

    private function generateGuestInfo() {
        $jsonString = file_get_contents('http://uinames.com/api?region=china');
        $jsonObject = json_decode($jsonString, true);
        $guest = $jsonObject['name'] . $jsonObject['surname'];
        $guestInfo = array(
            'guest' => $guest,
            'time' => date('H:i:s', time()),
        );

        return json_encode($guestInfo);
    }
}

$app = new Ratchet\App('localhost', 8080);
$app->route('/guest', new GuestServer(), array('*'));
$app->run();
?>
~~~

这个例子也同样是由服务器返回`{guest: "人名", time: "15:26:01"}`的json数据，不过由于php不像Node那样可以用`setTimeout()`很容易地实现异步定时任务，这里改为在客户端发送一次任意信息后，再去uinames取得信息并返回。

也可以看到，php搭建的WebSocket服务器仍然是近似的，主要通过WebSocket的`open`、`message`等事件来实现功能。

## 在Chrome开发工具中查看WebSocket数据帧 ##

Chrome开发工具中选择Network，然后找到WebSocket的那个请求，里面可以选择Frames。在Frames里看到的，就是WebSocket的数据帧了：

![查看WebSocket数据帧][img_chrome_websocket_frames]

可以看到很像聊天记录，其中用浅绿色标注的是由客户端发送给服务器的部分。

## 结语 ##

总的来说，把服务器和客户端拉到了一个聊天窗口来办事，这确实是很棒的想法。

即使只从形式上说，WebSocket的事件回调感觉也比定时任务用起来要更亲切一些。

[img_websocket_process]: {{POSTS_IMG_PATH}}/201603/websocket_process.png "Websocket协议建立过程"
[img_websocket_preview]: {{POSTS_IMG_PATH}}/201603/websocket_preview.gif "websocket的即时姓名"
[img_server_recevied_via_websocket]: {{POSTS_IMG_PATH}}/201603/server_recevied_via_websocket.png "服务器端已收到"
[img_chrome_websocket_frames]: {{POSTS_IMG_PATH}}/201603/chrome_websocket_frames.png "查看WebSocket数据帧"

[IETF]: https://zh.wikipedia.org/wiki/%E4%BA%92%E8%81%94%E7%BD%91%E5%B7%A5%E7%A8%8B%E4%BB%BB%E5%8A%A1%E7%BB%84 "互联网工程任务组"
[Protocol]: https://tools.ietf.org/html/rfc6455 "RFC 6455 - The WebSocket Protocol"
[API]: https://www.w3.org/TR/websockets/ "The WebSocket API"
[支持WebSocket的浏览器]: http://caniuse.com/#feat=websockets "Can I use - Web Sockets"
[ws]: https://www.npmjs.com/package/ws "ws - npm"
[uinames]: http://uinames.com/ "uinames.com: Randomly Generate Fake Names"
[Ratchet]: http://socketo.me/ "Ratchet - PHP WebSockets"
[Blob]: https://developer.mozilla.org/zh-CN/docs/Web/API/Blob "Blob - Web API 接口 | MDN"
[ArrayBuffer]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer "ArrayBuffer - JavaScript | MDN"