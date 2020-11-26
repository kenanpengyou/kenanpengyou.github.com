---
layout: post
title: "在Video.js播放器中定制自己的组件"
category: "前端综合"
description: "Video.js是一个很棒的视频播放功能第三方库。但是想要更深度的定制自己的组件有一定门槛，希望本文给你带来一点帮助。"
---
{% include JB/setup %}

视频播放是网页中常见的一个比较重量级的功能。作为HTML5的内容之一，`<video>`标签已经出现很久了。仅使用`<video>`标签虽然简单，但如果需要视频播放控制，不同浏览器会有不同的原生控制界面，而且从功能上说也可能有所不足。

更多情况下，我们都想要打造一个界面统一，又满足定制需求的视频播放器。

[Video.js][Video.js]就是一个常见的用来打造视频播放器的开源框架。在本文的时间点，它的最新版本是v7.11.0。

## 从默认播放器开始 ##

打造播放器，需要一点一点来。我们先看看默认的播放器。

下面是一个用最简单的方式引入Video.js的例子（使用了[Parcel][Parcel]进行快速构建）：

~~~html
<video id="video_target" class="video-js">
    <source type="video/mp4" src="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4">
</video>
~~~

~~~js
import "video.js/src/css/video-js.scss";
import videojs from "video.js";

const options = {
    controls: true,
    fluid: true
};
let videoEl = document.getElementById("video_target");
let player = videojs(videoEl, options);
~~~

这段代码中，配置项`controls: true`表示允许显示播放器界面，`fluid: true`表示将视频播放器宽度调整至和容器一致。

到此，就可以看到默认播放器的界面：

![Video.js默认播放器][img_videojs_default]

接下来，我们在这个播放器的基础之上，增加一个**自己定制的组件**。

## Video.js中的组件 ##

定制自己的组件，首先要理解Video.js内部的**组件**（**components**）这一概念。你已经看到了默认播放器，注意到它已经包含了进度条、播放按钮、音量控制、视频时间、全屏按钮等常见的视频播放器组成元素。这些组成元素，就是Video.js的组件。而更准确一点说，Video.js内部定义了`Component`这个组件类，任何播放器的组成元素，甚至这个播放器整体，都属于这个组件类（继承自`Component`）。

Video.js组件也像DOM那样具有树形的层级关系，比如所有组件都是`Player`这个顶层组件的子组件，`VolumePanel`是`ControlBar`的子组件。默认播放器的完整组件结构可以参照[Video.js官方文档的components][Video.js官方文档的components]。



## 结语 ##

另外还有一个播放器库[DPlayer][DPlayer]（以前叫MoePlayer）也很推荐。
[Video.js官方文档][Video.js官方文档]目前对于定制控件并没有描述得很清晰，因此本文将比较具体的说明如何制作自己的控件。


[img_videojs_default]: {{POSTS_IMG_PATH}}/202012/videojs_default.png "Video.js默认播放器"

[Video.js]: https://videojs.com/ "Video.js - Make your player yours | Video.js"
[Parcel]: https://github.com/parcel-bundler/parcel "Parcel"
[Video.js官方文档的components]: https://docs.videojs.com/tutorial-components.html#default-component-tree "Tutorial: components | Video.js Documentation"
[Video.js官方文档]: https://docs.videojs.com/ "Home | Video.js Documentation"
[DPlayer]: https://github.com/DIYgod/DPlayer
