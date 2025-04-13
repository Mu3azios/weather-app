// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

import ToastService from "primevue/toastservice";
import VueTelInput from "vue-tel-input";


import ToastPlugin from 'vue-toast-notification';
// Import one of the available themes
//import 'vue-toast-notification/dist/theme-default.css';
import 'vue-toast-notification/dist/theme-bootstrap.css';

import 'primeicons/primeicons.css';

import "./assets/main.css";
import "vue-tel-input/vue-tel-input.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(ToastService);
app.use(ToastPlugin);
app.use(VueTelInput, {
  mode: "international",
  defaultCountry: "", // Explicitly set empty default
  autoDefaultCountry: false, // Disable auto-detection
  dropdownOptions: {
    showDialCodeInList: true,
    showSearchBox: true,
    searchBoxPlaceholder: "Search Your Country Code",
  },
});

app.mount("#app");
