---
layout: post
title: "css进阶 - 从选择符开始"
category: "css"
description: "选择符是css的组成部分，同时也对前端性能有很重要的影响。好的css代码，不仅应适于维护更新，而且应符合浏览器渲染优化需求，也即较好的页面性能。在写css选择符的时候，多一些思考，形成好的习惯，就可以很容易做到这些。"
---
{% include JB/setup %}

在我最早开始写css的时候，其代码上的高自由度就一直很令我困惑。这就是说，同一个设计，如果让不同的人来实现，最终的代码一定是有差异的。但这存在一个问题，如果不同的人通过不同的方法以及代码风格，都从外观上实现了一样的设计，将很难评价谁做得更好。想来也是，既然都实现了设计，达到了目的，css这种没有程序逻辑的代码中，又能找出什么来说明谁做得更出色呢？

而如今，我认同的观念是，css这种描述性语言，仍然有着代码上的质量评判。评判标准就是*可维护性*（*Maintainability*）和*性能*（*Performance*），用比较通俗的话说，好的css，要对开发者的工作友好（dev-friendly），也要对浏览器友好（browser-friendly）。 本文将说明如何从css选择符的角度来提高css代码质量。

##关键选择符与浏览器的样式规则匹配原理##

css选择符的概念，在之前的[css优先级详细解析][]的开头部分也有提到，是指每一条样式规则中，描述把样式作用到哪些元素的部分，也即`{}`之前的部分。在本文，还要额外介绍一个概念：*关键选择符*（*Key selector*）。关键选择符就是在每一条样式规则起始的`{`之前的最后一个选择符，如下图：

![css关键选择符][img_key_selector_explain]

css选择符将确定后面的属性定义要作用到哪些元素,因此存在一个浏览器根据css选择符来应用样式到对应元素的匹配过程。关于浏览器的样式匹配系统，David Hyatt在[Writing Efficient CSS for use in the Mozilla UI][]一文中提到了以下内容：

> The style system matches a rule by starting with the rightmost selector and moving to the left through the rule’s selectors. As long as your little subtree continues to check out, the style system will continue moving to the left until it either matches the rule or bails out because of a mismatch.

意思是说，浏览器引擎在样式匹配时，以*从右向左*的顺序进行。在具体匹配某一条样式规则时，这个从右向左的过程会一直持续，直到读取完整个选择符序列并完成匹配，或因某一个地方的不匹配而取消（然后转到另一条样式规则）。

至于为什么浏览器会选择这样的匹配顺序，你可以看看[Stack Overflow上的相关讨论][]。大致上解释一下的话，由于最右边的关键选择符直接表示了样式定义应作用的元素，所以从右向左的顺序更利于浏览器在初始匹配的时候就确定有样式定义的元素集合，并更快地在找某一个元素的样式时避开大多数实际没有作用到的选择符。

*更好的css选择符，是让浏览器在样式匹配过程中减少匹配查询次数，以更快的速度完成样式匹配，从而优化前端性能*。这其中，也必须参考浏览器的对于样式从右向左的匹配顺序。

##css选择符的正确使用方式##

###更特定，更具体的关键选择符###

关键选择符是浏览器引擎在样式匹配时最先读取到的部分，因此，如果你在某一条样式规则中使用更特定、具体的选择符，可以帮助减少浏览器的查找匹配次数。

比如说下边这样的选择符：

    .content .note span { }

最后一个`span`是关键选择符，而`span`这个标签，在网页中使用是非常多的。浏览器从`span`开始读取选择符，就可能会为因此在样式匹配上做了一些额外工作。

如果你确定只是想为具体处于那一个位置的`span`元素定义样式，更好的做法是为`span`命名class，比如命名为`span.note_text`，然后简单写为：

    .note_text { }

###使用class选择符###

*class选择符（类选择符）是最利于性能优化的选择符*。相对于class，ID的缺点是只允许定义给一个元素，无法重用。而此外，它在使用上没有任何比class更好的地方。很多时候，你很难确定某一个元素是否是唯一的。另外，使用class来定义样式，而保留ID给javascript，一直是一个较好的实践。如果可以，不使用ID来定义样式。

而相对于class，标签在html中的重复性要更大，因此同样可能让浏览器在样式匹配时做更多的额外工作。如果可以，除css样式清零（reset）外，不使用标签选择符（也叫元素选择符）。

###缩短选择符序列###

继承写法是css中很常用的写法。继承写法的初衷是，如果有两个元素，都是同样的标签或有相同的class命名，加入父元素的选择符组成选择符序列，就可以避免在不需要的时候两个元素的样式互相影响。比如`.confirm_layer .submit_btn`就是指，class名为`submit_btn`，且有一个class名为`confirm_layer`的父元素的元素，才应用样式。

但是，避免元素样式相互影响，并不代表可以随意地使用继承选择符。前面提到，浏览器会从右向左读取整个选择符序列，直到读取完毕并匹配完成，或者因不匹配而取消。因此，*短的选择符序列更有利于浏览器更快地完成匹配过程*。相对的，冗长的选择符序列则认为是低效的，比如：

    .header ul li .nav_link { }

建议写为：

    .header .nav_link { }

一般来说，不超过3层的继承层级就可以满足实际中的开发要求。因此，应减少不必要的继承层级，使用更短的选择符序列。

此外，较长的选择符序列还有一个问题。有较长选择符的样式规则，css优先级的计算值也较大，因此，如果在以后需要写新的样式来覆盖掉它，就需要写更长的选择符（或者使用ID）以获得更高的css优先级。这对性能和代码可读性都是不利的。

###避免链式选择符###

*链式选择符*（*Chaining selectors*）是对单个元素同时写了多个选择符判定的情况。比如`p.name`是指class名为`name`，且标签是`p`的元素，才应用样式。这些判定组合可以是ID选择符，标签选择符，class选择符的任意组合。

但是，链式选择符是过度定义（over qualified）的，不利于重用，也不利于性能优化。如:

    a#author {}

建议写为：

    #author {}

这里的`a`是不必要的。一个ID只对应一个元素，没有必要再强调这个元素的标签是什么（同理，class也不必）。另外有：

    .content span.arrow {}

建议写为：

    .content .arrow {}

这里的`span.arrow`中的`span`也是不必要的。一方面，这为浏览器在样式匹配时增加了一项额外工作：检查class名为`arrow`的元素的标签名是不是`span`，也因此降低了性能。另一方面，如果去掉了这个限定，`.arrow`的样式定义，就可以用在更多的元素上，也就有着更好的重用性。否则，就还得告诉别人，使用这个的时候只能用在`span`标签上，替换都不让的。

同理，多个class的链式写法，如

    .tips.succuss {}

建议更改命名，写为：

    .tips_succuss {}

这样可以帮助浏览器减少额外的样式匹配工作。

此外，IE6还存在一个链式选择符的问题，多个class选择符写在一起时，例如`.class1.class2.class3`，正常情况是只有同时有这全部的class的元素，才应用样式。但IE6只认最后一个，也就是符合`.class3`这个选择符的元素，就应用样式。

##例外情况##

前面所述的选择符的写法的建议，只是从浏览器渲染性能优化，及代码的重用性方面分析得到的理论结果。在实际使用中，你并不需要严格按照这些内容来做。例如，如果你确实是准备为class名为`intro`的元素内的所有`a`标签元素都加上某样式，那么`.intro a`这样的选择符是明智的。

##结语##

关于高效的css选择符的指南，你还可以阅读google developer中的[Use efficient CSS selectors][]

如今，现代浏览器在样式匹配上也逐渐有了更多的优化（参考[CSS Selector Performance has changed!][]），有些方面的内容我们已经不再需要再担心了。但是，这并不意味着不需要考虑写合理的css选择符了。css选择符性能优化是依然存在的事，你的选择符应该更好地体现你的意图，而不是随心所欲地使用。更重要的是，以这样一种稍细腻的，经过思考的想法来写css选择符，并不是一件困难的事。只要你想，形成这样的一种习惯，你就可以自然地在这方面做得更好，何乐而不为呢？

[img_key_selector_explain]: {{POSTS_IMG_PATH}}/201305/key_selector_explain.png "css关键选择符"

[css优先级详细解析]: http://acgtofe.com/posts/2013/04/css-specificity-explain-in-detail/ "css优先级详细解析"
[Writing Efficient CSS for use in the Mozilla UI]: http://www.mozilla.org/xpfe/goodcss.html "Writing Efficient CSS"
[Stack Overflow上的相关讨论]: http://stackoverflow.com/questions/5797014/why-do-browsers-match-css-selectors-from-right-to-left "Why do browsers match CSS selectors from right to left?"
[Use efficient CSS selectors]: https://developers.google.com/speed/docs/best-practices/rendering#UseEfficientCSSSelectors "UseEfficientCSSSelectors"
[CSS Selector Performance has changed!]: http://calendar.perfplanet.com/2011/css-selector-performance-has-changed-for-the-better/ "CSS Selector Performance has changed! (For the better)"