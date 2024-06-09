<template>
    <div class="boards-info" :style="{ visibility: isBoardsInfoVisible ? 'visible' : 'hidden' }">
        <div class="boards-container" :class="{ hide: isBoardsContainerHidden }">
            <div class="content">
                <section class="info">
                    <div class="title">{{ boardInfo.title }}</div>
                    <div class="author">{{ boardInfo.author }}</div>
                    <div class="describe" v-html="boardInfo.describe"></div>
                </section>
                <section class="img">
                    <!-- <img :src="boardInfo.img_src" alt=""> -->
                    <img :src="boardInfo.img_src" alt="Board Image">
                </section>
            </div>
            <div class="close boards-info-close" @click="hideBoardsBox"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

const isBoardsInfoVisible = ref(false);
const isBoardsContainerHidden = ref(true);
let boardInfo = reactive({
    title: '',
    author: '',
    describe: '',
    img_src: ''
});

const showBoardsBox = (title: string, author: string, describe: string, img_src: string) => {
    if (isBoardsInfoVisible.value) return;
    isBoardsInfoVisible.value = true;
    isBoardsContainerHidden.value = false;
    boardInfo.title = title;
    boardInfo.author = author;
    boardInfo.describe = describe;
    boardInfo.img_src = img_src;
    console.log(img_src);
};

const hideBoardsBox = () => {
    isBoardsInfoVisible.value = false;
    isBoardsContainerHidden.value = true;
    boardInfo.title = '';
    boardInfo.author = '';
    boardInfo.describe = '';
    boardInfo.img_src = '';
};

defineExpose({showBoardsBox});

</script>

<style scoped>
.boards-info {
    user-select: none;
    position: fixed;
    z-index: 99999;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
}

.boards-info .boards-container {
    position: relative;
    width: 80%;
    height: 70%;
    background: #000;
    padding: 60px 40px 40px;
    border-radius: 20px;
    transition: opacity .5s;
}

.boards-info .boards-container .content {
    width: 100%;
    height: 100%;
    display: flex;
    column-gap: 20px;
}

.boards-info .boards-container .close {
    position: absolute;
    right: 12px;
    top: 12px;
    cursor: pointer;
    text-align: center;
    width: 22px;
    height: 22px;
    line-height: 15px;
    border: 2px solid #fff;
    border-radius: 50%;
    -webkit-tap-highlight-color: transparent;
}

.boards-info .boards-container .close::after {
    content: "x";
    font-size: 18px;
}

.boards-info .boards-container .info {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.boards-info .boards-container .info .title {
    font-size: 24px;
}

.boards-info .boards-container .info .author,
.boards-info .boards-container .info .describe {
    margin-top: 20px;
    line-height: 30px;
}

.boards-info .boards-container .img {
    flex: 1;
    overflow: hidden;
}

.boards-info .boards-container .img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

@media screen and (max-width: 960px) {
    .boards-info .boards-container {
        width: 65%;
        height: 85%;
    }

    .boards-info .boards-container .content {
        flex-direction: column;
        column-gap: 0;
        overflow-y: scroll;
    }

    .boards-info .boards-container .info {
        margin-top: 20px;
        width: 100%;
        height: auto;
        order: 2;
    }

    .boards-info .boards-container .img {
        overflow: initial;
        order: 1;
    }

    .boards-info .boards-container .img img {
        height: auto;
        object-fit: initial;
    }
}
</style>