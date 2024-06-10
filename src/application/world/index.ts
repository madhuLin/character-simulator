import Environment from "../environment";
import Character from "../character";
import InteractionDetection from "../interactionDetection";
import Audio from "../audio";
import { PerspectiveCamera, Scene, Mesh, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Control from "../control";
import Loader from "../loader";
import Emitter from "../emitter";
import { PointerLockControls } from "three-stdlib";
import RayCasterControls from "../rayCasterControls";
import { portalPositions } from "../Constants";

interface WorldParams {
	scene: Scene;
	camera: PerspectiveCamera;
	controls: OrbitControls | PointerLockControls;
	control: Control;
	loader: Loader;
	emitter: Emitter;
	mode: string;
}

export default class World {
	private readonly scene: Scene;
	private readonly camera: PerspectiveCamera;
	private readonly controls: OrbitControls | PointerLockControls;
	private readonly control: Control;
	private readonly loader: Loader;
	private readonly emitter: Emitter;
	private readonly mode: string;

	ray_caster_controls: RayCasterControls;
	environment: Environment;
	character: Character;
	interaction_detection: InteractionDetection;
	audio: Audio;

	constructor({
		scene,
		camera,
		controls,
		control,
		loader,
		emitter,
		mode
	}: WorldParams) {
		this.scene = scene;
		this.camera = camera;
		this.controls = controls;
		this.control = control;
		this.loader = loader;
		this.emitter = emitter;
		this.mode = mode;
		let portalPosition: Vector3 | undefined;
		if (mode === "Plaza") portalPosition = new Vector3(...portalPositions[0]);
		else if (mode === "Entertainment") portalPosition = new Vector3(...portalPositions[1]);
		else if (mode === "Grallery") portalPosition = new Vector3(...portalPositions[2]);
		else if (mode === "Playground") portalPosition = new Vector3(...portalPositions[3]);
		this.environment = new Environment({
			scene: this.scene,
			loader: this.loader,
			emitter: this.emitter,
			mode: this.mode,
			portalPosition: portalPosition!
		});

		this.character = new Character({
			scene: this.scene,
			camera: this.camera,
			controls: this.controls,
			control: this.control,
			loader: this.loader,
			emitter: this.emitter,
			mode: this.mode,
			portalPosition: portalPosition!,
		});


		this.interaction_detection = new InteractionDetection({
			scene: this.scene,
			emitter: this.emitter
		});

		this.audio = new Audio({
			scene: this.scene,
			camera: this.camera,
			loader: this.loader,
		});

		this.ray_caster_controls = new RayCasterControls({
			camera: this.camera,
			emitter: this.emitter
		});



	}

	update(delta: number) {
		// 需等待場景載入完畢後更新character，避免初始載入時多餘的效能消耗和人物碰撞錯誤處理
		if (this.environment.is_load_finished && this.environment.colliders) {
			// @ts-ignore
			this.character.update(delta, this.environment.colliders as Mesh[]);
			this.ray_caster_controls.updateTooltipRayCast(this.environment.raycast_objects);
			this.ray_caster_controls.updateTooltipRayCast(this.environment.raycast_objects);
			this.environment.update(delta);
		}

		// 需等待場景及人物載入完畢後更新互動探測，避免初始載入時多餘的效能消耗
		if (this.mode === "Entertainment" && this.environment.is_load_finished && this.character.character_shape) {
			this.interaction_detection.update(this.character.character_shape);
		}
	}
}
