---
layout: post
title: "有趣而不常见的css选择符命名"
category: "css"
description: "应用css需要给html元素命名，一般来说，你会习惯性地使用英文单词的组合。但实际上，有更多看起来很不常见的字符同样可以使用。通过组合使用它们，你可以让css选择符更加有趣！"
extraCSS: ["posts/201308/unusual-css-selectors-characters.css"]
---
{% include JB/setup %}

##原来命名可以这样的##

前一段时间，在某一站点看到了这样的内容：

![不常见的css选择符][img_unusual_css_selectors_of_one_site]

"这也可以？"是我对此的第一印象。不过，稍作调查知道了，这样写确实是有效的。此外，这个`ಠ_ಠ`的符号表情，看起来是不是相当有存在感？再看看搭配的css属性，`display: none !important;`即定义元素一定不显示，是不是也非常符合这个表情想要表达的意思？

只要遵循css语法，就可以很好地应用这种不常见的命名。

##命名字符的规定##

英文单词的组合你一定很熟悉，例如`.top_nav`用来表示顶部导航，不仅用了合法的选择符，而且也很符合语义化的要求。

另外，你应该也知道，选择符命名的开头字符，不可以是数字，例如`.3-column`不是合法的选择符。使用不合法的选择符的后果是，对应的css样式规则会因为选择符无法正确解析，而变为无效。

事实上，css语法对于命名字符有更多的规定。以下是[W3C关于命名标识符的说明][]中的内容：

> In CSS, identifiers (including element names, classes, and IDs in selectors) can contain only the characters `[a-zA-Z0-9]` and ISO 10646 characters U+00A0 and higher, plus the hyphen (`-`) and the underscore (`_`); they cannot start with a digit, two hyphens, or a hyphen followed by a digit. Identifiers can also contain escaped characters and any ISO 10646 character as a numeric code.

意思是说，css中允许使用的命名字符，包括大小写英文字母、数字、连字符`-`、下划线`-`及其他ISO 10646字符集（等同于Unicode）中的字符。同时，起始字符部分不能是数字，或连续2个`-`，或1个`-`后接1个数字。此外，允许使用转义字符和任意ISO 10646字符的数字代码。

经过测试，IE6对起始字符是下划线`_`和单个连字符`-`的情况，也会认定样式规则无效。

##字符转义##

可以看出，命名允许使用的字符其实是非常多的。但是，有一个地方需要注意，就是*特殊字符*。特殊字符是指在css语法中，被认定用来表示特定含义的字符（相当于编程语言中的关键字）。例如，`...`这样的class命名是不合法的，因为`.`是css选择符中表示class的字符，因此不允许直接用在命名中（`...`这位沉默着的class名你感觉如何？）。

css中的特殊字符包含：`!`, `"`, `#`, `$`, `%`, `&`, `'`, `(`, `)`, `*`, `+`, `,`, `-`, `.`, `/`, `:`, `;`, `<`, `=`, `>`, `?`, `@`, `[`, `\`, `]`, `^`,<code>\`</code>, `{`, `|`, `}`, 和`~`。

这个时候，想要在命名中也加入这些特殊字符，就要使用*字符转义*（*character escape*）。字符转义通过反斜杠`\`实现，在css选择符中，你可以通过在特殊字符前加`\`的方法，取消特殊字符的特定含义，使其可以正确地被用于命名。例如，特殊字符`#`就可以用`\#`来表示。

反斜杠`\`的作用还不只如此。前面说到，任意ISO 10646字符都可以使用。按照ISO 10646的定义，所有的字符都可以用十六进制的代码来表示（尤其是一些不易直接输入的字符需要这样表示）。css语法中，以反斜杠`\`开头，后接最多6位十六进制数字，即构成一个ISO 10646字符的代码。这和直接输入ISO 10646字符是一样的，但由于形式上是代码，因此是最可靠的。

取消特殊字符的特定含义，除了前边的直接在前边加`\`的写法外，还可以用ISO 10646代码。比如`#`也可以用`\23 `或者`\000023`表示。请注意，如果代码不满6位（前面几位是0），一定要在末尾留一个空格，这才能组成一个正确的ISO 10646代码（这个空格是分隔标识用，算作代码的一部分，不会引发选择符中的特殊含义）。如果不想有这个空格，请使用完整的6位十六进制代码。

比如，下面是一个合法的命名示例。html：

{% highlight html %}
<div class="^_^"></div>
{% endhighlight %}

css中的定义：

{% highlight css %}
.\5E _\5E {width:50px;height:50px;background:tomato;}
{% endhighlight %}

这里的`^`属于特殊字符，但通过代码写法后，就可以正确解析了。

关于css字符转义的更多介绍，推荐你阅读[CSS character escape sequences][]，这位作者还给了一个很有用的[转义工具][]。

##让命名更有趣##

还需要提示一下的是，ISO 10646包含的字符，有很多即使看起来很奇特，但由于不是特殊字符，是可以直接输入的。尽管可能因为编辑器字体原因无法显示，但仍然有效。比如，html：

{% highlight html %}
<div class="♫">music on~</div>
{% endhighlight %}

对应css：

{% highlight css %}
.♫{width:50px;height:50px;background:mistyrose;color:#333;}
{% endhighlight %}

对应的实际元素是（对的，我要证明这个写法有效！）：

<div class="post_display" >
    <div class="♫">music on~</div>
</div>

如果你想表示关于音乐内容的区域，这样字符图形也许可以说比英文单词更加符合语义。而更重要的是，这种写法更有趣！

在使用这些字符的时候，请注意，css和html的编码都应使用utf-8。如果html是服务器端语言（比如php）生成的，则编码选项应设置为utf-8。

关于如何找到各种字符，欢迎到Unicode查询站点[Unicode character table][]。

看到这里，你是否已经想开始写点不一样的选择符命名呢？我已经试过一些↓

html：

{% highlight html %}
<div class="(・ρ・*)"></div>
<div class="(・ω・)"></div>
{% endhighlight %}

css：

{% highlight css %}
.\(・ω・\){width:50px;height:50px;background:skyblue;}
.\(・ρ・\*\){width:50px;height:50px;background:aquamarine;}
{% endhighlight %}

以后觉得词不达意的时候，就用这种吧，一定可以给某个看你代码的人一个惊喜。

##结语##

实际地了解css语法对于命名标识符的规定后才知道，命名时原来还有如此多的空间可以发挥。一起试试更多的有趣的选择符吧！

[img_unusual_css_selectors_of_one_site]: {{POSTS_IMG_PATH}}/201308/unusual_css_selectors_of_one_site.png "不常见的css选择符"

[W3C关于命名标识符的说明]: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier "W3C关于命名标识符的说明"
[CSS character escape sequences]: http://mathiasbynens.be/notes/css-escapes "CSS character escape sequences"
[转义工具]: http://mothereff.in/css-escapes "CSS escapes"
[Unicode character table]: http://unicode-table.com/en/ "Unicode character table" 