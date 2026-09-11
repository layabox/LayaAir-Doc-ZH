"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result) __defProp(target, key, result);
    return result;
  };

  // src/Main.ts
  var { regClass } = Laya;
  var Main = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.point = new Laya.Vector3();
    }
    onStart() {
      const scene = this.owner.name === "Scene3D" ? this.owner : this.owner.getChildByName("Scene3D");
      if (!scene) return;
      this.camera = scene.getChildByName("Main Camera");
      this.target = scene.getChildByName("LookTarget");
      const model = scene.getChildByName("CesiumMan_HeadLook_Demo");
      this.head = this.find(model, "Skeleton_neck_joint_2");
      this.aimEnd = this.find(model, "HeadAimEnd");
      this.disableAnimator(model);
      if (!this.head) return;
      this.marker = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(0.12, 16, 12));
      const markerMaterial = new Laya.UnlitMaterial();
      markerMaterial.albedoColor = new Laya.Color(1, 0.08, 0.12, 1);
      this.marker.meshRenderer.sharedMaterial = markerMaterial;
      scene.addChild(this.marker);
      this.faceMarker = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(0.045, 12, 8));
      const faceMaterial = new Laya.UnlitMaterial();
      faceMaterial.albedoColor = new Laya.Color(1, 0.85, 0.05, 1);
      this.faceMarker.meshRenderer.sharedMaterial = faceMaterial;
      scene.addChild(this.faceMarker);
      this.sightLine = new Laya.PixelLineSprite3D(4);
      scene.addChild(this.sightLine);
    }
    onUpdate() {
      if (!this.camera || !this.target) return;
      const width = Math.max(1, Laya.stage.width);
      const height = Math.max(1, Laya.stage.height);
      const nx = Laya.stage.mouseX / width * 2 - 1;
      const ny = 1 - Laya.stage.mouseY / height * 2;
      this.point.setValue(nx * 1.7, 1.4 + ny * 0.85, 1.2);
      this.target.transform.position = this.point;
      this.marker.transform.position = this.point;
      this.sightLine.clear();
      const faceStart = this.aimEnd ? this.aimEnd.transform.position : this.head.transform.position;
      if (this.faceMarker) this.faceMarker.transform.position = faceStart;
      this.sightLine.addLine(faceStart, this.point, Laya.Color.RED, Laya.Color.RED);
    }
    disableAnimator(root) {
      if (!root) return;
      const animator = root.getComponent(Laya.Animator);
      if (animator) animator.enabled = false;
      for (let i = 0; i < root.numChildren; i++) this.disableAnimator(root.getChildAt(i));
    }
    find(root, name) {
      if (!root) return null;
      if (root.name === name) return root;
      for (let i = 0; i < root.numChildren; i++) {
        const result = this.find(root.getChildAt(i), name);
        if (result) return result;
      }
      return null;
    }
  };
  Main = __decorateClass([
    regClass("7bad1742-6eed-4d8d-81c0-501dc5bf03d6")
  ], Main);

  // src/Camera2DDemo.ts
  var { regClass: regClass2 } = Laya;
  var Camera2DDemo = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.blueY = 600;
      this.redY = 600;
      this.finished = false;
    }
    onStart() {
      this.blue1 = this.find("BluePlayer_1P");
      this.red1 = this.find("RedPlayer_1P");
      this.blue2 = this.find("BluePlayer_2P");
      this.red2 = this.find("RedPlayer_2P");
      this.world1 = this.find("RaceWorld_1P");
      this.world2 = this.find("RaceWorld_2P");
      this.cam1 = this.find("Camera2D_1P");
      this.cam2 = this.find("Camera2D_2P");
      this.drawWorld(this.world1);
      this.drawWorld(this.world2);
      this.drawBall(this.blue1, "#55c2ff");
      this.drawBall(this.blue2, "#55c2ff");
      this.drawBall(this.red1, "#ff718d");
      this.drawBall(this.red2, "#ff718d");
      this.status = new Laya.Text();
      this.status.text = "\u84DD\u7403\uFF1AW/S    \u7EA2\u7403\uFF1A\u2191/\u2193    Enter\uFF1A\u91CD\u65B0\u5F00\u59CB";
      this.status.fontSize = 20;
      this.status.color = "#ffffff";
      this.status.pos(24, 10);
      this.status.zOrder = 100;
      this.owner.addChild(this.status);
      this.updateView();
    }
    onUpdate() {
      if (Laya.InputManager.hasKeyDown(13)) {
        this.blueY = 600;
        this.redY = 600;
        this.finished = false;
      }
      if (!this.finished) {
        if (Laya.InputManager.hasKeyDown(87)) this.blueY -= 4;
        if (Laya.InputManager.hasKeyDown(83)) this.blueY += 4;
        if (Laya.InputManager.hasKeyDown(38)) this.redY -= 4;
        if (Laya.InputManager.hasKeyDown(40)) this.redY += 4;
        this.blueY = Math.max(-1020, Math.min(600, this.blueY));
        this.redY = Math.max(-1020, Math.min(600, this.redY));
        if (this.blueY <= -1020 || this.redY <= -1020) {
          this.finished = true;
          this.status.text = this.blueY < this.redY ? "\u84DD\u7403\u83B7\u80DC\uFF01\u6309 Enter \u91CD\u65B0\u5F00\u59CB" : "\u7EA2\u7403\u83B7\u80DC\uFF01\u6309 Enter \u91CD\u65B0\u5F00\u59CB";
        }
      }
      this.updateView();
    }
    updateView() {
      const center = 354;
      const diff = this.redY - this.blueY;
      this.blue1.pos(280, center);
      this.red1.pos(380, center + diff);
      this.red2.pos(380, center);
      this.blue2.pos(280, center - diff);
      this.world1.pos(0, center - this.blueY);
      this.world2.pos(0, center - this.redY);
      if (this.cam1) this.cam1.pos(333, this.blueY);
      if (this.cam2) this.cam2.pos(333, this.redY);
    }
    drawWorld(world) {
      if (!world) return;
      world.graphics.drawRect(0, -1400, 667, 2400, "#202b43");
      world.graphics.drawRect(210, -1200, 150, 2200, "#2e405f");
      world.graphics.drawRect(360, -1200, 150, 2200, "#2e405f");
      for (let y = -1100; y < 900; y += 120) {
        world.graphics.drawRect(280, y, 10, 55, "#dce7ff");
        world.graphics.drawRect(430, y, 10, 55, "#dce7ff");
      }
      for (let x = 205; x < 515; x += 40) {
        world.graphics.drawRect(x, 650, 20, 12, "#ffffff");
        world.graphics.drawRect(x, -1050, 20, 12, "#ffffff");
      }
      world.graphics.drawRect(205, 650, 310, 12, "#f2c14e");
      world.graphics.drawRect(205, -1050, 310, 12, "#ff718d");
    }
    drawBall(ball, color) {
      if (!ball) return;
      ball.graphics.drawCircle(0, 0, 24, color);
      ball.graphics.drawCircle(-8, -5, 4, "#ffffff");
    }
    find(name) {
      return this.findNode(this.owner, name);
    }
    findNode(root, name) {
      if (!root) return null;
      if (root.name === name) return root;
      for (let i = 0; i < root.numChildren; i++) {
        const found = this.findNode(root.getChildAt(i), name);
        if (found) return found;
      }
      return null;
    }
  };
  Camera2DDemo = __decorateClass([
    regClass2("be130629-846b-4cd4-8b20-7813ee88d620")
  ], Camera2DDemo);
})();
