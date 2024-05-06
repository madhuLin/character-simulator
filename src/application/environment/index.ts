import Loader from "../loader";
import { COLLISION_SCENE_URL, ON_LOAD_SCENE_FINISH, SCENE_BACKGROUND_TEXTURE, WATER_NORMAL1_TEXTURE, WATER_NORMAL2_TEXTURE, PLAZA_COLLISION_SCENE_URL, PLAZA_FLOOR_SCENE_URL, PLAZA_UFO_SCENE_URL, PLAZA_DESERT_SCENE_URL, PLAZA_CITY_SCENE_URL } from "../Constants";
import { Scene, AmbientLight, DirectionalLight, EquirectangularReflectionMapping, Fog, Group, HemisphereLight, Mesh, PlaneGeometry, Vector2, MeshBasicMaterial, DoubleSide } from "three";
import { Water } from "three/examples/jsm/objects/Water2";
import type { BVHGeometry } from "../utils/typeAssert";
import { MeshBVH, StaticGeometryGenerator, type MeshBVHOptions } from "three-mesh-bvh";
import Emitter from "../emitter";

interface EnvironmentParams {
	scene: Scene;
	loader: Loader;
	emitter: Emitter
}

export default class Environment {
	private scene: Scene;
	private loader: Loader;
	private emitter: Emitter;

	private collision_scene: Group | undefined;
	colliders: Mesh[] = [];
	is_load_finished = false;

	constructor({
		scene,
		loader,
		emitter,
	}: EnvironmentParams) {
		this.scene = scene;
		this.loader = loader;
		this.emitter = emitter;

		this._loadEnvironment();
	}


	/*
* 加载场景全部物体
* */
	private async _loadEnvironment() {
		try {
			// await this._initFloor();
			// const arrl = [/*COLLISION_SCENE_URL*/PLAZA_COLLISION_SCENE_URL];
			// this._loadCollisionScenes(arrl);
			await this._loadCollisionScene();
			this._initSceneOtherEffects();

			// this._createWater();
			this.is_load_finished = true;
			this.emitter.$emit(ON_LOAD_SCENE_FINISH);
		} catch (e) {
			console.log(e);
		}
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
	private _loadCollisionScenes(sceneUrls: string[]): Promise<void[]> {
		const promises: Promise<void>[] = [];

		for (const url of sceneUrls) {
			promises.push(new Promise<void>(resolve => {
				this.loader.gltf_loader.load(url, (gltf) => {
					const collision_scene = gltf.scene;

					collision_scene.updateMatrixWorld(true);

					collision_scene.traverse(item => {
						item.castShadow = true;
						item.receiveShadow = true;
						// console.log(item);
					});

					const static_generator = new StaticGeometryGenerator(collision_scene);
					static_generator.attributes = ["position"];

					const generate_geometry = static_generator.generate() as BVHGeometry;
					generate_geometry.boundsTree = new MeshBVH(generate_geometry, { lazyGeneration: false } as MeshBVHOptions);

					// const colliders.push(collision_scene);
					this.scene.add(collision_scene);

					resolve();
				});
			}));
		}

		return Promise.all(promises);
	}

	/*
	* 加载地图并绑定碰撞
	* */
	private _loadCollisionScene(): Promise<void> {
		return new Promise(resolve => {
			this.loader.gltf_loader.load( PLAZA_CITY_SCENE_URL /* PLAZA_UFO_SCENE_URL PLAZA_COLLISION_SCENE_URL COLLISION_SCENE_URL*/, (gltf) => {
				this.collision_scene = gltf.scene;	
				// this.collision_scene.scale.set(0.01, 0.01, 0.01);
				// this.collision_scene.position.y -= 40;
				// this.collision_scene.scale.set(50, 50, 50);			

				this.collision_scene.traverse(item => {
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
	private _initSceneOtherEffects() {
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
}
