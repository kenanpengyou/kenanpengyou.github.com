---
layout: post
title: "React Native植入原生Android应用的流程解析"
category: "移动开发"
description: "React Native已经是当前移动开发新的可用技术方案，不过具体到如何应用，官方的本意和移动开发人员的想法可能还有些偏差。本文将介绍如何正确地在一个现有的原生Android应用的基础之上，再加入React Native。"
---
{% include JB/setup %}

##  引言 ##

React Native是现在移动开发新的可选方案，也带来了原属于Web领域的React的优秀开发特性。另一方面，React Native的技术栈一经掌握，可以用于iOS、Android及Windows（[见此][见此]）多个平台，即所说的“learn once, write anywhere”。

## 开始使用React Native的问题 ##

如何使用React Native？参照[官方指南][官方指南]，你会发现官方告诉你的是：请用`react-native init`命令来创建一个React Native项目。这个项目的根目录结构是这样：

![init命令生成的React Native项目][img_init_project_glance]

但是，以Android为例，一个普通原生项目的根目录结构却是这样（Android Studio 2.1.2）：

![Android原生项目][img_android_original_project_glance]

可以看到，Android原生项目（上图的`Drill`根目录）**平级于**生成的React Native项目的`android`目录。那么，如果一直以来都是Android原生开发，现在想要引入React Native，考虑部分页面用React Native实现，应该如何做呢？

这就是React Native植入原生应用的问题。显然，`react-native init`命令生成的项目在结构上不太相符，它的出发点更像是“完全用React Native做一个多平台应用”，但我们可能需要的是“一个原生应用但有部分内容是用React Native做的”。

在本文的时间点，React Native的最新版是0.27。官方对此已给出[植入原生Android应用的指南][植入原生Android应用的指南]，但它不够准确，也缺少一些细节。因此，本文将提供一个React Native植入原生Android应用的更详细一点的流程。

如果你想了解iOS版的，可以阅读[这篇文章][这篇文章1]。

## 植入Android流程 ##

### 基本环境 ###

这篇流程是windows及Android Studio，如果你已经是一个Android Studio原生应用开发者，以及Node.js用户，那么所需的环境你基本已经有了。详情请参考[windows环境搭建文字教程][windows环境搭建文字教程]以及[开始使用React Native][开始使用React Native]，什么都没有也没关系，正好从头搭建。

此外，Android模拟器使用了[Genymotion][Genymotion]，注册后就可以供个人使用，会比官方模拟器性能要好一些。

### 新建Android项目 ###

让我们从一个全新的Android原生应用开始。

用Android Studio创建一个新项目，注意Minimum SDK应设置为API 16及以上（React Native要求Android4.1以上的环境）：

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

~~~shell
npm install
~~~

安装好所需的npm组件。

### 添加index.android.js文件 ###

同样在根目录，增加一个文件`index.android.js`，这是React Native开发的具体内容，是任意的，这里给一个简单的例子：

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
  }
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

这是因为Android项目默认的依赖包的源`jcenter()`并不包含最新版的React Native（它只到`0.20.1`）。新版的React Native都只在npm里发布，因此你需要增加一下依赖包的源，到根目录的`build.gradle`文件（project级别的gradle）内增加以下内容（从官方的这句注释也可以了解到这一点）：

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

不太建议这样做，因为没有明确的版本号，你无法让系统帮你判断前面的`url`路径写的是否正确。如果写错，Android将使用发布在`jcenter()`的旧版React Native，而这将引发其他错误（见后文）。

### 新建React Native的Activity ###

新建一个继承自`ReactActivity`的activity（这里起名为`LiveActivity`），Android Studio会提醒你必须实现3个方法，一般写成这样：

~~~java
public class LiveActivity extends ReactActivity {

    @Override
    protected String getMainComponentName() {
        return "react-native-module";
    }

    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
                new MainReactPackage()
        );
    }
}
~~~

`getMainComponentName()`的字符串返回值，必须和前面的`index.android.js`内的组件名一致。

`getUseDeveloperSupport()`是一个逻辑返回值，表示是否启用开发者模式。这里写`BuildConfig.DEBUG`就可以自动根据gradle构建的类型（debug或release）来决定。

`getPackages()`是模块列表，一般像上面代码这样就可以。如果你需要在JavaScript里调用原生Java模块，就要把它们添加到这里，具体可以参考[这篇文章][这篇文章2]。

### 清单文件添加声明 ###

到Android清单文件`AndroidManifest.xml`添加以下内容（省略了无关部分）：

~~~xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
          package="com.acgtofe.drill">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>

    <application ... >
         ... 
        <activity android:name=".LiveActivity" />
        <activity android:name="com.facebook.react.devsupport.DevSettingsActivity" />
    </application>

</manifest>
~~~

前面的权限都是React Native开发环境需要用到的。后面的`LiveActivity`是刚才的React Native运行界面，`DevSettingsActivity`则是以下这个`Dev Settings`的界面：

![Dev Settings界面][img_dev_settings_activity]

它也是开发版所必需的。

### 启动packager server ###

到`package.json`的位置，打开命令行，运行packager server：

~~~shell
react-native start
~~~

也可以用`npm start`。启动后的状态看起来像这样：

![packager server运行中][img_react_packager]

### 运行起来 ###

这是最后一步了。build这个Android项目，安装到模拟器里，然后打开应用，切换到`LiveActivity`界面（用按钮跳转，或者直接设置为启动界面都可以），这时候应该只看到一片空白。

按`ctrl` + `m`（这是Genymotion的用法，事实上，这是Android的Menu键，现在的实体设备基本没有这个键，但摇一摇可以触发）开启调试菜单，选择`Dev Settings`，打开前面贴过图的`DevSettingsActivity`，设置`Debug server host & port for device`为本机ip地址（命令行内`ipconfig`查看）。最后，回到`LiveActivity`，开启调试菜单选择`Reload JS`，等待一会儿，如果你看到了像下图这样的界面：

![示例效果][img_demo_view]

就说明完成了！对应的，packager server里应该可以看到每一次请求的记录：

![示例的packager server输出][img_demo_shell_output]

接下来，你就可以开始React Native的开发了，改动保存后，重新`Reload JS`，就可以看到新的效果。

## 建议及改进 ##

建议使用Android 5.0+的设备（包括模拟器），它们支持直接USB传输packager server返回的那个bundle js文件。如果是Android 5.0+，可以USB连接电脑后（如果是模拟器，那就等于已经连接）运行以下命令：

~~~shell
adb reverse tcp:8081 tcp:8081
~~~

然后就可以省略掉前面流程里设置本机ip地址那一步，直接`Reload JS`。注意设备需要开启USB调试（模拟器不用），而且电脑同时只连接一个设备。

相对于前面设置本机ip地址的方式，这帮你免去了同一WiFi环境、代理等麻烦。

## 不顺利的情况 ##

虽然流程看起来轻松愉快，但并不怎么能一次成功。下面是我在流程中碰到过的一些问题及其记录，可以用作参考。

### 版本不匹配 ###

错误提示如下：

![Module 0 is not ...][img_error_1]

参照[github上的issue][github上的issue]，这个错误的引发原因是packager server的React Native版本和Android应用内的不一致。比如应用内的gradle依赖写的是`compile "com.facebook.react:react-native:+"`但`url`路径写得不对，结果用的就是`jcenter()`里的`0.20.1`的旧版，就会有这个问题。

因此，建议用`compile "com.facebook.react:react-native:0.27.2"`这样的写法，并检查版本号是否和`package.json`里的一致。

### 404 ###

![404][img_error_2]

这是说`index.android.js`文件不存在的错误。但我碰见的是文件就在那，也出这个错误。

这可能是由不正确的缓存引起，我的解决方法：关闭server，删除`index.android.js`，然后重启server，刷新，得到真正的404，然后还原`index.android.js`，再刷新即解决。

### 无法连接到server ###

![Could not connect to development server.][img_error_3]

先按照`Try the following to fix the issue: `下给出的解决方法依次检查和尝试。如果仍不能解决，删除掉`node_modules`目录，重新`npm install`，然后重开server。

windows下删除`node_modules`目录可能有路径过长的问题，推荐用[rimraf][rimraf]来删除。

### 500 ###

![500][img_error_4]

这个问题需要具体看server的输出，我这里的错误信息是：`Error: Unable to find file with path: ......polyfills\prelude_dev.js`。类似前面的无法连接server，我也是删除`node_modules`后重新安装得到解决。

### 有用的调试方法 ###

流程中可能碰到的问题可以分为两类，Android应用（client）和server。如果看到错误，打开浏览器访问`http://localhost:8081/index.android.bundle?platform=android`，如果能看到输出的JavaScript代码，那说明server是比较正常的，更可能是Android应用的问题。反过来，如果浏览器里同样看到错误信息，那更可能就是server的问题。

### 没有Flow和Nuclide ###

你可能在开始用React Native的过程中听说了[Flow][Flow]和[Nuclide][Nuclide]，它们分别是JavaScript类型检查工具及React Native的推荐IDE。

但请注意，在本文的时间点，它们还没有windows版。我是用[Atom][Atom]来开发React Native的。

## 发布正式版 ##

React Native的开发版是需要有一个packager server来随时发送更新后的bundle js文件的。但如果要得到真正签名的正式版（`app-release`），你需要把bundle js文件保存到Android应用的资源目录内。这样，正式版不再需要server支持，可以独立运行。

参照[官方的发行APK包指南][官方的发行APK包指南]，你只需要这样几步：

* 创建目录`app/src/main/assets`。
* 运行以下命令（对应本文流程的目录结构），将bundle js文件保存到资源目录。

~~~shell
react-native bundle --platform android --dev false 
--entry-file index.android.js 
--bundle-output app/src/main/assets/index.android.bundle 
--assets-dest app/src/main/res/
~~~

* 在Android Studio里选择`Build`→`Generate Signed APK...`，生成正式版的apk。

官方有提到使用`react.gradle`文件的方法，但我觉得像上面这样不用它更简单。

### 正式版的即时更新 ###

看起来正式版把bundle js文件保存到了apk内，这好像就丢失了React Native的即时更新？对的，但仍然有办法实现它，你可以看看[React-Native-Remote-Update][React-Native-Remote-Update]，这个项目已经过时了，但里面贴出的原理很值得参考。

现在，你可以用[react-native-auto-updater][react-native-auto-updater]来帮助你实现React Native的即时更新。

## 参考资料集 ##

我在写本文的过程中参考了下面三个资料集合，觉得非常棒，在此也贴出来：

* [React-Native学习指南][React-Native学习指南]
* [Android开发技术周报特刊之React Native][Android开发技术周报特刊之React Native]
* [react-native-android-guide][react-native-android-guide]

## 结语 ##

React Native的Android版本是去年9月（2015.9.15）才推出，此前只有iOS版。相对来说，Android的相关教程要比iOS少很多。因此，我觉得有这样一份windows + React Native for Android的组合流程会很有帮助。

来尝试新的移动开发方案吧！

[img_init_project_glance]: {{POSTS_IMG_PATH}}/201606/init_project_glance.png  "init命令生成的React Native项目"
[img_android_original_project_glance]: {{POSTS_IMG_PATH}}/201606/android_original_project_glance.png  "Android原生项目"
[img_react_native_min_sdk]: {{POSTS_IMG_PATH}}/201606/react_native_min_sdk.png  "要求Android 4.1(API 16)以上"
[img_gradle_sync_error]: {{POSTS_IMG_PATH}}/201606/gradle_sync_error.png  "Gradle Sync错误"
[img_dev_settings_activity]: {{POSTS_IMG_PATH}}/201606/dev_settings_activity.png  "Dev Settings界面"
[img_react_packager]: {{POSTS_IMG_PATH}}/201606/react_packager.png  "packager server运行中"
[img_demo_view]: {{POSTS_IMG_PATH}}/201606/demo_view.png  "示例效果"
[img_demo_shell_output]: {{POSTS_IMG_PATH}}/201606/demo_shell_output.png  "示例的packager server输出"
[img_error_1]: {{POSTS_IMG_PATH}}/201606/error_1.png  "Module 0 is not ..."
[img_error_2]: {{POSTS_IMG_PATH}}/201606/error_2.png  "404"
[img_error_3]: {{POSTS_IMG_PATH}}/201606/error_3.png  "Module 0 is not ..."
[img_error_4]: {{POSTS_IMG_PATH}}/201606/error_4.png  "500"

[见此]: http://microsoft.github.io/code-push/articles/ReactNativeWindows.html "React Native for Windows"
[官方指南]: https://facebook.github.io/react-native/docs/getting-started.html "Getting Started – React Native | A framework for building native apps using React"
[植入原生Android应用的指南]: http://reactnative.cn/docs/0.27/embedded-app-android.html "植入原生应用 - react native 中文网"
[这篇文章1]: http://ued.fanxing.com/reactnative-into-ios/ "reactnative与现有原生ios项目集成"
[windows环境搭建文字教程]: http://bbs.reactnative.cn/topic/10/%E5%9C%A8windows%E4%B8%8B%E6%90%AD%E5%BB%BAreact-native-android%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83 "在Windows下搭建React Native Android开发环境"
[开始使用React Native]: http://reactnative.cn/docs/0.27/getting-started.html "开始使用React Native - react native 中文网"
[Genymotion]: http://www.genymotion.net/ "Genymotion"
[这篇文章2]: http://www.liuchungui.com/blog/2016/05/08/reactnativezhi-yuan-sheng-mo-kuai-kai-fa-bing-fa-bu-androidpian/ "ReactNative之原生模块开发并发布——android篇 - liuchungui's Blog"
[github上的issue]: https://github.com/facebook/react-native/issues/7832 "[Android] module 0 is not a registered callable module. · Issue #7832 · facebook/react-native"
[rimraf]: https://www.npmjs.com/package/rimraf "rimraf"
[Flow]: https://flowtype.org/ "Flow | A static type checker for JavaScript"
[Nuclide]: https://nuclide.io/ "Nuclide"
[Atom]: https://atom.io/ "Atom"
[官方的发行APK包指南]: http://reactnative.cn/docs/0.27/signed-apk-android.html "官方的发行APK包指南"
[React-Native-Remote-Update]: https://github.com/fengjundev/React-Native-Remote-Update "使用React-Native实现app热更新的一次实践"
[react-native-auto-updater]: https://github.com/aerofs/react-native-auto-updater "aerofs/react-native-auto-updater: A library to manage dynamic updates to React Native apps."
[React-Native学习指南]: https://github.com/reactnativecn/react-native-guide "React-Native学习指南"
[Android开发技术周报特刊之React Native]: http://www.androidweekly.cn/android-dev-special-weekly-react-native/ "Android开发技术周报特刊之React Native"
[react-native-android-guide]: https://github.com/xujinyang/react-native-android-guide "react-native-android-guide"