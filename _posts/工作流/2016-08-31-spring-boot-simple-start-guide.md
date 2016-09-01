---
layout: post
title: "Spring Boot简略入门手册"
category: "工作流"
description: "现在，Java Web Frameworks来搭建项目也可以比较快速了，Spring Boot就是一位杰出代表。"
---
{% include JB/setup %}

## 引言 ##

说起用Java语言来搭建Web项目，那么最令人熟知，也应用最广的框架就是Spring MVC了。不过，Spring MVC的Web项目搭建起来并不是一件简单的事，而如果你也像我这样之前没有接触过Spring生态系统，那多半会感觉到相当费劲。

时代是变化的，现在我们有了Spring Boot。

## 现代Java应用 ##

**[Spring Boot][Spring Boot]**是一个新的框架，但它并不生产新东西，而是作为一个统筹者，整理好Spring生态系统的一系列库，方便你快速搭建基于Spring的项目。

![Spring Boot][img_spring_boot_logo]

相比传统的Spring MVC，Spring Boot基本无需配置即可使用。这一点使得Spring Boot像许多脚本语言的简洁框架（如PHP的Laravel，Node的Express）那样亲切友好。这就是现代Java 应用。

## 用Spring Boot搭建Web项目 ##

接下来，本文将讲述用Spring Boot搭建一个简单Web项目的流程。

在本文的时间点，Spring Boot的推荐版本是1.4.0。

### 基本环境 ###

本文使用Java8（jdk1.8.0_60）。

Spring Boot需要搭配[Maven][Maven]或[Gradle][Gradle]任一构建工具使用。本文选择Gradle，安装版本为2.8。

Java项目需要搭配适当的IDE来开发，本文使用IntelliJ IDEA。

### 初始目录 ###

到官方提供的[Spring Initializer][Spring Initializer]，生成符合自己需要的项目初始目录，比如我的情况：

![Spring Initializer][img_spring_initializer_info]

一方面选择`Gradle Project`，另一方面在`Dependencies`位置输入并选择所需的依赖模块。这里选择`Web`和`Thymeleaf`就足够搭建一个简单的Web项目。其中，[Thymeleaf][Thymeleaf]是Spring Boot常用的模板引擎。附加的`DevTools`如名所示，是Spring Boot的开发工具，它可以提供自动刷新等有用功能。

事实上，Spring Boot的`Thymeleaf`依赖包已经包含了`Web`，因此准确地说，只用`Thymeleaf`即可。

### 创建项目 ###

使用生成的初始目录，就可以创建好一个Spring Boot项目。在IntelliJ IDEA里选择`File`→`New`→`Project from Existing Sources...`。

在打开的对话框里继续选择`Import project from external model (Gradle)`→`Use default gradle wrapper (recommended)`。

![由初始目录创建项目][img_idea_import_project]

点击`Finish`后，Gradle会立即运行，下载项目需要的依赖包。如果遇到错误，有可能是网络状况不佳，这时候可以考虑到`File`→`Settings`里找到`HTTP Proxy`一栏设置适当的代理。

新创建的项目可能还需要到`File`→`Project Structure`里设置正确的`language level`：

![设置language level][img_idea_language_level]

### 目录结构规划 ###

现在可以开始在项目里写东西了。参考官方的[Code Structure][Code Structure]建议，项目目录可以是这样（由初始目录演变得到）：

![目录结构][img_code_structure]

其中主应用类（这里是`SpringBootAcgtofeApplication.java`）建议放在图示位置，以符合Spring Boot的默认结构要求，免除额外的配置需要。

### 视图view ###

创建一个简单的视图文件`welcome.html`：

~~~html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>spring boot for acgtofe</title>
</head>
<body>
Welcome to acgtofe!
</body>
</html>
~~~

放置于`templates/welcome`目录下。

### 控制器controller ###

参照前文的目录结构创建`WelcomeController.java`，它的代码也很简单：

~~~java
@Controller
@RequestMapping("/welcome")
public class WelcomeController {

    @RequestMapping("")
    String index(){
        return "welcome/welcome";
    }

}
~~~

`@Controller`标识这是一个controller类。`@RequestMapping`用于指定访问路径，也就是路由。

`index()`方法返回一个字符串`welcome/welcome`，意思是返回路径`templates/welcome/welcome.html`的那个视图。

不需要再做其他任何配置，基于Spring Boot的简单Web项目到此就可以运行了。

### 启动运行 ###

在IntelliJ IDEA里选择`Run`→`Edit Configurations`。

在弹出的对话框里点击左上的`+`选择`Spring Boot`。然后，在右边的`Main class`一栏点击`...`按钮选择主应用类：

![运行配置][img_idea_run_config]

点击`OK`保存运行配置，最后选择`Run`→`Run`（或`Debug`）运行应用。此时控制台里可以看到Spring Boot的banner：

![默认banner][img_spring_boot_banner]

打开浏览器，访问`localhost:8080/welcome`，就可以看到刚才的视图页：

![浏览器访问结果][img_browser_result]

到此，一个简单的Web项目就完成了。接下来，我们看看如何让这个Web项目更丰富，更符合实际项目的需要。

## 改变默认配置 ##

在前面的流程中，尽可能使用了Spring Boot的默认配置，因此非常简单。如果要改变Spring Boot项目的配置，就可以修改初始提供的位于`resources`下的`application.properties`。

这个文件的内容初始是空的，表示全部使用Spring Boot的默认值。简单按照`.properties`的内容格式来添加内容就可以了。下面是一些常用的例子。

### 端口号 ###

这段代码将更改服务器启动的端口为`8001`（默认`8080`）：

~~~properties
server.port = 8001
~~~

### 非严格的thymeleaf格式 ###

你可能会发现在默认配置下，thymeleaf对`.html`的内容要求很严格，比如`<meta charset="UTF-8" />`，如果少最后的标签封闭符号`/`，就会报错而转到错误页。也比如你在使用[Vue.js][Vue.js]这样的库，然后有`<div v-cloak></div>`这样的html代码，也会被thymeleaf认为不符合要求而抛出错误。

因此，建议增加下面这段：

~~~properties
spring.thymeleaf.mode = LEGACYHTML5
~~~

`spring.thymeleaf.mode`的默认值是`HTML5`，其实是一个很严格的检查，改为`LEGACYHTML5`可以得到一个可能更友好亲切的格式要求。

需要注意的是，`LEGACYHTML5`需要搭配一个额外的库[NekoHTML][NekoHTML]才可用。到项目根目录的`build.gradle`文件里这样添加它到`dependencies`：

~~~groovy
compile('net.sourceforge.nekohtml:nekohtml:1.9.22')
~~~

然后运行一次Gradle刷新（有任何Gradle改动，都应该这样运行一次）：

![Gradle刷新][img_gradle_refresh_hint]

最后重启项目就可以感受到不那么严格的thymeleaf了。

### YAML格式的配置 ###

相比`.properties`格式，可能YAML格式看起来条理更清晰，也更有层次感。Spring Boot本身就支持YAML格式的应用配置文件，因此，你可以创建文件`application.yml`。

前面刚提到的两项配置，写成YAML是：

~~~yaml
server:
    port: 8001

spring:
    thymeleaf:
        mode: LEGACYHTML5
~~~

应用配置文件`application.[yml|properties]`除了初始位置，新建目录`resources/config`来放置也比较常见。

### 配置参考 ###

完整的配置参考请见官方的[Common application properties][Common application properties]。

## 静态资源 ##

css、js及图片属于静态资源。在`resources`目录下的以下几个位置的静态资源文件，都将在启动服务后可以被直接访问：

* `static`
* `public`
* `resources`
* `META-INF/resources`

## 数据传递与thymeleaf基础用法 ##

如何把数据从controller传递到view呢？请看下面的例子。

<div class="code_before_note">model/Hoge.java</div>

~~~java
public class Hoge {

    public int id;
    public String value;

}
~~~

<div class="code_before_note">controller/WelcomeController.java</div>
~~~java
@Controller
@RequestMapping("/welcome")
public class WelcomeController {

    @RequestMapping("")
    String index(Model model){
        Hoge hoge = new Hoge();
        hoge.id = 10;
        hoge.value = "hoge";

        model.addAttribute("myData", hoge);
        
        return "welcome/welcome";
    }

}
~~~

<div class="code_before_note">templates/welcome/welcome.html</div>
~~~html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" />
    <title>spring boot for acgtofe</title>
</head>
<body>
<p>id: <span th:text="${myData.id}">mock id</span></p>
<p>value: <span th:text="${myData.value}">mock value</span></p>
</body>
</html>
~~~

这样可以得到：

![传递数据][img_access_data_result]

在视图文件中使用thymeleaf，首先用`xmlns:th`为thymeleaf定义好名空间，然后以`th:`名空间的自定属性，来使用thymeleaf的功能。

在这个例子中，`th:text`属性表示标签内部的文本，它会输出指定的值，替换掉原来的静态文本。而`${...}`的表达式，可以用于指定`th:text`的值，以获取controller传递过来的数据（通过`model`）。

### 插值技巧 ###

在前面的例子中，我们好像为了让thymeleaf输出数据，额外增加了`<span>`标签。这个标签不是必须的，因此我们可能不想要它。

thymeleaf有一个非常有用的属性设置`th:remove='tag'`。比如现在有一个数据变量`name`的值是`Rin`，那么这段：

~~~html
<p>Hello, <span th:remove="tag" th:text="${name}">Alice</span>!</p>
~~~

将输出为：

~~~html
<p>Hello, Rin!</p>
~~~

是不是干净了许多？

详细的thymeleaf模板引擎的用法，请参考[Using Thymeleaf][Using Thymeleaf]。

## thymeleaf视图布局 ##

搭建一个Web站点常会面临这样一个问题：**有很多不同的页会有一些结构或内容是相同的，如何合理地管理它们以方便维护**？

[Thymeleaf Layout Dialect][Thymeleaf Layout Dialect]可以帮助我们应对这个问题。`spring-boot-starter-thymeleaf`依赖包已经包含了它，可以直接使用。

现在，我们有一系列视图，它们都有页眉（header），页脚（footer），及公共的css（`common.css`）和js（`common.js`），而且网页标题有相同的后缀。那么，可以新建一个布局视图`layout/default.html`：

~~~html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">

<head>
    <meta charset="UTF-8" />
    <title layout:title-pattern="$CONTENT_TITLE - $DECORATOR_TITLE">acgtofe</title>
    <link rel="stylesheet"
          href="../../static/css/common/common.css"
          th:href="@{/css/common/common.css}" />
</head>
<body>

<header>public header</header>

<section layout:fragment="content">page main content</section>

<footer>public footer</footer>

<script src="../../static/js/common/common.js"
        th:src="@{/js/common/common.js}"></script>

</body>
</html>
~~~

可以看到，共用元素，包括`<head>`内的`<meta>`、`<title>`等信息，都写在了这个布局视图内。

然后修改之前的视图`welcome/welcome.html`如下：

~~~html
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorator="layout/default">

<head>
    <title>welcome</title>
    <link rel="stylesheet"
          href="../../static/css/welcome/welcome.css"
          th:href="@{/css/welcome/welcome.css}" />
</head>
<body>

<section layout:fragment="content">Welcome to acgtofe!</section>

</body>
</html>
~~~

其中`layout:decorator="layout/default"`是一个关键的属性标记，它的意思是按照**继承**的风格，取`layout/default.html`视图作为布局使用。

启动应用并访问，可以看到结果是这样：

![布局视图的应用][img_layout_result]

`thymeleaf-layout-dialect`默认会像这样为`<head>`里的内容进行合并，而`<body>`里的内容会按`layout:fragment`分别进行覆盖。

属性`layout:title-pattern`用于指定布局视图的标题如何与页面视图的标题拼合在一起，这个例子也是用它实现了网页标题的共同后缀。

你可以查看`thymeleaf-layout-dialect`的[官方文档][thymeleaf-layout-dialect-doc]了解更多的使用方法。

## 前端库集成 ##

如果想要为项目添加jQuery、Bootstrap这样的前端库，可以使用[WebJars][WebJars]。

例如，在`build.gradle`里添加这样的依赖：

~~~groovy
compile 'org.webjars:jquery:3.1.0'
compile 'org.webjars:bootstrap:3.3.7'
~~~

运行Gradle刷新，然后就可以这样在视图文件里加入它们：

~~~html
<link rel="stylesheet"
      href="http://cdn.jsdelivr.net/webjars/bootstrap/3.3.7/css/bootstrap.min.css"
      th:href="@{/webjars/bootstrap/3.3.7/css/bootstrap.min.css}" />
<script src="http://cdn.jsdelivr.net/webjars/jquery/3.1.0/jquery.min.js"
        th:src="@{/webjars/jquery/3.1.0/jquery.min.js}"></script>
<script src="http://cdn.jsdelivr.net/webjars/bootstrap/3.3.7/js/bootstrap.min.js"
        th:src="@{/webjars/bootstrap/3.3.7/js/bootstrap.min.js}"></script>
~~~

结合前面的布局视图，就可以让这些库在任何地方都可用。

## 和Spring MVC有关的用法笔记 ##

Spring Boot的Web用的就是Spring MVC，因此Spring MVC的知识点在Spring Boot项目里是通用的。下面是一些常用功能。

### 返回一般数据的controller ###

~~~java
@RestController
@RequestMapping("/hello")
public class HelloController {

    @RequestMapping(method=RequestMethod.GET)
    public String getMethod() {
        return "get";
    }

    @RequestMapping(value="/hey", method=RequestMethod.POST)
    public String postMethod2() {
        return "hey post";
    }
}
~~~

除了返回视图，某些controller可能是用来返回一般数据（例如json格式数据），比较像API。`@RestController`标记的类就是一个API风格的controller，其内部所有指定了访问地址的方法，都将返回一般数据。一般来说，Ajax请求很适合和这样的controller搭配。

如果在返回视图的`@Controller`标记的类里也希望某单个方法返回一般数据，在这个方法前一行单独添加注解`@ResponseBody`即可。

`@RequestMapping`的`value`指定路径，`method`指定HTTP访问方法。

### controller中获取请求参数 ###

`@RequestMapping`可以在路径里设置参数，然后在方法中被取到：

~~~java
@RestController
@RequestMapping("/hello")
public class HelloController {

    @RequestMapping(value="/{id}/{name}", method=RequestMethod.GET)
    public void getMethod(@PathVariable int id, @PathVariable String name) {
        System.out.println("id=" + id + ", name=" + name);
    }
}
~~~

这样`@PathVariable`搭配`{...}`，就从路径分别获取了`id`和`name`两个变量值。

此外， 一次请求的GET参数（位于URL的`?`后的内容）或POST参数（作为请求的Request Body），都可以用`request.getParameter()`取到：

~~~java
@RestController
@RequestMapping("/hello")
public class HelloController {

    @RequestMapping(method=RequestMethod.POST)
    public void getMethod(HttpServletRequest request) {
        System.out.println("userName=" + request.getParameter("userName"));
    }
}
~~~

如果用Ajax向controller发送json字符串数据，controller这边获取起来要麻烦一些，大致像下面这样。

例如，Ajax发送的内容是（注意需要指定内容格式为json）：

~~~javascript
var person = {
    name: "Rin",
    age: 17
},
promise = $.ajax{
    url: "/hello/submit",
    type: "POST",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(person)
};
~~~

然后接收的这边需要先准备好一个同样结构的类，如`Person.java`：

~~~java
public class Person {
  private String name;
  private int age;
  // getters & setters ...
}
~~~

然后controller里用带`@RequestBody`标记的参数就可以获取到：

~~~java
@RestController
@RequestMapping("/hello")
public class HelloController {

    @RequestMapping(value="/submit", method=RequestMethod.POST)
    public void submit(@RequestBody Person person) {
        System.out.println("person.name=" + person.getName());
    }
}
~~~

如果json数据结构和数据类不能完全匹配，controller将返回415错误（不支持的媒体类型）。

## DevTools的自动刷新 ##

很久之前提到的依赖包`DevTools`终于派上用场了。DevTools提供了自动刷新功能，可以让开发更快捷。下面是结合IntelliJ IDEA的使用流程：

在应用配置文件内设置`spring.devtools.livereload.enabled`的值为`true`：

~~~properties
spring.devtools.livereload.enabled = true
~~~

接下来，为浏览器安装[LiveReload插件][LiveReload插件]，比如Chrome的情况：

![Chrome的LiveReload插件][img_chrome_livereload]

然后运行项目，并在浏览器中确认LiveReload插件为运行状态（单击一下即可在运行状态与停止状态之间切换）。

修改任意文件后，按`ctrl` + `F9`执行`Make Project`，浏览器就会在编译完成后自动刷新。

## 结语 ##

一路写下来，发现篇幅意外地长，不过这也总算是有一点“手册”的味道。如果你有考虑过Java语言来快速开发Web应用，相信本文和Spring Boot都会对你有所帮助。

[img_spring_boot_logo]: {{POSTS_IMG_PATH}}/201608/spring_boot_logo.png "Spring Boot"
[img_spring_initializer_info]: {{POSTS_IMG_PATH}}/201608/spring_initializer_info.png "Spring Initializer"
[img_idea_import_project]: {{POSTS_IMG_PATH}}/201608/idea_import_project.png "由初始目录创建项目"
[img_idea_language_level]: {{POSTS_IMG_PATH}}/201608/idea_language_level.png "设置language level"
[img_code_structure]: {{POSTS_IMG_PATH}}/201608/code_structure.png "目录结构"
[img_idea_run_config]: {{POSTS_IMG_PATH}}/201608/idea_run_config.png "运行配置"
[img_spring_boot_banner]: {{POSTS_IMG_PATH}}/201608/spring_boot_banner.png "默认banner"
[img_browser_result]: {{POSTS_IMG_PATH}}/201608/browser_result.png "浏览器访问结果"
[img_gradle_refresh_hint]: {{POSTS_IMG_PATH}}/201608/gradle_refresh_hint.png "Gradle刷新"
[img_layout_result]: {{POSTS_IMG_PATH}}/201608/layout_result.png "布局视图的应用"
[img_access_data_result]: {{POSTS_IMG_PATH}}/201608/access_data_result.png "传递数据"
[img_chrome_livereload]: {{POSTS_IMG_PATH}}/201608/chrome_livereload.png "Chrome的LiveReload插件"

[Spring Boot]: http://projects.spring.io/spring-boot/ "Spring Boot"
[Maven]: https://maven.apache.org/ "Maven"
[Gradle]: https://gradle.org/ "Gradle Build Tool I Modern Open Source Build Automation"
[Spring Initializer]: http://start.spring.io/ "Spring Initializr"
[Thymeleaf]: http://www.thymeleaf.org/ "Thymeleaf"
[Code Structure]: http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using-boot-structuring-your-code "Structuring your code - Spring Boot Reference Guide"
[Vue.js]: https://vuejs.org.cn/ "Vue.js"
[NekoHTML]: http://nekohtml.sourceforge.net/ "NekoHTML"
[Common application properties]: http://docs.spring.io/spring-boot/docs/current/reference/html/common-application-properties.html "Common application properties - Spring Boot Reference Guide"
[Thymeleaf Layout Dialect]: https://github.com/ultraq/thymeleaf-layout-dialect "Thymeleaf Layout Dialect"
[WebJars]: http://www.webjars.org/ "WebJars - Web Libraries in Jars"
[Using Thymeleaf]: http://www.thymeleaf.org/doc/tutorials/2.1/usingthymeleaf.html "Tutorial: Using Thymeleaf"
[thymeleaf-layout-dialect-doc]: https://ultraq.github.io/thymeleaf-layout-dialect/ "Introduction · Thymeleaf Layout Dialect"
[LiveReload插件]: http://livereload.com/extensions/ "LiveReload插件"
