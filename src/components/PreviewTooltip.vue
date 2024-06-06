<template>
    <div>
        <div class="preview-tooltip" :class="{ hide: isPreviewTooltipHidden }">{{
            previewTooltipMsg }}</div>
        <div class="preview-tips" :class="{ hide: isPreviewTipsHidden }">{{ previewTips }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isPreviewTooltipHidden = ref(true);
const isPreviewTipsHidden = ref(true);
const previewTooltipMsg = ref('');
const previewTips = ref('');

const showPreviewTooltip = (msg: string, tips: string) => {
    if (previewTooltipMsg.value === msg) return;
    if (previewTips.value === tips) return;
    if (msg) isPreviewTooltipHidden.value = false;
    if (tips) isPreviewTipsHidden.value = false;
    
    previewTooltipMsg.value = msg;
    previewTips.value = tips;
};

const hidePreviewTooltip = () => {
    isPreviewTooltipHidden.value = true;
    isPreviewTipsHidden.value = true;
    previewTooltipMsg.value = '';
    previewTips.value = '';
};

defineExpose({
    showPreviewTooltip,
    hidePreviewTooltip,
});

</script>

<style scoped>
.hide {
    opacity: 0 !important;
}

.preview-tooltip {
    user-select: none;
    position: fixed;
    left: 50%;
    bottom: 15%;
    transform: translateX(-50%);
    z-index: 1;
    max-width: 260px;
    border-radius: 10px;
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    transition: opacity .5s;
}

.preview-tips {
    user-select: none;
    position: fixed;
    width: 65%;
    text-align: center;
    left: 50%;
    bottom: 1%;
    transform: translateX(-50%);
    z-index: 1;
    border-radius: 4px;
    padding: 5px 20px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    transition: opacity .5s;
}
</style>