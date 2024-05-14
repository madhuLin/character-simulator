import mitt from "mitt";

export default class Emitter {
	private emitter_instance: ReturnType<typeof mitt>;

	constructor() {
		this.emitter_instance = mitt();
	}
	//註冊事件監聽器
	$on(name: string, handler: (...args: any[]) => void) {
		this.emitter_instance.on(name, handler);
	}
	//用於觸發特定事件
	$emit(name: string, ...args: any[]) {
		this.emitter_instance.emit(name, args);
	}
	//取消註冊事件監聽器
	$off(name: string, handler?: (...args: any[]) => void) {
		this.emitter_instance.off(name, handler);
	}
}
