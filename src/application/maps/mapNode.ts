import { Object3D, Vector3 } from 'three';
import { RevolverJoint } from './revolverJoint';

export class MapNode {
  private body: Object3D | null = null;
  private rand = Math.random();

  constructor(private node: Object3D) {}

  updatePhysics() {
    try {
      if (this.node.userData.obstacle === 'swing') {
        const now = performance.now();
        const rotation = { x: 0, y: 0, z: Math.sin((now + this.rand * 2000) / 1000) };
        (this.body as any).setRotationFromEuler(rotation);
      }

      if (this.node.userData.obstacle === 'slider') {
        const now = performance.now();
        const position = new Vector3(Math.sin((now + this.rand * 800) / 700) * 6, this.node.position.y, this.node.position.z);
        this.body?.position.copy(position);
      }
    } catch (err) {}
  }

  createRevolverJoint() {
    if (this.node.userData.obstacle === 'revolver' && this.body) {
      return new RevolverJoint(this.body, this.node.position);
    }
    return null;
  }

  createBody() {
    this.body = this.node.clone(true);
    return this.body;
  }
}
