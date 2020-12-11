---
layout: post
title: "在Video.js播放器中定制自己的组件"
category: "前端综合"
description: "Video.js是一个很棒的视频播放器框架。但是，想要比较深度地定制它，增加自己的组件，还是有一定的门槛。本文将用一个具体的例子，说明如何为Video.js添加自定义组件。"
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

可以看到，默认的音量（`VolumePanel`）和画中画（`PictureInPictureToggle`）就已经被移除了。

这里使用的`getChild()`和`removeChild()`两个方法，在[API文档][API文档]里都可以搜索到，属于基础的组件类`Component`的方法。`getChild()`通过组件名获取子组件，`removeChild()`通过组件名删除子组件。

我们想要的定制组件，最终也是和这些默认组件一样，存在于Video.js的组件树中，可以被获取和移除。

## 定制组件目标 ##

现在，我们为默认播放器添加一个下面这样的自定义组件（视频画面中央）：

![新增组件：触摸调整视频进度][img_bilibili_feature]

这个组件参考自bilibili微信小程序，作用是播放画面本身可以触摸，触摸画面后再左右滑动，就可以把视频进度向前或向后移动，同时会在画面中央显示视频进度将跳转的时间点。

这个触摸交互在很多手机APP内的视频播放器中都可以见到，非常有用。

## 为Video.js新增组件类 ##

前面提到过的音量控制，就是一个名为`VolumePanel`的组件类。我们在Video.js中增加自定义组件，就是要增加一个全新的组件类。

这个触摸交互的组件类我们在这里命名为`TouchOverlay`。

创建组件类的方法是继承Video.js的`Component`类。像下面这样：

~~~js
const Component = videojs.getComponent("Component");

class TouchOverlay extends Component {
    // ...
}
~~~

`getComponent()`是`videojs`本身的静态方法，可以获取到`Component`类。

接下来，我们详细地实现这个自定义组件类：

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

以上是这个组件类定义的完整代码，非常长，我们一点一点来解释。

首先，这个组件类定义一共有6个函数，只有前2个，也就是`constructor`和`createEl`是基类`Component`里就有的方法，所以这里是覆盖基类同名方法。除此之外，剩余的函数里，`handleTouchstart`、`handleTouchend`、`handleTouchmove`都是触摸动作的事件处理方法，最后的`formatTime`则是一个简单的帮助方法，它的作用是把秒数转换成时间文字，比如`86`将转换为`"1:26"`。

`constructor`构造函数和Video.js的所有其他组件一样，都携带`player`参数，也就是所在的播放器实例的引用。除了`super`调用基类方法外，
只做了2件事：获取当前播放视频的总时长（需要等待`loadedmetadata`事件完毕）并保存到`totalDuration`属性里；以及绑定触摸事件处理方法。这里可以用`on()`这样的语法来绑定事件，是因为Video.js已经帮我们在基类`Component`里做了定义。

`createEl`用于定义和这个组件对应的DOM元素。这里，我们使用的DOM结构是：

~~~html
<div class="vjs-touch-overlay">
    <span class="vjs-touch-seek-note"></span>
</div>
~~~

外层的`div.vjs-touch-overlay`侦听触摸动作，内层的`span.vjs-touch-seek-note`指示跳转时间点。这里的class名字可以是任意的。不过，为了体现这些DOM元素是属于Video.js的组件，建议和Video.js的其他组件一致，使用`vjs-`前缀的格式来命名。

组件的DOM元素现在有了，但我们还需要为它们增加css样式（scss）：

~~~scss
.video-js {
  .vjs-touch-overlay {
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    left: 0;
    top: 0;
  }
  &.vjs-has-started .vjs-touch-overlay {
    pointer-events: auto;
  }
  .vjs-touch-seek-note {
    display: none;
    margin: auto;
    padding: 10px 15px;
    border-radius: 2px;
    background: rgba(#000, .3);
    color: #fff;
    font-size: 16px;
  }
  .vjs-touch-overlay.vjs-touch-active.vjs-touch-moving .vjs-touch-seek-note {
    display: block;
  }
}
~~~

这里的样式也有2个关键点。一是`.vjs-touch-overlay`是一个覆盖整个视频画面的透明层，并通过切换设置`pointer-events`为`none`或`auto`来确保只有视频点击过播放后才接收触摸动作。二是画面中央的时间点提示，只应该在触摸移动的时候出现。

最后，再来看`handleTouchstart`、`handleTouchend`和`handleTouchmove`的触摸事件处理。`handleTouchstart`是记录触摸开始时的坐标，并标记触摸状态已开始。`handleTouchend`则是认为触摸已结束，移除触摸标记，然后看如果期间手指有进行过滑动，就根据滑动中计算出的目标时间点，把视频进度跳转到对应位置（`player.currentTime()`方法）。`handleTouchmove`一方面标记滑动状态，另一方面根据触摸坐标相对于初始坐标的偏移，计算出目标时间点，然后将目标时间点文字写入到组件的DOM中。

## 注册并完工 ##

组件类已经定义好后，接下来的部分就很简单了。将组件类`TouchOverlay`注册到Video.js中：

~~~js
Component.registerComponent("TouchOverlay", TouchOverlay);
~~~

然后添加到组件树里的适当位置：

~~~js
// add component "TouchOverlay" before "BigPlayButton“
const touchOptions = {};
const properIndex = player.children().indexOf(player.getChild("BigPlayButton"));
player.addChild("TouchOverlay", touchOptions, properIndex);
~~~

`TouchOverlay`作为一个覆盖整个视频画面的透明层，它不能影响到视频下方的进度条，播放键等组件。因此，这里使用`addChild()`的第3个参数，将其添加到了一个适当的位置，层级比`BigPlayButton`、`ControlBar`更低。

到此，就可以体验到我们制作的组件效果了：

![自定义组件效果][img_videojs_custom]

以及，在Video.js的DOM中也可以找到我们增加的组件：

![DOM里的组件元素][img_videojs_dom]

## 补充 ##

### 另一种添加方法 ###

组件类的注册不是必须的。如果不注册，你也可以用下面这样的做法：

~~~js
let touchOverlay = new TouchOverlay(player);

// add component "TouchOverlay" before "BigPlayButton“
const touchOptions = {};
const controlBarIndex = player.children().indexOf(player.getChild("BigPlayButton"));
player.addChild(touchOverlay, touchOptions, controlBarIndex);
~~~

这是因为`addChild()`方法添加子组件，其第1个参数既可以是已注册的组件类名，也可以是组件实例。

### 其他继承方式 ###

除了继承`Component`来创建自定义组件类，也可以继承Video.js已有的组件，比如`Button`。这相当于在`Component`基础方法之外，还拥有了`Button`的预定义方法。

这很适合想要的自定义组件和已有组件相似的场景。

## 结语 ##

制作一个定制的视频播放器不是一件容易的事，希望本文对你有所帮助。

ps.除Video.js之外，还有一个视频播放器库[DPlayer][DPlayer]也比较推荐。

[img_videojs_default]: {{POSTS_IMG_PATH}}/202012/videojs_default.png "Video.js默认播放器"
[img_videojs_remove_default]: {{POSTS_IMG_PATH}}/202012/videojs_remove_default.png "移除默认组件"
[img_bilibili_feature]: {{POSTS_IMG_PATH}}/202012/bilibili_feature.jpg "新增组件：触摸调整视频进度"
[img_videojs_custom]: {{POSTS_IMG_PATH}}/202012/videojs_custom.png "自定义组件效果"
[img_videojs_dom]: {{POSTS_IMG_PATH}}/202012/videojs_dom.png "DOM里的组件元素"

[Video.js]: https://videojs.com/ "Video.js - Make your player yours | Video.js"
[Parcel]: https://github.com/parcel-bundler/parcel "Parcel"
[Video.js官方文档的components]: https://docs.videojs.com/tutorial-components.html#default-component-tree "Tutorial: components | Video.js Documentation"
[API文档]: https://docs.videojs.com/component "Class: Component | Video.js Documentation"
[DPlayer]: https://github.com/DIYgod/DPlayer "DPlayer"
