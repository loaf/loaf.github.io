---
title: AI能代替程序员了吗？顺便评测一下DeepSeek V4、Glm-5.1和Gemini 3.1 Pro
date: 2026-04-25
category: 随笔
tags:
  - LLM
  - AI
  - DeepSeek

description: DeepSeek V4 已经发布，我决定评测一下它的代码生成能力。

---

<!-- more -->

因为DeepSeek V4上线，网上出了许多的评测，各有各的说法。我比较关注它的代码生成能力，刚好想到自己NAS上有许多历史照片，备份混乱，又有重复照片占用空间。我原来是自己用Python写的去重应用。使用起来比较麻烦，干脆让AI给我写一个，顺便评测一下DeepSeek V4的能力。

## 评测情况
我用同一个需求文件，相同的提示词。使用opencode+omo，分别调用DeepSeek V4 Pro和GLM-5.1，让它生成最终的可执行文件。使用Trae的Solo模式，使用Gemini 3.1 pro。

为了做到尽可能让AI自己完成全部的工作，我选择了自己不熟悉的技术栈，用Tauri + Rust，这两种技术我都是一点经验都没有的。

|    |  DeepSeek V4  |  GLM-5.1  |  Gemini 3.1 Pro  |
| :--: | :--: | :--: | :--: |
| 生成时间 | 约3.5小时 |约3.5小时  | 约1小时，但不能编译成功 |
| 消耗Token | 8500万 |3000万  | - |
| 生成物大小 | 18.7M |32.9M  |  |


DeepSeek花费8524万个Token，历时约3个半小时，费用约24元
GLM-5.1，花费约3000万个Token，历时也是大约3个半小时。考虑到它的单价是DeepSeek的是4倍速，折合费用要100元左右了。
Gemini 3.1 Pro是内置在Trae中的，费用没有办法统计。

如上表统计，Gemini 3.1 pro代码生成到是很快，但是最后一直编译不成功。检查后发现它在第一步时，就把需求文档给删除了，后面的步骤它是根据读入的内容自己想出来的。
最后，我重新上传了需求文档，让它对照功能项，将没有实现的内容重新实现，它也很快完成了工作，但是编译还是一直出错。
修复了多次后，我还是放弃了，在opencode里让Glm-5.1来解决这个问题。glm到是生成了可执行文件，但是在打开后马上又闪退了。后来用DeepSeek V4 pro解决了这个问题，


进入后的初始界面（从上到下，分别是DeepSeek、GLM和Gemini）：
![deepseek](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428103040039.png)
![glm](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428103106794.png)
![gemini](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428103125755.png)

很明显，从界面来看，我更喜欢GLM。

新建库，然后导入照片。为了测试我先建了一个原始照片目录，里面放些准备导入的照片，在网上随便下载了一些老照片和mp4的视频，另外，随手复制了一些，当作重复的照片。

DeepSeek能正常建库、导入、预览照片，导入的进度条，去重等功能都很完善。但是在这些完成后，点击左侧目录树，逻辑不对。照片的Exif信息也显示不出来。视频不能正常显示。
![deepseek](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428103214963.png)

GLM能正常建库、导入，导入逻辑也没有问题，但照片预览不出。不过它左侧目录树和中间照片的连动逻辑到是正确的。其它问题和DeepSeek一样。
![glm](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428103245765.png)

Gemini则在建库时就出错，出现 “Command plugin:dialog|open not allowed by ACL”，看来是权限问题。顺手修复了，然后能正常建库、导入，逻辑也没有问题。然后就界面混乱，无法显示了。
![gemini01](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428103315204.png)
![gemini02](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428103339089.png)

也就是，从Vibe Coding的角度来说，
DeepSeek V4 Pro的完成度最好，但是界面审美糟糕。
GLM审美在线，框架的逻辑表现较好，但是具体到一些功能性的逻辑就差些了。
Gemini不知道是什么原因，反正是翻车了。可能与我使用的trae IDE有关，因为我也只是想简单测试一下，就没有尝试将Trae中的Gemini反代出来，用OpenCode来用了。

就这个项目来说，我想**比较好的选择是，用GLM搭框架，然后用DeepSeek来修改优化业务逻辑。**

## 结论
在当前情况下，试图用Vibe Coding来代替程序员是不可能的。
但是程序员的确是AI最有可能替代的行业。或者说，AI将大大减少程序员的岗位。

我们能想到的最理想状态是：高级程序员使用AI来完成一些常规的代码，人类只需要控制AI的执行方向，并对错误进行修正即可。相当于企业不再需要低级程序员了。

但是，如果纸级程序员的岗位没有了，高级程序员又怎么成长呢？

