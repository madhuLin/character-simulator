<template>
    <div id="webgl"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Core from "@/application/core/inedx2";

let core: Core | undefined = undefined;
onMounted(() => {
    core = new Core("Plaza");
    core.render();
});

</script>

<style lang="less"></style>