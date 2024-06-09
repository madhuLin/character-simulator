import { createRouter, createWebHistory } from 'vue-router'
import Plaza from "@/views/Plaza.vue";
import Entertainment from "@/views/Entertainment.vue";
import Playground from '@/views/Playground.vue';
import Grallery from '@/views/Grallery.vue';
const routes = [
    { path: "/", name: "plaza", component: Plaza },
    { path: "/entertainment", name: "entertainment", component: Entertainment },
    { path: "/playground", name: "playground", component: Playground },
    { path: "/grallery", name: "grallery", component: Grallery }

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router