const apiKey = "75f3db6a7759f1b9d0a0e7ef43abb567";
const cityInputEl = document.querySelector('#city-search');
const searchButtonEl = document.querySelector('#button-search');
let searchHistory = JSON.parse(localStorage.getItem('cities'));

function searchSubmitHandler(event) {
    event.preventDefault();
    const city = cityInputEl.value.trim();

    // run functions if text present
    if(city) {
        getWeatherData(city);
        saveSearches(city);
    } else {
        alert('Please enter a city');
    }
}

function getWeatherData(city) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    // get current weather data
    fetch(currentWeatherUrl)
        .then(function (response) {
            if(response.ok) {
                response.json().then(function (data) {
                    // reset form input, remove current displayed weather
                    cityInputEl.value = '';
                    $('#current-weather').empty('');
                    $('#five-day-forecast').empty(''); 
                    getForecastData(data);
                    displayWeatherData(data);
                });
            } else {
                alert(`Error:${response.statusText}`);
            }
        })
        .catch(function (error) {
            alert('Error');
        });
}
function getForecastData(city) {
    // retrieve latitude and longitude
    let lat = city.coord.lat;
    let lon = city.coord.lon;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    // get forecast data using longitute and latitude from current weather data
    fetch(forecastUrl)
        .then(function (response) {
            if(response.ok) {
                response.json().then(function (data) {
                    displayForecastData(data);
                });
            } else {
                alert(`Error:${response.statusText}`);
            }
        })
        .catch(function (error) {
            alert('Error');
        });
}

function displayWeatherData(data) {
    // create card content
    let temp = $('<li>').addClass('weather-info').text(`Temperature: ${data.main.temp} °C`);
    let wind = $('<li>').addClass('weather-info').text(`Wind Speed: ${data.wind.speed} km/h`);
    let humidity = $('<li>').addClass('weather-info').text(`Humidity: ${data.main.humidity}%`);
    let icon = $('<img>').attr('src', `https://openweathermap.org/img/w/${data.weather[0].icon}.png`);
    let rightNow = dayjs().format('MMM DD, YYYY');
    let time = $('<p>').addClass('h4').text(`${data.name} (${rightNow})`);
    
    // create and append card with card content
    const weatherCard = $('<div>').addClass('current-weather');
    weatherCard.append(time, temp, wind, humidity, icon);
    $('#current-weather').append(weatherCard);
    $('#header-text').text(`${data.name}`);
}

function displayForecastData(data) {
    let days = [];
    
    // retrieve and store one set of weather data for each day
    for (i = data.list.length - 1; i > 0; i = i - 8) {
        let day = {
            time: '',
            temp: 0,
            humidity: 0,
            wind: 0,
            icon: '',
        }

        // convert dt to dd/mmm/yyyy format
        let a = new Date(data.list[i].dt*1000);
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let year = a.getFullYear();
        let month = months[a.getMonth()];
        let dayDate = a.getDate();

        day.date = `${dayDate} ${month} ${year}`;
        day.temp = data.list[i].main.temp;
        day.humidity = data.list[i].main.humidity;
        day.wind = data.list[i].wind.speed;
        day.icon = `https://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png`
        
        days.unshift(day);
    }

    // add section title
    let cardHeader = $('<h4>').addClass('').text('Five Day Forecast:');
    $('#five-day-forecast').append(cardHeader);

    // print stored data
    for (i = 0; i < days.length; i++) {
        // create card content
        let time = $('<h5>').addClass('weather-info').text(`${days[i].date}`);
        let temp = $('<li>').addClass('weather-info').text(`Temp: ${days[i].temp} °C`);
        let humidity = $('<li>').addClass('weather-info').text(`Humidity: ${days[i].humidity}%`);
        let wind = $('<li>').addClass('weather-info').text(`Wind: ${days[i].wind} km/h`);
        let icon = $('<img>').attr('src', days[i].icon);

        // create cards
        let dayCard = $('<div>').addClass('col weather-card m-2')
        let dayCardHeader = $('<div>').addClass('weather-card-header');
        let dayCardContent = $('<div>');

        // append cards with weather content
        dayCardHeader.append(time, icon);
        dayCardContent.append(temp, wind, humidity);
        dayCard.append(dayCardHeader, dayCardContent);

        $('#five-day-forecast').append(dayCard);
    }
}

function saveSearches (city) {
    // create empty array is localstorage empty
    if (!searchHistory) {
        searchHistory = [];
    }

    // add searched city to start of history array
    searchHistory.unshift(city);

    // limit recent searches to 10
    if (searchHistory.length > 10) {
        searchHistory.pop();
    }

    renderSavedSearches();
    localStorage.setItem('cities', JSON.stringify(searchHistory));
}

function renderSavedSearches() {
    $('#city-results').empty('');
    // render history only if it exists
    if(searchHistory) {
        for (i = 0; i < searchHistory.length; i++) {
            let button = $('<button>').addClass('btn btn-history mb-2').text(`${searchHistory[i]}`);
            $('#city-results').append(button);
        }
    }
}

renderSavedSearches()
searchButtonEl.addEventListener('click', searchSubmitHandler);

// event listenr to reload saved searches on click
$('#city-results').on("click", function(event) {
    event.preventDefault();
    getWeatherData(event.target.textContent);
});