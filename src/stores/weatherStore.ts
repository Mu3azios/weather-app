import { defineStore } from "pinia";
import { ref } from "vue";
import en from "i18n-iso-countries/langs/en.json";
import countries from "i18n-iso-countries";
countries.registerLocale(en);

export interface SavedCities {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  isMyLocation:boolean;
  temp: number;
  temp_max: number;
  temp_min: number;
  weatherDescription: string;
  sunset:number;
  sunrise:number;
  timezone:number;
  timezone_offset:number;
  dt:number;
  dayOrNight:string;
  backgroundImage:string
}

export const useWeatherStore = defineStore("weather", () => {
  const savedCities = ref<SavedCities[]>([]);

  const isLoading = ref(false);
  const errorMessage = ref("");

  const geoLocation = ref<GeoLocation>({
    latitude: null,
    longitude: null,
  });

  const currentDayOrNight = ref<string>("Day"); // Default to "Day"


  const getCurrentLocation = (): void => {
    if ("geolocation" in navigator) {
      isLoading.value = true;
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          geoLocation.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          isLoading.value = false;
        },
        (error: GeolocationPositionError) => {
          isLoading.value = false;
          errorMessage.value = `Error: ${error.message}`;
          console.error(errorMessage.value);
        }
      );
    } else {
      errorMessage.value = "Geolocation is not supported by your browser.";
      console.error(errorMessage.value);
    }
  };


 const isMyCity = ( lat: number, lon: number): boolean => {
  const latDiff = Math.abs(lat - geoLocation.value.latitude);
  const lonDiff = Math.abs(lon - geoLocation.value.longitude);
  return latDiff <= 0.01 && lonDiff <=0.01; // ~1.1 km tolerance
};
  // ✅ Get country name from ISO code
  const getCountryName = (countryCode: string): string => {
    return countries.getName(countryCode, "en", { select: "official" }) || countryCode;
  };

  //  Format time for display
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  //  Helper: Calculate "Day" or "Night" based on sunrise/sunset
  const getDayOrNight = (sunrise: number, sunset: number): string => {
    const currentUtcTime = Math.floor((new Date()).getTime() / 1000);
    const dayOrNight = currentUtcTime >= sunrise && currentUtcTime <= sunset ? "Day" : "Night";
    currentDayOrNight.value = dayOrNight; // Update the reactive state
    return dayOrNight;
  };

 // Helper: Determine background image based on description + time
  const getBackgroundImage = (description: string, time: string): string => {

    const desc = description.toLowerCase();
    const timeOfDay = time || "Day";

    if (desc.includes("thunder")) return `thunder${timeOfDay}.jpg`;
    if (desc.includes("snow")) return `snow${timeOfDay}.jpg`;
    if (desc.includes("rain")) return `rain${timeOfDay}.jpg`;
    if (desc.includes("cloud")) return `clouds${timeOfDay}.jpg`;
    return `clear${timeOfDay}.jpg`;
  };


  const loadCities = () => {
    const saved = localStorage.getItem("savedCities");
    if (saved) {
      const parsed: SavedCities[] = JSON.parse(saved);
      savedCities.value = parsed;
    }
  };




  return {
    currentDayOrNight,
    geoLocation,
    isLoading,
    errorMessage,
    getCurrentLocation,
    isMyCity,
    getDayOrNight,
    getBackgroundImage,
    getCountryName,
    savedCities,
    loadCities,
    formatTime,
  };
});
