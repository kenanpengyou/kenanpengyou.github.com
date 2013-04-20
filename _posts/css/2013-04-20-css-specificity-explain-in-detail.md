---
layout: post
title: "css优先级详细解析"
category: "css"
description: "对css优先级的不了解往往是写css过程中感到困惑的原因。然而，css优先级并不是简单的概念，本文将在这里详细阐述css优先级。理解css优先级可以帮助你对css做更明确，更合理的布局和控制。"
---
{% include JB/setup %}

css不是一种程序语言，而是一种描述语言。因此，可以说，css理解起来是非常容易的，大部分人通过简单的学习就可以懂得如何写css代码来定义网页的样式。但是，大部分人同样也会在写css的过程中产生很多困惑，比如为什么自己写的某段css没有生效，或者呈现出的样式和预计的不同，但又不知道要如何解决。

造成这些问题的主要因素，是*css优先级*。css优先级是css中最难理解的概念之一，但对于掌握css来说非常重要。理解css优先级，不仅有利于快速解决样式问题，而且能在布局层面，帮助我们写出更明晰，更合理的css代码。

##什么是css优先级##

css的组成单元是*样式规则*（*CSS Rule*），单条样式规则的形式如下：

![样式规则][img_css_rule_explain]

其中，*选择符*（*Selector*）决定了后边所写的属性定义会作用到哪些元素，因此称为选择符。

css有一个核心特性，当多条样式规则中的同一个属性（比如`padding`）作用到了同一个元素，这些样式之间就会发生覆盖：

![css样式覆盖示意][img_undoing_style_example]

图中由前端调试工具所显示的，被划掉的css样式，不会呈现在这里选中的网页元素上，因为它们被覆盖掉了。css优先级，就是指在这种情况下，得出“应该由哪一条样式规则的内容覆盖掉其他的”这个结论的过程中所遵循的原则。更一般的表述是，*优先级高的css样式，将覆盖优先级低的css样式，成为最终网页元素的实际样式*。

注意，前端调试工具显示的，“被划掉”的css样式，并不是说一定是完全覆盖。css中的一些组合属性（比如`margin`，可以拆分为`margin-top`、`margin-right`、`margin-bottom`、`margin-left`），在这种样式覆盖中遵循的是局部覆盖的原则，即使在前端调试工具中它们看起来“整个都被划掉了”：

![组合属性覆盖][img_rollup_property_overwrite]

##css优先级的影响因素##

css优先级的影响因素要考虑三部分内容，*css选择符权重*、*!important标识符*、*属性继承*。很多文章都阐述过css选择符权重这一点，但后面两部分却很少被提及。本文会依照这三部分做详细的说明。

##属性继承##

css中一部分属性是*可继承属性*，比如文本颜色`color`。讨论css优先级，首先应认清css中的属性继承所带来的影响。由于存在可继承属性，一个网页元素的样式来源可以分为两类：

* 由css选择符直接定义到元素*本身*的样式。
* css选择符未作用到，但*继承*自父级元素的样式。

*定义到元素本身的样式，包括浏览器默认样式，一定比继承得到的样式优先级高*。因此，可以这样认定：继承得到的样式的优先级是最低的，在任何时候，只要元素本身有同属性的样式定义，就可以覆盖掉继承值：

![可继承属性覆盖][img_inherit_property_overwrite]

而且，继承样式是最低优先级这一点，是*无视继承样式所在的样式规则的内容*的。这就是说，继承样式所在的样式规则，即使其选择符的权重比元素本身样式的选择符的权重更高（本文后文会介绍选择符权重~ :) ），甚至继承样式被写了`!important`，继承样式会被元素本身样式覆盖这一点仍然成立。

举例来说明。下面这段html：

{% highlight html %}
<div id="container">
    <p class="note_text">acgtofe - 动漫与前端技术的综合博客</p>
</div>
{% endhighlight %}

对应的css：

{% highlight css %}
#container{color:darkblue;}
.note_text{color:darkorange;}
{% endhighlight %}

在所有浏览器中的效果都是：

![继承属性优先级原则无视选择符权重][img_inherit_regardless_of_selector_specificity]

再为原来的css增加`!important`：

{% highlight css %}
#container{color:darkblue !important;}
.note_text{color:darkorange;}
{% endhighlight %}

然后，会发现所有浏览器中的效果都不变：

![继承属性优先级原则无视!important][img_inherit_regardless_of_important]

当一个元素有多个父级元素都定义了继承样式，这些继承样式之间的优先级又是怎样的？这时候，遵循的优先级原则可以叫做*就近原则*，也就是说，*在存在多个继承样式时，层级关系距离当前元素最近的父级元素的继承样式，具有相对最高的优先级*。同样，这时候也是无视样式规则内容的。

![多个继承属性时的优先级][img_multiple_inherit]

就近原则其实不算是新的结论，想一下，如果把每一个父级元素都作为当前元素，然后按照前边的“元素本身样式大于继承样式”的原则推理一遍，就可以明白，离得最近的父级元素的继承样式优先级最高，是很合理的。

##css选择符权重##

css选择符权重是css优先级的核心概念。但在考虑css选择符权重前，请记住，这条优先级原则涉及的样式都是指*定义在元素本身的样式*。

每一条样式规则的选择符，除了决定这条样式规则会作用到哪些元素之外，选择符也是浏览器判断css规则优先级的参考信息。css选择符权重不是简单的内容，但却可以用简单而直观的方法做阐述。

css选择符权重是一个数字游戏，比的就是谁的计算值更大。*权重计算值大的样式规则将有更高的优先级*。你可以想象为龙珠里的战斗力测量，在这场权重战争（[Specificity Wars][]，这也是早期的一篇阐述css优先级的文章中用到的词）中，战斗力最强的将取得胜利。

战斗力的测量方法是统计选择符中的不同组成元素的个数，并以 (a,b,c,d) 这种形式来判断。其中，abcd分别代表了不同类别的选择符组成元素，且战斗力分别在不同的数量级，a最强，d最弱。从弱到强，这4个字母分别代表的类别是：

* 元素选择符（Element），伪元素选择符（Pseudo element） d = 1 – (0,0,0,1)
* 类选择符 （Class），伪类选择符（Pseudo class），属性选择符（Attribute） c = 1 – (0,0,1,0)
* Id选择符 b = 1 – (0,1,0,0)
* 内联样式（Inline style） a = 1 – (1,0,0,0)

这里的*伪元素*和*伪类*做一下补充说明。伪元素选择符，指的是样式作用到的元素不是html结构中的实际元素，即不是真正的dom元素。目前只有`:before`，`:after`，`:first-line`，`:first-letter`和`::selection`这5个伪元素选择符。伪类选择符，则是指除前边的这部分选择符之外，在css中加入冒号`:`的，用于实现动态效果与智能控制的选择符，比如`:hover`，`:nth-of-type(n)`。从css3开始，通过区别使用双冒号`::`来表示伪元素，单冒号`:`来表示伪类，但为了和以前的浏览器兼容，`:after`这种诞生于css2的伪类选择符仍然允许使用单冒号的写法。

现在，可以找一些css选择符计算一下了：

![css选择符权重计算举例][img_specificity_calculate_example]

看过这些例子后，请理解为，简单的分类计数，正是css中的战斗力测量方法。(a,b,c,d) 这种形式中，abcd分别是不同的数量级，a>b>c>d，和数字的大小比较方法相同，从高位开始，如果高位数字相同，则取低一位数字比较，以此类推。*选择符权重计算值最大的样式规则中的属性，覆盖其他的样式规则中的同名属性*。

如果你觉得自己计算麻烦，请到[Specificity Calculator][]，这是一个非常棒的计算器。

(a,b,c,d) 中，a代表的内联样式实际是存在于html代码中，只能取值为0或1，所以和其他的较为不同。后边的bcd虽说是不同的数量级，但详细说来有多大差距呢？请看下面这一段[Firefox浏览器源代码][]：

![Firefox浏览器源代码-StyleRule][img_firefox_css_selector_source]

可以看出，class和id对应的十六进制数值之间隔了2位，所以，在Firefox中，要256（16²）个class才相当于1个id。在不同浏览器中，这种层级差距，可能有所不同。在写本文的时间点，Opera和Chrome中用256+的class也不能大于id的权重。不过，这些细节信息并不重要，你在实际使用中不可能用到这个数量的选择符。所以，应认为前面所述的权重计算方法是可靠的。

如果权重计算值相同，则进入后一个环节：样式定义顺序。

###样式定义顺序###

*权重计算值相同的样式规则，定义顺序靠后的优先级高*。这里的定义顺序，包含了所有的静态样式（不包括由javascript创建`<style>`或`<link>`元素引入的样式）定义的可能情况。如直接写在html的`<style>`标签内的样式规则，通过`<link>`引入的css文件，以及`@import`引入的css文件。

请记住，只有权重计算值相同的时候，你才需要考虑样式定义顺序。

##!important标识符##

`!important`是可以写在样式规则中的某一属性定义值后的标识符，用于提升某一属性的样式定义的优先级。不同于决定整条样式规则优先级的css选择符权重，`!important`只影响自己所在位置的单一属性。`!important`在优先级原则中，可以理解为前文的(a,b,c,d)结构中的，比a更高位的标识：

![!important在优先级原则中的位置][img_position_of_css_important]

然后，你完全再按照前文的css选择符权重的比较方法，就可以得出在这种情况下的css优先级了。具体说的话，可以表述如下：

* 写有`!important`标识符的样式，其优先级一定大于没有该标识符的样式。
* 在都写有`!important`标识符的样式之间，再按照一般的css选择符权重的优先级原则做判断。

##css优先级的浏览器兼容性##

css优先级虽然是不简单的内容，但幸运的是，除IE6和IE7存在少量优先级的bug（详见[IE Specificity bugs][]）外，几乎所有浏览器都很一致地遵循css优先级原则。所以，css优先级是很通用的概念，可以在各种情况下应用而不必担心兼容性。

##结语##

css优先级的概念在本文就介绍到此。本文所阐述的仍有不够全面的地方，如果你碰到一些新的问题，欢迎来这里讨论。在实际应用中，理解css优先级并不是让我们去这样分析每一条样式规则，而只是让我们有一个更清醒的意识，知道如何去布局和控制自己所写的css。所谓“知己知彼，百战不殆”，也是这样的道理。

css全名是层叠样式表（Cascading Style Sheet），css优先级正是这种“层叠”中所遵循的原则，由此也可以看出css优先级的重要性。最后，以一个自制的图来结尾~ :)

![卡片 - css specificity war][img_special_card_css_specificity_war]

[img_css_rule_explain]: {{POSTS_IMG_PATH}}/201304/css_rule_explain.png "样式规则"
[img_undoing_style_example]: {{POSTS_IMG_PATH}}/201304/undoing_style_example.png "css样式覆盖示意"
[img_rollup_property_overwrite]: {{POSTS_IMG_PATH}}/201304/rollup_property_overwrite.png "组合属性覆盖"
[img_inherit_property_overwrite]: {{POSTS_IMG_PATH}}/201304/inherit_property_overwrite.png "可继承属性覆盖"
[img_inherit_regardless_of_selector_specificity]: {{POSTS_IMG_PATH}}/201304/inherit_regardless_of_selector_specificity.png "继承属性优先级原则无视选择符权重"
[img_inherit_regardless_of_important]: {{POSTS_IMG_PATH}}/201304/inherit_regardless_of_important.png "继承属性优先级原则无视!important"
[img_multiple_inherit]: {{POSTS_IMG_PATH}}/201304/multiple_inherit.png "多个继承属性时的优先级"
[img_specificity_calculate_example]: {{POSTS_IMG_PATH}}/201304/specificity_calculate_example.png "css选择符权重计算举例"
[img_firefox_css_selector_source]: {{POSTS_IMG_PATH}}/201304/firefox_css_selector_source.png "Firefox浏览器源代码-StyleRule"
[img_position_of_css_important]: {{POSTS_IMG_PATH}}/201304/position_of_css_important.png "!important在优先级原则中的位置"
[img_special_card_css_specificity_war]: {{POSTS_IMG_PATH}}/201304/special_card_css_specificity_war.jpg "卡片 - css specificity war"

[Specificity Wars]: http://www.stuffandnonsense.co.uk/archives/css_specificity_wars.html "CSS: Specificity Wars"
[Specificity Calculator]: http://specificity.keegan.st/ "Specificity Calculator"
[Firefox浏览器源代码]: http://hg.mozilla.org/mozilla-central/file/17c65d32c7b8/layout/style/StyleRule.cpp#l521 "mozilla-central source"
[IE Specificity bugs]: http://www.brunildo.org/test/IEASpec.html "IE Specificity bugs"