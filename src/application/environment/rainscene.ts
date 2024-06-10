import * as THREE from 'three';

export class RainScene {
  private scene: THREE.Scene;
  public rainParticles: THREE.Points;
  private flash: THREE.PointLight;
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.rainParticles = this.createRain();
    this.scene.add(this.rainParticles);

    this.flash = new THREE.PointLight(0x062d89, 30, 500 ,1.7);
    this.flash.position.set(200,300,100);
    scene.add(this.flash);
  }

  // private createRaindropTexture(): THREE.CanvasTexture {
  //   const canvas = document.createElement('canvas');
  //   const size = 64;
  //   canvas.width = size;
  //   canvas.height = size;
  //   const context = canvas.getContext('2d');

  //   if (context) {
  //     // Add your raindrop texture drawing code here
  //     context.beginPath();
  //     context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  //     context.fillStyle = '#ffffff';
  //     context.fill();
  //   }

  //   return new THREE.CanvasTexture(canvas);
  // };


  private createRaindropTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
  
    if (context) {
      // Clear canvas
      context.clearRect(0, 0, size, size);
  
      // Draw raindrop shape
      context.beginPath();
      context.moveTo(size / 2, 0);
      context.bezierCurveTo(size / 2, size * 0.4, size * 0.2, size * 0.6, size / 2, size);
      context.bezierCurveTo(size * 0.8, size * 0.6, size / 2, size * 0.4, size / 2, 0);
      context.closePath();
  
      // Fill raindrop shape with color
      context.fillStyle = '#87CEFA'; // Light blue color
      context.fill();
    }
  
    return new THREE.CanvasTexture(canvas);
  };

  private createRain(): THREE.Points {
    const particleCount = 10000;
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Add your rain particle creation logic here
      particlePositions[i * 3] = Math.random() * 2000 - 1000;
      particlePositions[i * 3 + 1] = Math.random() * 2000 - 1000;
      particlePositions[i * 3 + 2] = Math.random() * 2000 - 1000;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      map: this.createRaindropTexture(), // Create raindrop texture
      size: 6, // Adjust raindrop size
      transparent: true, // Set as transparent
      opacity: 0.9, // Adjust raindrop opacity
    });

    return new THREE.Points(particles, particleMaterial);
  }

  public updateRain(): void {
    // Add your rain update logic here
    const positions = this.rainParticles.geometry.attributes.position.array as Float32Array;
    const particleCount = positions.length / 3;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] -= 1; // Rainfall speed

      if (positions[i * 3 + 1] < -1000) {
        positions[i * 3 + 1] = 1000;
      }
    }

    if(Math.random() > 0.93 || this.flash.power > 100) {
      if(this.flash.power < 100) 
        this.flash.position.set(
          Math.random()*400,
          300 + Math.random() *200,
          100
        );
        this.flash.power = 50 + Math.random() * 500;
    }

    this.rainParticles.geometry.attributes.position.needsUpdate = true;
  }
}
