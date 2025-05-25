 📦 Setup & Installation

 **Clone the repository:**
   ```bash
   git clone https://github.com/Mu3azios/weather-app.git

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Add your API key: ## important

-- Create a file in the root directory and name it ".env" and add this line:
VITE_OPENWEATHER_API_KEY=your_api_key_here

### Preferred browser: Chrome or Edge (Firefox may not cause an issue in retrieving location)




# 🌦️ Weather App

-A modern weather application built with **Vue 3**, **TypeScript**, and **Pinia**, powered by the **OpenWeather API** and **Geolocation API**. It provides real-time weather data, -forecasts, and a clean, responsive UI with dynamic visuals.

---

## 🔌 APIs Used

### 🌐 [Geolocation API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- Retrieves the user's current geographical coordinates.
- Used to get weather based on real-time location.

### ☁️ [OpenWeatherMap API](https://openweathermap.org/api)
- **Search by City Name**: Fetches weather data for a specific city.
- **Reverse Geocoding**: Converts coordinates into a human-readable city name.
- **Current Weather Data**: Updates and displays weather for saved cities on the home page.
- **One Call API**: Provides extended data including:
  - Hourly forecast
  - 7-day forecast
  - UV index, humidity, and more

---

## 🗂️ Project Structure

src/ ├── assets/ # Images, icons, and background photos
 ├── components/ # Reusable Vue components and their styles 
 ├── stores/
    │ 
    ├── weatherStore # Manages all weather-related states and functions 
    │
    └── toastStore # Handles toast notifications for user feedback 
 ├── views/ # View-level components like HomeView and WeatherDetails
 ├── composable/ # reusable Api fetching function

## 🚀 Features

### 🏠 Home Page
- Displays weather cards for saved cities.
- Dynamic backgrounds change based on:
  - Weather conditions (e.g., sunny, cloudy, rainy)
  - Time of day (day/night mode)
- Clickable cards lead to detailed forecast view.

### 📍 My Location Support
- Typing anything in the search bar shows a **"My Location"** option at the top.
- Automatically fetches weather using device's current location.
- Represented with a unique icon and appears before city search results.

### 📊 Detailed Forecast
- Displays:
  - Hourly forecast for the day
  - 7-day forecast
  - Sunrise & sunset times
  - Weather metrics like "feels like", UV index, humidity, etc.
- Background and UI colors adapt to the time of day and weather conditions.

### 💾 Saved Cities
- Searched cities are stored in `localStorage`.
- Cities remain visible after refreshing or reopening the app.

### 🔔 Toast Notifications
- Shows feedback for:
  - Successful actions (e.g., city added)
  - Account details submission

---
