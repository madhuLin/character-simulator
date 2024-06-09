import { Object3D, Quaternion, Vector3 } from 'three';

export class RevolverJoint {
  private anchor: Object3D;

  constructor(private body: Object3D, private position: Vector3) {
    this.anchor = new Object3D();
    this.body.add(this.anchor);
    this.anchor.position.copy(position);
    this.anchor.quaternion.copy(new Quaternion().setFromEuler({ x: 0, y: 0, z: 1 }));
  }

  updateRotation(rotation: Quaternion) {
    this.anchor.quaternion.copy(rotation);
  }
}
