---
layout: post
title: "在Web中实现表情符号的输入"
category: "javascript"
description: "我们熟悉的微信聊天和写微博，它们的输入框不仅可以输入文字，还可以插入表情。这样对表情输入的支持在Web上要怎样实现呢？这里将给出两种不同风格的可用方案。"
---
{% include JB/setup %}

如果你准备在Web中开发一个可以聊天互动的应用，那么一个支持表情符号的输入框很可能会是必备的内容项。但具体到Web环境来说，我们知道，表单元素`<input>`和`<textarea>`只能输入纯文本，这样的话，表情符号的支持具体要如何做呢？

让我们从熟悉的东西开始。

## 来自微博和微信的两种风格 ##

下图是微信里的聊天：

![微信的表情输入][img_emoji_design_wechat]

下图是微博里的写微博：

![微博的表情输入][img_emoji_design_weibo]

综合以上微信和微博的表情输入设计，我们可以看出有两种风格可以采用：

* 一种是像微信这样，只用纯文本，通过类似`[旺柴]`这样的符号标识来替代表情，最后输出时再显示成真正的表情。
* 另一种是像微博这样，所见即所得，输入框本身就是表情和文字混合在一起。

看起来似乎微博这种风格要复杂一点，我们就从微博的这种开始吧。

## 表情图和文字在一起的场景 ##

对HTML来说，文字和图片放在一起是非常基础的能力。但是，我们还要求它可以作为输入框来使用，这就需要用到HTML属性`contenteditable`。它可能不太常用，但其实是一个支持范围很广，历史悠久的HTML属性。

使用`contenteditable`，就可以得到这个简单却满足要求的输入框元素：

~~~html
<div contenteditable="true"></div>
~~~

### 表情的显示 ###

现在的输入框已经是一个`<div>`，所以，你可以用任意的HTML标签来显示表情。当然，最常用的是图片`<img>`。以前面的微博内容为例，它和输入框一起，应该构成像下面这样的HTML代码：

~~~html
<div contenteditable="true">
    一条带表情<img src="/path/to/emoji/3.gif"><img src="/path/to/emoji/3.gif">的微博<img src="/path/to/emoji/9.gif">
</div>
~~~

可以看出，**插入表情实际就是插入一段HTML代码**，它和剩余的纯文本一起，共同构成一段带表情符号的输入内容。

### 表情输入功能的要点 ###

接下来，我们参照以下示例界面，完成微博风格的输入框。

![表情输入界面][img_contenteditable_ui]

这个界面中间的横线，就是`contenteditable`的`<div>`输入框元素。结合这个界面，我们可以分析出接下来的两个要点：

* 点击下方的表情，就将该表情HTML代码插入到输入框`<div>`。
* 表情HTML代码插入的位置要**符合输入框`<div>`的当前光标位置**。

显然，只是第一个要点的话是很容易的，关键是第二个。

第二个要点，就需要Selection和Range的概念了。

## Selection和Range ##



~~~js
document.onselectionchange = () => {
    let selection = document.getSelection();

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        if (vmEmoji.$refs.inputBox.contains(range.commonAncestorContainer)) {
            rangeOfInputBox = range;
        }
    }
};
~~~



### 备忘单 ###

GSAP有一份包含丰富参考代码的[备忘单][备忘单]（Cheat Sheet），可以帮助你节约时间。

## 结语 ##

GSAP里的很它的原因的

[img_emoji_design_wechat]: {{POSTS_IMG_PATH}}/202101/emoji_design_wechat.jpg "微信的表情输入"
[img_emoji_design_weibo]: {{POSTS_IMG_PATH}}/202101/emoji_design_weibo.jpg "微博的表情输入"
[img_contenteditable_ui]: {{POSTS_IMG_PATH}}/202101/contenteditable_ui.png "表情输入界面"


https://javascript.info/selection-range

[GSAP]: http://greensock.com/gsap "GreenSock | GSAP"
