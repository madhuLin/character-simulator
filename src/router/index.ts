import { createRouter, createWebHistory } from 'vue-router'
import Plaza from "@/views/Plaza.vue";
import Entertainment from "@/views/Entertainment.vue";

const routes = [
    { path: "/", name: "plaza", component: Plaza },
    { path: "/entertainment", name: "entertainment", component: Entertainment },
    

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router