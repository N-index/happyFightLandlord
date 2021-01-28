# 欢乐斗地主 Web 版

---

## 简介

本项目在 Web 上复现了经典的斗地主游戏（单机版）。

Framework: Vue.js v2.6.12
Author: N-index

## 初衷

> 初衷不只存在于成功作品拥有者的回忆里。一泡大便的制作人也有可能有他的初衷，因为不然的话，当大便还是小便的时候就可能已经被杀掉了。

在学一个东西的一段日子里，我们常会以造物主的视角，重新审视一些生活里很寻常，甚至是很古早的东西。像 Frontend developer 会随手 F12 一样，我学到数据响应时，就迫不及待想拿眼前的东西练练手。

## 心得

与其说这是 Vue 练手项目，不如说这更是一个 Javascript 项目。因为我用了最单纯、最原始的 Vue 引入方式，而且没有以中型以上的形式构建项目，只用到了分离模块、封装函数等开发常识。不过，最简单的形式未必不会让我意识到 Vue 的核心作用，基础指令用明白了之后，了解其后的生态可能更多地依托信息而不是智慧。

基础指令怎么才算用明白？答：用不小的业务量支撑。只看文档是碰不到奇怪的问题的，合适的工具需要自己在实际中寻找。当你面前有锤子和钉子配套的时候，当然可以拿起锤子就去敲钉子，但是现实中，当我们面对一个奇形怪状、有些变形的钉子的时候，我们可能很难想到自己的背包栏里还有个 🔨 锤子。

比如：看文档的时候是不会碰到这样的代码的（没说这样的代码好，但有些情况下不失为有用的解决方法）：

    :class="{['clock--'+ ['left','myself','right'][grablandlordinfo.currentgrabturnindex] ]:displayStatus.countdownOfGrab,['clock--'+ ['left','myself','right'][putupinfo.currentputupturnindex] ]:displayStatus.countdownOfPutUp}

<!-- js: -->

<!-- 1. 使用 Promise、async/await 控制计时流程。 -->
