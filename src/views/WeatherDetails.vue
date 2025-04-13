<script lang="ts">
import "primeicons/primeicons.css";
import { defineComponent, onMounted, ref, computed, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import play from "../assets/icons/play.png";
import "../components/styles/WeatherDetailsStyle.css";
import "../components/styles/Loader.css";

import { useWeatherStore } from "../../src/stores/weatherStore";

import { useToastStore } from "../../src/stores/toastStore";


export default defineComponent({
  name: "WeatherDetails",
  setup() {
    const apiKey =import.meta.env.VITE_OPENWEATHER_API_KEY;
    const weatherStore = useWeatherStore();
    const router = useRouter();

    const toast = useToastStore();

    const detailedWeatherData = ref(null);

    const errorMessage = ref("");

    const selectedCity = JSON.parse(localStorage.getItem("selectedCity") || "null");

    const getWeatherDetails = async () => {
      weatherStore.isLoading = true;
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&exclude=minutely,alerts&appid=${apiKey}`
        );
        detailedWeatherData.value = response.data;
        weatherStore.isLoading = false;
        console.log("detailed weather data", detailedWeatherData.value);
      } catch (error) {
        errorMessage.value = `Error: ${error.message}`;
        console.error(errorMessage.value);
        weatherStore.isLoading = false;
      }
    };

    const refreshData = () => {
      currentTime.value = new Date();
      getWeatherDetails(); 
    };
    const goBack = () => {
      router.push({ name: "home" });
    };
    const todayDate = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const currentTime = ref(new Date());

    const formattedTime = computed(() => {
      return currentTime.value.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    });

    const getDayTime = () => {
      if (detailedWeatherData.value && detailedWeatherData.value.current) {
        const sunrise = detailedWeatherData.value.current.sunrise;
        const sunset = detailedWeatherData.value.current.sunset;
        return weatherStore.getDayOrNight(sunrise, sunset);
      }
      return "Loading";
    };

    const saveToLocalStorage = () => {
      localStorage.setItem("savedCities", JSON.stringify(weatherStore.savedCities));
    };

    const exists = computed(() =>
      weatherStore.savedCities.some((c) => c.lat === selectedCity.lat && c.lon === selectedCity.lon)
    );

    const addCity = (): void => {
      const newCity = {
        name: selectedCity.name,
        country: selectedCity.country,
        state: selectedCity.state,
        lat: selectedCity.lat,
        lon: selectedCity.lon,
        temp: null,
        temp_max: null,
        temp_min: null,
        weatherDescription: "",
        sunset:null,
        sunrise:null,
        timezone:null,
        timezone_offset:null,
        dt:null

      };

      if (!exists.value) {
        weatherStore.savedCities.push(newCity);
        saveToLocalStorage();
        toast.success("City Saved Successfully");
      }
    };

    const removeCity = (): void => {
      weatherStore.savedCities = weatherStore.savedCities.filter(
        (fav) => !(fav.lat === selectedCity.lat && fav.lon === selectedCity.lon)
      );
      saveToLocalStorage();
      toast.success("City Deleted Successfully");
    };

   onMounted(() => {
     const stored = localStorage.getItem("savedCities");
     if (stored) {
       weatherStore.savedCities = JSON.parse(stored);
     }
     getWeatherDetails().then(() => {
       if (detailedWeatherData.value) {
         getDayTime(); 
       }
     });
   });

   watch(() => weatherStore.currentDayOrNight, (newVal) => {
  console.log("Day/Night changed:", newVal);
});


    return {
      weatherStore,

      detailedWeatherData,
      selectedCity,
      getDayTime,
     
      refreshData,
      errorMessage,
      todayDate,
      goBack,
      formattedTime,
      currentTime,
      play, //this is an icon
      addCity,
      saveToLocalStorage,
      removeCity,
      exists,
    };
  },
});
</script>
<template>
  <div class="main">
    <div v-if="weatherStore.isLoading" class="loader-overlay">
      <div class="loader"></div>
    </div>
    <!-- Current Day Section (wrapped with .background) -->
    <div :class="getDayTime() === 'Day' ? 'day-background' : 'night-background'" class="background">
      <div class="header">
        <i class="pi pi-angle-left" @click="goBack"></i>

        <p class="city-name">
          {{ selectedCity.name }}, {{ weatherStore.getCountryName(selectedCity.country) }}
        </p>

        <span v-if="exists" class="pi pi-trash" @click="removeCity"></span>
        <span v-if="!exists" class="pi pi-plus" @click="addCity"></span>
      </div>

      <div class="current-day">
        <p :style="{ fontWeight: '300' }">{{ todayDate }}</p>
      </div>
      
        <span v-if="errorMessage" class="error-message"><i class="pi pi-exclamation-circle"></i> {{ errorMessage }}</span>

        <div v-if="detailedWeatherData">
          <div class="">
            <div class="weather-overview">
              <img
                :src="`http://openweathermap.org/img/wn/${detailedWeatherData.current.weather[0].icon}@4x.png`"
                :alt="detailedWeatherData.current.weather[0].description"
              />
              <p class="overview-temp">{{ Math.ceil(detailedWeatherData.current.temp) }}°C</p>
              <p class="overview-description">
                {{ detailedWeatherData.current.weather[0].description }}
              </p>
              <p class="last-updated">
                Last Updated {{ formattedTime }}

                <i class="pi pi-refresh" @click="refreshData"></i>
              </p>
            </div>
          </div>
        </div>
   
    </div>

    <div v-if="detailedWeatherData">
      <p class="forecast-title">Hourly Forecast</p>
      <div class="hourly-forecast">
        <div
          v-for="(hour, index) in detailedWeatherData.hourly.slice(0, 12)"
          :key="index"
          class="hourly-forecast-card"
        >
          <img
            :src="`http://openweathermap.org/img/wn/${hour.weather[0].icon}.png`"
            :alt="hour.weather[0].description"
          />
          <p :style="{ fontWeight: 500 }">{{ Math.ceil(hour.temp) }}°</p>
          <p class="hourly-time">
            {{
              new Date(hour.dt * 1000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </p>
        </div>
      </div>

      <p class="forecast-title">Weekly Forecast</p>
      <div class="weekly-forecast">
        <div
          v-for="(day, index) in detailedWeatherData.daily.slice(0, 7)"
          :key="index"
          class="weekly-forecast-card"
        >
          <div class="icon-cell">
            <img
              class="weekly-icon"
              :src="`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`"
              :alt="day.weather[0].description"
            />
          </div>
          <div class="weather-description-cell">
            <p :style="{ fontWeight: 500 }">
              {{ new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: "long" }) }}
            </p>
            <p>{{ day.weather[0].main }}</p>
          </div>
          <div class="temperature-cell">
            <p :style="{ fontWeight: 500 }">{{ Math.ceil((day.temp.min + day.temp.max) / 2) }}°C</p>
            <img class="arrow" :src="play" />
          </div>
        </div>
      </div>
      <div></div>
    </div>
  </div>
</template>
