---
title: Softmax函数和Sigmoid函数
date: 2025-09-11
author: loaf
categories:
    - 技术
tags:
  - 数学
  - 人工智能
description: 介绍Softmax函数和Sigmoid函数的简单说明、数学定义、计算示例和代码实现。

---

<!-- more -->

## softmax简单说明
Softmax是一种激活函数，它可以将一个数值向量归一化为一个概率分布向量，且各个概率之和为1。

举例来说：有一个向量[2.0,1.0,0.1]，通过softmax函数转换后得到[0.7,0.2,0.1]，相当于将原来的数值向量转成了概率分布。

![](https://raw.githubusercontent.com/loaf/sa1/master/blog/images/20250911094749017.png)

## softmax数学定义

对于向量 `z = [z₁, z₂, ..., zₖ]`，第 `j` 个元素的Softmax值为：
$$
\sigma(z)_j = \frac{e^{z_j}}{\sum_{k=1}^{K} e^{z_k}} \quad \text{for } j = 1, ..., K
$$


输出向量 $σ(z)$ 可以被解释为一个**概率分布**。每个值 $σ(z)_j$代表了样本属于第 `j` 个类别的**概率**。

## softmax计算示例
回到上面提到的图例，假设一个三分类模型的最后一个全连接层输出了3个logits值：`z = [2.0, 1.0, 0.1]`。

现在我们来计算它们的Softmax概率：

1.  **计算指数项**：
	* $e^{2} \approx7.389$
	* $e^{1}  \approx2.718$
	* $e^{0.1} \approx 1.105$

2.  **计算指数和**：
    *   `sum = 7.389 + 2.718 + 1.105 = 11.212`

3.  **计算每个类别的概率**：
    *   `P(class 1) = 7.389 / 11.212 ≈ 0.659`
    *   `P(class 2) = 2.718 / 11.212 ≈ 0.242`
    *   `P(class 3) = 1.105 / 11.212 ≈ 0.099`

**结果**：我们得到了一个概率分布 `[0.659, 0.242, 0.099]`，其总和为1。模型认为该样本属于第1类的概率最高（65.9%）。

## softmax代码实现（Python with NumPy）

下面是带有数值稳定性优化的Softmax函数实现：

```python
import numpy as np

def softmax(z):
    """
    计算Softmax函数，具有数值稳定性优化。

    参数:
    z -- 输入向量或矩阵（numpy array of shape (K,) or (N, K)）

    返回:
    s -- Softmax概率分布（与输入shape相同）
    """
    # 减去最大值，避免数值溢出
    z_stable = z - np.max(z, axis=-1, keepdims=True)
    
    # 计算指数
    exp_values = np.exp(z_stable)
    
    # 计算指数和（按行求和，如果是矩阵的话）
    sum_exp = np.sum(exp_values, axis=-1, keepdims=True)
    
    # 计算概率
    s = exp_values / sum_exp
    
    return s

# 示例使用
logits = np.array([2.0, 1.0, 0.1])
probs = softmax(logits)
print("Softmax概率:", probs)
print("概率总和:", np.sum(probs))
# 输出：
# Softmax概率: [0.65900114 0.24243297 0.09856589]
# 概率总和: 1.0
```

因为$e^{z_j}$是指数级增长的，如果$z_j$比较大，$e^{z_j}$可能会溢出，所以在计算时，选择将每一项都减去最大值。

这样尽管会丢失精度，但计算机不会崩溃，再说这种精度丢失的影响也不大，反正都会趋于0，亿万分之一和十亿万分之一又有什么区别呢？

## Sigmoid函数是Softmax函数的特例
Sigmoid函数表达为
$$
\sigma(x) = \frac{1}{1 + e^{-x}}
$$
功能是将一个实数映射到[0,1]的区间中。

之所以说它是Softmax函数的特例，是因为在数学上，
如果Softmax只有两个向量[$z_1$,$z_2$]，在这种二分类的情况下，Softmax函数输出的第一个概率值，刚好等价于对$z_1-z_2$应用Sigmoid函数。