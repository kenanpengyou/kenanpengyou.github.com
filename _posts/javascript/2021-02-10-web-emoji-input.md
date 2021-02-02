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

现在的输入框已经是一个`<div>`，所以，你可以用任意的HTML标签来显示表情，而其中最为常用的就是图片`<img>`。以前面的微博内容为例，它和输入框一起，应该构成像下面这样的HTML代码：

~~~html
<div contenteditable="true">
    一条带表情<img src="/path/to/emoji/3.gif"><img src="/path/to/emoji/3.gif">的微博<img src="/path/to/emoji/9.gif">
</div>
~~~

可以看出，**插入表情实际就是插入一段HTML代码**。HTML代码和剩余的纯文本一起，共同构成带表情符号的输入内容。

### 表情输入功能的要点 ###

接下来，我们参照以下示例界面，来完成微博风格的输入框。

![表情输入界面][img_contenteditable_ui]

这个界面中间的横线，就是`contenteditable`的`<div>`输入框元素。结合这个界面，我们可以分析出接下来的两个实现要点：

* 点击下方的表情，就将该表情对应的HTML代码插入到输入框`<div>`。
* 表情HTML代码插入的位置要**符合输入框`<div>`的当前光标位置**。

显然，只是第一个要点的话是很容易的，关键是第二个。

这第二个要点，就需要了解Selection和Range的概念了。

## Selection 和 Range ##

在网页中，你一定很熟悉下图展示的两种状态：

![不同类型的Selection][img_selection_type]

* 一种是有一个不断闪烁的光标，表示着当前正在输入或准备输入的位置。它一般只出现在网页的可以输入的元素内，比如文本输入框。
* 另一种是一部分内容呈现蓝底白字（这个颜色可以修改，但默认是这个颜色）的状态，表示当前被选中。它可以出现在任意的网页元素内，我们也常用来部分复制网页内容。

以上两种状态虽然表现形式不同，但它们在Web领域都叫做**Selection**。Selection描述的正是网页中的“当前选择”。闪烁的光标也算作一种特殊的选择，称为已折叠（Collapsed）的选择。

Selection在JavaScript中对应的是`Selection`对象，它可以通过`window.getSelection()`或`document.getSelection()`获取到。

任何时候，当网页中“当前选择”发生改变时，都会触发`document.onselectionchange`事件。这个事件处理函数仅存在于`document`。

### Range的设计意义 ###

Selection已经表示了“当前选择”，那Range是做什么的呢？简单来说，**Range**是Selection的“预备军”，它和Selection类似，都可以具体描述网页中的“选择”状态，只是**Selection是可见的，Range是不可见的**。

通过Selection的和Range有关的方法，可以把Range应用到Selection，这时候就可以看到Range的选择效果了。这就好像Selection代表了舞台，Range则是一个又一个幕后的演员，它们可以轮换上场和退场。

除Firefox外，其他浏览器的Selection都只支持单个Range，因此，**我们一般在同一时间只能应用一个Range到Selection**。

一个Range由两个边界点组成，分别是起始边界点和结尾边界点。这两个边界点在一起，就可以描述任意的“选择”状态。当两个边界点完全相同时，这个“选择”状态是折叠的（Collapsed），也就是闪烁光标的状态。

Selection的和Range有关的方法很重要，具体如下：

* `getRangeAt(i)` - 按索引获取Selection的当前Range。除Firefox外，其他浏览器只固定使用索引`0`。
* `addRange(range)` - 将`range`应用到Selection。除Firefox外，如果Selection当前已经有其他Range，将忽略此方法调用。
* `removeRange(range)` - 从Selection中取消应用`range`。
* `removeAllRanges()` - 取消应用所有Range。
* `empty()` - 等同于`removeAllRanges()`。

关于Selection和Range的更详细的解释，推荐你阅读这篇[Selection And Range][Selection And Range]。

## 符合光标位置的表情插入 ##

了解了Selection和Range的基础知识后，我们继续来完成微博风格的表情输入。前面说过，要点是**表情HTML代码的插入位置要符合输入框的光标位置**，所以我们首先要做的就是记录这个光标位置。

先标记输入框为`inputBox`（本示例使用Vue）：

~~~html
<div 
    ref="inputBox" 
    class="input-box" 
    contenteditable="true"></div>
~~~

然后使用前面提到的`document.onselectionchange`监听选择变化事件：

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

这段代码的作用是，在“当前选择”发生变化（鼠标点击或触摸动作等）后，如果变化后的Selection位于输入框`inputBox`内部，就用变量`rangeOfInputBox`保存它。这里也可以看到，Selection是用Range来保存的。

`selection.rangeCount`是`Selection`的属性，它表示Selection正在应用的Range数目。当它大于`0`时，说明当前是有选择的。

`range.commonAncestorContainer`是`Range`的属性，它表示Range的两个边界点的距离最近的共同父元素。这里用于判断Range发生在`inputBox`内。

最后，当点击表情时，执行插入表情的方法`insertEmoji`：

~~~js
insertEmoji (name) {
    let emojiEl = document.createElement("img");
    emojiEl.src = `${this.emoji.path}${name}${this.emoji.suffix}`;

    if (!rangeOfInputBox) {
        rangeOfInputBox = new Range();
        rangeOfInputBox.selectNodeContents(this.$refs.inputBox);
    }

    if (rangeOfInputBox.collapsed) {
        rangeOfInputBox.insertNode(emojiEl);
    } else {
        rangeOfInputBox.deleteContents();
        rangeOfInputBox.insertNode(emojiEl);
    }
    rangeOfInputBox.collapse(false);
}
~~~

这段代码中，参数`name`代表了不同表情，从而生成不同表情对应的不同HTML元素（都是`<img>`）。

如果`rangeOfInputBox`不存在，说明还没有过任何发生在输入框内的选择事件，此时就指定一个默认的Range。`selectNodeContents(node)`是`Range`的方法，将一个Range设定为选中整个`node`元素内容。

`insertNode(node)`是核心方法，用来插入表情HTML元素。`insertNode(node)`是`Range`的方法，将`node`元素插入到Range的起始边界点。如果Range是折叠的（闪烁光标），直接插入表情元素，如果Range不是折叠的（选中了一部分输入框内容），就先删除选中的内容，再插入表情元素。





### 备忘单 ###

GSAP有一份包含丰富参考代码的[备忘单][备忘单]（Cheat Sheet），可以帮助你节约时间。

## 结语 ##

GSAP里的很它的原因的

[img_emoji_design_wechat]: {{POSTS_IMG_PATH}}/202102/emoji_design_wechat.jpg "微信的表情输入"
[img_emoji_design_weibo]: {{POSTS_IMG_PATH}}/202102/emoji_design_weibo.jpg "微博的表情输入"
[img_contenteditable_ui]: {{POSTS_IMG_PATH}}/202102/contenteditable_ui.png "表情输入界面"
[img_selection_type]: {{POSTS_IMG_PATH}}/202102/selection_type.png "不同类型的Selection"


[Selection And Range]: https://javascript.info/selection-range "Selection And Range"
