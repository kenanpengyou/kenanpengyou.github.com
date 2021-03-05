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

一个Range由两个边界点组成，分别是起始边界点和结尾边界点。这两个边界点在一起，就可以描述任意的“选择”状态。当两个边界点完全相同时，这个“选择”状态就称为**折叠的**（**Collapsed**），也就是闪烁光标的状态。

Selection的和Range有关的方法很重要，具体如下：

* `getRangeAt(i)` - 按索引获取Selection的当前Range。除Firefox外，其他浏览器只固定使用索引`0`。
* `addRange(range)` - 将`range`应用到Selection。除Firefox外，如果Selection当前已经有其他Range，将忽略此方法调用。
* `removeRange(range)` - 从Selection中取消应用`range`。
* `removeAllRanges()` - 取消应用所有Range。
* `empty()` - 等同于`removeAllRanges()`。

关于Selection和Range的更详细的介绍和说明，推荐阅读这篇[Selection And Range][Selection And Range]。

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

`selection.rangeCount`是`Selection`的属性，它表示Selection正在应用的Range数目。当它大于`0`时，说明当前是“有选择”的状态。

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

`insertNode(node)`是`Range`的方法，可以将`node`元素插入到Range的起始边界点。它是本示例的关键方法，用于完成表情HTML元素插入。这里需要对Range的状态做判断，如果Range是折叠的（闪烁光标），直接插入表情元素，如果Range不是折叠的（选中了一部分输入框内容），就先删除选中的内容，再插入表情元素（相当于替换内容的效果）。`deleteContent()`也是`Range`的方法，可以将Range包含的内容从网页文档中删除。

结尾调用的`collapse(toStart)`仍然是`Range`的方法，它可以将Range的两个边界点变成相同的，也就是折叠的状态。如果参数`toStart`为`true`则取起始边界点的位置，如果为`false`则是取结尾边界点。这里取的是结尾边界点，这样就好像是在插入一个表情后，自动将光标移动到刚插入的表情元素后方，从而支持表情的**连续输入**。

到此，微博风格的表情输入就已经实现了：

![微博风格表情输入 - 结果演示][img_works_preview_weibo]

把输入框内的内容作为HTML代码（富文本），就可以提交给后台，或者像图里这样简单展示在上方的聊天窗口内。

### 完善点击表情时的光标置位 ###

这种文字和表情图混合在一起的风格还存在一个待完善的地方：如果点击文字，光标会正确定位到选中的文字前方，而点击表情图，就没有任何动作。这个光标置位的功能我们可以手动补全。

为输入框增加`click`事件处理：

~~~html
<div 
    ref="inputBox" 
    @click="handleBoxClick"
    class="input-box" 
    contenteditable="true"></div>
~~~

对应的`handleBoxClick()`事件处理方法如下：

~~~js
handleBoxClick (event) {
    let target = event.target;
    this.setCaretForEmoji(target);
},
setCaretForEmoji (target) {
    if (target.tagName.toLowerCase() === "img") {
        let range = new Range();
        range.setStartBefore(target);
        range.collapse(true);
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(range);
    }
},
~~~

`setStartBefore(node)`是`Range`的方法，可以设定边界起始点的位置到一个元素之前。这段代码整体来说就是，如果当前`click`的是`<img>`元素，就创建一个Range，设定它为折叠状态，位置在刚才点击的表情图之前，然后应用这个Range到Selection，变成真实可见的选择效果。

## 用纯文本符号来替代表情的场景 ##

现在，我们重新开始，来实现微信风格的表情输入。

前面说过，微信是使用类似`[旺柴]`这样的符号标识来替代表情的风格。这种风格全部使用纯文本，因此，输入框会很容易实现，可以直接使用表单元素的文本输入框：

~~~html
<input
    ref="formInput"
    @keydown="handleFormInputKeydown" 
    class="form-input"
    type="text">
~~~

这里预留的`handleFormInputKeydown()`输入事件处理方法，将在后文中使用。

和微博风格类似，接下来也是可以分成两个实现要点：

* 点击下方的表情，就将该表情对应的纯文本符号插入到输入框`<input>`。
* 纯文本符号的插入位置要**符合输入框`<input>`的当前光标位置**。

虽然同样是结合Selection和Range的概念，按光标位置来插入纯文本符号，但`<input>`会更加简单。

### 按光标位置来插入纯文本 ###

表单元素`<input>`自身有以下3个属性是关于“选择”的：

* `input.selectionStart` - 选择的起始位置。它的值是一个索引数字，比如`6`。
* `input.selectionEnd` - 选择的结尾位置。值的格式同上。
* `input.selectionDirection` - 选择的方向。可选值`"forward"`,`"backward"`和`"none"`。一般对应的情况是指鼠标拖拽选择时是从前向后，还是从后向前，又或者是双击选中。

通过这些属性，就可以实现对“选择”状态的读取和写入，而无需使用`Selection`和`Range`。

现在，点击表情时，执行插入表情的方法`insertEmojiText`：

~~~js
insertEmojiText (name) {
    let input = this.$refs.formInput;
    let emojiText = `[${name}]`;
    input.focus();
    input.setRangeText(emojiText, input.selectionStart, input.selectionEnd, "end");
    input.blur();
}
~~~

可以看到纯文本的表情插入非常简单。这里也是用`[name]`的符号来表示表情。

`input.setRangeText(replacement, [start], [end], [selectionMode])`是`input`的方法，可以将索引位置从`start`到`end`的文本，替换成`replacement`的文本。而如果`start`等于`end`，就相当于闪烁光标的状态，没有文本会被替换，变成了插入文本的效果。末尾参数`selectionMode`决定了在文本替换（或插入）操作完毕后，`input`如何更新选择状态。这里取`"end"`表示将选择状态设定为“闪烁光标，位置在新插入文本的后方”，从而支持表情连续输入。

使用`input.setRangeText()`，无论当前状态是闪烁光标，还是已经选择了一些文本，都会以符合我们输入习惯的方式插入表情文本。

关于`input.setRangeText()`的更详细的说明，同样推荐阅读这篇[Selection And Range][Selection And Range]。

这段代码中的`input.focus()`和`input.blur()`，是因为仅在`<input>`元素被focus的情况下进行文本编辑操作，才能确保`input.selectionStart`和`input.selectionEnd`两个值正确更新。同时，这里又并不希望`<input>`元素被真地focus，所以又用了`input.blur()`来取消。

到这里，微信风格的表情输入就基本可用了。但是，这种纯文本符号的风格也有一个应完善的地方：**用退格键（Backspace）来删除文本时，代表一个表情的纯文本符号应该以作为一个整体被删除**。比如`[旺柴]`这样的表情符号，在光标位于`]`的后方时，一个退格键就应该删除这一整段文本。这也是微信里存在的功能。

### 退格键支持 - 以表情符号为整体删除文本 ###

前文示例中为`<input>`元素预留的`handleFormInputKeydown()`方法，就是用于实现这一功能：

~~~js
handleFormInputKeydown (event) {
    let input = this.$refs.formInput;
    let chatString = input.value;

    // "Backspace" and selection type "Caret"
    if (event.keyCode === 8 && input.selectionStart === input.selectionEnd) {
        let indexEnd = input.selectionStart - 1;
        let charToDelete = chatString.charAt(indexEnd);

        // delete the whole [***]
        if (charToDelete === "]") {
            event.preventDefault();
            let indexStart = chatString.lastIndexOf("[", indexEnd);
            input.setRangeText("", indexStart, indexEnd + 1, "end");
        }
    }
}
~~~

这段代码是判断当选择状态为闪烁光标，且刚好位于字符`]`后按下了退格键的时候，就找出整个`[name]`表情文本，使用`input.setRangeText()`实现整段删除。

到此，微信风格的表情输入也就完成了：

![微信风格表情输入 - 结果演示][img_works_preview_wechat]

在提交给后台或者图中这样展示在上方聊天窗口内的时候，取输入框内的纯文本，然后将所有`[name]`格式的文本符号，替换成对应表情的HTML（比如`[1]`变成`<img src="/path/to/emoji/1.gif">`）即可。

## 完整代码示例 ##

两种风格的完整代码示例：

* [微博风格（表情图和文字一起）](https://codesandbox.io/s/emoji-input-contenteditable-75qe8)
* [微信风格（表情用纯文本符号替代）](https://codesandbox.io/s/emoji-input-text-yqfe3)

## 补充 ##

### 光标颜色 ###

Selection在可输入元素内的折叠状态，也就是闪烁光标，它的颜色也是可以修改的，比如：

~~~css
input {
    caret-color: red;
}
~~~

会将闪烁光标修改为红色。更详细的说明请查看[MDN上的caret-color][MDN上的caret-color]。

### 输入法里的表情字符 ###

![输入法里的表情字符][img_IME_emoji]

在手机上，你可能注意到像搜狗这样的输入法也给你提供了一套表情（上图中的Emoji），它们在微信中也可以使用，而且可以直接显示在微信的输入框内。这种不依赖其他东西就可以使用的表情，本质上是Unicode字符，你可以到[Unicode Character Table][Unicode Character Table]上查找更多的表情字符。

Unicode字符表情最终呈现的样子取决于它所处的环境。比如不同手机，不同操作系统，都可能有不同的外观。

### 定义虚拟键盘的动作键 ###

![定义虚拟键盘的动作键][img_IME_enterkeyhint]

手机上的输入法键盘，右下角的动作键可以通过HTML属性`enterkeyhint`设置为不同的类型：

~~~html
<div
    ref="inputBox" 
    enterkeyhint="send"
    contenteditable="true"></div>
~~~

这里值`send`对应的就是前面图中的“发送”。其他可用的值可以参考[MDN上的enterkeyhint][MDN上的enterkeyhint]。

如果想要像微信那样，点击虚拟键盘右下角的“发送”就可以发送消息（而不是点击网页上的按钮），监听输入元素的键盘事件，并确认按键为`enter`键即可。

## 结语 ##

“可以输入表情”对于聊天交流而言可以说是非常棒的一项增强。不管具体用哪一种风格实现，最终都是让大家可以表达出更多。

希望本文的表情功能开发指南可以帮到你。

[img_emoji_design_wechat]: {{POSTS_IMG_PATH}}/202103/emoji_design_wechat.jpg "微信的表情输入"
[img_emoji_design_weibo]: {{POSTS_IMG_PATH}}/202103/emoji_design_weibo.jpg "微博的表情输入"
[img_contenteditable_ui]: {{POSTS_IMG_PATH}}/202103/contenteditable_ui.png "表情输入界面"
[img_selection_type]: {{POSTS_IMG_PATH}}/202103/selection_type.png "不同类型的Selection"
[img_works_preview_weibo]: {{POSTS_IMG_PATH}}/202103/works_preview_weibo.gif "微博风格表情输入 - 结果演示"
[img_works_preview_wechat]: {{POSTS_IMG_PATH}}/202103/works_preview_wechat.gif "微信风格表情输入 - 结果演示"
[img_IME_emoji]: {{POSTS_IMG_PATH}}/202103/IME_emoji.jpg "输入法里的表情字符"
[img_IME_enterkeyhint]: {{POSTS_IMG_PATH}}/202103/IME_enterkeyhint.jpg "定义虚拟键盘的动作键"

[Selection And Range]: https://javascript.info/selection-range "Selection And Range"
[MDN上的caret-color]: https://developer.mozilla.org/zh-CN/docs/Web/CSS/caret-color "caret-color - CSS（层叠样式表） | MDN"
[Unicode Character Table]: https://unicode-table.com/cn/ "基本拉丁字母 — ✔️ ❤️ ★ Unicode 字符百科"
[MDN上的enterkeyhint]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint "enterkeyhint - HTML: HyperText Markup Language | MDN"