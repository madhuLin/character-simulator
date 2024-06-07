import {createApp} from "vue";
import "nes.css/css/nes.css";
import "@/assets/main.css";
import App from "./App.vue";
import router from '@/router/';
import { createPinia } from 'pinia'

const app = createApp(App);

const pinia = createPinia();
app.use(pinia); 
app.use(router); // 使用路由

app.mount('#app');
