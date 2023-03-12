const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');

const grantAccessContainer = document.querySelector('.grant-location');
const searchForm = document.querySelector('.search-form-container');
const searchInput = document.querySelector("[data-searchInput]");
const loadingScreen = document.querySelector('.loading-screen-container');
const userInfoContainer = document.querySelector('.weather-info-container');
const errorMsg = document.querySelector('.error-msg');


// initially
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

let currentTab = userTab;
currentTab.classList.add('current-tab');
getfromSessionStorage();

function switchTab(clickedTab) {
    // check if the clicked tab is current active tab
    if (clickedTab != currentTab) {
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');
    
    // if search form is not active then searchTab is clicked so make the 
    // search form active
    if (!searchForm.classList.contains('active')) {
        grantAccessContainer.classList.remove('active');
        userInfoContainer.classList.remove('active');
        searchForm.classList.add('active');
        // make the search input blank
        searchInput.value = "";
    }
    else {
        // if search form is active then userTab is clicked so hide the user tab
        // and check if we have coordinates saved in localStorage to display 
        // weather
        searchForm.classList.remove('active');
        userInfoContainer.classList.remove('active');
        errorMsg.classList.remove('active');

        // check if coordinates are saved
        getfromSessionStorage();
    }
    }

}

// click on Your Weather tab
userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

// click on Search Weather tab
searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// check if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem('user-coordinates')

    // if local coordinates are not available
    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        // if local coordinates are availabe
        const coordinates = JSON.parse(localCoordinates);
        // fetch the weather info through API call using coordinates 
        fetchUserWeatherInfo(coordinates);
    }
}

// fetch weather info through api call using coordinates 
async function fetchUserWeatherInfo(coordinates) {
    let {lat, lon} = coordinates;

    // hide grant access container
    grantAccessContainer.classList.remove("active");

    // make loader visible
    loadingScreen.classList.add("active");

    // API call
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        // when fetching is successfull make the loader hidden   
        loadingScreen.classList.remove("active");

        // show weather info container
        userInfoContainer.classList.add("active");

        // render the weather info in the UI
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");

        errorMsg.classList.add("active");
    }
}

// render weather info to the UI 
function renderWeatherInfo(weatherInfo) {
    // firstly we have to fetch the elements to show on UI

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temperature]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-clouds]");

    
    // fetch values from weatherInfo element and put it in UI elements
    cityName.innerText = weatherInfo?.name; 
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`; 
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

}

// if coordinates are not stored in session storage we have to get it by 
// clicking the Grant Access button
const grantAccessButton = document.querySelector('[data-grantAccessButton]');
grantAccessButton.addEventListener("click", () => getLocation());

function getLocation() {
    // Check if geolocation is available or not
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert('No geolocation feature availabe');
    }
}

// fetch the latitude and longitude of users location
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    // store the coordinates in the session storage
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    // now fetch the weather info using coordinates available
    fetchUserWeatherInfo(userCoordinates);
}

// for search 
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if (cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);

    // make the search input blank
    searchInput.value = "";
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add('active');
    grantAccessContainer.classList.remove('active');
    userInfoContainer.classList.remove('active');
    errorMsg.classList.remove('active');

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        if (data?.cod == "404")
            throw(data);
        else {
            loadingScreen.classList.remove('active');
            userInfoContainer.classList.add('active'); 
            renderWeatherInfo(data);
        }
        
    }
    catch(e) {
        loadingScreen.classList.remove('active');
        errorMsg.classList.add('active');
    }
}
