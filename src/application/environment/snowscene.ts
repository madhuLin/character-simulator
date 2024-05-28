import * as THREE from 'three';

// 建立雪花場景
export class SnowScene {
  private scene: THREE.Scene;
  public snowParticles: THREE.Points;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.snowParticles = this.createSnow();
    this.scene.add(this.snowParticles);
  }

  // 建立雪花圖片
  private createCircleTexture (): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  };

  // 建立雨滴圖片
  private createRaindropTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');

    if (context) {
      // Add your raindrop texture drawing code here
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
    }

    return new THREE.CanvasTexture(canvas);
  };

  // 建立雪花粒子
  private createSnow(): THREE.Points {
    const particleCount = 10000;
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = Math.random() * 2000 - 1000;
      particlePositions[i * 3 + 1] = Math.random() * 2000 - 1000;
      particlePositions[i * 3 + 2] = Math.random() * 2000 - 1000;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      map: this.createCircleTexture(), // 設定雪花圖片
      size: 8, // 調整雪花大小
      transparent: true, // 設定為透明
      opacity: 0.9, // 調整雪花透明度
    });

    return new THREE.Points(particles, particleMaterial);
  }

  //更新雪花場景
  public updateSnow(): void {
    const positions = this.snowParticles.geometry.attributes.position.array as Float32Array;
    const particleCount = positions.length / 3;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] -= 1; // 下雪速度

      if (positions[i * 3 + 1] < -1000) {
        positions[i * 3 + 1] = 1000;
      }
    }

    this.snowParticles.geometry.attributes.position.needsUpdate = true;
  }
}
