<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import debounce from "lodash/debounce";
import { useWeatherStore } from "../../src/stores/weatherStore";
import "../components/styles/HomeViewStyle.css";
import "../components/styles/Loader.css";
import { useApi } from "../composable/useApi";

interface CitySearchResults {
  city: {
    name: string;
    state?: string;
    country: string;
  };
}
export default defineComponent({
  name: "HomeView",
  setup() {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const weatherStore = useWeatherStore();
    const router = useRouter();
    const weatherCardRef = ref<HTMLElement | null>(null);

    const selectedCity = ref<any>({});

    const isSearchFocused = ref(false);

    const citySearchResults = ref<any[]>([]);

    const highlightedIndex = ref(-1);
    const cityName = ref("");

    const myCurrentLocation = ref({});

    //-------------------------------------------------------------------------------------------------------------------------------------------

    const showMyLocation = async () => {
      if (!weatherStore.geoLocation.latitude || !weatherStore.geoLocation.longitude) {
        console.log("No geoLocation in store");
        return null;
      }

      const { data, error } = await useApi<any[]>(
        "https://api.openweathermap.org/geo/1.0/reverse",
        {
          lat: weatherStore.geoLocation.latitude,
          lon: weatherStore.geoLocation.longitude,
          limit: 1,
          appid: apiKey,
        }
      );
      console.log("my location data", data);
      if (error) {
        console.error("Error fetching current location:", error);
        myCurrentLocation.value = "Error fetching location";
        return null;
      }

      if (data && data.length > 0) {
        const myCity = data[0];
        myCurrentLocation.value = myCity;
        return myCity;
      }

      myCurrentLocation.value = "City not found";
      return null;
    };

    //-------------------------------------------------------------------------------------------------------------------------------------------

    //-------------------------------------------------------------------------------------------------------------------------------------------
    const debouncedSearchCities = debounce(async () => {
      if (!cityName.value.trim()) {
        citySearchResults.value = [];
        return;
      }

      const { data, error } = await useApi<CitySearchResults[]>(
        "https://api.openweathermap.org/geo/1.0/direct",
        {
          q: cityName.value,
          limit: 5,
          appid: apiKey,
        }
      );

      if (error) {
        console.error("Error in geocode API:", error);
        weatherStore.errorMessage = "Failed to search for cities";
        return;
      }

      citySearchResults.value = data || [];
      console.log("this is search result", citySearchResults.value);
    });

    //-------------------------------------------------------------------------------------------------------------------------------------------

    const handleKeyNavigation = (event: KeyboardEvent) => {
      const total = citySearchResults.value.length;
      if (!total) return;

      const hasMyLocation = !!myCurrentLocation.value;
      const offset = hasMyLocation ? 1 : 0;
      const totalItems = total + offset;

      switch (event.key) {
        case "ArrowDown":
          highlightedIndex.value = (highlightedIndex.value + 1) % totalItems;
          event.preventDefault();
          break;
        case "ArrowUp":
          highlightedIndex.value = (highlightedIndex.value - 1 + totalItems) % totalItems;
          event.preventDefault();
          break;
        case "Enter":
          if (highlightedIndex.value !== -1) {
            if (highlightedIndex.value === 0 && hasMyLocation) {
              viewDetails(myCurrentLocation.value);
            } else {
              const cityIndex = highlightedIndex.value - offset;
              viewDetails(citySearchResults.value[cityIndex]);
            }
          }
          break;
        case "Escape":
          citySearchResults.value = [];
          highlightedIndex.value = -1;
          cityName.value = "";
          break;
      }
    };

    //-------------------------------------------------------------------------------------------------------------------------------------------
    const clearSearch = () => {
      cityName.value = "";
      citySearchResults.value = [];
      isSearchFocused.value = false;
      debouncedSearchCities.cancel(); // Cancel any pending searches
    };

    //-------------------------------------------------------------------------------------------------------------------------------------------

    const getCurrentWeather = async (lat: number, lon: number) => {
      const { data, error } = await useApi<any>("https://api.openweathermap.org/data/2.5/weather", {
        lat,
        lon,
        appid: apiKey,
        units: "metric",
        lang: "en",
      });

      if (error) {
        console.error("Error fetching weather data:", error);
        weatherStore.errorMessage = "Failed to fetch current weather";
        return null;
      }

      // console.log("Current weather:", data);
      return data;
    };
    //-------------------------------------------------------------------------------------------------------------------------------------------

    const viewDetails = (city: any): void => {
      debouncedSearchCities.flush(); // to clear pending search

      selectedCity.value = city;
      highlightedIndex.value = -1;
      citySearchResults.value = [];
      localStorage.setItem("selectedCity", JSON.stringify(city));
      router.push({ name: "WeatherDetails" });
    };

    const viewAccount = (): void => {
      router.push({ name: "AccountDetails" });
    };

    function getLocalTime(timezoneOffset: number): string {
      const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
      const localTime = new Date(nowUTC.getTime() + timezoneOffset * 1000);

      return localTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    //------------------------------------------------------------------------------------------
    const displayCities = async () => {

      if (Array.isArray(weatherStore.savedCities)) {
        const updatedCities = await Promise.all(
          weatherStore.savedCities.map(async (city) => {
            try {
              const weatherData = await getCurrentWeather(city.lat, city.lon);
              if (!weatherData) return city;

              const isMyLocation = weatherStore.isMyCity(weatherData.coord.lat, weatherData.coord.lon);
              const dayOrNight = weatherStore.getDayOrNight(weatherData.sys?.sunrise,weatherData.sys?.sunset)
              const backgroundImage = weatherStore.getBackgroundImage(weatherData.weather?.[0]?.description,dayOrNight )

              return {
                ...city,
                isMyLocation,
                dayOrNight,
                backgroundImage,
                temp: weatherData.main?.temp,
                temp_max: weatherData.main?.temp_max,
                temp_min: weatherData.main?.temp_min,
                description: weatherData.weather?.[0]?.description || "",
                timezoneOffset: weatherData.timezone,

              };
            } catch (error) {
              console.error("Error updating city:", city.name, error);
              return city;
            }
          })
        );

        weatherStore.savedCities = updatedCities;
      }
    };

    //-------------------------------------------------------------------------------------------------------------------------------------------

    const sortedCities = computed(() => {
      const cities = [...weatherStore.savedCities]; // clone to avoid mutating store
      const myCityIndex = cities.findIndex((city) => weatherStore.isMyCity(city.lat, city.lon));

      const myCity = myCityIndex !== -1 ? cities.splice(myCityIndex, 1)[0] : null;

      // Reverse the remaining cities (newest added last = show first)
      const reversedCities = cities.reverse();

      return myCity ? [myCity, ...reversedCities] : reversedCities;
    });

    onMounted(async () => {
      await weatherStore.getCurrentLocation();
      weatherStore.loadCities();
      // wait for geolocation to be set

      await displayCities();
    });

    onUnmounted(() => {
      debouncedSearchCities.cancel();
    });

    return {
      router,
      weatherStore,
      weatherCardRef,
      showMyLocation,
      isSearchFocused,

      citySearchResults,
      cityName,
      clearSearch,
      handleKeyNavigation,
      highlightedIndex,
      getCurrentWeather,
      selectedCity,
      myCurrentLocation,
      debouncedSearchCities,
      displayCities,
      viewDetails,
      viewAccount,
      getLocalTime,
      sortedCities,
    };
  },
});
</script>

<template>
  <main  class="home-container">
    <section
      class="search-container"
      :class="{ 'has-input': cityName.length > 0, 'is-focused': isSearchFocused }"
    >
      <header  class="home-page-header">
        <h1 class="title">Weather</h1>
        <RouterLink :to="{ name: 'AccountDetails' }">
          <p class="pi pi-user" @click="viewAccount"></p>
        </RouterLink>
      </header>

      <form  class="search-wrapper">
        <i class="pi pi-search search-icon"></i>
        <input
          class="search"
          type="text"
          v-model="cityName"
          @input="debouncedSearchCities"
          @keydown="handleKeyNavigation"
          @focus="() => showMyLocation()"
          placeholder="Search for a city or airport"
        />
        <i v-if="isSearchFocused" class="pi pi-times-circle closing-icon" @click="clearSearch"></i>
      </form>

      <div v-if="citySearchResults.length" class="dropdown-menu">
        <ul>
          <li
            v-for="(city, index) in [myCurrentLocation, ...citySearchResults].filter(Boolean)"
            :key="index"
            @click="viewDetails(city)"
            class="dropdown-item clickable-span"
            :class="{
              highlighted: highlightedIndex === (myCurrentLocation ? index : index + 1 - 1),
            }"
          >
            <template v-if="myCurrentLocation && city === myCurrentLocation">
              My Location: {{ city.name }},
              {{ weatherStore.getCountryName(city.country) }}
              <i class="pi pi-map-marker"></i>
            </template>
            <template v-else>
              {{ city.name }}
              <span v-if="city.state">, {{ city.state }}</span
              >,
              {{ weatherStore.getCountryName(city.country) }}
            </template>
          </li>
        </ul>
      </div>
    </section>
    <p v-if="weatherStore.isLoading">Fetching location...</p>
    <p v-if="weatherStore.errorMessage" class="error-message">{{ weatherStore.errorMessage }}</p>

    <!-- Search results dropdown -->
    <div v-if="weatherStore.isLoading" class="loader-overlay">
      <div class="loader"></div>
    </div>
    <!-- Current weather card -->
    <section v-if="weatherStore.savedCities">
      <div
        v-for="(city, index) in sortedCities"
        :key="index"
        class="router-link"
        @click="viewDetails(city)"
      >
        <article 
          ref="weatherCardRef"
          class="weather-card"
          :style="{ backgroundImage: 'url(../src/assets/photos/' + city.backgroundImage + ')' }"
        >
          <!-- Top-left (Location) -->
          <div class="weather-item location">
            <p class="myLocationLabel" v-if="city.isMyLocation">My Location</p>
            <p class="city-name">{{ city.name }}</p>
            <p class="city-timezone" v-if="!city.isMyLocation">
              {{ getLocalTime(city.timezoneOffset) }}
            </p>
          </div>

          <!-- Top-right (Temperature) -->
          <div class="weather-item temperature">
            <p class="temperatureText">{{ city.temp ? Math.ceil(city.temp) + "°" : "—" }}</p>
          </div>

          <!-- Bottom-left (Weather Description) -->
          <div class="weather-item description">
            <p class="descriptionText">{{ city.description }}</p>
          </div>

          <!-- Bottom-right (Min/Max Temperature) -->
          <div class="weather-item minAndMax">
            <p class="minMaxText">
              H: {{ city.temp_max ? Math.ceil(city.temp_max) + "°" : "—" }} &nbsp; L:
              {{ city.temp_min ? Math.ceil(city.temp_min) + "°" : "—" }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
