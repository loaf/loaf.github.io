---
title: DeepSeek发新版本了！
date: 2026-04-24
author: loaf
categories:
  - 随笔
tags:
  - LLM
  - A

description: DeepSeek v4 于2026年4月24日发布预览版了。这次有什么新的惊喜？

---

<!-- more -->

4月24日，DeepSeek出新版本了。这个日期，我昨天就有强烈的预感。这到不是事后诸葛亮，而是因为1970年4月24日是中国第一颗人造卫星东方红号升空的日子，也算是有政治寓意吧。

果然，上午就看到[DeepSeek官方的公众号](https://mp.weixin.qq.com/s/8bxXqS2R8Fx5-1TLDBiEDg)消息了。[最新的论文](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/resolve/main/DeepSeek_V4.pdf)也能在Huggingface找到

## DeepSeek v4的性能如何

我想大家首先关心的是DeepSeek新版本的性能如何。

### 报告中自测
在论文第一页，我们就能看到下面的
![deepseek v4](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101017622.png)
左侧大图，是DeepSeek-V4-Pro-Max与其它顶尖模型的对比。
最左侧蓝色斜纹的表示的是DeepSeek，其它三个从左到右分别是Claude-Opus-4.6-Max、GPT-5.4-xHigh、Gemini-3.1-Pro-High。都是当前最强大的闭源模型。

#### 知识与推理测试
在Knowledge & Reasoning（知识与推理）类中，我们能看到：

在 Apex ShortList和 Codeforces上，DeepSeek-V4-Pro-Max 明显领先所有对手
 在 SimpleQA 上略逊于 Gemini，但比Claude和ChatGPTft都要高很多。
 在HLE上，表现最差，低于以上三个模型。
 
>APEX（AI Productivity Index）是让大模型处理包含真实代码库和依赖的复杂开发任务。
Codeforces是算法竞赛能力。要求大模型根据问题描述，编写正确、高效的算法代码。
SimpleQA主要判断大模型的参数化知识与事实准确性，要求大模型在不依赖检索的情况下直接回答简短的客观事实性问题。就是看它的知识量。
HLE（Humanity's Last Exam），即“人类的最后一次考试”。旨在创建一个能够测试模型顶尖能力的终极学术基准。试题由来自全球数百位顶尖学科专家撰写，包含了2,500道研究生级别的题目，横跨数学、人文、自然科学等领域。

#### 智能体测试
“Agentic Capabilities”测试的是AI智能体在模拟真实世界的任务中，进行自主规划、决策并调用各种工具来解决复杂问题的能力。

从图中能看到，
SWE Verified项目上，DeepSeek与Gemini持平，比Claudde低0.2，并没有显示GPT的值。
Terminal Bench 2.0项目上，比Claude高一点，比GPT和Gemini低。
Toolathlon项目上，比Claude和Gemini高，低于GPT。

>SWE Verified：测试修复软件Bug的能力。
Terminal Bench 2.0：考察在终端环境中的综合操作能力。
Toolathlon：衡量使用多种应用和工具的能力。

简单来说，我们一般认为第一类的测试主要测模型是否聪明，第二类测试则是看它的编程能力。从上表看来，**我们可以认为DeepSeek和国外顶级的模型基本上处于相同的水平。**

#### 计算效率的升级

右上图Y轴上显示Single-Token FLOPs (T) 意思是生成每个 token 所需的浮点运算次数（万亿次），X轴则是Token的数量 。

我们能看到DeepSeek三个版本在生成1024K内容时的计算量，DeepSeek-V4-Flash版比当前的V3.2降低了9.8倍，DeepSeek-V4-Pro比V3.2降低了3.7倍。
这个显示方式有点奇怪，简单换算一下。

V4-Pro 用 仅 21.28% 的计算量 达到与 V3.2 同等的上下文处理能力
V4-Flash 用 仅 9.26% 的计算量，效率提升近 10 倍
 
这说明 V4 系列采用了更高效的注意力机制。

#### 内存效率的提升

右下图也是DeepSeek版本间的比较，Y轴是Accumulated KV Cache (GB) 累积的键值缓存大小，X轴则是句子的长度。

按上面相同的折算方法，
V4-Pro 的内存占用仅为 V3.2 的 9.52%
V4-Flash 的内存占用仅为 V3.2 的 6.80%
 
这对于 长上下文推理（如 100万 token 文档处理）至关重要，大幅降低显存需求和推理成本

简单总结一下，就是，**这次升级和去年底发布V3.2比，性能大约提升了10倍。**

### 第三方测试

除了官方的基准测试数据，马上就有许多第三方的测试平台进行测试。
这里从X上随便找了两个，未必准确，也算是一家之言吧。

#### [arena.ai](https://arena.ai/leaderboard/code)
下面两个图都是开源模型的评测得分
![arena01](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101221920.png)
![arena02](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101243542.png)

上图是代码能力，下图是文本能力。

如果加上闭源的模型，得分就低的多了。就代码能力而言，在开源里排第3，包括闭源模型后，排名就是14了。
![arena03](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101347563.png)

#### [vals.ai](https://www.vals.ai/models/deepseek_deepseek-v4-pro)
这家的排名，代码能力在全部模型中排第9名，在开源里排第1。
![vals](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101435689.png)

#### [superada.ai](https://x.com/iAmHenryMascot/status/2047524673185849795)

这家是直接把DeepSeek和顶级模型相比，看起来差距比较大了。
![superada](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101505157.png)


### 性能参数
这次发布的模型有两个版本
![cs](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101606475.png)
pro版的参数有1万6千亿个，而flash版有2840亿个。

### 价格情况

DeepSeek原来一直是以性价比著称。这次升级后，情况有点复杂，因为这次发布了两个版本，所以价格也有两个：
![price](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101643262.png)

这个价格，怎么说呢？

flash版的输入价格是上一版本v3.2版单价的1/2，输出是v3.2的1/6。可以说是非常便宜了。
pro版的输入则是v3.2单价的6倍，输出是v3.2的2倍。

考虑到flash版比v3.2要强，但强的有限。再考虑到这些上下文长度变成1M，相当于V3.2长度的8倍。在实际应用中，其实这次**价格是上涨了，而且涨的幅度非常大**。

事实上，DeepSeek也注意到了这一点，所以上图下有一行小字“<font style="color:#ff0000;">预计下半年昇腾950超节点批量上市后，Pro的价格会大幅度下调</font>”。

### 结论

正如官方公众号所言：

>目前 DeepSeek-V4 已成为公司内部员工使用的 Agentic Coding 模型，据评测反馈使用体验优于 Sonnet 4.5，交付质量接近 Opus 4.6 非思考模式，但仍与 Opus 4.6 思考模式存在一定差距。

**DeepSeek和自己比进步非凡，在不到4个月时间内，将能力提升了10倍。但是和Cluade相比，仍有较大差距。**

之所以和Cluade相比，是因为我对这家公司非常讨厌，真希望有DeepSeek能超过它。

## DeepSeek论文中的技术问题

我前几篇关于DeepSeek的文章中，有他们发布的论文中提到的一些技术创新。而这些内容都用在新版本上了。

比如mHC（流形约束超连接）、混合注意力机制、Engram记忆等。

这次又提到了一个Muon优化器，我以前到是没有看到相关论文。是在这篇论文里第一次看到，简单看了一下，应该是训练数据时使用MoE多专家系统的一种策略。

这次发布时附上的论文里其实还有一些新的东西没有搞懂，准备迟点了解一下概念。

##  V4是否基于华为芯片进行训练

文没有明确说明具体硬件，但我认为肯定是用到了，因为论文中提到了FP4量化感知训练，这明显是为华为芯片适配而优化的。
而且论文中大量篇幅都在研究训练的Muon优化器，这些优化应该是为了在较差的平台下提升训练效率。
另外在论文中的3.1章节，提到了DeepSeek在两种平台下验证了MegaMoE方案。
![11](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101718237.png)

我的看法是，V4原来准备在华为昇腾NPU上训练，但是失败了，所以后期一直在努力调整，最后还是有所妥协，前期训练还是在Nvidia上进行，但后期的训练和推理可能已经能适配华为昇腾了。因为上面也提到了，下半年随着昇腾950的大批部署会降价。

为什么说V4主要还是在英伟达的平台上训练的呢？主要是论文中还有大量关于FP8精度的算法，这明显是需要使用Nvidia GPU的特征。另外，论文中还有大量关于集群调度、任务抢占、节点通讯瓶颈等硬件故障频繁的文字。如果只是通讯问题，还可以理解成训练时使用了新的并发架构，需要调试。但是这部分需要专门讨论，更像是远程租用了别人的计算平台引发的网络问题。
![22](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20260428101757379.png)

## 结论

DeepSeek V4有很多的创新。但仍落后于美国前沿模型半年左右。因为它与之对应的模型其实已经不是最新的了，最近几天大多数模型都发了最新版本。

DeepSeek V4即使与国内的开源模型相比，也只是略优，远称不上领先。在使用感觉上，我感觉与GLM-5.1相差不大。

但这不是DeepSeek的耻辱，而是它的荣耀。它在一个被严密封锁的技术孤岛中努力地进行全栈国产化的尝试。即使如此，它的性能也令我惊喜。我现在希望它尽快出一个Coding Plan，我肯定会订阅的。