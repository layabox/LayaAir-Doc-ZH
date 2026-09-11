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
    regClass("e60XQm7tTY2BwFAdxb8D1g")
  ], Main);
})();
