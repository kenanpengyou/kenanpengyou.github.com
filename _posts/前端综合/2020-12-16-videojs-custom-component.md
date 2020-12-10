---
layout: post
title: "在Video.js播放器中定制自己的组件"
category: "前端综合"
description: "Video.js是一个很棒的视频播放功能第三方库。但是想要更深度的定制自己的组件有一定门槛，希望本文给你带来一点帮助。"
---
{% include JB/setup %}

视频播放是网页中常见的一个比较重量级的功能。作为HTML5的内容之一，`<video>`标签已经出现很久了。仅使用`<video>`标签虽然简单，但如果需要视频播放控制，不同浏览器会有不同的原生控制界面，而且在功能上也很可能有所不足。

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

参照默认播放器的完整组件结构，我们可以移除任意的默认组件。比如下面这样操作：

~~~js
let controlBar = player.getChild("ControlBar");
let volumePanel = controlBar.getChild("VolumePanel");
let pictureInPictureToggle = controlBar.getChild("PictureInPictureToggle");

controlBar.removeChild(volumePanel);
controlBar.removeChild(pictureInPictureToggle);
~~~

然后效果是：

![移除默认组件][img_videojs_remove_default]

可以看到，音量（`VolumePanel`）和画中画（`PictureInPictureToggle`）就已经被移除了。

这里使用的`getChild()`和`removeChild()`两个方法，在[API文档][API文档]里都可以搜索到，属于基础的组件类`Component`的方法。`getChild()`通过组件名获取子组件，`removeChild()`通过组件名删除子组件。

我们想要的定制组件，最终也是和这些默认组件一样，存在于Video.js的组件树中，可以被获取和移除。

## 定制组件目标 ##

现在，我们为默认播放器添加一个下面这样的自定义组件（视频画面中央）：

![新增组件：触摸调整视频进度][img_bilibili_feature]

这个组件参考自bilibili微信小程序，作用是播放画面本身可以触摸，触摸画面后再左右滑动，就可以把视频进度向前或向后移动，同时会在画面中央显示视频进度将跳转的时间点。

这个触摸交互在很多手机APP内的视频播放器中都可以见到，非常有用。

## 为Video.js新增组件类 ##

前面提到过的音量控制，就是一个名为`VolumePanel`的组件类。我们在Video.js中增加自定义组件，也是要增加一个全新的组件类。

这个触摸交互的组件类我们在这里命名为`TouchOverlay`。

创建组件类的方法是继承Video.js的`Component`类。像下面这样：

~~~js
const Component = videojs.getComponent("Component");

class TouchOverlay extends Component {
    // ...
}
~~~

`getComponent()`是`videojs`本身的静态方法，可以获取到`Component`类。

接下来，我们详细的为这个自定义组件类添加相应的功能：

继承自`Component`类，也就拥有了Video.js已经定义好的组件基础方法

~~~js
class TouchOverlay extends Component {

    constructor (player, options) {
        super(player, options);

        player.on("loadedmetadata", () => {
            this.totalDuration = player.duration();
        });
        this.on("touchstart", this.handleTouchstart);
        this.on("touchmove", this.handleTouchmove);
        this.on("touchend", this.handleTouchend);
    }

    createEl () {
        let overlay = videojs.dom.createEl("div", {
            className: "vjs-touch-overlay",
            tabIndex: -1
        });
        let seekNote = videojs.dom.createEl("span", {
            className: "vjs-touch-seek-note"
        });
        videojs.dom.appendContent(overlay, seekNote);
        this.seekNote = seekNote;
        return overlay;
    }

    handleTouchstart (event) {
        if (this.totalDuration) {
            this.addClass("vjs-touch-active");
            this.touchStateActive = true;
            this.totalWidth = this.currentWidth();
            this.startX = event.touches[0].clientX;
        }
    }

    handleTouchend () {
        this.touchStateActive = false;
        this.removeClass("vjs-touch-active");

        if (this.hasClass("vjs-touch-moving")) {
            this.removeClass("vjs-touch-moving");
            this.player().currentTime(this.toSeconds);
        }
    }

    handleTouchmove (event) {
        if (this.touchStateActive) {
            this.addClass("vjs-touch-moving");
            let currentX = event.touches[0].clientX;
            let dx = currentX - this.startX;
            let deltaX = dx / this.totalWidth;
            let currentSeconds = this.player().currentTime();
            let toSeconds = currentSeconds + deltaX * this.totalDuration;

            if (toSeconds < 0) {
                toSeconds = 0;
            } else if (toSeconds > this.totalDuration) {
                toSeconds = this.totalDuration;
            }

            let toTime = this.formatTime(toSeconds);
            videojs.dom.insertContent(this.seekNote, toTime);
            this.toSeconds = toSeconds;
        }
    }

    formatTime (secondsTotal) {
        secondsTotal = Math.floor(secondsTotal);
        let minutes = Math.floor(secondsTotal / 60);
        let seconds = secondsTotal % 60;
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }
}
~~~

## 结语 ##

另外还有一个播放器库[DPlayer][DPlayer]（以前叫MoePlayer）也很推荐。
[Video.js官方文档][Video.js官方文档]目前对于定制控件并没有描述得很清晰，因此本文将比较具体的说明如何制作自己的控件。


[img_videojs_default]: {{POSTS_IMG_PATH}}/202012/videojs_default.png "Video.js默认播放器"
[img_videojs_remove_default]: {{POSTS_IMG_PATH}}/202012/videojs_remove_default.png "移除默认组件"
[img_bilibili_feature]: {{POSTS_IMG_PATH}}/202012/bilibili_feature.jpg "新增组件：触摸调整视频进度"

[Video.js]: https://videojs.com/ "Video.js - Make your player yours | Video.js"
[Parcel]: https://github.com/parcel-bundler/parcel "Parcel"
[Video.js官方文档的components]: https://docs.videojs.com/tutorial-components.html#default-component-tree "Tutorial: components | Video.js Documentation"
[Video.js官方文档]: https://docs.videojs.com/ "Home | Video.js Documentation"
[API文档]: https://docs.videojs.com/component "Class: Component | Video.js Documentation"
[DPlayer]: https://github.com/DIYgod/DPlayer "DPlayer"
