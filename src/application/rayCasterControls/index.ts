import { Object3D, Raycaster, Vector2, PerspectiveCamera, Camera } from "three";
import { ON_CLICK_RAY_CAST, ON_HIDE_TOOLTIP, ON_SHOW_TOOLTIP } from "../Constants";
import Emitter from "../emitter";

interface PlayerParams {
	camera: PerspectiveCamera;
	emitter: Emitter;
}

export default class RayCasterControls {
	private readonly camera: PerspectiveCamera;
	private readonly emitter: Emitter;
	private click_raycaster: Raycaster;
	private tooltip_raycaster: Raycaster;
	private hover_point: Vector2;
	private mouse_point: Vector2;

	constructor({ camera, emitter }: PlayerParams) {
		this.camera = camera;
		this.emitter = emitter;

		this.click_raycaster = new Raycaster();
		// 透過click點選檢測距離為12
		// this.click_raycaster.far = 18;
		this.click_raycaster.far = 8;

		this.tooltip_raycaster = new Raycaster();
		// tooltip顯示偵測距離為15
		this.tooltip_raycaster.far = 10;

		this.hover_point = new Vector2(0, 0);
		this.mouse_point = new Vector2();
	}

	updateTooltipRayCast(raycast_objects: Object3D[] = []) {
		if (raycast_objects.length) {
			this.tooltip_raycaster.setFromCamera(this.hover_point, this.camera);
			const intersects = this.tooltip_raycaster.intersectObjects(raycast_objects);
			if (intersects.length && intersects[0].object.userData.hint) {
				// console.log("intersects", intersects[0].object.userData.title);
				this.emitter.$emit(ON_SHOW_TOOLTIP, { msg: intersects[0].object.userData.title, tips:intersects[0].object.userData.tips });
			} else {
				this.emitter.$emit(ON_HIDE_TOOLTIP);
			}
		}
	}

	bindClickRayCastObj(raycast_objects: Object3D[] = []) {
		let down_x = 0;
		let down_y = 0;

		document.body.addEventListener("pointerdown", (event) => {
			down_x = event.screenX;
			down_y = event.screenY;
		});

		document.body.addEventListener("pointerup", (event) => {
			const offset_x = Math.abs(event.screenX - down_x);
			const offset_y = Math.abs(event.screenY - down_y);
			// 点击偏移量限制
			if (offset_x <= 1 && offset_y <= 1 && event.target instanceof HTMLCanvasElement) {
				this.mouse_point.x = (event.clientX / window.innerWidth) * 2 - 1;
				this.mouse_point.y = -((event.clientY / window.innerHeight) * 2 - 1);

				this.click_raycaster.setFromCamera(this.mouse_point, this.camera);
				const intersects = this.click_raycaster.intersectObjects(raycast_objects);
				if (intersects.length > 0) {
					// 點擊事件檢測到了物件
					console.log("點擊事件檢測到了物件", intersects[0]);
					// console.log(intersects[0].object);
					if(intersects[0].object.userData.show_boards) {
						this.emitter.$emit(ON_CLICK_RAY_CAST, intersects[0].object.userData);
					}
					else if(intersects[0].object.userData.map)
					this.emitter.$emit(ON_CLICK_RAY_CAST, intersects[0].object.userData.map);

					//  this.emitter.$emit(ON_CLICK_RAY_CAST, intersects[0].object);
				}
				// if (intersects.length && intersects[0].object.userData.show_boards) {
				// 	console.log("click obj", intersects[0].object);
				// 	this.emitter.$emit(ON_CLICK_RAY_CAST, intersects[0].object);
				// }
			}
		});
	}
}
