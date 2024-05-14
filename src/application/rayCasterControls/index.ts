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
		// 通过click点击检测距离为18
		// this.click_raycaster.far = 18;
		this.click_raycaster.far = 8;

		this.tooltip_raycaster = new Raycaster();
		// tooltip显示检测距离为15
		this.tooltip_raycaster.far = 5;

		this.hover_point = new Vector2(0, 0);
		this.mouse_point = new Vector2();
	}

	updateTooltipRayCast(raycast_objects: Object3D[] = []) {
		if (raycast_objects.length) {
			this.tooltip_raycaster.setFromCamera(this.hover_point, this.camera);
			const intersects = this.tooltip_raycaster.intersectObjects(raycast_objects);
			if (intersects.length && intersects[0].object.userData.title) {
				this.emitter.$emit(ON_SHOW_TOOLTIP, { msg: intersects[0].object.userData.title, show_preview_tips: !!intersects[0].object.userData.show_boards });
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
			// console.log("click");
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
					console.log("點擊事件檢測到了物件", intersects[0].object.userData.mode);
					console.log(intersects[0].object);
					this.emitter.$emit(ON_CLICK_RAY_CAST, intersects[0].object);

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
