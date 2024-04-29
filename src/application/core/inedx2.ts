import { ACESFilmicToneMapping, Clock, Color, PerspectiveCamera, Scene, SRGBColorSpace, VSMShadowMap, WebGLRenderer, AmbientLight, HemisphereLight, DirectionalLight, Mesh, MeshBasicMaterial, PlaneGeometry, PointLight, SpotLight, TextureLoader } from "three";
import World from "../world";
import Emitter from "../emitter";
import Loader from "../loader";
import Control from "../control";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three-stdlib";
import { PLAZA_COLLISION_SCENE_URL } from "../Constants"

export default class Core {
	scene: Scene;
	renderer: WebGLRenderer;
	camera: PerspectiveCamera;
	clock: Clock;
	pointerLock_controls: PointerLockControls;

	emitter: Emitter;
	control: Control;
	loader: Loader;
	world: World;

	constructor(mode: String) {
		this.scene = new Scene();
		this.renderer = new WebGLRenderer({antialias: true});
		this.camera = new PerspectiveCamera();
		this.clock = new Clock();
		this.pointerLock_controls = new PointerLockControls(this.camera, this.renderer.domElement);


		this._initScene();
		this._initCamera();
		this._initRenderer();
		this._initResponsiveResize();

		this.emitter = new Emitter();

		this.control = new Control({
			emitter: this.emitter
		});

		this.loader = new Loader({
			emitter: this.emitter
		});

		this.world = new World({
			scene: this.scene,
			camera: this.camera,
			controls: this.pointerLock_controls,
			control: this.control,
			loader: this.loader,
			emitter: this.emitter
		});
		

		// 创建平面几何体
		const planeGeometry = new PlaneGeometry(100, 100, 32, 32); // 平面的宽度和高度，以及分段数
		const planeMaterial = new MeshBasicMaterial({ color: new Color(0xff0000) }); // 红色材质
		const plane = new Mesh(planeGeometry, planeMaterial);
		plane.rotation.x = -Math.PI / 2; // 使平面水平
		this.scene.add(plane);

	}

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

		// this.scene.fog = new Fog(0xcccccc, 10, 900);

		// const texture = this.loader.texture_loader.load(SCENE_BACKGROUND_TEXTURE);
		// texture.mapping = EquirectangularReflectionMapping;
		// this.scene.background = texture;
	}


	/*
* 加载地图并绑定碰撞
* */
	// private _loadCollisionScene(): Promise<void> {
	// 	console.log('Loading collision scene...');
	// 	return new Promise(resolve => {
	// 		const gltf_loader = new GLTFLoader();
	// 		gltf_loader.load(PLAZA_COLLISION_SCENE_URL, (gltf) => {
	// 			// 在此處處理加載完成後的邏輯
	// 			// 你可以在這裡處理加載完成後的場景或模型
	// 			console.log('Collision scene loaded:', gltf);
	// 			this.scene.add(gltf.scene);
	// 			// 當加載完成後，執行 resolve() 以完成 Promise
	// 			resolve();
	// 		}, undefined, (error) => {
	// 			// 在此處處理加載失敗的情況
	// 			console.error('Error loading collision scene:', error);
	// 			resolve(); // 雖然加載失敗，但仍然執行 resolve() 以完成 Promise
	// 		});
	// 	});
	// }

	render() {
		this.renderer.setAnimationLoop(() => {
			this.renderer.render(this.scene, this.camera);
			const delta_time = Math.min(0.05, this.clock.getDelta());
			this.world.update(delta_time);
		});
	}

	private _initScene() {
		this.scene.background = new Color(0x000000);
	}

	private _initCamera() {
		this.camera.fov = 55;
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.near = 0.1;
		this.camera.far = 10000;
		this.camera.position.set(0, 10, 30);
		this.camera.updateProjectionMatrix();
	}


	private _initRenderer() {
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = VSMShadowMap;
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = ACESFilmicToneMapping;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.querySelector("#webgl")?.appendChild(this.renderer.domElement);
	}

	private _initResponsiveResize() {
		window.addEventListener("resize", () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.setPixelRatio(window.devicePixelRatio);
		});
	}

}