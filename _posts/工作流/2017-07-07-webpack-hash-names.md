---
layout: post
title: "webpack的hash"
category: "工作流"
description: ""
---
{% include JB/setup %}

在[webpack][webpack]的配置项中，可能会见到`[hash]`这样的字符。

当存在`[hash]`配置的时候，webpack的输出将可以得到形如这样的文件：

```
page1_bundle_54e8c56e.js
```

这种带哈希值的文件名，将可以帮助实现静态资源的长期缓存，尤其常用于生产环境。关于这一点的详细内容，可以参考这篇久远的[大公司里怎样开发和部署前端代码][blog_issue]。

## 在webpack中配置hash ##

一个带hash输出的webpack配置

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
*     filename: './[name]/bundle_<span class="vivid">[chunkhash:8]</span>.js',
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


当静态资源的文件名变成这样的带哈希值的版本后，引用这些静态资源就需要稍多花一点工夫。


### 提纲 ###




![Spring Initializer][img_spring_initializer_info]

## 结语 ##


[img_spring_boot_logo]: {{POSTS_IMG_PATH}}/201608/spring_boot_logo.png "Spring Boot"

[webpack]: https://webpack.js.org/ "webpack"
[blog_issue]: https://github.com/fouber/blog/issues/6 "大公司里怎样开发和部署前端代码？"
