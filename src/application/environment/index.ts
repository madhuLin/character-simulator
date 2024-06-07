import Loader from "../loader";
import {
	// Entertainment
	COLLISION_SCENE_URL, ON_LOAD_SCENE_FINISH, SCENE_BACKGROUND_TEXTURE, WATER_NORMAL1_TEXTURE,
	WATER_NORMAL2_TEXTURE,
	// Plaza
	PLAZA_CITY_SCENE_URL, PLAZA_EFFECT_SCENE_URL, PLAZA_PORTAL_SCENE_URL,
	// 傳送門 雨 雪
	SCENE_BACKGROUND1_TEXTURE, PORTAL_PERLINNOISE_TEXTURE, PORTAL_SPARKNOISE_TEXTURE,
	PORTAL_WATERURBURBULENCE_TEXTURE, PORTAL_NOISE_TEXTURE,
	// graallery
	GALLETY_SCENE_URL, STATIC_SCENE_URL, BOARD_TEXTURES, BOARDS_INFO,
} from "../Constants";
import {
	Scene, AmbientLight, DirectionalLight, EquirectangularReflectionMapping, Fog, Group, HemisphereLight,
	Mesh, PlaneGeometry, Vector2, MeshBasicMaterial, DoubleSide, Object3D, MeshLambertMaterial, PointLight,
	ShaderMaterial, Vector3, CircleGeometry, BufferGeometry, BufferAttribute, Texture,

	//graallery
	SRGBColorSpace, Material, BoxGeometry
} from "three";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';



import { Water } from "three/examples/jsm/objects/Water2";
import type { BVHGeometry } from "../utils/typeAssert";
import { isLight, isMesh } from "../utils/typeAssert";
import { MeshBVH, StaticGeometryGenerator, type MeshBVHOptions } from "three-mesh-bvh";
import Emitter from "../emitter";
import { SnowScene } from "./snowscene";
import { RainScene } from "./rainscene";
//@ts-ignore
import portalVertexShader from '../../assets/shaders/portal/vertex.glsl?raw';
//@ts-ignore
import portalFragmentShader from '../../assets/shaders/portal/fragment.glsl?raw';
import { TeleporterManager } from "./teleoirter";

//grallery
import { Reflector } from "../lib/Reflector";


interface EnvironmentParams {
	scene: Scene;
	loader: Loader;
	emitter: Emitter;
	mode: string;
	portalPosition: Vector3;
}

export default class Environment {
	private scene: Scene;
	private loader: Loader;
	private emitter: Emitter;
	private mode: string;

	private collision_scene: Group | undefined;
	colliders: Mesh[] = [];
	is_load_finished = false;
	raycast_objects: Object3D[] = [];  // 物件可被射線追蹤
	//tool common effects
	snowScene: SnowScene | undefined;
	rainScene: RainScene | undefined;
	cloudParticles: Mesh[] = [];
	private weather: string = "sunny";
	private portalMaterial: ShaderMaterial | undefined;
	private teleporterManager: TeleporterManager | undefined;
	private portalPosition: Vector3; //傳送門位置
	//grallery
	private texture_boards: Record<string, Texture> = {};
	private gallery_boards: Record<string, Mesh> = {};
	private scaleGrallery = 0.3; //grallery 縮放比例
	constructor({
		scene,
		loader,
		emitter,
		mode,
		portalPosition
	}: EnvironmentParams) {
		this.scene = scene;
		this.loader = loader;
		this.emitter = emitter;
		this.mode = mode; //模式
		this.portalPosition = portalPosition; //傳送門位置
		this.clearEffects();
		if (this.mode === "Plaza") {
			console.log("Plaza");
			this._loadEnvironment(PLAZA_CITY_SCENE_URL);
		}
		else if (this.mode === "Entertainment") {
			this._loadEntertainmentEnvironment(COLLISION_SCENE_URL);
			this.createPortal();

		}
		else if (this.mode === "Grallery") {
			this._loadGralleryEnvironment();
			this.createPortal();
		}
		else if (this.mode === "Playground") {
			
		}


	}

	private async _loadGralleryEnvironment() {
		try {
			await this._loadCollisionScene(GALLETY_SCENE_URL);
			await this._loadStaticScene();
			await this._loadBoardsTexture();
			this._configureGallery();
			this._createSpecularReflection();
			this.is_load_finished = true;
			this.emitter.$emit(ON_LOAD_SCENE_FINISH);
		} catch (e) {
			console.log(e);
		}
	}

	/*
	* 載入grallery環境不含碰撞其他的場景
	* */
	private async _loadStaticScene(): Promise<void> {
		return new Promise(resolve => {
			this.loader.gltf_loader.load(STATIC_SCENE_URL, (gltf) => {
				//統一大小
				gltf.scene.scale.set(this.scaleGrallery, this.scaleGrallery, this.scaleGrallery);

				this.scene.add(gltf.scene);
				gltf.scene.traverse(item => {
					if (item.name === "computer") {
						item.userData = {
							hint: true,
							name: item.name,
							title: "噢，是遠方 🏕",
						};
						this.raycast_objects.push(item);
					}
				});
				resolve();
			});
		});
	}


	private async _loadBoardsTexture(): Promise<void> {
		for (let i = 0; i < BOARD_TEXTURES.length; i++) {
			this.texture_boards[i + 1] = await this.loader.texture_loader.loadAsync(BOARD_TEXTURES[i]);
		}

		for (const key in this.texture_boards) {
			const texture = this.texture_boards[key]
			texture.colorSpace = SRGBColorSpace;

			// 根據紋理的寬高比和平面的寬高比，計算所需的縮放比例
			const texture_aspect_ratio = texture.image.width / texture.image.height;
			let scale_x = 1;
			let scale_y = 1;

			if (texture_aspect_ratio > 1) {
				scale_x = 1 / texture_aspect_ratio;
			} else {
				scale_y = texture_aspect_ratio;
			}

			// 設定紋理的偏移和重複以進行居中和適應
			texture.offset.set(0.5 - scale_x / 2, 0.5 - scale_y / 2);
			texture.repeat.set(scale_x, scale_y);
			texture.needsUpdate = true;
		}

		return Promise.resolve();
	}

	/*
	* 設定畫板userData資料、貼圖翻轉
	* */
	private _configureGallery() {
		for (const key in this.texture_boards) {
			const board = this.gallery_boards[`gallery${key}_board`];
			const board_material = board.material;
			(board_material as MeshBasicMaterial).map = this.texture_boards[key];
			board.userData = {
				hint: true,
				name: board.name,
				title: BOARDS_INFO[key].title,
				author: BOARDS_INFO[key].author,
				describe: BOARDS_INFO[key].describe,
				index: key,
				src: this.texture_boards[key].image.src,
				tips: "Tips：點擊此畫可查看詳情",
				show_boards: true
			};

			// 翻轉貼圖
			if ([4, 5, 6, 7, 9].includes(+key)) {
				board.rotation.y = -Math.PI / 2;
			}
			if (8 === +key) {
				board.rotation.y = Math.PI;
			}

			(board_material as MeshBasicMaterial).needsUpdate = true;
		}
	}

	/*
	* 產生地面鏡面反射
	* */
	private _createSpecularReflection() {
		const mirror = new Reflector(new PlaneGeometry(100, 100), {
			textureWidth: window.innerWidth * window.devicePixelRatio,
			textureHeight: window.innerHeight * window.devicePixelRatio,
			color: 0xffffff,
		});
		if (mirror.material instanceof Material) {
			mirror.material.transparent = true;
		}
		mirror.rotation.x = -0.5 * Math.PI;
		this.scene.add(mirror);
	}


	/*
* 載入場景全部物體
* */
	private async _loadEnvironment(SCENE_URL: string) {
		try {
			// await this._initFloor();
			// const arrl = [/*COLLISION_SCENE_URL*/PLAZA_COLLISION_SCENE_URL];
			// this._loadCollisionScenes(arrl);
			await this._loadCollisionScene(SCENE_URL);
			// this._initSceneOtherEffectsMorning();
			this._initDoor([18.7, 0.6, -16.8], "Tips：點擊此門進入遊戲!", "Entertainment");
			this._initDoor([46.5, 0.6 ,-31.8], "Tips：點擊此門進入美術館!", "Grallery");
			this._initDoor([46.5, 0.6 ,-31.8], "Tips：點擊此門進入遊樂場!", "Grallery");

			// this._createWater();
			this.is_load_finished = true;
			this.emitter.$emit(ON_LOAD_SCENE_FINISH);
		} catch (e) {
			console.log(e);
		}
	}

	/*
* 載入場景全部物體
* */
	private async _loadEntertainmentEnvironment(SCENE_URL: string) {
		try {
			await this._loadCollisionScene(SCENE_URL);
			// this._initSceneOtherEffectsMorning();
			// this._initDoor();

			this._createWater();
			this.is_load_finished = true;
			this.emitter.$emit(ON_LOAD_SCENE_FINISH);
		} catch (e) {
			console.log(e);
		}
	}

	private createPortal() {
		this.teleporterManager = new TeleporterManager(this.scene, this.portalPosition);
		const teleporter = this.teleporterManager.teleporter;
		if (teleporter) {
			// 添加碰撞體
			const geometry = new BoxGeometry(0.7, 4, 0.7); // 使用盒子碰撞體作為示例
			const material = new MeshBasicMaterial({ visible: false }); // 使碰撞體不可見  
			const collider = new Mesh(geometry, material);
			teleporter.add(collider); // 將碰撞體添加為傳送門的子物件
			collider.userData.hint = true;
			collider.userData.tips = "Tips: 在傳送門內三秒即可傳送回廣場!";
			this.raycast_objects.push(collider); // 將碰撞體添加到射線檢測對象列表中
			// console.log("createPortal", teleporter);
		} else {
			// console.error("Teleporter is null!");
		}
	}

	/*
	* 創建戶外池
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
	private async _initDoor(position: [number, number, number], tips: string = "Tips: 點擊此門可進入傳送門!", map: string): Promise<void> {
		return new Promise(resolve => {
			this.loader.gltf_loader.load(PLAZA_PORTAL_SCENE_URL, (gltf) => {
				//統一大小
				const scale = 0.4;
				let door = gltf.scene.children[0];
				door.scale.set(scale, scale, scale);
				door.position.set(position[0], position[1], position[2]);
				// 添加碰撞體
				const geometry = new BoxGeometry(3, 5, 3); // 使用盒子碰撞體作為示例
				const material = new MeshBasicMaterial({ visible: false }); // 使碰撞體不可見   
				const collider = new Mesh(geometry, material);
				door.add(collider); // 將碰撞體添加為傳送門的子物件
				this.scene.add(door);
				// gltf.scene.traverse(item => {

				// });
				collider.userData = {
					hint: true,
					map: map,
					tips: tips,
				};
				this.raycast_objects.push(collider);
				resolve();
			});
		});
	}
	// private _initDoor() {
	// 	this.portalMaterial = new ShaderMaterial({
	// 		uniforms: {
	// 			time: {
	// 				value: 0.0,
	// 			},
	// 			perlinnoise: {
	// 				value: this.loader.texture_loader.load(PORTAL_PERLINNOISE_TEXTURE),
	// 			},
	// 			sparknoise: {
	// 				value: this.loader.texture_loader.load(PORTAL_SPARKNOISE_TEXTURE),
	// 			},
	// 			waterturbulence: {
	// 				value: this.loader.texture_loader.load(PORTAL_WATERURBURBULENCE_TEXTURE),
	// 			},
	// 			noiseTex: {
	// 				value: this.loader.texture_loader.load(PORTAL_NOISE_TEXTURE),
	// 			},
	// 			color5: {
	// 				value: new Vector3(...options.color5),
	// 			},
	// 			color4: {
	// 				value: new Vector3(...options.color4),
	// 			},
	// 			color3: {
	// 				value: new Vector3(...options.color3),
	// 			},
	// 			color2: {
	// 				value: new Vector3(...options.color2),
	// 			},
	// 			color1: {
	// 				value: new Vector3(...options.color1),
	// 			},
	// 			color0: {
	// 				value: new Vector3(...options.color0),
	// 			},
	// 			resolution: {
	// 				value: new Vector2(window.innerWidth, window.innerHeight),
	// 			},
	// 		},
	// 		fragmentShader: portalFragmentShader,
	// 		vertexShader: portalVertexShader,
	// 	});




	// 	const planeGeometry = new PlaneGeometry(2.5, 2.5, 1, 1);
	// 	const portal = new Mesh(planeGeometry, this.portalMaterial);
	// 	portal.position.copy(this.portalPosition);
	// 	this.scene.add(portal);
	// 	portal.userData.mode = "Entertainment";
	// 	this.raycast_objects.push(portal);

	// }

	// /*
	// * 載入場景全部物體
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
	* 載入地圖並綁定碰撞
	* */
	private async _loadCollisionScene(SCENE_URL: string): Promise<void> {
		return new Promise(resolve => {
			this.loader.gltf_loader.load(SCENE_URL /* PLAZA_UFO_SCENE_URL PLAZA_COLLISION_SCENE_URL COLLISION_SCENE_URL*/, (gltf) => {
				this.collision_scene = gltf.scene;
				if (this.mode === "Grallery") {

					this.collision_scene.scale.set(this.scaleGrallery, this.scaleGrallery, this.scaleGrallery);
					this.collision_scene.traverse(item => {
						if (item.name === "home001" || item.name === "PointLight") {
							item.castShadow = true;
						}

						if (item.name.includes("PointLight") && isLight(item)) {
							// console.log("PointLight", item.name, item.intensity);
							item.intensity *= 60;
						}

						if (item.name === "home002") {
							item.castShadow = true;
							item.receiveShadow = true;
						}

						// 提取出相框元素
						if (/gallery.*_board/.test(item.name) && isMesh(item)) {
							this.gallery_boards[item.name] = item;
						}

						this.raycast_objects.push(item);
					});
				}
				else {
					this.collision_scene.traverse(item => {
						// console.log(item);
						item.castShadow = true;
						item.receiveShadow = true;
					});
				}
				// this.collision_scene.scale.set(0.01, 0.01, 0.01);
				// this.collision_scene.position.y -= 40;
				// this.collision_scene.scale.set(50, 50, 50);			



				// this.collision_scene.position.x += 20;
				this.collision_scene.updateMatrixWorld(true);


				const static_generator = new StaticGeometryGenerator(this.collision_scene);
				static_generator.attributes = ["position"];
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

		if (this.mode === "Entertainment") {
			if (this.teleporterManager) {
				this.teleporterManager.updateCircles();
				this.teleporterManager.updateArounds();
				this.teleporterManager.updatePatical();
			}
		}
	}
}


