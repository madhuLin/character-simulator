import { createRouter, createWebHistory } from 'vue-router'
import Plaza from "@/views/Plaza.vue";
import Entertainment from "@/views/Entertainment.vue";
import Tool from "@/components/Tool.vue";

const routes = [
    { path: "/", name: "plaza", component: Plaza },
    { path: "/entertainment", name: "entertainment", component: Entertainment },
    { path: "/tool", name: "tool", component: Tool }

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router