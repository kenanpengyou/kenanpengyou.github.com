---
layout: demo
title: "打砖块"
description: "使用html5画布canvas元素制作的经典的打砖块游戏，欢迎来尝试通关~"
pageFlag: "demo"
demoName: "brick-breaker"
demoCover: "brick_cover.jpg"
demoCSS: "brick_style.css"
demoJS: "canvasBrick.js"
---
{% include JB/setup %}

<div class="canvas_brick demo_heroine">
    <div class="canvas_container">
        <canvas id="brickCanvas" width="640" height="500"></canvas>
        <p id="supportNote">抱歉，你所使用的浏览器不支持canvas</p>
    </div>
</div>
<div class="demo_heroine_note">请在宽度大于740px的情况下查看</div>

经典游戏打砖块（Brick Breaker）。

操作方法：  
←[LEFT]  -  挡板左移  
→[RIGHT]  -  挡板右移  
Z[字母Z键] -  释放小球

需要支持canvas画布的浏览器（IE9+及其他）。

[源代码][source view]

原生javascript编写，尝试使用了Publish/Subscribe（发布/订阅）及MVC模式。

[source view]: http://runjs.cn/code/l8zh4leo  "查看源码"