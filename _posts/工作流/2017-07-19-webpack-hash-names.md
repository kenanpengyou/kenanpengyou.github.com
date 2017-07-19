---
layout: post
title: "Webpack中hash的用法"
category: "工作流"
description: "Webpack的构建除了常规的输出之外，还可以选择带hash的输出。这种输出文件很有用，但处理起来并不是很容易。本文将针对这个问题，展示一些可行的方案。"
---
{% include JB/setup %}

在[webpack][webpack]的配置项中，可能会见到`hash`这样的字符。

当存在`hash`配置的时候，webpack的输出将可以得到形如这样的文件：

```
page1_bundle_54e8c56e.js
```

这种带哈希值的文件名，可以帮助实现静态资源的长期缓存，在生产环境中非常有用。关于这一点的详细内容，可以参考这篇久远的[大公司里怎样开发和部署前端代码][blog_issue]。

## 在webpack中配置hash ##

下面是一个带hash输出的webpack配置的例子(webpack v3.0.0)：

```js
var env = {
    src: path.resolve(__dirname, './src'),
    output: path.resolve(__dirname, './dist'),
    publicPath: '/'
};

module.exports = {
    entry: {
        'page1': './page1',
        'page2': './page2'
    },
    context: env.src,
    output: {
        path: env.output,
        filename: './[name]/bundle_[chunkhash:8].js',
        publicPath: env.publicPath
    },
    devtool: false,
    module: {
        rules: [{
            test: /\.(png|jpg)$/,
            use: 'url-loader?limit=8192&name=[path][name]_[hash:8].[ext]'
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: 'css-loader'
            })
        }]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: './[name]/style_[contenthash:8].css'
        })
    ]
};
```

可以看到，有多个地方都出现了`hash`这个词，但形式不太一样。

### output的情况 ###

output的`filename`可以指定hash。有两个值可以选择：

* `[hash]`。hash值是特定于整个构建过程的。
* `[chunkhash]`。hash值是特定于每一个文件的内容的。

我们理想的缓存设计是，在一次版本更新(重新构建)后，只有当一个文件的内容确实发生了变化，它才需要被重新下载，否则应使用缓存。

因此，以上两个值中更推荐的是`[chunkhash]`。你也可以阅读这篇官方的[缓存指南][缓存指南]了解更多细节。

### file-loader的情况 ###

`url-loader`和`file-loader`是同一家，参照[file-loader文档][file-loader文档]可知，文件名`name`可以使用标识符`[hash]`来启用hash。此外，你还可以按照`[<hashType>:hash:<digestType>:<length>]`的格式更详细地定制hash结果。

`[hash:8]`中的`:8`则和前面output的一样，指定了hash结果的截取长度。

### extract-text-webpack-plugin的情况 ###

被引用的css通过`extract-text-webpack-plugin`来得到带hash的文件。参照[extract-text-webpack-plugin文档][extract-text-webpack-plugin文档]，在指定生成文件的文件名`filename`时可以使用标识符`[contenthash]`(可以看到，和之前的并不相同)。

## 引用带hash的文件 ##

当静态资源的文件名变成这样的带哈希值的版本后，引用这些静态资源就需要稍多花一点工夫。

### 纯前端的情况 ###

**如果没有任何服务端，只是纯html、css、js的前端应用的话，一般使用[html-webpack-plugin][html-webpack-plugin]**。

例如，新建一个`index.ejs`模板文件如下：

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>App Example</title>
</head>

<body>
    <main id="root"></main>
</body>

</html>
```

然后增加html-webpack-plugin到webpack：

```js
{
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.ejs'
    })
  ]
}
```

执行一次webpack构建，得到生成的`index.html`：

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>App Example</title>
    <link href="/page1/style_626f7c3f.css" rel="stylesheet">
</head>

<body>
    <main id="root"></main>
    <script type="text/javascript" src="/page1/bundle_0f33bdc8.js"></script>
</body>

</html>
```

可以看到，html-webpack-plugin在模板文件内容的基础上，就添加好了需要引用的bundle js。如果还有生成的css文件(通过`extract-text-webpack-plugin`)，也会被添加到适当的位置。

### 纯前端、多页的情况 ###

如果webpack有多个entry文件，例如本文最前面给出的例子：

```js
{
    entry: {
        'page1': './page1',
        'page2': './page2'
    }
}
```

在这种情况下，html-webpack-plugin会把全部entry的输出都集中到一个`.html`里。所以，这可能并不是我们想要的。

我们更希望的是为每一个entry生成一个`.html`。这时候，可以使用的是[multipage-webpack-plugin][multipage-webpack-plugin]。这个插件实际也依赖了html-webpack-plugin。

例如，有这样的目录结构：

```
.
├─ package.json
├─ src
│   ├─ page1
│   │   ├─ index.css
│   │   ├─ index.ejs
│   │   ├─ index.js
│   │   └─ potofu.jpg
│   └─ page2
│       ├─ index.css
│       ├─ index.ejs
│       └─ index.js
└─ webpack.config.js
```

然后在webpack配置文件中加入multipage-webpack-plugin：

```js
{
  plugins: [
    new MultipageWebpackPlugin({
        htmlTemplatePath: '[name]/index.ejs',   // 源模板文件的位置
        bootstrapFilename: 'manifest.js',
        templatePath: '[name]'  // 输出html文件的路径
    }),
  ]
}
```

`[name]`标识符对应的是每一个entry的名称(注意，在本文的时间点，需要使用multipage-webpack-plugin的master分支，也就是最新版，才支持此标识符)。在这个例子中，只有两个取值：`page1`，`page2`。

`bootstrapFilename`如字面意义，是指保存webpack的bootstrap代码的文件命名。而webpack的bootstrap代码被这样单独放到一个文件里，是因为multipage-webpack-plugin在内部(<del>强行</del>)为你启用了`CommonsChunkPlugin`。

执行一次webpack构建，得到的输出结果：

```
dist
├─ manifest.js
├─ page1
│   ├─ bundle_29862ad6.js
│   ├─ index.html
│   ├─ potofu_26766d43.jpg
│   └─ style_0b5ab6ef.css
├─ page2
│   ├─ bundle_6a9c6f12.js
│   ├─ index.html
│   └─ style_914dffd0.css
└─ shared
    └─ bundle_9fa1a762.js
```

取其中一个`page1/index.html`，内容是：

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>page1</title>
    <link href="/page1/style_0b5ab6ef.css" rel="stylesheet">
</head>

<body>
    <div class="page-box">page1</div>
    <script type="text/javascript" src="/manifest.js"></script>
    <script type="text/javascript" src="/shared/bundle_9fa1a762.js"></script>
    <script type="text/javascript" src="/page1/bundle_29862ad6.js"></script>
</body>

</html>
```

可以看到，关联的css、js静态资源，都已被正确添加。

### 带服务端的情况 ###

如果是带服务端的应用，引用带hash的资源文件将是另一个思路。

常见的做法是，**为所有的静态资源生成一个`.json`清单文件，然后在服务端读取这个`.json`，然后把清单信息提供给模板文件，由此来正确地引用所需的静态资源**。

插件[webpack-manifest-plugin][webpack-manifest-plugin]或[assets-webpack-plugin][assets-webpack-plugin]都可以帮助完成这一点。

### 服务端例子 - Spring Boot & Thymeleaf ###

请看一个Spring Boot(`1.5.3.RELEASE`) & Thymeleaf(`2.1`)的例子。这里选择webpack-manifest-plugin。

首先，在webpack的配置中加入这个插件：

```js
{
  plugins: [
     new ManifestPlugin()
  ]
}
```

执行webpack构建，即生成一个资源清单文件`manifest.json`(位置取决于webpack的output配置，这里是`src/main/resources/static`)，它的内容是这样：

```
{
  "account/login.css": "account/login_style_f549ea0a.css",
  "account/login.js": "account/login_bundle_279af402.js"
}
```

接下来，创建一个帮助类`ResourceFormatter`(名称自拟)：

```java
public class ResourceFormatter{

    private JsonNode resourceMap;

    public ResourceFormatter(){
        ObjectMapper mapper = new ObjectMapper();
        Resource resource = new ClassPathResource("static/manifest.json");

        try {
            resourceMap = mapper.readValue(resource.getFile(), JsonNode.class);
        } catch (IOException e) {
            resourceMap = null;
        }
    }

    public String format(String originPath){

        if(resourceMap != null && resourceMap.has(originPath)){
            return "/" + resourceMap.get(originPath).asText();
        }

        return "/" + originPath;
    }
}
```

这个帮助类在初始化的时候就会读取`manifest.json`，而在`format()`方法里则会利用清单信息对路径进行转换。

然后，把这个帮助类添加到模板引擎Thymeleaf内，包含两步。

第一步，创建一个Dialect类：

```java
public class ResourceDialect extends AbstractDialect implements IExpressionEnhancingDialect {

    public ResourceDialect() {
        super();
    }

    @Override
    public String getPrefix() {
        return "resource";
    }

    @Override
    public Map<String, Object> getAdditionalExpressionObjects(IProcessingContext processingContext) {
        Map<String, Object> expressions = new HashMap<>();
        expressions.put("resourceFormatter", new ResourceFormatter());
        return expressions;
    }
}
```

可以看到`ResourceFormatter`在这里被实例化并添加。

第二步，在Spring应用中注册这个Dialect类：

```java
@Configuration
public class ThymeleafConfig {
    @Bean
    public ResourceDialect resourceDialect() {
        return new ResourceDialect();
    }
}
```

到此，就可以在Thymeleaf视图模板文件中使用了。修改视图文件如下(只包含修改的部分)：

```html
<link rel="stylesheet" th:href="@{${#resourceFormatter.format('account/login.css')}}" th:unless="${@environment.acceptsProfiles('dev')}" />
<!-- ... -->
<script th:src="@{${#resourceFormatter.format('account/login.js')}}"></script>
```

最后，启动服务，访问该页，可以看到最终的输出信息：

```html
<link rel="stylesheet" href="/account/login_style_f549ea0a.css">
<!-- ... -->
<script src="/account/login_bundle_279af402.js"></script>
```

这就是我们要的带hash的文件了。

此外，关于如何在Spring Boot中引入webpack，可以参考这个[spring-boot-angular2-seed][spring-boot-angular2-seed]。

### 服务端例子 - Koa ###

看完了一个传统Java应用的例子，再来看看现代的Node应用。[Koa][Koa](v2)是简洁的Node服务端框架，在它的基础上引用带hash的资源文件，也是同样的思路。

首先，同样是在webpack配置中加入webpack-manifest-plugin。

运行webpack构建生成`manifest.json`，内容大概会像这样：

```
{
  "page1.css": "page1/style_0b5ab6ef.css",
  "page1.js": "page1/bundle_0f33bdc8.js",
  "page1\\potofu.jpg": "page1/potofu_26766d43.jpg"
}
```

然后，读取这个json，为Koa(通过`ctx.state`)添加一个资源路径转换的帮助方法：

```js
import manifest from './public/manifest.json';

app.use(async(ctx, next) => {
    ctx.state.resourceFormat = (originPath) => {

        if (originPath in manifest) {
            return "/" + manifest[originPath];
        }

        return "/" + originPath;
    };
    await next();
});
```

最后，在视图模板(这里的模板引擎是[ejs][ejs])内，引用所需的静态资源：

```html
<link rel="stylesheet" href="<%= resourceFormat('page1.css') %>">
<!-- ... -->
<script src="<%= resourceFormat('page1.js') %>"></script>
```

到此，Koa的例子就完成了。

## 结语 ##

带hash的文件是现在web启用缓存来提升性能比较建议的形式，如果你也有类似的生产环境优化的需要，很推荐你也试试。


[webpack]: https://webpack.js.org/ "webpack"
[blog_issue]: https://github.com/fouber/blog/issues/6 "大公司里怎样开发和部署前端代码？"
[缓存指南]: https://doc.webpack-china.org/guides/caching/ "缓存 - webpack"
[file-loader文档]: https://github.com/webpack-contrib/file-loader "webpack-contrib/file-loader: file loader for webpack"
[extract-text-webpack-plugin文档]: https://github.com/webpack-contrib/extract-text-webpack-plugin "webpack-contrib/extract-text-webpack-plugin: Extract text from bundle into a file."
[html-webpack-plugin]: https://github.com/jantimon/html-webpack-plugin "jantimon/html-webpack-plugin: Simplifies creation of HTML files to serve your webpack bundles"
[multipage-webpack-plugin]: https://github.com/mutualofomaha/multipage-webpack-plugin "mutualofomaha/multipage-webpack-plugin: A plugin that makes handling templates and asset distribution for multi-page applications using webpack trivial"
[webpack-manifest-plugin]: https://github.com/danethurber/webpack-manifest-plugin "danethurber/webpack-manifest-plugin: webpack plugin for generating asset manifests"
[assets-webpack-plugin]: https://github.com/kossnocorp/assets-webpack-plugin "kossnocorp/assets-webpack-plugin: Webpack plugin that emits a json file with assets paths"
[spring-boot-angular2-seed]: https://github.com/Efk3/spring-boot-angular2-seed "Efk3/spring-boot-angular2-seed"
[Koa]: http://koajs.com/ "Koa - next generation web framework for node.js"
[ejs]: https://github.com/tj/ejs "tj/ejs: Embedded JavaScript templates for node"