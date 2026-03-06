import Aura from "@primevue/themes/aura";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./index.css";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || "/"),
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
