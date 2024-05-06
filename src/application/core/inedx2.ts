import { ACESFilmicToneMapping, Clock, Color, PerspectiveCamera, Scene, SRGBColorSpace, VSMShadowMap, WebGLRenderer, AmbientLight, HemisphereLight, DirectionalLight, Mesh, MeshBasicMaterial, PlaneGeometry, PointLight, SpotLight, TextureLoader } from "three";
import World from "../world";
import Emitter from "../emitter";
import Loader from "../loader";
import Control from "../control";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three-stdlib";
import { PLAZA_COLLISION_SCENE_URL } from "../Constants"

export default class Core {
	scene: Scene;
	renderer: WebGLRenderer;
	camera: PerspectiveCamera;
	clock: Clock;
	controls: OrbitControls | PointerLockControls;

	emitter: Emitter;
	control: Control;
	loader: Loader;
	world: World;

	constructor(mode: String) {
		this.scene = new Scene();
		this.renderer = new WebGLRenderer({antialias: true});
		this.camera = new PerspectiveCamera();
		this.clock = new Clock();
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enablePan = false;


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
			controls: this.controls,
			control: this.control,
			loader: this.loader,
			emitter: this.emitter,
			mode: "",
		});
		

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
			if (this.controls instanceof OrbitControls) {
				this.controls.update();
			}
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