const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusMsg = document.getElementById("statusMsg");
const currentCard = document.getElementById("currentCard");
const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const windEl = document.getElementById("wind");
const conditionEl = document.getElementById("condition");
const forecastBody = document.getElementById("forecastBody");

// ============================================================
// TASK 1 — WEATHER CODE DESCRIPTION
// ============================================================

// TODO:
// Complete this function to convert an Open-Meteo WMO weather
// code into a human-readable weather description.
//
// Required mappings:
//
// 0                → "Clear sky"
// 1 to 3           → "Partly cloudy"
// 45 or 48         → "Fog"
// 51 to 57         → "Drizzle"
// 61 to 67         → "Rain"
// 71 to 77         → "Snow"
// 80 to 82         → "Rain showers"
// 95 to 99         → "Thunderstorm"
// Any other code   → "Unknown"
//
// Return the appropriate description.
//
function describeWeatherCode(code) {
  if (code === 0) return "Clear sky";
  if (code >= 1 && code <= 3) return "Partly cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
}

// ============================================================
// TASK 2 — STATUS MESSAGE
// ============================================================

// TODO:
// Complete this function.
//
// The function should:
// 1. Display the supplied message inside the element
//    represented by statusMsg.
// 2. Add the "error" class when isError is true.
// 3. Remove the "error" class when isError is false.
//
function setStatus(message, isError = false) {
  statusMsg.textContent = message;
  statusMsg.classList.toggle("error", isError);
}

// ============================================================
// API FUNCTION 1 — GEOCODING
// ============================================================

// This function is provided.
// DO NOT MODIFY the API URL or the fetch logic.
//
// It converts a city name into latitude and longitude.

async function geocodeCity(city) {
const url =
`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

const res = await fetch(url);

if (!res.ok) {
throw new Error("Geocoding request failed");
}

const data = await res.json();

if (!data.results || data.results.length === 0) {
throw new Error("City not found — try another name.");
}

return data.results[0];
}

// ============================================================
// API FUNCTION 2 — WEATHER FORECAST
// ============================================================

// This function is provided.
// DO NOT MODIFY the API URL or fetch logic.
//
// It retrieves:
// - Current weather
// - Daily weather code
// - Maximum temperature
// - Minimum temperature
// - Precipitation
//
// The API uses the coordinates obtained from geocodeCity().

async function fetchForecast(lat, lon) {
const url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
`&current_weather=true` +
`&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
`&timezone=auto`;

const res = await fetch(url);

if (!res.ok) {
throw new Error("Forecast request failed");
}

return res.json();
}

// ============================================================
// TASK 3 — DISPLAY CURRENT WEATHER
// ============================================================

// TODO:
// Complete this function to display the current weather.
//
// Requirements:
//
// 1. Get the current weather object from:
//      weatherData.current_weather
//
// 2. Display the city name and country in cityNameEl.
//    Example:
//      Colombo, Sri Lanka
//
// 3. Display the temperature in tempEl.
//    Format:
//      30 °C
//
// 4. Display the wind speed in windEl.
//    Format:
//      12 km/h
//
// 5. Convert the weather code into a description using
//    describeWeatherCode() and display it in conditionEl.
//
// 6. Remove the "hidden" class from currentCard so that
//    the current weather section becomes visible.
//
function renderCurrentWeather(place, weatherData) {
  const current = weatherData.current_weather;

  if (!current) {
    return;
  }

  const locationLabel = place.country ? `${place.name}, ${place.country}` : place.name;
  cityNameEl.textContent = locationLabel;
  tempEl.textContent = `${Math.round(current.temperature)} °C`;
  windEl.textContent = `${Math.round(current.windspeed)} km/h`;
  conditionEl.textContent = describeWeatherCode(current.weathercode);
  currentCard.classList.remove("hidden");
}

// ============================================================
// TASK 4 — CREATE THE FORECAST TABLE
// ============================================================

// TODO:
// Complete this function to display the 5-day forecast.
//
// Requirements:
//
// 1. Clear any existing rows from forecastBody.
//
// 2. Loop through daily.time.
//
// 3. For each day:
//    - Create a <tr> element.
//    - Create/display the date.
//    - Display the weather condition.
//    - Display maximum temperature.
//    - Display minimum temperature.
//    - Display precipitation.
//
// 4. Use describeWeatherCode() to convert the weather code
//    into a readable condition.
//
// 5. Add the completed row to forecastBody.
//
// Hint:
//
// You can use:
//   document.createElement("tr")
//   row.innerHTML
//   forecastBody.appendChild(row)
//
// Data available:
//
//   daily.time
//   daily.weathercode
//   daily.temperature_2m_max
//   daily.temperature_2m_min
//   daily.precipitation_sum
//
function renderForecastTable(daily) {
  forecastBody.innerHTML = "";

  const dates = daily.time || [];
  const codes = daily.weathercode || [];
  const highs = daily.temperature_2m_max || [];
  const lows = daily.temperature_2m_min || [];
  const precip = daily.precipitation_sum || [];

  dates.forEach((dateString, index) => {
    const row = document.createElement("tr");
    const precipitationValue = Number(precip[index] ?? 0);

    if (precipitationValue > 0) {
      row.classList.add("rainy");
    }

    const dayLabel = new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    row.innerHTML = `
      <td>${dayLabel}</td>
      <td>${describeWeatherCode(codes[index])}</td>
      <td>${Math.round(highs[index])} °C</td>
      <td>${Math.round(lows[index])} °C</td>
      <td>${precipitationValue.toFixed(1)} mm</td>
    `;

    forecastBody.appendChild(row);
  });
}

// ============================================================
// TASK 5 — HANDLE SEARCH
// ============================================================

async function handleSearch() {
  const city = cityInput.value.trim();

  if (!city) {
    setStatus("Please type a city name.", true);
    return;
  }

  currentCard.classList.add("hidden");
  forecastBody.innerHTML = "";
  setStatus("Loading…");

  try {
    const place = await geocodeCity(city);
    const weatherData = await fetchForecast(place.latitude, place.longitude);

    renderCurrentWeather(place, weatherData);
    renderForecastTable(weatherData.daily);
    setStatus("");
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", true);
  }
}

// ============================================================
// TASK 6 — SEARCH BUTTON EVENT
// ============================================================

searchBtn.addEventListener("click", handleSearch);

// ============================================================
// TASK 7 — ENTER KEY SUPPORT
// ============================================================

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
});

// ============================================================
// STRETCH GOAL — HIGHLIGHT RAINY DAYS
// ============================================================

// Rainy rows are marked in renderForecastTable when precipitation is greater than 0.
