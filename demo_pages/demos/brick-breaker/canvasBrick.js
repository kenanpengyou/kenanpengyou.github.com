/*
 * canvasBrick.js
 * brick game based on canvas
 * by Liang Zhu(kenanpengyou@yeah.net)
 *date 2013-08-12
 */

(function() {
    //游戏本身的参数
    var brickConfig = {
        canvasId: "brickCanvas",
        stageWidth: 640,
        stageHeight: 500
    },

        //游戏代码所用到的全局变量
        canvasElem = null,
        context = null;

    //实现Publish/Subscribe Pattern
    var pubsub = (function() {
        var topics = {},
            subUid = -1;

        return {
            publish: function(topic, args) {
                if (!topics[topic]) {
                    return false;
                }

                var subscribers = topics[topic],
                    len = subscribers ? subscribers.length : 0;
                while (len--) {
                    subscribers[len].func(topic, args);
                }
            },
            subscribe: function(topic, func) {
                if (!topics[topic]) {
                    topics[topic] = [];
                }

                var token = (++subUid).toString();
                topics[topic].push({
                    token: token,
                    func: func
                });
                return token;
            },
            unsubscribe: function(token) {
                for (var i in topics) {
                    if (topic[i]) {
                        for (var j = 0, len = topics[i].length; i < len; i++) {
                            if (topics[i][j].token === token) {
                                topics[i].splice(i, 1);
                                return token;
                            }
                        }
                    }
                }
            }
        };
    })();

    //Model
    var brickModel = (function() {
        var life = 3,
            score = 0;

        return {
            getLife: function() {
                return life;
            },
            setLife: function(lifeSet) {
                life = lifeSet;
            },
            getScore: function() {
                return score;
            },
            setScore: function(scoreSet) {
                score = scoreSet;
            },
            //重置游戏
            reset: function() {
                life = 3;
                score = 0;
            }
        };
    })();

    //View
    var brickView = (function(model) {
        //View中的变量
        var gameinfo = null,
            brickRemain = 0;

        //类，用来碰撞的砖块
        var Brick = function(config, context) {
            this.x = config.x;
            this.y = config.y;
            this.width = config.width;
            this.height = config.height;
            this.image = new Image();
            this.image.src = config.imageURL;
            this.styleType = config.styleType;
            this.context = context;
        };
        Brick.prototype = {
            constructor: Brick,
            draw: function() {
                //默认尺寸，这个由素材图决定
                var brickDefaultWidth = 46,
                    brickDefaultHeight = 16;
                //styleType表示砖块种类，现在一共6种，分别是不同颜色的砖块
                //context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
                var sx = 0,
                    sy = this.styleType * brickDefaultHeight,
                    swidth = brickDefaultWidth,
                    sheight = brickDefaultHeight;
                this.context.drawImage(this.image, sx, sy, swidth, sheight, this.x, this.y, this.width, this.height);
            }
        };

        //类，砖块被碰撞后，消失的动画
        var BrickVanish = function(config, context) {
            this.name = config.name;
            this.x = config.x;
            this.y = config.y;
            this.width = config.width;
            this.height = config.height;
            this.scoreValue = config.scoreValue;
            this.context = context;
            this.textX = this.x + this.width / 2;
            this.textY = this.y + this.height;
            this.moveStepY = this.distanceY / this.duration;
            this.alphaStep = 1 / this.duration;
            this.alpha = 1;
            this.timeCount = 0;
        };
        BrickVanish.prototype = {
            constructor: BrickVanish,
            distanceY: 10,
            duration: 50,
            draw: function() {
                var context = this.context,
                    font = "12px Arial",
                    fillStyle = "rgba(255,255,255," + this.alpha.toFixed(2) + ")";
                context.font = font;
                context.fillStyle = fillStyle;
                context.textAlign = "center";
                context.textBaseline = "bottom";
                context.fillText("+100", this.textX, this.textY);
                if (this.timeCount++ < this.duration) {
                    this.textY -= this.moveStepY;
                    this.alpha -= this.alphaStep;
                } else {
                    stage.removeChild(this.name);
                    pubsub.publish("checkLevelClear");
                }
            }
        };

        //类，玩家操作的挡板
        var Block = function(config, context) {
            this.x = config.x;
            this.y = config.y;
            this.speedX = 0;
            this.width = config.width;
            this.height = config.height;
            this.image = new Image();
            this.image.src = config.imageURL;
            this.context = context;
        };
        Block.prototype = {
            constructor: Block,
            move: function() {
                this.x += this.speedX;
                if (this.x + this.width >= brickConfig.stageWidth) {
                    this.x = brickConfig.stageWidth - this.width;
                } else if (this.x <= 0) {
                    this.x = 0;
                }
            },
            draw: function() {
                this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
                this.move();
            }
        };

        //类，运动的小球
        var Ball = function(config, context) {
            this.x = config.x;
            this.y = config.y;
            this.lastX = this.x;
            this.lastY = this.y;
            this.speedX = 0;
            this.speedY = 0;
            this.released = false;
            this.visible = true;
            this.radius = config.radius;
            this.blockRef = config.blockRef;
            this.image = new Image();
            this.image.src = config.imageURL;
            this.context = context;
        };
        Ball.prototype = {
            constructor: Ball,
            checkEdge: function() {
                if (this.x + this.radius >= brickConfig.stageWidth) {
                    this.x = brickConfig.stageWidth - this.radius;
                    this.speedX *= -1;
                } else if (this.x - this.radius <= 0) {
                    this.x = this.radius;
                    this.speedX *= -1;
                }

                if (this.y - this.radius <= 0) {
                    this.y = this.radius;
                    this.speedY *= -1;
                } else if (this.y - this.radius >= brickConfig.stageHeight) {
                    //如果完全到了舞台下方之外
                    this.visible = false;
                    pubsub.publish("ballLost");
                }
            },
            checkBlock: function() {
                var block = this.blockRef,
                    edgeX = this.x - this.radius,
                    edgeY = this.y + this.radius;
                if (edgeY >= block.y && edgeY <= block.y + block.height) {
                    if (edgeX > block.x - 2 * this.radius && edgeX < block.x + block.width) {
                        this.y = block.y - this.radius;
                        this.speedY *= -1;
                        this.speedX += block.speedX * 0.3;
                    }
                }
            },
            checkBrick: function() {
                //一次检查中，只允许小球某一方向的速度翻转一次
                var isSpeedReversed = false;
                for (var i in stage.childs) {
                    if (/^brick\d/.test(i)) {
                        var brick = stage.childs[i],
                            brickTop = brick.y,
                            brickBottom = brick.y + brick.height,
                            brickLeft = brick.x,
                            brickRight = brick.x + brick.width,
                            isLastOverlyingX = this.lastX + this.radius >= brickLeft && this.lastX - this.radius <= brickRight,
                            isLastOverlyingY = this.lastY + this.radius >= brickTop && this.lastY - this.radius <= brickBottom,
                            isOverlyingX = this.x + this.radius >= brickLeft && this.x - this.radius <= brickRight,
                            isOverlyingY = this.y + this.radius >= brickTop && this.y - this.radius <= brickBottom;

                        if (isOverlyingX && isOverlyingY) {
                            if (!isSpeedReversed) {
                                if (isLastOverlyingY) {
                                    this.speedX *= -1;
                                } else {
                                    this.speedY *= -1;
                                }
                                isSpeedReversed = true;
                            }

                            pubsub.publish("brickCollision", {
                                brickName: i,
                                brickElem: brick
                            });
                        }
                    }
                }
            },
            freeMove: function() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.checkBlock();
                this.checkBrick();
                this.checkEdge();
                this.lastX = this.x;
                this.lastY = this.y;
            },
            moveWithBlock: function() {
                var block = this.blockRef;
                this.x = block.x + block.width / 2;
                this.y = block.y - this.radius;
            },
            draw: function() {
                if (this.visible) {
                    var imageDrawPoint = {
                        x: this.x - this.radius,
                        y: this.y - this.radius
                    };
                    this.context.drawImage(this.image, imageDrawPoint.x, imageDrawPoint.y, this.radius * 2, this.radius * 2);
                    if (this.released) {
                        this.freeMove();
                    } else {
                        this.moveWithBlock();
                    }
                }
            }
        };

        //类，游戏分数和当前生命值
        var GameInfo = function(config, context) {
            this.life = model.getLife();
            this.score = model.getScore();
            this.name = config.name;
            this.context = context;
        };
        GameInfo.prototype = {
            constructor: GameInfo,
            update: function() {
                this.life = model.getLife();
                this.score = model.getScore();
            },
            draw: function() {
                var context = this.context,
                    lifeString = "life : ",
                    scoreString = "score : ",
                    infoDrawConfig = {
                        keyFont: "14px Verdana",
                        valueFont: "14px Verdana",
                        textColor: "#fff",
                        textAlign: "left",
                        textBaseline: "middle",
                        lifePosX: brickConfig.stageWidth - 65,
                        scorePosX: 20,
                        maskRec: {
                            x: 0,
                            y: 20,
                            height: 30,
                            color: "rgba(255,255,255,.2)"
                        }
                    },
                    maskRecConfig = infoDrawConfig.maskRec;

                //先画矩形
                context.fillStyle = maskRecConfig.color;
                context.fillRect(maskRecConfig.x, maskRecConfig.y, brickConfig.stageWidth, maskRecConfig.height);
                //然后是文字
                context.font = infoDrawConfig.keyFont;
                context.textAlign = infoDrawConfig.textAlign;
                context.textBaseline = infoDrawConfig.textBaseline;
                context.fillStyle = infoDrawConfig.textColor;
                var properTextPosY = maskRecConfig.y + maskRecConfig.height / 2;
                context.fillText(lifeString, infoDrawConfig.lifePosX, properTextPosY);
                context.fillText(scoreString, infoDrawConfig.scorePosX, properTextPosY);
                context.font = infoDrawConfig.valueFont;
                context.fillText(this.life.toString(), infoDrawConfig.lifePosX + context.measureText(lifeString).width, properTextPosY);
                context.fillText(this.score.toString(), infoDrawConfig.scorePosX + context.measureText(scoreString).width, properTextPosY);
                this.update();
            }
        };

        //舞台，用于保存显示中的所有元素
        var stage = {
            stageWidth: brickConfig.stageWidth,
            stageHeight: brickConfig.stageHeight,
            playFlag: false,
            childs: {},

            addChild: function(name, sprite) {
                this.childs[name] = sprite;
            },

            removeChild: function(name) {
                delete this.childs[name];
            },

            removeAll: function() {
                for (var i in this.childs) {
                    this.removeChild(i);
                }
            },

            removeAllExcept: function(name) {
                for (var i in this.childs) {
                    if (i !== name) {
                        this.removeChild(i);
                    }
                }
            },

            play: function() {
                if (!this.playFlag) {
                    this.playFlag = true;
                    this.render();
                }
            },

            stop: function() {
                if (this.playFlag) {
                    this.playFlag = false;
                }
            },

            render: function() {
                context.clearRect(0, 0, this.stageWidth, this.stageHeight);
                var childs = this.childs;
                for (var i in childs) {
                    childs[i].draw();
                }
                if (this.playFlag) {
                    requestAnimationFrame((function(thisReplace) {
                        return function() {
                            thisReplace.render();
                        };
                    })(this));
                }
            }
        };

        //定义对挡板和小球的处理
        var blockAndBall = (function() {
            var blockWidth = 60,
                blockHeight = 13,
                ballRadius = 6,
                blockElem = null,
                ballElem = null;

            //挡板的属性
            var blockSet = {
                x: (brickConfig.stageWidth - blockWidth) / 2,
                y: brickConfig.stageHeight - blockHeight - 20,
                width: blockWidth,
                height: blockHeight,
                imageURL: "blockImage.png"
            };

            //小球的属性
            var ballSet = {
                x: blockSet.x + blockWidth / 2,
                y: blockSet.y - ballRadius,
                radius: ballRadius,
                imageURL: "ballImage.png"
            };

            return {
                init: function() {
                    blockElem = new Block(blockSet, context);
                    ballSet.blockRef = blockElem;
                    ballElem = new Ball(ballSet, context);
                    stage.addChild("block", blockElem);
                    stage.addChild("ball", ballElem);
                },
                blockMove: function(speedX) {
                    blockElem.speedX = speedX;
                },
                ballRelease: function() {
                    if (!ballElem.released) {
                        //小球释放
                        var angleLimit = 30,
                            startSpeedY = -5;

                        //小球将参照垂直向上的方向，左右随机偏移一定角度，然后弹出
                        var angleSet = (-angleLimit + Math.floor(Math.random() * (angleLimit * 2 + 1))) * Math.PI / 180,
                            startSpeedX = startSpeedY * Math.tan(angleSet);

                        ballElem.released = true;
                        ballElem.speedX = startSpeedX;
                        ballElem.speedY = startSpeedY;
                    }
                },
                ballReset: function(isWithFace) {
                    if (isWithFace) {
                        var resetNote = {
                            context: context,
                            duration: 60,
                            draw: function() {
                                var context = this.context,
                                    circleRadius = 25,
                                    circlePosY = brickConfig.stageHeight - 120,
                                    circlePosX = brickConfig.stageWidth / 2;
                                context.fillStyle = "rgba(255,255,255,.1)";
                                context.beginPath();
                                context.arc(circlePosX, circlePosY, circleRadius, 0, 2 * Math.PI);
                                context.closePath();
                                context.fill();
                                context.font = "Arial 14px";
                                context.textAlign = "center";
                                context.textBaseline = "middle";
                                context.fillStyle = "rgba(255,255,255,.8)";
                                context.fillText("（・д・）", circlePosX, circlePosY);
                                if (this.duration-- <= 0) {
                                    stage.removeChild("resetNote");
                                }
                            }
                        };
                        stage.addChild("resetNote", resetNote);
                    }

                    ballElem.released = false;
                    ballElem.visible = true;
                }
            };
        })();

        //只创建一个关卡...（゜д゜）
        var gameLevel = (function() {
            //一致的brick的尺寸
            var brickDefaultWidth = 46,
                brickDefaultHeight = 16,
                levelArray = [];

            var level1 = function(context) {
                //描述：3大块，因此有4个间距，设置为 3*148 + 4* 49 =640
                var areaSpaceX = 49,
                    areaContains = 3,
                    brickStartY = 80,
                    brickSpaceX = 5,
                    brickSpaceY = 5,
                    areaNumberX = 3,
                    areaNumberY = 7,
                    brickImageURL = "bricksImage.png",
                    brickTypeArray = [0, 1, 2, 3, 4, 5],
                    brickTypeSetArray = [],
                    rowContains = areaNumberX * areaContains,
                    brickTotal = areaContains * areaNumberX * areaNumberY;

                //清理舞台
                stage.removeAllExcept(gameInfo.name);

                //现在一共6种砖块，生成一个长度和砖块组数（3个一组）相同的数组，尽可能多的让6种都出现
                var count = areaNumberX * areaNumberY,
                    brickTypeArrayClone = brickTypeArray.slice(0),
                    tempSetArray = [];
                while (count > 0) {
                    if (brickTypeArrayClone.length > 0) {
                        var randomIndex = Math.floor(brickTypeArrayClone.length * Math.random()),
                            randomItem = brickTypeArrayClone[randomIndex];
                        brickTypeArrayClone.splice(randomIndex, 1);
                        tempSetArray.push(randomItem);
                        count--;
                    } else {
                        brickTypeArrayClone = brickTypeArray.slice(0);
                    }
                }
                //上面一段结束后，tempSetArray满足尽可能多的让6种出现，但还存在问题是每6个元素一定会遍历完6种，因此需要进一步随机化
                for (var i = 0, len = tempSetArray.length; i < len; i++) {
                    var randomIndex = Math.floor(tempSetArray.length * Math.random()),
                        randomItem = tempSetArray[randomIndex];
                    tempSetArray.splice(randomIndex, 1);
                    brickTypeSetArray.push(randomItem);
                }
                //这时候brickTypeSetArray将是所需的类别数组

                for (i = 0; i < areaNumberY; i++) {
                    for (var j = 0; j < rowContains; j++) {
                        var calculateY = brickStartY + brickSpaceY * (i + 1) + brickDefaultHeight * i,
                            calculateX = areaSpaceX * Math.floor(j / areaContains + 1) + brickSpaceX * (j - Math.floor(j / areaContains)) + brickDefaultWidth * j,
                            index = i * rowContains + j,
                            typeIndex = i * areaNumberX + Math.floor(j / areaContains);

                        var brickSet = {
                            width: brickDefaultWidth,
                            height: brickDefaultHeight,
                            x: calculateX,
                            y: calculateY,
                            imageURL: brickImageURL,
                            styleType: brickTypeSetArray[typeIndex]
                        },
                            brick = new Brick(brickSet, context);
                        //添加元素到舞台
                        stage.addChild("brick" + index, brick);
                    }
                }

                //返回砖块总数
                return brickTotal;
            };

            levelArray.push(level1);

            return {
                create: function(levelNumber) {
                    brickRemain = levelArray[levelNumber - 1](context);
                }
            };
        })();

        //View中做事件侦听
        var eventManager = (function() {
            var doc = document,
                releasePermit = true;
            keyHash = {};

            var keyDownHandler = function(event) {
                switch (event.keyCode) {
                    // ←
                    case 37:
                        keyHash.left = true;
                        pubsub.publish("blockMove", "left");
                        break;
                        // →
                    case 39:
                        keyHash.right = true;
                        pubsub.publish("blockMove", "right");
                        break;
                        // Z键
                    case 90:
                        if (releasePermit) {
                            pubsub.publish("ballRelease");
                        }
                }
            },

                keyUpHandler = function(event) {
                    switch (event.keyCode) {
                        case 37:
                            keyHash.left = false;
                            break;
                            // →
                        case 39:
                            keyHash.right = false;
                            break;
                    }
                    if (!(keyHash.left || keyHash.right)) {
                        pubsub.publish("blockMove", "stop");
                    }
                };
            return {
                on: function() {
                    doc.addEventListener("keydown", keyDownHandler);
                    doc.addEventListener("keyup", keyUpHandler);
                },
                off: function() {
                    releasePermit = false;
                }
            };
        })();

        return {
            stage: stage,
            blockAndBall: blockAndBall,
            init: function() {
                gameInfo = new GameInfo({
                    name: "brickGameInfo"
                }, context);
                stage.addChild(gameInfo.name, gameInfo);
                gameLevel.create(1);
                blockAndBall.init();
                eventManager.on();
            },
            setLevel: function(levelNumber) {
                gameLevel.create(levelNumber);
            },
            stop: function() {
                stage.stop();
            },
            show: function() {
                stage.play();
            },
            brickCollision: function(brickName, brickVanishSet) {
                stage.removeChild(brickName);
                brickRemain--;
                var brickVanishElem = new BrickVanish(brickVanishSet, context);
                stage.addChild(brickVanishElem.name, brickVanishElem);
            },
            checkLevelClear: function() {
                if (brickRemain <= 0) {
                    pubsub.publish("levelClear");
                }
            },
            levelClear: function() {
                var levelClearNote = {
                    context: context,
                    alphaAnimeDuration: 50,
                    alpha: 0,
                    getAlphaStep: function() {
                        return 1 / this.alphaAnimeDuration;
                    },
                    draw: function() {
                        var context = this.context,
                            mainFont = "24px Arial",
                            mainPosX = brickConfig.stageWidth / 2,
                            mainPosY = brickConfig.stageHeight / 2,
                            subFont = "12px Arial",
                            subPosX = mainPosX,
                            subPosY = mainPosY + 25;
                        context.textAlign = "center";
                        context.textBaseline = "middle";
                        context.fillStyle = "rgba(255,255,255," + this.alpha + ")";
                        context.font = mainFont;
                        context.fillText("Congratulations!", mainPosX, mainPosY);
                        context.font = subFont;
                        context.fillText("You are a great player. There is no more levels :)", subPosX, subPosY);
                        if (this.alphaAnimeDuration-- > 0) {
                            this.alpha += this.getAlphaStep();
                        } else {
                            this.alpha = 1;
                        }
                    }
                };
                blockAndBall.ballReset(false);
                eventManager.off();
                stage.addChild("levelClearNote", levelClearNote);
            },
            gameOver: function() {
                var gameOverNote = {
                    context: context,
                    alphaAnimeDuration: 50,
                    alpha: 0,
                    getAlphaStep: function() {
                        return 1 / this.alphaAnimeDuration;
                    },
                    draw: function() {
                        var context = this.context,
                            mainFont = "24px Arial",
                            mainPosX = brickConfig.stageWidth / 2,
                            mainPosY = brickConfig.stageHeight / 2,
                            subFont = "14px Arial",
                            subPosX = mainPosX,
                            subPosY = mainPosY + 25;
                        context.textAlign = "center";
                        context.textBaseline = "middle";
                        context.fillStyle = "rgba(255,255,255," + this.alpha + ")";
                        context.font = mainFont;
                        context.fillText("Game Over", mainPosX, mainPosY);
                        context.font = subFont;
                        context.fillText("click to retry?", subPosX, subPosY);
                        if (this.alphaAnimeDuration-- > 0) {
                            this.alpha += this.getAlphaStep();
                        } else {
                            this.alpha = 1;
                        }
                    }
                };
                stage.addChild("gameOverNote", gameOverNote);
                canvasElem.addEventListener("click", function(event) {
                    pubsub.publish("gameReset");
                });
            },
            gameReset: function() {
                stage.removeAllExcept(gameInfo.name);
                gameLevel.create(1);
                blockAndBall.init();
            }
        };
    })(brickModel);

    //Controller
    var brickController = (function(model, view) {
        var blockSpeedX = 0,
            blockSpeedXSet = 6,
            stopFlag = null;

        //挡板的操作
        var blockMoveHandler = function(topic, direction) {
            clearTimeout(stopFlag);

            switch (direction) {
                case "left":
                    blockSpeedX = -blockSpeedXSet;
                    break;
                case "right":
                    blockSpeedX = blockSpeedXSet;
                    break;
                case "stop":
                    blockSpeedX = 0;
            }
            view.blockAndBall.blockMove(blockSpeedX);
        },

            //释放小球
            ballReleaseHandler = function(topic) {
                view.blockAndBall.ballRelease();
            },

            //碰撞到砖块
            brickCollisionHandler = function(topic, brickObj) {
                var brickName = brickObj.brickName,
                    brickElem = brickObj.brickElem,
                    brickVanishSet = {
                        name: "brickVanish" + brickName.replace("brick",""),
                        x: brickElem.x,
                        y: brickElem.y,
                        width: brickElem.width,
                        height: brickElem.height,
                        scoreValue: 100
                    };
                view.brickCollision(brickName, brickVanishSet);
                model.setScore(model.getScore() + 100);
            },

            ballLostHandler = function(topic) {
                var lifeRemain = model.getLife() - 1;
                model.setLife(lifeRemain);
                if (lifeRemain <= 0) {
                    pubsub.publish("gameOver");
                    return;
                }
                view.blockAndBall.ballReset(true);
            },

            gameOverHandler = function(topic) {
                view.gameOver();
            },

            gameResetHandler = function(topic) {
                model.reset();
                view.gameReset();
            },

            checkLevelClearHandler = function(topic) {
                view.checkLevelClear();
            },

            levelClearHandler = function(topic) {
                view.levelClear();
            };

        //订阅事件
        var blockMoveListener = pubsub.subscribe("blockMove", blockMoveHandler),
            ballReleaseListener = pubsub.subscribe("ballRelease", ballReleaseHandler),
            brickCollisionListener = pubsub.subscribe("brickCollision", brickCollisionHandler),
            ballLastListener = pubsub.subscribe("ballLost", ballLostHandler),
            gameOverListener = pubsub.subscribe("gameOver", gameOverHandler),
            gameResetListener = pubsub.subscribe("gameReset", gameResetHandler),
            checkLevelClearListener = pubsub.subscribe("checkLevelClear", checkLevelClearHandler),
            levelClearListener = pubsub.subscribe("levelClear", levelClearHandler);

    })(brickModel, brickView);

    // 提供一个跨浏览器的动画运行控制函数，来源如下
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function() {
            return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
        })();
    }

    //初始化函数
    var init = function() {
        canvasElem = document.getElementById(brickConfig.canvasId);
        if (canvasElem.getContext) {
            context = canvasElem.getContext("2d");
        }else{
            var supportNote = document.getElementById("supportNote");
            supportNote.style.display="block";
        }
        brickView.init();
        brickView.show();
    };

    //定义对应的全局变量
    window.brickGame = {};

    //输出内容为全局变量的一个方法
    brickGame.start = function() {
        init();
    };
})();

brickGame.start();