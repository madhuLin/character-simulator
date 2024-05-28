import Loader from "../loader";
import {
	COLLISION_SCENE_URL, ON_LOAD_SCENE_FINISH, SCENE_BACKGROUND_TEXTURE, WATER_NORMAL1_TEXTURE,
	WATER_NORMAL2_TEXTURE, PLAZA_COLLISION_SCENE_URL, PLAZA_FLOOR_SCENE_URL, PLAZA_UFO_SCENE_URL,
	PLAZA_DESERT_SCENE_URL, PLAZA_CITY_SCENE_URL, PLAZA_EFFECT_SCENE_URL
} from "../Constants";
import {
	Scene, AmbientLight, DirectionalLight, EquirectangularReflectionMapping, Fog, Group, HemisphereLight,
	Mesh, PlaneGeometry, Vector2, MeshBasicMaterial, DoubleSide, Object3D, MeshLambertMaterial, PointLight
} from "three";
import { Water } from "three/examples/jsm/objects/Water2";
import type { BVHGeometry } from "../utils/typeAssert";
import { MeshBVH, StaticGeometryGenerator, type MeshBVHOptions } from "three-mesh-bvh";
import Emitter from "../emitter";
import { SnowScene } from "./snowscene";
import { RainScene } from "./rainscene";

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


	private _initDoor() {

		const planeGeometry = new PlaneGeometry(2, 3.5, 1, 1);
		const floorTexture = this.loader.texture_loader.load(PLAZA_FLOOR_SCENE_URL);
		const planeMaterial = new MeshBasicMaterial({
			map: floorTexture,
			side: DoubleSide,
		});
		const door = new Mesh(planeGeometry, planeMaterial);
		door.position.set(19, 0, -18);
		// door.position.set(20, 0, -16);
		this.scene.add(door);
		// floor.rotation.x = -Math.PI / 2;
		door.userData.mode = "Entertainment";
		this.raycast_objects.push(door);
		// throw new Error("Method not implemented.");
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



	public update(): void {
		// 更新場景其他部分

		// 更新下雪場景
		if (this.snowScene && this.weather === "snowy") {
			this.snowScene.updateSnow();
		}

		// 更新水面效果
		if (this.rainScene && this.weather === "rainy") {
			this.rainScene.updateRain();
		}
	}
}
