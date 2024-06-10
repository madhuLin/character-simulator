import {
    CircleGeometry,
    TextureLoader,
    Mesh,
    MeshBasicMaterial,
    DoubleSide,
    BufferAttribute,
    BufferGeometry,
    Float32BufferAttribute,
    PointsMaterial,
    AdditiveBlending,
    Points,
    Object3D,
    Vector3,
    Scene,
    Texture
} from 'three'

import {
    PORTAL_MAGIC_TEXTURE, PORTAL_AROUND_TEXTURE, PORTAL_POINT1_TEXTURE, PORTAL_POINT2_TEXTURE, 
    PORTAL_POINT3_TEXTURE, PORTAL_POINT4_TEXTURE
} from "../Constants";

export class TeleporterManager {
    private circles: Mesh[] = [];
    private arounds: Mesh[] = [];
    private arounds2: Mesh[] = [];
    private particles: Points[] = [];
    private scene: Scene;
    private circleTexture: Texture;
    private aroundTexture: Texture;
    public teleporter: Object3D | undefined;
    private textureLoader: TextureLoader = new TextureLoader();
    private params: any
    private teleporters: Object3D[] = [];
    private pointTexture: Texture[] = [];
    constructor(scene: Scene, position: Vector3) {
        this.scene = scene;
        this.circleTexture = this.textureLoader.load(PORTAL_MAGIC_TEXTURE);
        this.aroundTexture = this.textureLoader.load(PORTAL_AROUND_TEXTURE);
        this.init();
        this.createTeleporter(position);
    }

    init() {
        this.params = {
            segment: 32,
            circleRadius: 1,
            circleRotateSpeed: 0.02,
            aroundRadius: 0.5,
            aroundRotateSpeed: 0.01,
            aroundScaleOffset: 0.01,
            height: 2,
            pointRangeRadius: 0.8,
            pointMinSize: 0.04,
            pointMaxSize: 0.15,
            pointFloatSpeed: 0.01,
            pointTexturePath: [
                PORTAL_POINT1_TEXTURE,
                PORTAL_POINT2_TEXTURE,
                PORTAL_POINT3_TEXTURE,
                PORTAL_POINT4_TEXTURE
            ]
        }

        for (let i = 0; i < this.params.pointTexturePath.length; i++) {
            this.textureLoader.load(this.params.pointTexturePath[i], texture => {
                this.pointTexture.push(texture)
            })
        }
    }

    update() {
        this.updateCircles();
        this.updateArounds();
        this.updatePatical();
    }

    clear() {
        for (var i = 0; i < this.teleporters.length; i++) {
            this.clearModel(this.teleporters[i])
        }
    }

    // clearModel(model) {
    //     if (!model) return
    //     // dispose geometry
    //     model.traverse(node => {
    //         if (!node.isMesh) return
    //         node.geometry.dispose()
    //     })
    // }

    clearModel(model: Object3D) {
        if (!model) return;
        // dispose geometry
        model.traverse(node => {
            if (!('isMesh' in node)) return;
            (node as Mesh).geometry.dispose();
        });
    }

    /**
    * 建立一個傳送陣
    */
    createTeleporter(position: Vector3) {
        let teleporter = new Object3D();
        // 設置傳送陣的位置
        teleporter.position.copy(position);
        
        this.teleporters.push(teleporter);
    
        let circleGeo = new CircleGeometry(this.params.circleRadius, this.params.segment);
        let circleMat = new MeshBasicMaterial({
            map: this.circleTexture,
            transparent: true,
            side: DoubleSide,
            depthWrite: false
        });
        let circle = new Mesh(circleGeo, circleMat);
        circle.rotateX(-Math.PI / 2);
        this.circles.push(circle);
        teleporter.add(circle);
    
        let aroundGeo = this.getCylinderGeo(this.params.aroundRadius, this.params.height);
        let aroundMat = new MeshBasicMaterial({
            map: this.aroundTexture,
            transparent: true,
            side: DoubleSide,
            wireframe: false,
            depthWrite: false
        });
        let around = new Mesh(aroundGeo, aroundMat);
        this.arounds.push(around);
        teleporter.add(around);
    
        let around2 = around.clone();
        around2.userData.aroundScaleOffset = this.params.aroundScaleOffset;
        teleporter.add(around2);
        this.arounds2.push(around2);
    
        for (let j = 0; j < 10; j++) {
            for (let i = 0; i < this.pointTexture.length; i++) {
                let sprite = this.getPoints(this.params.pointRangeRadius, this.params.height, this.pointTexture[i]);
                this.particles.push(sprite);
                teleporter.add(sprite);
            }
        }
        this.teleporter = teleporter;
        this.scene.add(teleporter);
    }

    /**
    * 取得點雲效果
    * @param {*} radius
    * @param {*} height
    * @param {*} texturePath
    * @returns
    */
    getPoints(radius: number, height: number, texture: any) {
        const geometry = new BufferGeometry()
        const vertices = [0, 0, 0]

        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))

        const material = new PointsMaterial({
            size: Math.random() * (this.params.pointMaxSize - this.params.pointMinSize) + this.params.pointMinSize,
            map: texture,
            blending: AdditiveBlending,
            depthTest: false,
            transparent: true,
            opacity: 0.2 + Math.random() * 0.8
        })

        const particle = new Points(geometry, material)
        particle.userData.floatSpeed = 0.001 + Math.random() * this.params.pointFloatSpeed
        particle.userData.radius = radius
        particle.position.x = Math.random() * radius * 2 - radius
        particle.position.y = Math.random() * height
        particle.position.z = Math.random() * radius * 2 - radius
        return particle
    }

    /**
    * 取得圓柱體幾何體
    * @param {*} radius 半徑
    * @param {*} height 高度
    * @param {*} segment 分段數
    * @returns
    */
    getCylinderGeo(radius = 1, height = 1, segment = 32) {
        let bottomPos = []
        let topPos = []
        let bottomUvs = []
        let topUvs = []
        let angleOffset = (Math.PI * 2) / segment
        let uvOffset = 1 / (segment - 1)
        for (var i = 0; i < segment; i++) {
            let x = Math.cos(angleOffset * i) * radius
            let z = Math.sin(angleOffset * i) * radius
            bottomPos.push(x, 0, z)
            bottomUvs.push(i * uvOffset, 0)
            topPos.push(x, height, z)
            topUvs.push(i * uvOffset, 1)
        }
        bottomPos = bottomPos.concat(topPos)
        bottomUvs = bottomUvs.concat(topUvs)

        let face = []
        for (var i = 0; i < segment; i++) {
            if (i != segment - 1) {
                face.push(i + segment + 1, i, i + segment)
                face.push(i, i + segment + 1, i + 1)
            } else {
                face.push(segment, i, i + segment)
                face.push(i, segment, 0)
            }
        }

        let geo = new BufferGeometry()
        geo.setAttribute('position', new BufferAttribute(new Float32Array(bottomPos), 3))
        geo.setAttribute('uv', new BufferAttribute(new Float32Array(bottomUvs), 2))
        geo.setIndex(new BufferAttribute(new Uint16Array(face), 1))
        return geo
    }

    /**
    * 更新傳送陣底部的圓
    */
    updateCircles() {
        for (var i = 0; i < this.circles.length; i++) {
            this.circles[i].rotateZ(this.params.circleRotateSpeed)
        }
    }

    /**
    * 更新傳送陣四周的光壁
    */
    updateArounds() {
        for (var i = 0; i < this.arounds.length; i++) {
            this.arounds[i].rotateY(this.params.aroundRotateSpeed)
        }
        for (var i = 0; i < this.arounds2.length; i++) {
            this.arounds2[i].rotateY(-this.params.aroundRotateSpeed)
            if (this.arounds2[i].scale.x < 0.9 || this.arounds2[i].scale.x > 1.4) {
                this.arounds2[i].userData.aroundScaleOffset *= -1
            }
            this.arounds2[i].scale.x -= this.arounds2[i].userData.aroundScaleOffset
            this.arounds2[i].scale.z -= this.arounds2[i].userData.aroundScaleOffset
        }
    }

    /**
    * 更新光點效果
    */
    updatePatical() {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].position.y += this.particles[i].userData.floatSpeed
            if (this.particles[i].position.y >= this.params.height) {
                //更新位置，y=0，x，z隨機
                this.particles[i].position.y = 0
                this.particles[i].position.x =
                    Math.random() * this.particles[i].userData.radius * 2 - this.particles[i].userData.radius
                this.particles[i].position.z =
                    Math.random() * this.particles[i].userData.radius * 2 - this.particles[i].userData.radius

                //隨機上升速度
                this.particles[i].userData.floatSpeed = 0.001 + Math.random() * this.params.pointFloatSpeed
            }
        }
    }
}
