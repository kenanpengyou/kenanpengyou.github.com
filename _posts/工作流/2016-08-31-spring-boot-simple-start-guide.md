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

接下来，本文将讲述用Spring Boot搭建一个Web项目的流程。

在本文的时间点，Spring Boot的推荐版本是1.4.0。

### 基本环境 ###

本文使用Java8（jdk1.8.0_60）。

Spring Boot需要搭配[Maven][Maven]或[Gradle][Gradle]任一构建工具使用。本文选择Gradle，安装版本为2.8。

Java项目需要搭配适当的IDE来开发，本文使用IntelliJ IDEA。

### 初始目录 ###

到官方提供的[Spring Initializer][]，生成符合自己需要的项目初始目录，比如我的情况：

![Spring Initializer][img_spring_initializer_info]

一方面选择`Gradle Project`，另一方面在`Dependencies`位置输入并选择所需的依赖模块。一个简单的Web项目只需要`Web`和`Thymeleaf`。[Thymeleaf][]是推荐的模板引擎

## 结语 ##


[img_spring_boot_logo]: {{POSTS_IMG_PATH}}/201608/spring_boot_logo.png "Spring Boot"
[img_spring_initializer_info]: {{POSTS_IMG_PATH}}/201608/spring_initializer_info.png "Spring Initializer"

[Spring Boot]: http://projects.spring.io/spring-boot/ "Spring Boot"
[Maven]: https://maven.apache.org/ "Maven"
[Gradle]: https://gradle.org/ "Gradle Build Tool I Modern Open Source Build Automation"
[Spring Initializer]: http://start.spring.io/ "Spring Initializr"
[Thymeleaf]: http://www.thymeleaf.org/ "Thymeleaf"