// Selecting DOM elements
const weatherCardsContainer = $(".forecast-display");
const currentWeatherContainer = $(".current-weather-container");

// OpenWeatherMap API key
const API_KEY = "393609ac7b2e5f25ccdd00e626ee13dd";

// Function to format current weather data
const getCurrentData = function (name, forecastData) {
  return {
    name: name,
    temperature: forecastData.current.temp,
    wind: forecastData.current.wind_speed,
    humidity: forecastData.current.humidity,
    uvi: forecastData.current.uvi,
    date: getFormattedDate(forecastData.current.dt, "ddd DD/MM/YYYY HH:mm"),
    iconCode: forecastData.current.weather[0].icon,
  };
};

// Function to format date
const getFormattedDate = function (unixTimestamp, format = "DD/MM/YYYY") {
  return moment.unix(unixTimestamp).format(format);
};

// Function to format forecast weather data
const getForecastData = function (forecastData) {
  const callback = function (each) {
    return {
      date: getFormattedDate(each.dt),
      temperature: each.temp.max,
      wind: each.wind_speed,
      humidity: each.humidity,
      iconCode: each.weather[0].icon,
    };
  };

  return forecastData.daily.slice(1, 6).map(callback);
};

// Function to fetch weather data from OpenWeatherMap API
const getWeatherData = async (cityName) => {
  // Fetch current weather data
  const currentDataUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
  const currentDataResponse = await fetch(currentDataUrl);
  const currentData = await currentDataResponse.json();

  // Extract latitude, longitude, and city name
  const lat = currentData.coord.lat;
  const lon = currentData.coord.lon;
  const name = currentData.name;

  // Fetch forecast weather data
  const forecastDataUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
  const forecastDataResponse = await fetch(forecastDataUrl);
  const forecastData = await forecastDataResponse.json();

  // Format current and forecast weather data
  const current = getCurrentData(name, forecastData);
  const forecast = getForecastData(forecastData);

  return {
    current: current,
    forecast: forecast,
  };
};


const getUVIClassName = function (uvi) {
  if (uvi >= 0 && uvi < 3) {
    return "btn-success";
  } else if (uvi >= 3 && uvi < 6) {
    return "btn-warning";
  } else if (uvi >= 6 && uvi < 8) {
    return "btn-danger";
  } else {
    return "btn-dark";
  }
};

// Function to store recent cities in local storage
const setCitiesInLS = function (cityName) {
  // Retrieve cities from local storage
  const cities = JSON.parse(localStorage.getItem("recentCities")) ?? [];

  // Add city to the list if not already present
  if (!cities.includes(cityName)) {
    cities.push(cityName);
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
};

// Function to render current weather card
const renderCurrentWeatherCard = function (currentData) {
  const currentWeatherCard = `<div class="current-weather">
          <div class="city">
            <h2>
              ${currentData.name} ${currentData.date}
            </h2>
          </div>
          <div class="temperature">
            Temperature: ${currentData.temperature}&deg;F
          </div>
          <img
            class="img-icon"
            src="https://openweathermap.org/img/w/${currentData.iconCode}.png"
          />
          <div class="weather-info">Sunny</div>
          <div class="humidity">Humidity: ${currentData.humidity}%</div>
          <div class="wind">Wind-Speed:${currentData.wind} MPH</div>
          <div class="uv-index">UV-Index: <span class="btn ${getUVIClassName(
            currentData.uvi
          )}">${currentData.uvi}</span></div>
          </div>`;

  // Append current weather card to container
  currentWeatherContainer.append(currentWeatherCard);
};

// Function to render forecast weather cards
const renderForecastWeatherCards = function (forecastData) {
  const constructForecastCard = function (each) {
    return `<div class="forecast-card">
    <div class="date">${each.date}</div>
    <div class="temperature">Temperature: ${each.temperature}&deg;F</div>
    <img src="https://openweathermap.org/img/w/${each.iconCode}.png" />
    <div class="weather-info">Sunny</div>
    <div class="humidity">Humidity: ${each.humidity}</div>
    <div class="wind">Wind-Speed: ${each.wind} MPH</div>
    <div class="uv-index">UV-Index: Moderate</div>
  </div>`;
  };

  
  const forecastCards = forecastData.map(constructForecastCard).join("");

  // Append forecast cards container to main container
  const forecastCardsContainer = `<div class="bg-white border">
    <div
        class="m-3 d-flex flex-wrap justify-content-around"
        id=""
    >${forecastCards}</div>
    </div>`;

  weatherCardsContainer.append(forecastCardsContainer);
};

// Function to render weather cards
const renderWeatherCards = function (weatherData) {
  renderCurrentWeatherCard(weatherData.current);
  renderForecastWeatherCards(weatherData.forecast);
};


