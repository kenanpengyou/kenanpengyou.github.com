---
layout: post
title: "React Native植入原生Android应用的流程解析"
category: "移动开发"
description: "React Native"
---
{% include JB/setup %}

##  引言 ##

React Native是现在移动开发新的可选方案，也带来了原属于Web领域的React的优秀开发特性。另一方面，React Native的技术栈一经掌握，可以用于iOS、Android及Windows（[见此][见此]）多个平台，即所说的“learn once, write anywhere”。

## 开始使用React Native的问题 ##

如何使用React Native？参照[官方指南][官方指南]，你会发现官方告诉你的是：请用`react-native init`命令来创建一个React Native项目。这个项目的根目录结构是这样：

![init命令生成的React Native项目][img_init_project_glance]

但是，以Android为例，一个普通原生项目的根目录结构却是这样（Android Studio 2.1.2）：

![Android原生项目][img_android_original_project_glance]

可以看到，Android原生项目（上图的`Drill`根目录）**平级于**生成的React Native项目的`Android`目录。那么，如果一直以来都是Android原生开发，现在想要引入React Native，考虑部分页面用React Native实现，应该如何做呢？

这就是React Native植入原生应用的问题。显然，`react-native init`命令生成的项目在结构上不太相符，它的出发点更像是“完全用React Native做一个多平台应用”，但我们可能需要的是“一个原生应用但有部分内容是用React Native做的”。

在本文的时间点，React Native的最新版是0.27。官方对此已给出[植入原生Android应用的指南][植入原生Android应用的指南]，但它不够准确，也缺少一些细节。因此，本文将提供一个React Native植入原生Android应用的更详细一点的流程，以供参考。

如果你想了解iOS版的，可以阅读[这篇文章][这篇文章]。

## 植入Android流程 ##

### 基本环境 ###

这篇流程是windows及Android Studio，如果你已经是一个Android Studio原生应用开发者，以及Node.js用户，那么所需的环境你基本已经有了。详情请参考[windows环境搭建文字教程][windows环境搭建文字教程]以及[开始使用React Native][开始使用React Native]，如果什么也没有，就从头搭建。

此外，Android模拟器使用了[Genymotion][Genymotion]，注册后就可以供个人使用，会比官方模拟器性能要好一些。

### 新建Android项目 ###

为方便理解，从一个全新的Android原生应用开始。

在Android Studio中创建一个新项目，注意Minimum SDK应设置为API 16及以上（React Native要求Android4.1以上的环境）：

![要求Android 4.1(API 16)以上][img_react_native_min_sdk]

###  添加npm组件 ###

到Android原生项目的根目录（也可以新建一个目录，但根目录比较常用）新建一个文件`package.json`，内容如下（这里起名为`react-native-module`）：

~~~json
{
  "name": "react-native-module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "start": "node node_modules/react-native/local-cli/cli.js start"
  },
  "dependencies": {
    "react": "^15.1.0",
    "react-native": "^0.27.2"
  }
}
~~~

下面的`dependencies`的内容要如何得知呢？答案是参考`react-native init`生成的项目，毕竟版本号是会不断更新的。如果你已经`init`生成过项目，可以运行`react-native upgrade`更新后再参考。

然后，在这个`package.json`的所在位置，执行：

    npm install

安装好所需的npm组件。

### 添加index.android.js文件 ###

同样，在根目录增加一个文件`index.android.js`，这是React Native开发的具体内容，是任意的，这里给一个简单的例子：

~~~javascript
import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';

class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.note}>
          acgtofe.com with react native
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  note: {
    fontSize: 20
  },
});

AppRegistry.registerComponent('react-native-module', () => App);
~~~

注意上面代码最后的`react-native-module`这个名字比较重要，可以自定，但后面还会在其他地方用到，需要保持一致。

### 在Android应用内添加依赖 ###

回到Android Studio，到`app`的`build.gradle`文件（module级别的gradle）里添加依赖：

~~~groovy
dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    testCompile 'junit:junit:4.12'
    compile 'com.android.support:appcompat-v7:23.4.0'
    compile "com.facebook.react:react-native:0.27.2"
}
~~~

最后一行的`react-native`就是我们新增的，注意这里的版本号要和`package.json`里的一致。

运行一次Gradle Sync，你必然会得到这个错误：

![Gradle Sync错误][img_gradle_sync_error]

这是因为Android项目默认的依赖包的源`jcenter()`并不包含最新版的React Native（它只到`0.20.1`）。新版的React Native都只在npm里发布，因此你需要增加一下依赖包的源，到根目录的`build.gradle`文件（project级别的gradle）内增加以下内容（注意官方给的注释文字）：

~~~groovy
allprojects {
    repositories {
        jcenter()
        maven {
            // All of React Native (JS, Android binaries) is installed from npm
            url "$projectDir/../node_modules/react-native/android"
        }
    }
}
~~~

这里的`url`路径，将取决于你放置`node_modules`的位置（你可以根据需要选择放置在其他地方）。以上是`node_modules`位于根目录时的`url`路径，把它改为`"$rootDir/node_modules/react-native/android"`也是可以的，它们等效。如何知道这个路径写对了呢？反复试就可以了，如果路径不对，Gradle Sync的时候一定会提示你前面的错误。

你可能在很多别的地方看到的都是这样的写法：

~~~groovy
compile "com.facebook.react:react-native:+"
~~~

不太建议这样做，因为没有明确的版本号，你无法让系统帮你判断前面的`url`路径写的是否正确。如果写错，Android将使用发布在`jcenter()`的旧版React Native，而这将不能正常运行（见后文）。

### 清单文件添加声明 ###

到Android清单文件`AndroidManifest.xml`添加这些内容（省略了无关部分）：

~~~xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
          package="com.acgtofe.drill">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>

    <application ... >
         ... 
        <activity android:name="com.facebook.react.devsupport.DevSettingsActivity" />
    </application>

</manifest>
~~~

这些权限都是ReactNative开发环境需要用到的。下面的`DevSettingsActivity`





这是可以的，但建议

###  ###

## 结语 ##

React Native的Android版本为去年9月（2015.9.15）推出，此前只有iOS版。相对来说，Android的相关教程要比iOS少很多，因此

欢迎试试现在新的acgtofe。如果使用的是桌面电脑的话，简单地把窗口宽度，从最宽一直拖到最窄，就可以看到全部的的变化效果了！

[img_init_project_glance]: {{POSTS_IMG_PATH}}/201606/init_project_glance.png  "init命令生成的React Native项目"
[img_android_original_project_glance]: {{POSTS_IMG_PATH}}/201606/android_original_project_glance.png  "Android原生项目"
[img_react_native_min_sdk]: {{POSTS_IMG_PATH}}/201606/react_native_min_sdk.png  "要求Android 4.1(API 16)以上"
[img_gradle_sync_error]: {{POSTS_IMG_PATH}}/201606/gradle_sync_error.png  "Gradle Sync错误"


[见此]: http://microsoft.github.io/code-push/articles/ReactNativeWindows.html "React Native for Windows"
[官方指南]: https://facebook.github.io/react-native/docs/getting-started.html "Getting Started – React Native | A framework for building native apps using React"
[植入原生Android应用的指南]: http://reactnative.cn/docs/0.27/embedded-app-android.html "植入原生应用 - react native 中文网"
[这篇文章]: http://ued.fanxing.com/reactnative-into-ios/ "reactnative与现有原生ios项目集成"
[windows环境搭建文字教程]: http://bbs.reactnative.cn/topic/10/%E5%9C%A8windows%E4%B8%8B%E6%90%AD%E5%BB%BAreact-native-android%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83 "在Windows下搭建React Native Android开发环境"
[开始使用React Native]: http://reactnative.cn/docs/0.27/getting-started.html "开始使用React Native - react native 中文网"
[Genymotion]: http://www.genymotion.net/ "Genymotion"