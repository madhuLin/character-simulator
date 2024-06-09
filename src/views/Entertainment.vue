<template>
    <div id="webgl"></div>

    <nes-game-dialog ref="game_dialog_ref" @on-close-dialog="onCloseNesGameDialog" />

    <notify-tips ref="notify_ref" />

    <load-progress v-model="percentage" :text="loading_text" @on-enter="onEnterApp" />

    <Tool v-if="isToolVisible" @effetParams="handleToolCompleted" @close="() => isToolVisible = false"></Tool>
    <PreviewTooltip ref="c1" />
</template>

<script setup lang="ts">
import LoadProgress from "@/components/LoadProgress.vue";
import NesGameDialog from "@/components/NesGameDialog.vue";
import NotifyTips from "@/components/NotifyTips.vue";
import Core from "@/application/core";
import { onMounted, ref } from "vue";
import {
    ON_INTERSECT_TRIGGER, ON_INTERSECT_TRIGGER_STOP, ON_KEY_DOWN, ON_LOAD_PROGRESS,
    ON_IN_PORTAL, ON_SHOW_TOOLTIP, ON_HIDE_TOOLTIP
} from "@/application/Constants";
import type { InteractionMesh } from "@/application/interactionDetection/types";
import { PointerLockControls } from "three-stdlib";
const notify_ref = ref<InstanceType<typeof NotifyTips>>();
const game_dialog_ref = ref<InstanceType<typeof NesGameDialog>>();

import router from "@/router";
import { useStore } from '@/store/index';
const store = useStore();
import PreviewTooltip from '@/components/PreviewTooltip.vue';
// 引用子组件
const c1 = ref();
const showToolTip = (eventData: any) => {
    eventData = eventData[0];
    c1.value?.showPreviewTooltip(eventData.msg, eventData.tips);
};
import Tool from "@/components/Tool.vue";



// 工具相關
const isToolVisible = ref<boolean>(false);

const toggleToolVisibility = () => {
    isToolVisible.value = !isToolVisible.value;
    // event.preventDefault(); // 防止 Tab 鍵的默認行為
};

// 定義工具攔事件處理方法
const handleToolCompleted = (value: { timeOfDay: string, weather: string, mode: string, speed: number, music: string }) => {
    isToolVisible.value = false;
    //設定時間
    if (value.timeOfDay == "morning") {
        core!.world.environment.setTime("morning");
    }
    else if (value.timeOfDay == "afternoon") {
        core!.world.environment.setTime("afternoon");
    }
    else if (value.timeOfDay == "night") {
        core!.world.environment.setTime("night");
    }
    //設定天氣
    if (value.weather == "sunny") {
        core!.world.environment.setWeather("sunny");
    }
    else if (value.weather == "rainy") {
        core!.world.environment.setWeather("rainy");
    }
    else if (value.weather == "snowy") {
        core!.world.environment.setWeather("snowy");
    }

    //設定角色模式
    if(value.mode == "walk") {
        core!.world.character.setMode("walk");
    }
    else if(value.mode == "fly") {
        core!.world.character.setMode("fly");
    }
    //設定速度
    if(value.speed) {
        core!.world.character.setSpeed(value.speed);
    }

    //設定音樂
    if(value.music) {
        // console.log("value.music", value.music);
        core!.world.audio.setAudioUrl(value.music);
    }        
};

// 加載相關
const percentage = ref(0);
const loading_text = ref("加载中...");

let core: Core | undefined = undefined;

/*
* 触发场景交互提示
* */
const onIntersectTrigger = ([user_data]: [user_date: InteractionMesh["userData"]]) => {
    notify_ref.value!.openNotify(user_data.title!);
};

/*
* 結束場景交互提示
* */
const onIntersectTriggerStop = () => {
    notify_ref.value!.closeNotify();
};

//鍵盤事件
const onKeyDown = ([key]: [key: string]) => {
    if (core) {
        if (key === "KeyF") {
            const intersect = core.world.interaction_detection.getIntersectObj();
            if (intersect) {
                handleInteraction(intersect);
            }
        }
        if (key === "KeyT") {
            toggleToolVisibility();
        }

    }
};

/*
* 处理不同交互盒子的交互事件
* */
const handleInteraction = (intersect: InteractionMesh) => {
    if (!core) return;

    switch (intersect.userData.type) {
        case "game":
            // 处于nes游戏交互中，需禁用core.control中的按键触发，避免持续驱动character更新
            core.control.disabled();
            // 重置按键状态，防止键盘某个键锁死，持续驱动character更新
            core.control.resetStatus();
            // 进入游戏交互中后，关闭交互检测，优化性能
            core.world.interaction_detection.disableDetection();
            game_dialog_ref.value!.openDialog(intersect.userData.title!, intersect.userData.url!);
            break;
        case "music":
            core.world.audio.togglePlayAudio();
            break;
    }
};

const onCloseNesGameDialog = () => {
    if (core) {
        core.control.enabled();
        core.world.interaction_detection.enableDetection();
    }
};

const onLoadProgress = ([{ url, loaded, total }]: [{ url: string, loaded: number, total: number }]) => {
    percentage.value = +(loaded / total * 100).toFixed(2);
    if (/.*\.(blob|glb|fbx)$/i.test(url)) {
        loading_text.value = "加载模型中...";
    }
    if (url.includes("wasm")) {
        loading_text.value = "加载wasm中...";
    }
    if (/.*\.(jpg|png|jpeg)$/i.test(url)) {
        loading_text.value = "加载图片素材中...";
    }
    if (/.*\.(m4a|mp3)$/i.test(url)) {
        loading_text.value = "加载声音资源中...";
    }
};

const onEnterApp = () => {
    if (core) {
        // 進入時才能控制角色
        core.control.enabled();
        if (core.controls instanceof PointerLockControls) {
            core.controls.lock();
        }

        // 場景模型載入完畢後將場景中需要光線投射偵測的物件傳入給rayCasterControls
        core.world.ray_caster_controls.bindClickRayCastObj(core.world.environment.raycast_objects);
        // 音訊自動播放受限於網頁的初始化交互，因此進入後播放即可
        core.world.audio.playAudio();
        // 登出應用程式載入監聽事件
        core.emitter.$off(ON_LOAD_PROGRESS);
    }
};

const onJumpScene = () => {
    // TODO: 跳转场景逻辑
    // console.log("jump scene");
    router.push("/");
};

onMounted(() => {
    core = new Core("Entertainment");
    core.render();

    core.emitter.$on(ON_INTERSECT_TRIGGER, onIntersectTrigger);
    core.emitter.$on(ON_INTERSECT_TRIGGER_STOP, onIntersectTriggerStop);
    core.emitter.$on(ON_KEY_DOWN, onKeyDown);
    core.emitter.$on(ON_LOAD_PROGRESS, onLoadProgress);
    core.emitter.$on(ON_IN_PORTAL, onJumpScene);
    core.emitter.$on(ON_SHOW_TOOLTIP, showToolTip);
    core.emitter.$on(ON_HIDE_TOOLTIP, c1.value?.hidePreviewTooltip);
    core.world.environment.setTime(store.selectedTimeOfDay);
    core.world.environment.setWeather(store.selectedWeather);
    core.world.character.setMode(store.selectedCharacterMode);
    core.world.character.setSpeed(Number(store.selectedSpeed));
});
</script>

<style scoped>
#webgl {
    width: 100%;
    height: 100%;

}
</style>