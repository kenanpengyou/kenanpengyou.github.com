---
layout: post
title: "小而合理的前端理论：rscss和rsjs"
category: "前端综合"
description: "前端开发有一些简单、易于遵循的规则和约定吗？这里有rscss和rsjs推荐给你。"
---
{% include JB/setup %}

在前端开发中，我们会尝试去定一些规则和约定，来让项目质量更高，更易于维护。而对于这些规则和约定，我们也会希望它内容简单，容易理解。

**[rscss][rscss]**和**[rsjs][rsjs]**是一套比较新，也比较小巧的前端开发规则和约定，其中`rs`代表`Reasonable System`，所以可以理解为，追求“合理”的css和js。本文除了介绍它们，还会有一点补充以及我自己的看法，也推荐你点击链接阅读原作者给出的完整内容。

## 从css的疑问开始 ##

rscss希望有效地改善写css中的这样几个常见问题（<del>css哲学三问</del>）：

* 这个class到底什么意思？
* 这个class还有地方用到吗？
* 我新写的这个class，会有冲突吗？

## 组件原则 ##

rscss首先推崇的是以**组件**（**Components**）为基础的思考方式。在各类前端框架中，几乎都可以看到组件，如[Bootstrap][Bootstrap]和[Materialize][Materialize]：

![前端框架里的组件][img_components_in_frameworks]

一个组件是这样的感觉：

![组件][img_component_from_rscss]

小到一个按钮，大到整个web应用，可见的视觉元素都可以这样当做一个组件。

### 组件的命名 ###

rscss推荐组件**至少使用两个单词**的命名，中间用短横线（`-`）连接：

~~~css
.search-form { /* ... */ }
.article-card { /* ... */ }
~~~

## 组件的元素 ##

组件内部的更细小的部分，当做组件的**元素**（**Elements**）。

![组件的元素][img_element_from_rscss]

### 元素的命名 ###

为了和前面的组件区分开来，元素的命名**只使用一个单词**。

显然，只有一个单词是很容易冲突的，因此rscss建议以关系选择符把元素和组件关联起来：

~~~css
.search-form > .field { /* ... */ }
.search-form > .action { /* ... */ }
~~~

推荐子选择符 `> ` 而不是包含选择符 `(空格)`，以更好地避免冲突：

~~~css
.article-card .title { /* okay */ }
.article-card > .author { /* ✓ better */ }
~~~

如果确实需要用到多个单词，直接连接它们（不使用短横线等分隔符），以体现区别：

~~~css
.profile-box > .firstname { /* ... */ }
~~~

为每一个组件的元素使用class名，不要使用标签选择符。有名字的元素会更有语义。

## 多种属性或状态 ##

无论是组件还是元素，都可以有多种**属性或状态**（**Variants**，也可以叫变体）：

![可变的属性或状态][img_variants_from_rscss]

### 属性或状态的命名 ###

**使用短横线（`-`）开头**来命名表示属性或状态的class。

~~~css
/* component variants */
.like-button.-wide { /* ... */ }
.like-button.-disabled { /* ... */ }

/* element variants */
.shopping-card > .title.-small { /* ... */ }
~~~

### 对命名方式的解释 ###

rscss推荐的短横线作为前缀的class名可能会让你有一点惊讶，可以这样写的吗？答案是的确可以，而且搭配得还相当巧妙。为什么这么说呢？请看[w3c对css标识符的解释][w3c对css标识符的解释]：

> In CSS, identifiers (including element names, classes, and IDs in selectors) can contain only the characters [a-zA-Z0-9] and ISO 10646 characters U+0080 and higher, plus the hyphen (-) and the underscore (_); they cannot start with a digit, two hyphens, or a hyphen followed by a digit.

其中ISO 10646等同于Unicode。可以看到，w3c特意在css标识符一般使用的英文字母、数字以及一部分Unicode字符（U+0080以上）之外，提到了短横线（`-`）和下划线（`_`）也是可用的。

以短横线作为前缀的class名相当于有了一个特殊的标记，一眼就可以提醒你这是一个表示属性或状态的class。

## 组件嵌套 ##

组件是可以嵌套的。

![嵌套组件][img_nested_components]

对应html类似这样：

~~~html
<div class="article-link">
  <div class="vote-box">
    ...
  </div>
  <h3 class="title">...</h3>
  <p class="meta">...</p>
</div>
~~~

### 嵌套中的属性或状态 ###

当一个组件位于另一个组件内部的时候，可能会想要这个组件表现得特别一点。这个时候，建议不要使用关系选择符把它们耦合在一起：

~~~css
.article-header > .vote-box > .up { /* ✗ avoid this */ }
~~~

建议的做法是为组件增加一个属性或状态class：

~~~html
<div class="article-header">
  <div class="vote-box -highlight">
    ...
  </div>
  ...
</div>
~~~

然后以这个class为基础来定义特别的样式：

~~~css
.vote-box.-highlight > .up { /* ... */ }
~~~

这样做的目的是让一个组件的样式不依赖其所处的位置。OOCSS的原则之一，Separate container and content，也是这样的理念。

## 布局思想 ##

rscss推荐除一些具有固定宽高的特定元素（如头像，logo）外，
组件本身不定义任何影响布局位置的属性：

* 定位（`position`、`top`、`left`、`right`、`bottom`）
* 浮动（`float`、`clear`）
* 外边距（`margin`）
* 尺寸（`width`、`height`）

这样做的意思是说，如果把组件看做一个整体，它应该是自适应的。

### 需要定义布局位置属性的情况 ###

如果要定义组件的影响布局位置的属性，建议使用关系选择符把组件和它所处的环境关联起来：

~~~css
.article-list > .article-card {
    width: 33.3%;
    float: left;
}

.article-card { /* ... */ }
.article-card > .image { /* ... */ }
.article-card > .title { /* ... */ }
.article-card > .category { /* ... */ }
~~~

在上面这段代码可以注意到，“组件本身的外观”与“组件在某一环境中的位置”被明确地分离了。

## 辅助类 ##

rscss推荐**辅助类**（**Helpers**）单独存放一个文件，且class名**以下划线（`_`）开头**。辅助类也常会用到`!important`，对应的，应尽可能少使用辅助类。

~~~css
._pull-left { float: left !important; }
._pull-right { float: right !important; }
~~~

下划线（`_`）作为前缀的class名，如前文已经解释过的那样，也是作为一个特殊的标记提醒你这是一个辅助类，请谨慎使用它。

辅助类在前端框架中也很常见。

## rscss与其他css理论的比较 ##

rscss的组件（Component），元素（Element）等概念，在BEM、SMACSS这些css理论中也有类似的存在。它们比较起来是这样的：

| RSCSS | BEM | SMACSS |
|----
| Component | Block | Module |
| Element | Element | Sub-Component |
| Layout | ? | Layout |
| Variant | Modifier | Sub-Module & State |

关于BEM、SMACSS以及前文出现过的OOCSS的介绍，可以参考以前的[这篇文章][这篇文章]。

以上就是rscss的主要内容了，下面来看看rsjs。

## 关注传统web应用的rsjs ##

rsjs关注的是非单页应用（non-SPA web application），也就是我们通常理解的有很多页，主要使用jQuery，而且每个页都可以有自己的`.js`文件的传统网站。

现在已经有了可遵循的JavaScript代码本身的[风格指南][风格指南]，因此，rsjs只对一些其他的要点提出建议，如命名空间，文件组织方式。

## 行为原则 ##

rsjs推荐把由JavaScript实现的交互功能当做一次只影响一个组件（Component）的行为（Behavior）。下面是一个参考示例：

~~~html
<!-- Component -->
<div class="main-navbar" data-js-collapsible-nav>
  <button class="expand" data-js-expand>Expand</button>

  <a href="/">Home</a>
  <ul>...</ul>
</div>
~~~

~~~js
/* Behavior - behaviors/collapsible-nav.js */

$(function () {
  var $nav = $("[data-js-collapsible-nav]");
  if (!$nav.length) return;

  $nav
    .on("click", "[data-js-expand]", function () {
      $nav.addClass("-expanded");
    })
    .on("mouseout", function () {
      $nav.removeClass("-expanded");
    });
});
~~~

这其中包含了多项建议。

### 使用data属性 ###

建议使用html5的data自定义属性`data-js-___`来标记和一个行为有关的DOM元素。

相比用ID和class来选取元素，这种data属性的形式一方面更具有明确的意义，提醒你这是一个和交互行为有关的元素，另一方面更易于复用，在任何DOM结构里添加这样的data属性即可获得对应的行为。

### 为每个行为单独建立文件 ###

建议每一个行为对应的JavaScript代码都分离到单独的文件里，并以文件名明示。文件名可以参照`data-js-___`这个属性名里的对应名称，这样，根据属性名就很容易找到对应的JavaScript代码。

一个可能的文件目录结构：

~~~
└── javascripts/
    └── behaviors/
            ├── collapsible-nav.js
            ├── avatar-hover.js
            ├── popup-dialog.js
            └── notification.js
~~~

### 不使用行内JavaScript ###

在html中不要以`<script>...</script>`或`onclick=""`等形式添加行内JavaScript代码。通过保持行为的逻辑代码独立于html，可以使代码更易于维护。

从rsjs的内容来看，在已有React、Vue等库的今天，“行为独立于内容”的约定仍然对传统的以jQuery为主的Web应用有一定意义。

### 初始数据的获取方式 ###

传统Web站点的一个常见的场景是，后端语言在页面中预先输出某些数据，然后JavaScript会取用它们。你可能见到过下面这样`<script>`标签的实现方式，但显然，根据上一条建议，这是应避免的。

~~~html
<!-- ✗ Avoid -->
<script>
window.UserData = { email: "john@gmail.com", id: 9283 }
</script>
~~~

rsjs建议的方案是，如果这些数据只需要一个组件使用，可以利用之前提到的data属性（保存为值），由行为的JavaScript代码来自行取出。

~~~js
<!-- ✓ Used by the user-info behavior -->
<div class="user-info" data-js-user-info='{"email":"john@gmail.com","id":9283}'>
~~~

如果是多个组件使用的数据，可以使用`<head>`里的meta标签。

~~~html
<head>
  ...
  <!-- option 1 -->
  <meta property="app:user_data" content='{"email":"john@gmail.com","id":9283}'>

  <!-- option 2 -->
  <meta property="app:user_data:email" content="john@gmail.com">
  <meta property="app:user_data:id" content="9283">
~~~

## 命名空间 ##

rsjs建议使用尽可能少的全局变量。共用的类，函数，放到单个Object里，比如叫`App`：

~~~js
if (!window.App) window.App = {};

App.Editor = function() {
  // ...
};
~~~

在多个行为之间可复用的帮助方法，可以单独建立Object，并将它们分文件保存在`helpers/`：

~~~js
/* helpers/format_error.js */
if (!window.Helpers) window.Helpers = {};

Helpers.formatError = function (err) {
  return "" + err.project_id + " error: " + err.message;
};
~~~

## 第三方库的处理 ##

rsjs建议如果引入第三方库，也做成组件行为的形式。比如，[Select2][Select2]的功能，可以只影响带有属性`data-js-select2`的元素。

~~~js
// select2.js -- affects `[data-js-select2]`
$(function () {
  $("[data-js-select2]").select2();
});
~~~

所有第三方库的代码可以集中到一个类似`vendor.js`的文件，并和站点本身的代码各自独立。这样，当站点更新代码的时候，用户可以直接利用缓存，而并不需要再次获取这些第三方库代码。

### rsjs对自己的归纳 ###

rsjs认为自身的内容更偏向于对开发者友好，也就是更易于维护，而在性能上（对用户友好）可能没有做到最好。以上提到的各项建议，也是有利有弊，rsjs只是在权衡了利弊的基础上得到的更利于长期维护的结论。

rsjs不是万金油，它不适用于单页应用（SPA）等前端功能很复杂的情况。它关注的是的那种多个网页，每个网页一点JavaScript交互的传统网站。

## 结语 ##

rscss和rsjs所用的“合理”是一个很取巧的表述，不是完美，不是最好，也不是出色，它只是在说希望代码能“合乎道理”。rscss和rsjs大概就是这样，以简约的风格，不长的篇幅，追求着“小而合理”。

目前rsjs还在更新中（work-in-progress），rscss则已经比较成熟。很推荐试试其中你也认为合理的建议！

[img_components_in_frameworks]: {{POSTS_IMG_PATH}}/201701/components_in_frameworks.png "前端框架里的组件"
[img_component_from_rscss]: {{POSTS_IMG_PATH}}/201701/component_from_rscss.png "组件"
[img_element_from_rscss]: {{POSTS_IMG_PATH}}/201701/element_from_rscss.png "组件的元素"
[img_variants_from_rscss]: {{POSTS_IMG_PATH}}/201701/variants_from_rscss.png "可变的属性或状态"
[img_nested_components]: {{POSTS_IMG_PATH}}/201701/nested_components.png "嵌套组件"

[rscss]: http://rscss.io/ "rscss"
[rsjs]: http://ricostacruz.com/rsjs/ "rsjs"
[Bootstrap]: https://v4-alpha.getbootstrap.com/ "Bootstrap"
[Materialize]: http://materializecss.com/ "Materialize"
[w3c对css标识符的解释]: https://www.w3.org/TR/CSS22/syndata.html#characters "w3c对css标识符的解释"
[这篇文章]: http://acgtofe.com/posts/2014/09/valuable-theories-of-css "值得参考的css理论：OOCSS、SMACSS与BEM - acgtofe"
[风格指南]: https://github.com/airbnb/javascript "Airbnb JavaScript Style Guide"
[Select2]: https://github.com/select2/select2 "Select2"