---
layout: post
title: "小而合理的前端理论：rscss和rsjs"
category: "前端综合"
description: ""
---
{% include JB/setup %}

在前端开发中，我们会尝试去定一些规则和约定，来让项目质量更高，更易于维护。而对于这些规则和约定，我们也会希望它内容简单，容易理解。

[rscss][rscss]和[rsjs][rsjs]是一套比较新，也比较小巧的前端开发规则和约定，其中`rs`代表`Reasonable System`，所以可以理解为，追求“合理”的css和js。本文除了介绍它们，也会有一些补充以及我自己的看法，也推荐你点击链接阅读原作者给出的完整内容。

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

rscss推荐组件**至少使用两个单词**的命名，中间用短横线（`-`）连接。比如`.search-form`，`.article-card`。

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

无论是组件还是元素，都可以有多种属性或状态：

![可变的属性或状态][img_variants_from_rscss]


### 属性或状态的命名 ###




## 结语 ##


[img_components_in_frameworks]: {{POSTS_IMG_PATH}}/201701/components_in_frameworks.png "前端框架里的组件"
[img_component_from_rscss]: {{POSTS_IMG_PATH}}/201701/component_from_rscss.png "组件"
[img_element_from_rscss]: {{POSTS_IMG_PATH}}/201701/element_from_rscss.png "组件的元素"
[img_variants_from_rscss]: {{POSTS_IMG_PATH}}/201701/variants_from_rscss.png "可变的属性或状态"

[rscss]: http://rscss.io/ "rscss"
[rsjs]: http://ricostacruz.com/rsjs/ "rsjs"
[Bootstrap]: https://v4-alpha.getbootstrap.com/ "Bootstrap"
[Materialize]: http://materializecss.com/ "Materialize"
