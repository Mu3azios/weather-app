<template>
  <div   >
    <NotificationBar :class="notificationBarStyle"/>
    <router-view />
    <Toast position="bottom-right" group="br" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import NotificationBar from "./views/NotificationBar.vue";
import { useRoute } from "vue-router";
import Toast from 'primevue/toast';
import { useWeatherStore } from "../src/stores/weatherStore";





export default defineComponent({
  name: "App",
  components: {
    NotificationBar,
    Toast
  },
  setup() {
    const route = useRoute();
    const weatherStore = useWeatherStore();
    const notificationBarStyle = computed(() => {
      switch (route.name) {
        case "home":
          return "theme-home";
// Sets the notification bar background to synchronize with 
// the current day/night theme in WeatherDetails view
        case "WeatherDetails":
          return weatherStore.currentDayOrNight === "Day" 
            ? "theme-weather-day" 
            : "theme-weather-night";
        case "AccountDetails":
          return "theme-account";
        default:
          return "";
      }
    });

    return { notificationBarStyle };
  },
});
</script>
<style>
:root {
  --component-bg: #ffffff;
  --component-font-color: #000000;


}

.theme-home {
  --component-bg: white;
  --component-font-color: black;

}

.theme-weather-day {
  --component-bg: rgb(66, 120, 233);
  --component-font-color: white;
  border:none;

}
.theme-weather-night{
  --component-bg: rgb(14, 36, 81);
  --component-font-color: white;
  
}

.theme-account {
  --component-bg: rgb(234, 240, 255);
  --component-font-color: black;
}

/* this is to change the color of the icons since they are in png format */
.theme-home .icons img ,
.theme-account .icons img{
  filter: invert(0) grayscale(100%) brightness(100%); /* black  */
}

.theme-weather-day .icons img, 
.theme-weather-night .icons img {
 filter: invert(1) grayscale(100%) brightness(100%);  /* white  */
}


</style>
