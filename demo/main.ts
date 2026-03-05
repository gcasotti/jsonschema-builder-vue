import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import Tooltip from "primevue/tooltip";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./index.css";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: () => import("./pages/Index.vue"),
        },
        {
            path: "/:pathMatch(.*)*",
            component: () => import("./pages/NotFound.vue"),
        },
    ],
});

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
    },
});
app.directive("tooltip", Tooltip);
app.use(router);
app.mount("#app");
