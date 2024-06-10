import * as THREE from 'three';
import { Mesh, Object3D, Group, Vector3 } from 'three';
import { MeshBVH, StaticGeometryGenerator, type MeshBVHOptions } from "three-mesh-bvh";
import type { BVHGeometry } from "../utils/typeAssert";

class RevolverJoint {
  anchor: Object3D;

  constructor(body: Object3D, position: Vector3) {
    this.anchor = this.createRevoluteJoint(body, position);
  }

  createRevoluteJoint(body: Object3D, position: Vector3): Object3D {
    const anchor = new Object3D();
    anchor.position.copy(position);
    anchor.rotation.copy(body.rotation);
    anchor.add(body);
    return anchor;
  }

  update() {
    this.anchor.updateMatrixWorld(true);
  }
}

class MapNode {
  node: Mesh;
  body: Object3D | null = null;
  rand: number = Math.random();

  constructor(node: Mesh) {
    this.node = node;
    this.body = this.createRigidBody(node);
  }

  createRigidBody(node: Mesh): Object3D {
    const body = node.clone(true);
    body.position.copy(node.position);
    body.rotation.copy(node.rotation);
    return body;
  }

  update() {
    try {
      //搖擺 
      if (this.node.userData.obstacle === "swing") { 
        const now = performance.now();
        this.body!.rotation.z = Math.sin((now + this.rand * 2000) / 1000);
      }
      //滑動
      else if (this.node.userData.obstacle === "slider") {
        const now = performance.now();
        //rand 提供相位偏移量，避免所有節點同步運動
        this.body!.position.x = Math.sin((now + this.rand * 800) / 700) * 6;
      }
      //旋轉
      else if (this.node.userData.obstacle === "revolver") {
        this.body!.rotation.y += 0.02; // 添加自動旋轉邏輯，這裡可以調整旋轉速度
      }
    } catch (err) {}
    this.body?.updateMatrixWorld(true);
  }

  render(): Object3D[] {
    const objects: Object3D[] = [];

    if (this.node.userData.obstacle === "revolver") {
      if (this.body) {
        objects.push(this.body);
        objects.push(new RevolverJoint(this.body, this.node.position).anchor);
      }
    } else if (this.node.userData.obstacle === "swing" || this.node.userData.obstacle === "slider" || this.node.userData.physics) {
      objects.push(this.body!);
    } else if (this.node.name !== "Scene" && !this.node.name.includes("x_")) {
      objects.push(this.node);
    }

    return objects;
  }
}

export default class Map {
  scene: THREE.Scene;
  nodes: MapNode[] = [];
  collision_scene: THREE.Group;
  colliders: Mesh[] = [];

  constructor(scene: THREE.Scene, map: { nodes: Mesh[] }, collision_scene: Group, colliders: Mesh[]) {
    this.scene = scene;
    this.nodes = map.nodes.map((node) => new MapNode(node));
    this.collision_scene = collision_scene;
    this.colliders = colliders;
  }

  update() {
    // this.nodes.forEach((node) => node.update());
    this.updateCollisionScene();  // 更新碰撞場景
  }

  render() {
    return this.nodes.flatMap((node) => node.render());
  }

  initCollisionScene() {
    this.collision_scene.clear();
    const objectsToRender = this.render();
    objectsToRender.forEach(obj => this.collision_scene.add(obj));
    this.collision_scene.updateMatrixWorld(true);

    const static_generator = new StaticGeometryGenerator(this.collision_scene);
    static_generator.attributes = ["position"];
    const generate_geometry = static_generator.generate() as BVHGeometry;
    generate_geometry.boundsTree = new MeshBVH(generate_geometry, { lazyGeneration: false } as MeshBVHOptions);

    // this.colliders = [new Mesh(generate_geometry)];
    this.colliders.forEach(collider => this.scene.remove(collider));
    this.colliders.push(new Mesh(generate_geometry));

  }
  updateCollisionScene() {
    // this.collision_scene.clear();
     // 只更新需要更新的節點
    this.nodes.forEach(node => {
      if (node.node.userData.obstacle === "swing" || node.node.userData.obstacle === "slider" || node.node.userData.obstacle === "revolver") {
        this.collision_scene.remove(node.body!);
        node.update();
        this.collision_scene.add(node.body!);
      }
    });
  
    this.collision_scene.updateMatrixWorld(true);
  
    const static_generator = new StaticGeometryGenerator(this.collision_scene);
    static_generator.attributes = ["position"];
    const generate_geometry = static_generator.generate() as BVHGeometry;
    generate_geometry.boundsTree = new MeshBVH(generate_geometry, { lazyGeneration: false } as MeshBVHOptions);
  
    this.colliders.forEach(collider => this.scene.remove(collider));
    this.colliders.push(new Mesh(generate_geometry));
  }
}