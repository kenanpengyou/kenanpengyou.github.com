---
layout: post
title: "小而合理的前端理论：rscss和rsjs"
category: "前端综合"
description: ""
---
{% include JB/setup %}

在前端开发中，我们会尝试去定一些规则和约定，来让项目质量更高，更易于维护。而对于这些规则和约定，我们也会希望它内容简单，容易理解。

[rscss][rscss]和[rsjs][rsjs]是一套比较新，也比较小巧的前端开发规则和约定，其中`rs`代表`Reasonable System`，所以可以理解为，追求“合理”的css和js。本文除了介绍它们，还会有一点补充以及我自己的看法，也推荐你点击链接阅读原作者给出的完整内容。

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

无论是组件还是元素，都可以有多种属性或状态（Variants，也可以叫变体）：

![可变的属性或状态][img_variants_from_rscss]

### 属性或状态的命名 ###

使用短横线（`-`）开头来命名表示属性或状态的class。

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

rscss推荐辅助类（Helpers）单独存放一个文件，且class名以下划线（`_`）开头。辅助类也常会用到`!important`，对应的，应尽可能少使用辅助类。

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

总的来说，rscss

关于BEM、SMACSS以及前文出现过的OOCSS的介绍，可以参考以前的[这篇文章][这篇文章]。


rscss的部分到此，下面是rsjs。

## 关注传统web应用的rsjs ##



## 结语 ##


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
[这篇文章]: http://localhost:4000/posts/2014/09/valuable-theories-of-css "值得参考的css理论：OOCSS、SMACSS与BEM - acgtofe"
