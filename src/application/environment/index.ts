import Loader from "../loader";
import {
	COLLISION_SCENE_URL, ON_LOAD_SCENE_FINISH, SCENE_BACKGROUND_TEXTURE, WATER_NORMAL1_TEXTURE,
	WATER_NORMAL2_TEXTURE, PLAZA_COLLISION_SCENE_URL, PLAZA_FLOOR_SCENE_URL, PLAZA_UFO_SCENE_URL,
	PLAZA_DESERT_SCENE_URL, PLAZA_CITY_SCENE_URL, PLAZA_EFFECT_SCENE_URL, SCENE_BACKGROUND1_TEXTURE,
	PORTAL_PERLINNOISE_TEXTURE, PORTAL_SPARKNOISE_TEXTURE, PORTAL_WATERURBURBULENCE_TEXTURE, PORTAL_NOISE_TEXTURE,
	PORTAL_MAGIC_TEXTURE, PORTAL_AROUND_TEXTURE
} from "../Constants";
import {
	Scene, AmbientLight, DirectionalLight, EquirectangularReflectionMapping, Fog, Group, HemisphereLight,
	Mesh, PlaneGeometry, Vector2, MeshBasicMaterial, DoubleSide, Object3D, MeshLambertMaterial, PointLight,
	ShaderMaterial, Vector3, CircleGeometry,BufferGeometry, BufferAttribute
} from "three";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';



import { Water } from "three/examples/jsm/objects/Water2";
import type { BVHGeometry } from "../utils/typeAssert";
import { MeshBVH, StaticGeometryGenerator, type MeshBVHOptions } from "three-mesh-bvh";
import Emitter from "../emitter";
import { SnowScene } from "./snowscene";
import { RainScene } from "./rainscene";
//@ts-ignore
import portalVertexShader from '../../assets/shaders/portal/vertex.glsl?raw';
//@ts-ignore
import portalFragmentShader from '../../assets/shaders/portal/fragment.glsl?raw';
import { TeleporterManager } from "./teleoirter";



interface EnvironmentParams {
	scene: Scene;
	loader: Loader;
	emitter: Emitter;
	mode: string;
}

export default class Environment {
	private scene: Scene;
	private loader: Loader;
	private emitter: Emitter;
	private mode: string;

	private collision_scene: Group | undefined;
	colliders: Mesh[] = [];
	is_load_finished = false;
	raycast_objects: Object3D[] = [];

	snowScene: SnowScene | undefined;
	rainScene: RainScene | undefined;
	cloudParticles: Mesh[] = [];
	private weather: string = "sunny";
	private portalMaterial: ShaderMaterial | undefined;
	private teleporterManager: TeleporterManager | undefined;

	constructor({
		scene,
		loader,
		emitter,
		mode,
	}: EnvironmentParams) {
		this.scene = scene;
		this.loader = loader;
		this.emitter = emitter;
		this.mode = mode;

		if (this.mode === "Plaza") {
			console.log("Plaza");
			this._loadEnvironment(PLAZA_CITY_SCENE_URL);
		}
		else if (this.mode === "Entertainment") {
			this._loadEntertainmentEnvironment(COLLISION_SCENE_URL);
			this.teleporterManager = new TeleporterManager(this.scene, new Vector3(-1.4,0.05,16));
		}

	}



	/*
* 加载场景全部物体
* */
	private async _loadEnvironment(SCENE_URL: string) {
		try {
			// await this._initFloor();
			// const arrl = [/*COLLISION_SCENE_URL*/PLAZA_COLLISION_SCENE_URL];
			// this._loadCollisionScenes(arrl);
			await this._loadCollisionScene(SCENE_URL);
			this._initSceneOtherEffectsMorning();
			this._initDoor();


			// this._createWater();
			this.is_load_finished = true;
			this.emitter.$emit(ON_LOAD_SCENE_FINISH);
		} catch (e) {
			console.log(e);
		}
	}

	/*
* 加载场景全部物体
* */
	private async _loadEntertainmentEnvironment(SCENE_URL: string) {
		try {
			await this._loadCollisionScene(SCENE_URL);
			this._initSceneOtherEffectsMorning();
			// this._initDoor();


			this._createWater();
			this.is_load_finished = true;
			this.emitter.$emit(ON_LOAD_SCENE_FINISH);
		} catch (e) {
			console.log(e);
		}
	}

	/*
	* 创建户外水池
	* */
	private _createWater() {
		const water = new Water(new PlaneGeometry(8.5, 38, 1024, 1024), {
			color: 0xffffff,
			scale: 0.3,
			flowDirection: new Vector2(3, 1),
			textureHeight: 1024,
			textureWidth: 1024,
			flowSpeed: 0.001,
			reflectivity: 0.05,
			normalMap0: this.loader.texture_loader.load(WATER_NORMAL1_TEXTURE),
			normalMap1: this.loader.texture_loader.load(WATER_NORMAL2_TEXTURE)
		});
		water.position.set(-1, 0, -30.5);
		water.rotation.x = -(Math.PI / 2);
		this.scene.add(water);
	}


	/*
	* 創建門
	* */
	private _initDoor() {
		this.portalMaterial = new ShaderMaterial({
			uniforms: {
				time: {
					value: 0.0,
				},
				perlinnoise: {
					value: this.loader.texture_loader.load(PORTAL_PERLINNOISE_TEXTURE),
				},
				sparknoise: {
					value: this.loader.texture_loader.load(PORTAL_SPARKNOISE_TEXTURE),
				},
				waterturbulence: {
					value: this.loader.texture_loader.load(PORTAL_WATERURBURBULENCE_TEXTURE),
				},
				noiseTex: {
					value: this.loader.texture_loader.load(PORTAL_NOISE_TEXTURE),
				},
				color5: {
					value: new Vector3(...options.color5),
				},
				color4: {
					value: new Vector3(...options.color4),
				},
				color3: {
					value: new Vector3(...options.color3),
				},
				color2: {
					value: new Vector3(...options.color2),
				},
				color1: {
					value: new Vector3(...options.color1),
				},
				color0: {
					value: new Vector3(...options.color0),
				},
				resolution: {
					value: new Vector2(window.innerWidth, window.innerHeight),
				},
			},
			fragmentShader: portalFragmentShader,
			vertexShader: portalVertexShader,
		});




		const planeGeometry = new PlaneGeometry(2.5, 2.5, 1, 1);
		const portal = new Mesh(planeGeometry, this.portalMaterial);
		portal.position.set(19, 0.7, -18);
		this.scene.add(portal);
		portal.userData.mode = "Entertainment";
		this.raycast_objects.push(portal);

	}

	// /*
	// * 加载场景全部物体
	// * */
	// private async _loadEnvironment() {
	// 	try {
	// 		await this._loadCollisionScene();
	// 		this._initSceneOtherEffects();
	// 		this._createWater();
	// 		this.is_load_finished = true;
	// 		this.emitter.$emit(ON_LOAD_SCENE_FINISH);
	// 	} catch (e) {
	// 		console.log(e);
	// 	}
	// }


	/*
	* 加载地图并绑定碰撞
	* */
	private _loadCollisionScene(SCENE_URL: string): Promise<void> {
		return new Promise(resolve => {
			this.loader.gltf_loader.load(SCENE_URL /* PLAZA_UFO_SCENE_URL PLAZA_COLLISION_SCENE_URL COLLISION_SCENE_URL*/, (gltf) => {
				this.collision_scene = gltf.scene;
				// this.collision_scene.scale.set(0.01, 0.01, 0.01);
				// this.collision_scene.position.y -= 40;
				// this.collision_scene.scale.set(50, 50, 50);			

				this.collision_scene.traverse(item => {
					// console.log(item);
					item.castShadow = true;
					item.receiveShadow = true;
				});

				// this.collision_scene.position.x += 20;
				this.collision_scene.updateMatrixWorld(true);


				const static_generator = new StaticGeometryGenerator(this.collision_scene);
				static_generator.attributes = ["position"];
				console.log(static_generator.attributes);
				const generate_geometry = static_generator.generate() as BVHGeometry;
				generate_geometry.boundsTree = new MeshBVH(generate_geometry, { lazyGeneration: false } as MeshBVHOptions);

				this.colliders.push(new Mesh(generate_geometry));
				// this.colliders.position.x += 20;
				this.scene.add(this.collision_scene);


				resolve();
			});
		});
	}


	// private _initFloor(): Promise<void> {
	// 	return new Promise(resolve => {
	// 		const planeGeometry = new PlaneGeometry(100, 100, 32, 32);
	// 		const floorTexture = this.loader.texture_loader.load(PLAZA_FLOOR_SCENE_URL);
	// 		const planeMaterial = new MeshBasicMaterial({
	// 			map: floorTexture,
	// 			side: DoubleSide,
	// 		});
	// 		const floor = new Mesh(planeGeometry, planeMaterial);
	// 		floor.rotation.x = -Math.PI / 2;

	// 		// 创建地板碰撞模型
	// 		// 确保碰撞模型与地板视觉模型匹配
	// 		const colliderGeometry = new PlaneGeometry(100, 100, 32, 32);
	// 		const colliderMaterial = new MeshBasicMaterial({ visible: false }); // 隐藏碰撞模型
	// 		const collider = new Mesh(colliderGeometry, colliderMaterial);
	// 		collider.rotation.x = -Math.PI / 2;

	// 		this.colliders.push(collider); // 将碰撞模型添加到碰撞检测中

	// 		this.scene.add(floor);
	// 		this.scene.add(collider); // 将碰撞模型添加到场景中

	// 		resolve();
	// 	});
	// }


	/*
	* 创建环境灯光、场景贴图、场景雾
	* */
	private _initSceneOtherEffectsNight() {
		this.loader.texture_loader.load(PLAZA_EFFECT_SCENE_URL, (texture) => {
			const cloudGeo = new PlaneGeometry(500, 500);
			const cloudMaterial = new MeshLambertMaterial({
				map: texture,
				transparent: true
			});

			for (let p = 0; p < 25; p++) {
				const cloud = new Mesh(cloudGeo, cloudMaterial);
				cloud.position.set(
					Math.random() * 800 - 400,
					500,
					Math.random() * 500 - 450
				);
				cloud.rotation.x = 1.16;
				cloud.rotation.y = -0.12;
				cloud.rotation.z = Math.random() * 360;
				cloud.material.opacity = 0.6;
				this.cloudParticles.push(cloud);
				this.scene.add(cloud);
			}

			const ambient = new AmbientLight(0x555555);
			this.scene.add(ambient);

			const directionalLight = new DirectionalLight(0xffeedd);
			directionalLight.position.set(0, 0, 1);
			this.scene.add(directionalLight);

			const flash = new PointLight(0x062d89, 30, 500, 1.7);
			flash.position.set(200, 300, 100);
			this.scene.add(flash);
		});
	}

	private _initSceneOtherEffectsMorning() {
		const direction_light = new DirectionalLight(0xffffff, 1);
		direction_light.position.set(-5, 25, -1);
		direction_light.castShadow = true;
		direction_light.shadow.camera.near = 0.01;
		direction_light.shadow.camera.far = 500;
		direction_light.shadow.camera.right = 30;
		direction_light.shadow.camera.left = -30;
		direction_light.shadow.camera.top = 30;
		direction_light.shadow.camera.bottom = -30;
		direction_light.shadow.mapSize.width = 1024;
		direction_light.shadow.mapSize.height = 1024;
		direction_light.shadow.radius = 2;
		direction_light.shadow.bias = -0.00006;
		this.scene.add(direction_light);

		const fill_light = new HemisphereLight(0xffffff, 0xe49959, 1);
		fill_light.position.set(2, 1, 1);
		this.scene.add(fill_light);

		this.scene.add(new AmbientLight(0xffffff, 1));

		this.scene.fog = new Fog(0xcccccc, 10, 900);

		const texture = this.loader.texture_loader.load(SCENE_BACKGROUND_TEXTURE);
		texture.mapping = EquirectangularReflectionMapping;
		this.scene.background = texture;
	}

	private _initSceneOtherEffectsSunset() {
		// 修改主光源，使其顏色和強度模擬夕陽
		const direction_light = new DirectionalLight(0xffa500, 1.5); // 使用暖橙色
		direction_light.position.set(-5, 25, -1);
		direction_light.castShadow = true;
		direction_light.shadow.camera.near = 0.01;
		direction_light.shadow.camera.far = 500;
		direction_light.shadow.camera.right = 30;
		direction_light.shadow.camera.left = -30;
		direction_light.shadow.camera.top = 30;
		direction_light.shadow.camera.bottom = -30;
		direction_light.shadow.mapSize.width = 1024;
		direction_light.shadow.mapSize.height = 1024;
		direction_light.shadow.radius = 2;
		direction_light.shadow.bias = -0.00006;
		this.scene.add(direction_light);

		// 修改填充光源，使其顏色模擬黃昏的光線
		const fill_light = new HemisphereLight(0xffe4b5, 0xff4500, 0.8); // 上方使用暖黃色，下方使用橙紅色
		fill_light.position.set(2, 1, 1);
		this.scene.add(fill_light);

		// 修改環境光，使其顏色更加溫暖
		this.scene.add(new AmbientLight(0xffc107, 0.5)); // 使用暖黃色並減少強度

		// 調整霧的顏色，使其與黃昏的顏色相匹配
		this.scene.fog = new Fog(0xffcc99, 10, 900); // 使用暖色調的霧

		// 加載背景紋理
		const texture = this.loader.texture_loader.load(SCENE_BACKGROUND1_TEXTURE);
		texture.mapping = EquirectangularReflectionMapping;
		this.scene.background = texture;
	}



	private clearEffects(): void {
		// 移除云朵效果
		this.cloudParticles.forEach(cloud => {
			this.scene.remove(cloud);
		});
		this.cloudParticles = [];

		// 移除光源和其他效果
		this.scene.children.forEach(child => {
			// 移除DirectionalLight
			if (child instanceof DirectionalLight) {
				this.scene.remove(child);
			}
			// 移除HemisphereLight
			if (child instanceof HemisphereLight) {
				this.scene.remove(child);
			}
			// 移除AmbientLight
			if (child instanceof AmbientLight) {
				this.scene.remove(child);
			}
			// 移除PointLight
			if (child instanceof PointLight) {
				this.scene.remove(child);
			}
		});

		// 清除雾效果
		this.scene.fog = null;

		// 清除背景纹理
		this.scene.background = null;
	}


	public setTime(timeOfDay: string): void {
		console.log(timeOfDay);
		// 清除舊場景效果
		this.clearEffects();
		if (timeOfDay == "morning") {
			this._initSceneOtherEffectsMorning();
		}
		else if (timeOfDay == "afternoon") {
			this._initSceneOtherEffectsSunset();
		}
		else if (timeOfDay == "night") {
			this._initSceneOtherEffectsNight();
		}
	}

	private clearWeatherScene(): void {
		if (this.snowScene) {
			this.scene.remove(this.snowScene.snowParticles);
			this.snowScene = undefined;
			// Remove all snow particles from the scene
			//  this.snowScene.snowParticles.geometry.dispose();
			//  this.snowScene.snowParticles.material.dispose();
			//  this.scene.remove(this.snowScene.snowParticles);
			//  this.snowScene = null;
		}
		if (this.rainScene) {
			this.scene.remove(this.rainScene.rainParticles);
			this.rainScene = undefined;
		}
	}

	public setWeather(weather: string): void {
		// 先清除旧的天气效果
		this.clearWeatherScene();
		// 设置天气
		if (weather === "sunny") {
			this.weather = weather;
		}
		else if (weather === "rainy") {
			this.weather = weather;
			this.rainScene = new RainScene(this.scene);
		}
		else if (weather === "snowy") {
			console.log("set snow");
			this.weather = weather;
			this.snowScene = new SnowScene(this.scene);
		}
	}



	public update(delta: number): void {

		// 更新場景其他部分

		// 更新下雪場景
		if (this.snowScene && this.weather === "snowy") {
			this.snowScene.updateSnow();
		}

		// 更新水面效果
		if (this.rainScene && this.weather === "rainy") {
			this.rainScene.updateRain();
		}

		// if(this.mode === "Plaza") {

		// 	if(this.portalMaterial) {
		// 		// console.log("update portal");
		// 		// this.portalMaterial.uniforms.time.value = deltaTime / 5000;
		// 		this.portalMaterial.uniforms.time.value = delta / 5000;
		// 		this.portalMaterial.uniforms.color5.value =  new Vector3(...options.color5);
		// 		this.portalMaterial.uniforms.color4.value =  new Vector3(...options.color4);
		// 		this.portalMaterial.uniforms.color3.value =  new Vector3(...options.color3);
		// 		this.portalMaterial.uniforms.color2.value =  new Vector3(...options.color2);
		// 		this.portalMaterial.uniforms.color1.value =  new Vector3(...options.color1);
		// 		this.portalMaterial.uniforms.color0.value =  new Vector3(...options.color0);
		// 	}
		// }

		if(this.mode === "Entertainment") {
			if(this.teleporterManager) {
				this.teleporterManager.updateCircles();
				this.teleporterManager.updateArounds();
				this.teleporterManager.updatePatical();
			}
		}
	}
}


const options = {
	exposure: 2.8,
	bloomStrength: 2.39,
	bloomThreshold: 0,
	bloomRadius: 0.38,
	color0: [1, 5, 1],
	color1: [2, 20, 2],
	color2: [44, 97, 15],
	color3: [14, 28, 5],
	color4: [255, 255, 255],
	color5: [74, 145, 0],
};