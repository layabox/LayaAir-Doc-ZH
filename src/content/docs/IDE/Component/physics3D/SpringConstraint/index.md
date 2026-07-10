---
title: "弹簧约束 SpringConstraint"
description: "弹簧约束（SpringConstraint）用于模拟两个物体之间的弹簧连接效果。当物体之间的距离偏离平衡位置时，弹簧会产生恢复力将物体拉回或推开，使其在一定范围内弹性振荡。常用于模拟悬挂系统（如车辆悬挂）、弹性绳索、蹦极、弹跳平台等场景。"
slug: "ide/component/physics3d/springconstraint"
---

> Author : Charley

> 约束的通用属性（刚体、连接刚体、锚点、连接锚点、最大承受力、最大扭矩、应用碰撞）请查看[《固定约束》](/ide/component/physics3d/fixedconstraint/)中约束基类属性章节。

弹簧约束（SpringConstraint）用于模拟两个物体之间的弹簧连接效果。当物体之间的距离偏离平衡位置时，弹簧会产生恢复力将物体拉回或推开，使其在一定范围内弹性振荡。常用于模拟悬挂系统（如车辆悬挂）、弹性绳索、蹦极、弹跳平台等场景。

在 IDE 中添加弹簧约束组件后，属性面板如图1-1所示：

<img src="/IDE/Component/physics3D/SpringConstraint/img/1-1.png" style="zoom:100%;" />

（图1-1）

## 一、弹簧强度`spring`与弹簧阻尼`damping`

**弹簧强度**`spring`用于设置弹簧的刚度（弹力系数）。值越大弹簧越硬，恢复力越强，回弹越快；值越小弹簧越软，回弹越慢。弹簧力的计算遵循胡克定律：F = spring × x，其中 x 为弹簧偏离平衡位置的距离。

**弹簧阻尼**`damping`用于模拟能量损耗，使弹簧振荡逐渐衰减直至停止。阻尼值越大，振荡衰减越快；值为 0 时，弹簧会无限振荡。

## 二、弹簧最小距离`minDistance`与弹簧最大距离`maxDistance`

**弹簧最小距离**设置弹簧允许的最小距离。当两个锚点之间的距离小于该值时，弹簧会产生排斥力将物体推开。

**弹簧最大距离**设置弹簧允许的最大距离。当两个锚点之间的距离大于该值时，弹簧会产生拉力将物体拉回。

通过合理设置最小距离和最大距离，可以控制弹簧的有效工作范围。默认最大距离为 Infinity，表示不限制最大距离。

## 三、弹簧最大最小`tolerance`

**弹簧最大最小**`tolerance`用于设置弹簧的误差容限。在容差范围内，弹簧不会产生恢复力，可以理解为弹簧的"死区"。该属性可以避免弹簧在平衡位置附近产生微小的抖动，提升物理模拟的稳定性。

## 四、运行效果

动图2-1演示了弹簧约束的效果，物体在弹簧力作用下产生弹性振荡：

<img src="/IDE/Component/physics3D/SpringConstraint/img/2-1.gif" style="zoom:50%;" />

（动图2-1）

## 五、代码示例

以下示例演示了如何通过代码配置弹簧约束：

```typescript
const { regClass, property } = Laya;

@regClass()
export default class SpringConstraintDemo extends Laya.Script {
    declare owner: Laya.Sprite3D;

    onAwake(): void {
        let spring = this.owner.getComponent(Laya.SpringConstraint);

        // 设置弹簧强度和阻尼
        spring.spring = 50;
        spring.damping = 5;

        // 设置弹簧距离范围
        spring.minDistance = 0.5;
        spring.maxDistance = 3.0;

        // 设置容差
        spring.tolerance = 0.1;
    }
}
```

## 六、关联文档

- [《固定约束》](/ide/component/physics3d/fixedconstraint/)
- [《3D物理系统》](/ide/physicseditor/physics3d/)
