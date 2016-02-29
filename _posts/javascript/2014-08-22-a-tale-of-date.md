---
layout: post
title: "Date类型：了解日期和时间"
category: "javascript"
description: "对Date类型的有关概念的整理。如果你对javascript的Date类型还有一些不太清楚的地方，那本文也许可以帮到你。"
---
{% include JB/setup %}

Date是javascript中的引用数据类型之一，如果要处理日期、时间，一般都会用到Date类型。不过，要正确地使用Date，还应该了解日期和时间有关的概念。就从Date类型的方法开始吧。

## 创建Date ##

下面这段代码用了不同的形式，创建了一个名为`teaTime`的变量，并赋值为Date类型值，时间是最近的某一个时间点：

{% highlight javascript %}
// one way
var teaTime = new Date("Aug 21 2014 16:40:14");

// equivalent to...
var teaTime = new Date(2014, 7, 21, 16, 40, 14);
{% endhighlight %}

其中，构造函数`Date`传入了两种参数，来赋值给`teaTime`。不过，它们的效果是相同的，都代表同一个时间点。实际上，构造函数`Date`接收的参数是一个从1970年1月1日凌晨0点到希望设定的时间点的毫秒数（可以为负，表示在此之前）。上面的例子为什么可行呢？这是因为对于第一种字符串形式的单个参数，会在后台先调用`Date.parse()`方法转化为毫秒数。类似的，第二种数字形式的多个参数（你可能还发现了月份是以数字0~11来表示的），会在后台调用`Date.UTC()`方法转化为毫秒数。

UTC？这是什么？

### UTC ###

**UTC**是指**协调世界时**，是最主要的世界时间标准。这个缩写也是有来源的，英语中它是CUT（Cooordinated Universal Time），而法语中它是TUC（Temps Universel Coordonné），由于被希望协调世界时在所有语言中有统一的缩写，最后妥协使用了这个[UTC][]（竟然妥协了！）。

UTC是以[原子时][]秒长为基础的。也许你还有印象，在国际单位制（SI）中，只有7个基本单位，秒（s）就是其中之一，用的就是原子时。因此，UTC足够精确，被作为现今使用的标准时间。

与UTC非常有关的是另一个经常被提及的时间标准，GMT。

### GMT ###

**GMT**是指**格林尼治标准时间**，它对应位于英国伦敦郊区的皇家格林威治天文台的标准时间。[GMT][]（Greenwich Mean Time）受地球自转影响，可能有较大误差，因此GMT已经不再被作为标准时间使用（也就是说，现在用UTC作为标准）。不过，如果不考虑小于0.9秒的差异，GMT和UTC的时间可以认为是一样的。

### Date.parse()可用的字符串格式 ###

从前文可以知道，由于并不方便直接传入一个相对于1970年1月1日凌晨0点的毫秒数，通常我们都用`Date.parse()`和`Date.UTC()`所支持的参数形式。其中，`Date.parse()`是接收表示日期的字符串参数，如果格式不对，将返回`NaN`。

`Date.parse()`可用的表示日期的字符串包括[RFC2822][]和[ISO 8601][]。此外，可能会支持一些其他的格式，但因地区、浏览器差异，不能确保可用（所以，建议不使用）。

其中，ISO 8601的格式，例如下面这样的写法：

{% highlight javascript %}
var teaTime = new Date("2014-08-21T18:11:35");
{% endhighlight %}

只有兼容ECMAScript 5的浏览器才可用。以我自己的测试结果而言，IE8及以下不支持（返回`NaN`），请注意。

### 当前时间 ###

`Date`构造函数的另一个非常常用的用法是，不传递参数，这时候，新创建的对象将自动获得当前日期和时间。由于这里获得的当前时间是运行javascript的设备的系统时间，所以如果你自己手工更改了系统时间至不和真实情况一致，则javascript返回的结果也同样不和真实情况一致。

在指定时间内阻塞javascript代码，可以用Date实现：

{% highlight javascript %}
var start = new Date();
while (new Date() - start < 1000) {
// wait 1 second...
};
{% endhighlight %}

这可以用于某些测试。

### 超出范围的时间值 ###

如果使用超出范围的时间值，不同的浏览器会有不同的处理。例如，在写本文的时间点，我测试了`Aug 20 2014 15:75:32`这样的值，Firefox 31会将其处理为`Aug 20 2014 16:15:32`，Chrome 36和IE9+返回`Invalid Date`，IE8-返回`NaN`。

可见，要保证正常运行，最好的做法是保证输入的就是合法的时间值。

### 不使用new关键字的情况 ###

如果不使用关键字`new`，也就是说，直接调用`Date()`，则无论传什么参数，都返回一个`String`字符串数据，其内容是当前时间，相当于`Date.now().toString()`的结果：

{% highlight javascript %}
// will get a string like "Fri Aug 22 2014 10:10:08 GMT+0800"
var teaTime = Date("Aldnoah Zero");
{% endhighlight %}

## 显示一致的时间信息 ##

使用Date类型，一般是为了在页面中显示时间信息。不过，事实情况是，Date类型所有的将日期格式化为字符串的方法，包括`toString()`和`toLocaleString()`，其结果都因浏览器不同而不同。因此，如果要显示一致的时间信息，应该使用`getFullYear()`、`getMonth()`等get方法依次获取时间中的数字信息，然后自己以字符串组合的方式来组成自己想要的时间信息。例如：

{% highlight javascript %}
var time = new Date("Aug 22 2014 16:40:54"),
timeString = "";

timeString += time.getFullYear() + "-";
timeString += (time.getMonth() + 1) + "-";
timeString += time.getDate() + " ";
timeString += time.getHours() + ":";
timeString += time.getMinutes() + ":";
timeString += time.getSeconds();

alert(timeString); // 2014-8-22 16:40:54 in all browsers
{% endhighlight %}

需要注意的是，get方法有类似`getUTCHours()`和`getHours()`这样以UTC作为分别的情况。UTC系列的get方法返回的是前面所说的世界标准时间，时区上说就是零时区。而不带UTC的get方法返回的是当地时间。由于我们一般会用到的时间都是当地时间（比如国内是东八区，记为UTC/GMT +0800），所以基本只会用到`getHours()`这种形式的方法。

有关详细的Date类型的方法，请参考[MDN对Date的解释][]。

## 获得时区信息 ##

Date类型有一个`getTimezoneOffset()`的方法，它可以用来分析本地与UTC时间之间的时差。比如我自己这里调用的结果：

{% highlight javascript %}
// -480 while I'm in china
var hereTimeOffset = new Date().getTimezoneOffset();
{% endhighlight %}

它的结果是本地时间和UTC时间相差的分钟数（而且是 UTC - 本地时间）。如果这个“本地”进入夏令时，这个值会有变化。

什么是夏令时？

### DST ###

**DST**是指**夏令时间**，也叫做**日光节约时间**（Daylight saving time）。它是由部分国家所实施的在一年中的某一时间段（以夏季为中心，例如美国的4月到10月）内，将时间拨快1小时，以充分利用夏季较长的日光时间，节约能源的时间制度。在实行夏令时的国家中，不同国家也会有不同的夏令时实施日期。

为什么说DST会影响到`getTimezoneOffset()`这个值呢，看看Windows 7里的日期和时间选项：

![Windows 7中日期和时间选项中会提到夏令时][img_dst_windows7]

可见，夏令时已经被集成在系统内，会对应地改变系统时间，从而影响结果。不过，你可以从上面看到，中国未实行夏令时，所以不必担心受到影响，在此了解一下就可以了。

## 倒计时的制作方法 ##

如何制作一个倒计时？

首先，需要明确的是，javascript的每一个Date对象表示的虽然是一个时间点，看起来包括年月日时分秒等多重信息，但它实际是由单个数字信息体现的，这个数字就是相对于1970年1月1日凌晨0点UTC的毫秒数。因此，将时间点对应的毫秒数，做减法，然后将差值结果（也是毫秒数）依次转化为其他不同级别的时间单位，就可以得到倒计时信息。

你可以参考[How to create a simple javascript countdown timer][]。

## 结语 ##

最近在完成某个日期和时间有关的功能时，发现自己对诸如UTC这样的概念都没有什么印象。所以，果断地自己补习了一下，然后整理成了这篇文章。



[img_dst_windows7]: {{POSTS_IMG_PATH}}/201408/dst_windows7.png "Windows 7中日期和时间选项中会提到夏令时"

[UTC]: http://zh.wikipedia.org/wiki/%E5%8D%8F%E8%B0%83%E4%B8%96%E7%95%8C%E6%97%B6 "协调世界时 - 维基百科，自由的百科全书"
[原子时]: http://zh.wikipedia.org/wiki/%E5%8E%9F%E5%AD%90%E6%97%B6 "原子时 - 维基百科，自由的百科全书"
[GMT]: http://zh.wikipedia.org/wiki/%E6%A0%BC%E6%9E%97%E5%B0%BC%E6%B2%BB%E6%A0%87%E5%87%86%E6%97%B6%E9%97%B4 "格林尼治标准时间 - 维基百科，自由的百科全书"
[RFC2822]: http://tools.ietf.org/html/rfc2822#page-14 "RFC 2822 - Internet Message Format"
[ISO 8601]: http://www.w3.org/TR/NOTE-datetime "Date and Time Formats"
[MDN对Date的解释]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date "Date - JavaScript | MDN"
[How to create a simple javascript countdown timer]: https://mindgrader.com/tutorials/1-how-to-create-a-simple-javascript-countdown-timer "How to create a simple javascript countdown timer | MindGrader"
