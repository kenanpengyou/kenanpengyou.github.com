---
layout: post
title: "webpack的hash"
category: "工作流"
description: ""
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

如果没有任何服务端，只是纯html、css、js的前端应用的话，一般使用[html-webpack-plugin][html-webpack-plugin]。

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

可以看到，html-webpack-plugin在模板文件内容的基础上，就添加好了需要引用的bundle js。如果还有生成的css文件(通过[extract-text-webpack-plugin][extract-text-webpack-plugin])，也会被添加到适当的位置。

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

我们更希望的是为每一个entry生成一个`.html`。这时候，需要使用的是[multipage-webpack-plugin][multipage-webpack-plugin]。这个插件实际也依赖了html-webpack-plugin。

例如，

multipage-webpack-plugin

### 提纲 ###

hash帮助使用缓存。 只用于生产环境。


![Spring Initializer][img_spring_initializer_info]

## 结语 ##


[img_spring_boot_logo]: {{POSTS_IMG_PATH}}/201608/spring_boot_logo.png "Spring Boot"

[webpack]: https://webpack.js.org/ "webpack"
[blog_issue]: https://github.com/fouber/blog/issues/6 "大公司里怎样开发和部署前端代码？"
[缓存指南]: https://doc.webpack-china.org/guides/caching/ "缓存 - webpack"
[file-loader文档]: https://github.com/webpack-contrib/file-loader "webpack-contrib/file-loader: file loader for webpack"
[extract-text-webpack-plugin文档]: https://github.com/webpack-contrib/extract-text-webpack-plugin "webpack-contrib/extract-text-webpack-plugin: Extract text from bundle into a file."
[html-webpack-plugin]: https://github.com/jantimon/html-webpack-plugin "jantimon/html-webpack-plugin: Simplifies creation of HTML files to serve your webpack bundles"
[extract-text-webpack-plugin]: https://github.com/webpack-contrib/extract-text-webpack-plugin "webpack-contrib/extract-text-webpack-plugin: Extract text from bundle into a file."
[multipage-webpack-plugin]: https://github.com/mutualofomaha/multipage-webpack-plugin "mutualofomaha/multipage-webpack-plugin: A plugin that makes handling templates and asset distribution for multi-page applications using webpack trivial"