---
layout: demo
title: "拼图游戏"
description: "从自己的电脑中选择一张图片，然后就可以生成以这个图片作为素材的拼图。拖动拼图块并交换位置，完成拼图吧！"
pageFlag: "demo"
demoName: "puzzle"
demoCover: "puzzle_cover.jpg"
extraJS: ["mootools-core-1.4.5-full-compat-yc.js"]
demoCSS: "puzzle-style.css"
demoJS: "puzzleGame.js"
---
{% include JB/setup %}

<div class="puzzle_game demo_heroine">
    <div id="puzzleSet" class="game_core">
        <div class="config">
            <div class="size_set_area">
                <div class="size_set_data"><label class="config_label">每行拼图数：<input id="sizeX" class="size_input" type="text" maxlength="2" value="3" /></label><label class="config_label">每列拼图数：<input id="sizeY" class="size_input" type="text" maxlength="2" value="3"/></label></div>
                <p id="sizeSetNote" class="size_set_note">拼图数的数目设定，最小为2x2，最大为10x10（再多的话完成起来会非常费时间...）</p>
            </div>
            <div class="upload_area">
                <div id="upload" class="upload_btn_container">
                    <a id="uploadBtn" class="upload_btn" href="javascript:;" title="">选择图片<input id="fileImage" type="file" class="upload_file" /></a>
                    <div id="uploadProgress" class="upload_progress" style="display:none;"><div class="current_progress" style="width:0;"></div></div>
                </div>
                <p id="uploadNote" class="upload_note">图片尺寸，宽度范围为30~850px，高度范围为30~不限px</p>
            </div>
        </div>
    </div>
    <div class="game_info">
        <p class="step_count_note">step count : <em id="stepCount" class="step_count">0</em></p>
    </div>
</div>
<div class="demo_heroine_note">请在宽度大于930px的情况下查看</div>

设置好拼图的尺寸，也就是每行与每列的拼图个数，然后点击“选择图片”按钮，从自己的电脑中选择一张图片。然后，就会得到一个顺序被打乱的拼图。拖动拼图块并交换它们的位置，直到恢复原本的样子。

另外，由于上传图片的尺寸不一定能被拼图数目整除，所以图片可能会做一小部分边缘裁切。

不支持File API的IE9及以下，对本地文件有保护机制，不允许获取本地文件的路径，因此在本线上页面不能生成拼图。

[源代码][source view]

使用的javascript库是[MooTools][]。

[source view]: http://runjs.cn/code/bmxrssfm  "查看源码"
[MooTools]: http://mootools.net/ "MooTools"