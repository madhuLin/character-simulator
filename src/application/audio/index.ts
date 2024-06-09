import { Scene, Mesh, MeshBasicMaterial, PlaneGeometry, PositionalAudio, AudioListener, PerspectiveCamera } from "three";
import { PositionalAudioHelper } from "three/examples/jsm/helpers/PositionalAudioHelper";
import Loader from "../loader";
import {AUDIO_URL, AUDIO_URL1, AUDIO_URL2} from "../Constants";
interface AudioParams {
	scene: Scene;
	camera: PerspectiveCamera;
	loader: Loader;
}

export default class Audio {
	private scene: Scene;
	private camera: PerspectiveCamera;
	private loader: Loader;

	private positional_audio: PositionalAudio | undefined;
	private audio_mesh: Mesh | undefined;
	private audio_url: string = "sunny";
	is_playing = false;

	constructor({
		scene,
		camera,
		loader,
	}: AudioParams) {
		this.scene = scene;
		this.camera = camera;
		this.loader = loader;
		this.audio_url = AUDIO_URL;
		this._createAudio();
	}

	private async _createAudio() {
		this.audio_mesh = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ color: 0xff0000 }));
		this.audio_mesh.position.set(0, 1, 10);
		this.audio_mesh.rotation.y = Math.PI;
		this.audio_mesh.visible = false;
		this.scene.add(this.audio_mesh);

		const listener = new AudioListener();

		this.camera.add(listener);
		this.positional_audio = new PositionalAudio(listener);
		this.audio_mesh.add(this.positional_audio);

		const buffer = await this.loader.audio_loader.loadAsync(this.audio_url);
		this.positional_audio.setBuffer(buffer);
		this.positional_audio.setVolume(0.5);
		this.positional_audio.setRefDistance(2);
		this.positional_audio.setDirectionalCone(180, 230, 0.5);
		this.positional_audio.setLoop(true);

		const helper = new PositionalAudioHelper(this.positional_audio);
		this.positional_audio.add(helper);

		return Promise.resolve();
	}

	playAudio() {
		this.is_playing = true;
		this.positional_audio?.play();
	}

	togglePlayAudio() {
		if (this.is_playing) {
			this.is_playing = false;
			this.positional_audio?.pause();
		} else {
			this.is_playing = true;
			this.positional_audio?.play();
		}
	}

	async setAudioUrl(audio_url: string) {
		if (audio_url !== this.audio_url) {
			// 停止當前音樂
			this.positional_audio?.stop();
			let buffer: AudioBuffer;
			// 加載並設置新的音樂
			if (audio_url === "sunny") buffer = await this.loader.audio_loader.loadAsync(AUDIO_URL);
			else if (audio_url === "sad") buffer = await this.loader.audio_loader.loadAsync(AUDIO_URL1);
			else if (audio_url === "gta") buffer = await this.loader.audio_loader.loadAsync(AUDIO_URL2);
			this.positional_audio?.setBuffer(buffer!);
			// 播放新的音樂
			if (this.is_playing) {
				this.positional_audio?.play();
			}
			this.audio_url = audio_url;
		}
	}
	
}
