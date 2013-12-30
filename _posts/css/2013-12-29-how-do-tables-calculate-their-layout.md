---
layout: post
title: "以实测结果推断表格的布局计算原理"
category: "css"
description: "当网页涉及数据、表单时，表格很常用，也因此经常会有需要分配表格的宽度到多列的情况。这个分配过程会经过表格自身的布局计算，有一定的复杂性。本文将用多个表格的实例，尝试给出其布局计算原理的较可靠的结论。"
extraCSS: ["posts/201312/how-do-tables-calculate-their-layout.css"]
---
{% include JB/setup %}

##什么时候会用到表格##

现在，表格`<table>`一般不再用于网页整体的布局。不过，在面对某些特定的设计，如表单输入、数据呈现时，表格则可能是最恰当的选择。

关于表格的直观印象，就是由多个单元格（cell）整齐排列而成的元素，可以明确看出行（row）和列（column）。这可以联想到Excel，由Excel在数据处理和统计上的地位，就可以理解网页中表格的意义。

简单来说，能直观感受到多个元素是以行和列的概念排列时，用表格会让你轻松很多。如[caniuse.com][]中应用表格的例子：

![caniuse中的表格][img_caniuse_table_example]

##表格布局计算##

使用表格很简单，但有时候表格最终为每一个格子呈现的状态，可能不是你想要的。比如说某些格子出现了换行，然后整个表格就因为换行看起来十分不美观。尤其是用于数据呈现的表格，宽度分配是一个很重要的话题，你可能需要为每一列格子可能呈现的数据情况，对表格的总宽度做精打细算。

这是因为，表格在布局上有自己的特性，它会遵循一定的原理，通过计算，确定出它的实际布局。接下来，本文以实际的表格测试示例，探讨表格是如何计算自己的布局的。

###初始声明###

本文只针对应用表格最常见的方法，而不会列出所有的情况。不同浏览器对表格的部分概念的解析有差异，但布局计算是基本一致的（如果有差异，会单独提及）。

接下来用的测试表格都会以这样的外观呈现（内容取自零之轨迹）：

<div class="post_display">
    <table class="exhibit_table">
        <tr>
            <th>姓名</th>
            <th>年龄</th>
            <th>惯用武器</th>
            <th>简介</th>
        </tr>
        <tr>
            <td>罗伊德·班宁斯</td>
            <td>18</td>
            <td>旋棍</td>
            <td>隶属于克洛斯贝尔警察局的新人搜查官</td>
        </tr>
        <tr>
            <td>艾莉·麦克道尔</td>
            <td>18</td>
            <td>导力枪</td>
            <td>克洛斯贝尔自治州市长麦克道尔的孙女</td>
        </tr>
        <tr>
            <td>缇欧·普拉托</td>
            <td>14</td>
            <td>魔导杖</td>
            <td>隶属于“爱普斯坦因财团”财团的少女</td>
        </tr>
        <tr>
            <td>兰迪·奥兰多</td>
            <td>21</td>
            <td>战斧</td>
            <td>被转到警察单位的原克洛斯贝尔警备队队员</td>
        </tr>
    </table>
</div>

同时，表格都会设置`border-collapse:collapse;`和`border-spacing:0;`。这也是应用表格的最常用做法，[Normalize.css][]把这部分用作了初始化定义。

###两种算法###

定义在`<table>`元素上的css属性`table-layout`，将决定表格在布局计算时应用的算法。它有两种值，`auto`和`fixed`。在通常情况下，都使用默认值`auto`。

这两种算法的差异在于表格的宽度布局是否与表格中的数据内容有关。本文会分别讨论在这两种取值时，表格的布局计算原理。

###自动表格布局-auto###

自动表格布局的特点是，表格的宽度布局与表格中的所有数据内容有关，它需要在获取所有表格内容后才能确定最终的宽度布局，然后再一起显示出来。

如此看来，要点就是“内容相关”了。如果表格定义了固定宽度（这里是500px），而所有的单元格都不定义宽度（只讨论css定义宽度），会如何呢？来看结果：

<div class="post_display">
    <table class="exhibit_table">
        <tr>
            <th>字段1</th>
            <th>字段2</th>
            <th>字段3</th>
        </tr>
        <tr>
            <td>一二三四五六七八</td>
            <td>&nbsp;</td>
            <td>一二三四</td>
        </tr>
        <tr>
            <td>none</td>
            <td>一二三四</td>
            <td>&nbsp;</td>
        </tr>
    </table>
</div>

上面这个表格中，空白的部分是写了`&nbsp;`空格。经过比较，可以发现以下几点：

* 第2列和第3列宽度相同。
* 第1列的宽度和后面任意一列的宽度比似乎是2:1。
* 加上边框和内边距，所有列的宽度总合，等于表格定义的宽度。

每个单元格都没有定义宽度，所以宽度布局完全由具体的内容数据（文本信息）决定的。如何解释这样的结果呢？可以先直观地推测这样的逻辑：

* 第1步，从每一列中选取文字内容最多（理解为不换行的情况下，文本所占据的宽度最宽）的，作为“代表”。
* 第2步，比较各列的“代表”的宽度，然后按照它们的宽度比例关系，为它们分配表格的总宽度，包括边框和内边距。

参照上面的逻辑，再来反观一下前面的表格，是不是挺有一些道理？注意，前面说宽度比“似乎”是2:1，这个会是？来看看去掉内边距的版本：

<div class="post_display">
    <table class="exhibit_table exhibit_table_with_no_padding">
        <tr>
            <th>字段1</th>
            <th>字段2</th>
            <th>字段3</th>
        </tr>
        <tr>
            <td>一二三四五六七八</td>
            <td>&nbsp;</td>
            <td>一二三四</td>
        </tr>
        <tr>
            <td>none</td>
            <td>一二三四</td>
            <td>&nbsp;</td>
        </tr>
    </table>
</div>

用前端调试工具具体看一下上面的单元格的宽度，你会发现这个表格和之前不同，比例已经非常接近2:1（是的，还有的这一小点是因为边框，但是没有边框就没法区分列了）。

可见，*在分析宽度比例关系的时候，是会把内容宽度和内边距，以及边框都考虑在内的*。这也说明，*不是衡量文字的数目，而是衡量文字在不换行状态所能占据的宽度*（这里的2:1来源于中文汉字是等宽的）。使用内边距自然只是为了做出更美观的表格 :) 。

有宽度定义的时候，又会怎样呢？下面是一个部分单元格有宽度定义的表格：

<div class="post_display">
    <table class="exhibit_table">
        <tr>
            <th>一二</th>
            <th style="width:200px;">&nbsp;</th>
            <th>&nbsp;</th>
        </tr>
        <tr>
            <td style="width:5px;">&nbsp;</td>
            <td></td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td style="width:70px;">&nbsp;</td>
            <td>一二三四</td>
        </tr>
    </table>
</div>

它的对应html代码是：

{% highlight html %}
<table class="exhibit_table">
    <tr>
        <th>一二</th>
        <th style="width:200px;">&nbsp;</th>
        <th>&nbsp;</th>
    </tr>
    <tr>
        <td style="width:5px;">&nbsp;</td>
        <td></td>
        <td>&nbsp;</td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td style="width:70px;">&nbsp;</td>
        <td>一二三四</td>
    </tr>
</table>
{% endhighlight %}

上面这个表格可以发现以下几点：

* 宽度定为5px的单元格，实际呈现宽度是13px，这正好是单个汉字的宽度，同一列的有汉字的单元格则以最小单元格宽度的形式排列文字（所以，换行了）。
* 宽度定为200px的单元格，实际呈现宽度是200px，尽管同列还有一个宽度70px的定义。
* 没有确切宽度定义的第3列，最后得到了表格在分配完第1列和第2列后全部的剩余宽度。

对此的推断是，存在宽度定义和不存在宽度定义的列都有的情况时：

* 如果单元格定义宽度小于其内容的最小排列宽度（和不换行排列方式相反，尽可能多行排列在单元格内时，单元格所需的宽度），则该单元格所在的列，都会以最小排列方式呈现内容。
* 如果同一列中，单元格的内容宽度（不换行形式，后文这个词都是这个意思）小于该列中最大的宽度定义，则该列的实际宽度等于该宽度定义。
* 不存在宽度定义的列，会先由表格分配宽度给有宽度定义的列之后，再分配给它们（同样，它们之间的比例取决于内容宽度）。

最前边的没有宽度定义的可以看做情况1，这里有的列有宽度定义，有的又没有，可以看做情况2。下面是情况3，即所有的列都有宽度定义时：

<div class="post_display">
    <table class="exhibit_table exhibit_table_with_no_padding">
        <tr>
            <th style="width:50px;">&nbsp;</th>
            <th style="width:50px;">&nbsp;</th>
            <th style="width:100px;">&nbsp;</th>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
        </tr>
    </table>
</div>

对应html代码：

{% highlight html %}
<table class="exhibit_table exhibit_table_with_no_padding">
    <tr>
        <th style="width:50px;">&nbsp;</th>
        <th style="width:50px;">&nbsp;</th>
        <th style="width:100px;">&nbsp;</th>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
    </tr>
</table>
{% endhighlight %}

上面的表格中，去掉了内边距，因此可以清晰地由宽度定义值，得到这3列的宽度比例是2:1:1。这里还有一个条件，就是单元格内的内容宽度不超过宽度定义值。经过测试，IE7及以下在内容超过宽度定义值和其他浏览器表现不同。

从这个表格例子可以知道，如果所有的列都有宽度定义，而这些宽度定义的值的和小于表格的宽度，则表格会在分配完它们宽度定义值所对应的宽度后，继续把剩余宽度，按照它们的宽度比例，也分配给它们。

以上即是对自动表格布局，且表格本身是定义了固定宽度时，3种情况的分析。如果表格本身不定义宽度，还会有更多情况，而且会和表格的包含块（containing block，[详情][containing block]）有关，如果以后有合适机会，再做讨论（所谓文章篇幅有限...）。

###固定表格布局-fixed###

固定表格布局的特点是，表格的宽度布局和表格中的数据内容无关，只需要接收到表格第一行的信息，就可以确定最终的宽度布局，并开始显示。

固定表格布局是“内容无关”的，而且它强调“第一行”。请看下面这个表格示例：

<div class="post_display">
    <table class="exhibit_table exhibit_table_fixed">
        <tr>
            <th style="width:50px;"></th>
            <th>一二</th>
            <th>一二三四</th>
        </tr>
        <tr>
            <td>艾丝蒂尔·布莱特</td>
            <td width="1000px;">&nbsp;</td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td style="width:5px;">&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
        </tr>
    </table>
</div>

对应html代码：

{% highlight html %}
<table class="exhibit_table exhibit_table_fixed">
    <tr>
        <th style="width:50px;"></th>
        <th>一二</th>
        <th>一二三四</th>
    </tr>
    <tr>
        <td>艾丝蒂尔·布莱特</td>
        <td width="1000px;">&nbsp;</td>
        <td>&nbsp;</td>
    </tr>
    <tr>
        <td style="width:5px;">&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
    </tr>
</table>
{% endhighlight %}

固定表格布局的逻辑要简单很多，表述如下：

* 只取第一行的信息，无视第一行之后的所有单元格的内容，及宽度定义
* 在第一行中，如果单元格有宽度定义，则先分配它们所需的宽度，然后剩余的宽度平均分配给没有宽度定义的单元格
* 第一行的单元格的宽度分配将决定表格的宽度布局，第一行之后的内容不会再改变布局。

还需要注意的时候，使用固定表格布局，则一定要给表格元素定义宽度，如果它的宽度没有定义（也就是`auto`默认值），浏览器会改用自动表格布局。

###结尾声明###

与表格有关的其实还有`<colgroup>`、`<thead>`、`<tfoot>`、`<caption>`等元素，只是在最常见的用法中，并不需要用到它们。实际上，它们也在表格的布局计算的考虑之内。再加上还有单元格合并的情况，你大概可以想象到表格布局计算其实是多么复杂的东西。

W3C的文档提到，表格的布局计算（自动表格布局）尚没有成为规范。关于W3C对表格布局计算的说明，请参照[Table width algorithms][]。

##结语##

其实就表格布局计算原理这一点，做这样细致的推断，并没有多少实用性。只是说，在需要解决细节问题的时候，有这些信息做参考的话，会有所帮助，尽管这样的机会不多。

不过，可以就本文的内容，得到一个比较有意义的结论：表格定义宽度，且所有单元格都不定义宽度，那么自动布局的表格会尽可能让你的所有数据都不换行，而如果碰到换行影响美观的情况，说明必须要精简数据或者减小边距，*而不是再自行尝试重做宽度分配*。

这一次做这种实测和推断，感到针对具体情况细分后再说明，会比一次性系统地完整表述，更容易理解，也许算是语文练习？

[img_caniuse_table_example]: {{POSTS_IMG_PATH}}/201312/caniuse_table_example.png "caniuse中的表格"

[caniuse.com]: http://caniuse.com/#feat=audio "caniuse.com"
[Normalize.css]: http://necolas.github.io/normalize.css/ "Normalize.css"
[containing block]: http://www.w3help.org/zh-cn/kb/008/ "containing block"
[Table width algorithms]: http://www.w3.org/TR/CSS21/tables.html#width-layout "Table width algorithms"
