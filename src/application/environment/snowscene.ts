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

// 建立雪花材質
private createCircleTexture (): THREE.CanvasTexture {
  // 創建一個畫布元素
  const canvas = document.createElement('canvas');
  const size = 64; // 定義畫布大小
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d'); // 獲取2D繪圖上下文

  // 如果獲取到繪圖上下文
  if (context) {
    context.beginPath(); // 開始一條新的路徑
    context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); // 繪製一個圓形
    context.fillStyle = '#ffffff'; // 設置填充顏色為白色
    context.fill(); // 填充圓形
  }

  // 將畫布轉換為Three.js的CanvasTexture
  return new THREE.CanvasTexture(canvas);
};

  // 建立雪花粒子
  private createSnow(): THREE.Points {
    const particleCount = 10000; // 定義雪花的數量
    const particles = new THREE.BufferGeometry(); // 創建一個緩衝幾何體來存放雪花的位置
    const particlePositions = new Float32Array(particleCount * 3); // 創建一個陣列來存放雪花的位置
  
    // 隨機生成每個雪花的位置
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = Math.random() * 2000 - 1000; // x 位置
      particlePositions[i * 3 + 1] = Math.random() * 2000 - 1000; // y 位置
      particlePositions[i * 3 + 2] = Math.random() * 2000 - 1000; // z 位置
    }
  
    // 將位置屬性設置到緩衝幾何體中
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
    // 創建一個材質來顯示雪花
    const particleMaterial = new THREE.PointsMaterial({
      map: this.createCircleTexture(), // 使用之前創建的雪花材質
      size: 6, // 設定雪花的大小
      transparent: true, // 設定材質為透明
      opacity: 0.9, // 設定雪花的透明度
    });
  
    // 創建一個Points對象來表示雪花
    return new THREE.Points(particles, particleMaterial);
  }

  //更新雪花場景
  public updateSnow(): void {
    const positions = this.snowParticles.geometry.attributes.position.array as Float32Array;
    const particleCount = positions.length / 3;

    for (let i = 0; i < particleCount; i++) {
      // y 位置
      positions[i * 3 + 1] -= 1; // 下雪速度
      if (positions[i * 3 + 1] < -1000) {
        positions[i * 3 + 1] = 1000;
      }
    }

    this.snowParticles.geometry.attributes.position.needsUpdate = true;
  }
}
