---
layout: post
title: "Spring Boot简略入门手册"
category: "工作流"
description: "用Java Web Frameworks来搭建项目"
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

到官方提供的[Spring Initializer][]，生成符合自己需要的项目初始目录，比如我的情况：

![Spring Initializer][img_spring_initializer_info]

一方面选择`Gradle Project`，另一方面在`Dependencies`位置输入并选择所需的依赖模块。这里选择`Web`和`Thymeleaf`就足够搭建一个简单的Web项目。其中，[Thymeleaf][]是Spring Boot常用的模板引擎，后文将介绍它的用法。附加的`DevTools`如名所示，是Spring Boot的开发工具，它可以提供自动刷新等有用功能。

事实上，Spring Boot的`Thymeleaf`依赖包已经包含了`Web`，因此准确地说，只用`Thymeleaf`即可。

### 创建项目 ###

使用生成的初始目录，就可以创建好一个Spring Boot项目。在IntelliJ IDEA里选择`File`→`New`→`Project from Existing Sources...`。

在打开的对话框里继续选择`Import project from external model (Gradle)`→`Use default gradle wrapper (recommended)`。

![由初始目录创建项目][img_idea_import_project]

点击`Finish`后，Gradle会立即运行，下载项目需要的依赖包。如果遇到错误，有可能是网络状况不佳，这时候可以考虑到`File`→`Settings`里找到`HTTP Proxy`一栏设置适当的代理。

新创建的项目可能还需要到`File`→`Project Structure`里设置正确的`language level`：

![设置language level][img_idea_language_level]

### 目录结构规划 ###

现在可以开始在项目里写东西了。参考官方的[Code Structure][Code Structure]建议，项目目录可以是这样：

![目录结构][img_code_structure]

其中主应用类（这里是`SpringBootAcgtofeApplication.java`）建议放在图示位置，以符合Spring Boot的默认结构要求，免除额外的配置需要（简单最好了）。

### view ###

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

放置于`resources/templates/welcome`目录下。

### controller ###

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

上面`index()`方法返回一个字符串，意思就是返回路径`templates/welcome/welcome.html`的那个视图。

不需要再做其他任何配置，基于Spring Boot的简单Web项目到此就可以运行了。

### 启动运行 ###

在IntelliJ IDEA里选择`Run`→`Edit Configurations`。

![运行配置][img_idea_run_config]

如上图，在弹出的对话框里点击左上的`+`选择`Spring Boot`。然后，在右边的`Main class`一栏点击`...`按钮选择主应用类。最后，点击`OK`结束运行配置。

选择`Run`→`Run`（或`Debug`）运行应用。此时控制台里可以看到Spring Boot的banner：

![默认banner][img_spring_boot_banner]

打开浏览器，访问`localhost:8080/welcome`，就可以看到刚才的视图页：

![浏览器访问结果][img_browser_result]

到此，一个简单的Web项目就完成了。

挺简单的，但你可能也感觉有好多的东西都还没有说。接下来，我们看看如何让这个Web项目更丰富，更符合实际项目的需要。

## 视图布局 ##
## 不严格的 ##

nekohtml

## DevTool的自动刷新 ##

## 结语 ##


[img_spring_boot_logo]: {{POSTS_IMG_PATH}}/201608/spring_boot_logo.png "Spring Boot"
[img_spring_initializer_info]: {{POSTS_IMG_PATH}}/201608/spring_initializer_info.png "Spring Initializer"
[img_idea_import_project]: {{POSTS_IMG_PATH}}/201608/idea_import_project.png "由初始目录创建项目"
[img_idea_language_level]: {{POSTS_IMG_PATH}}/201608/idea_language_level.png "设置language level"
[img_code_structure]: {{POSTS_IMG_PATH}}/201608/code_structure.png "目录结构"
[img_idea_run_config]: {{POSTS_IMG_PATH}}/201608/idea_run_config.png "运行配置"
[img_spring_boot_banner]: {{POSTS_IMG_PATH}}/201608/spring_boot_banner.png "默认banner"
[img_browser_result]: {{POSTS_IMG_PATH}}/201608/browser_result.png "浏览器访问结果"

[Spring Boot]: http://projects.spring.io/spring-boot/ "Spring Boot"
[Maven]: https://maven.apache.org/ "Maven"
[Gradle]: https://gradle.org/ "Gradle Build Tool I Modern Open Source Build Automation"
[Spring Initializer]: http://start.spring.io/ "Spring Initializr"
[Thymeleaf]: http://www.thymeleaf.org/ "Thymeleaf"
[Code Structure]: http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using-boot-structuring-your-code "Structuring your code - Spring Boot Reference Guide"