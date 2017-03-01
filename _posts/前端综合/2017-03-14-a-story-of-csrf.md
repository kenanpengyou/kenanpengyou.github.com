---
layout: post
title: "csrf的故事"
category: "前端综合"
description: "csrf的故事"
---
{% include JB/setup %}



## 提纲 ##

1. 攻击者以 具有写效果 的请求为攻击目标，而不是窃取数据，因为攻击者没有办法拿到伪造的请求的返回（同源策略）。
自绘插图（用微博里的教你轻松画表情的某个视频的风格）
2. 成本
2. 即便POST也能被伪造，但POST的csrf的成本也要高一些，所以改为POST就是一个很好的建议。

[img_components_in_frameworks]: {{POSTS_IMG_PATH}}/201701/components_in_frameworks.png "前端框架里的组件"


[rscss]: http://rscss.io/ "rscss"
