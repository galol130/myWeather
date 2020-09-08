//API call: api.openweathermap.org/data/2.5/weather?q={city name},{state code},{country code}&appid={your api key}
//API key: d574b917b046ce060124a28c31721263

let dataCity1, dataCity2, dataCity3, dataCity4;
let globalLang = 'EN';

document.addEventListener('DOMContentLoaded', async function () {
    /*Al cargar la página se mostrarán 3 ciudades 'hardcodeadas'.
    Para ello pasamos a la función 4 parámetros: 'ciudad', 'país', 'idioma' (es/en), 'ruta de la imagen'
    */
    dataCity1 = await loadFixedCity('Rosario', 'Argentina');
    dataCity2 = await loadFixedCity('Bilbao', 'Spain');
    dataCity3 = await loadFixedCity('Lima', 'Peru');
    dataCity4 = await loadFixedCity('Brandon', 'US');
    showFixedCity(dataCity1, globalLang, '/images/rosario.jpg');
    showFixedCity(dataCity2, globalLang, '/images/bilbao.jpg');
    showFixedCity(dataCity3, globalLang, '/images/lima.jpg');
    showFixedCity(dataCity4, globalLang, '/images/brandon.jpg');
})

const formulario = document.getElementById('formulario');
const ciudadInput = document.getElementById('ciudad');
const paisInput = document.getElementById('pais');
const resultado = document.getElementById('resultado');
const citiesContainer = document.getElementById('citiesContainer');
const toggleUnits = document.getElementById('toggleUnits');
const urlBase = 'http://api.openweathermap.org/data/2.5/weather?q=';
const apiKey = 'd574b917b046ce060124a28c31721263';


//Declaro las variables globales para poder usarlas en distintas funciones. Se cargan via 'destructuring' al obtener el resultado del fetch
let city, country, countryName, weather, main, visibility, wind, clouds;

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    var formOk = validarFormulario()
    if (formOk) {
        city = ciudadInput.value;
        country = (paisInput[paisInput.selectedIndex].value).toLowerCase();
        countryName = (paisInput[paisInput.selectedIndex].innerText).toUpperCase();
        buscarClima();
    }
})


function validarFormulario() {
    if (ciudadInput.value.length < 4) {
        mensajeError('At least 4 characters for the city required');
        return false
    } else {
        if (paisInput.selectedIndex < 1) {
            mensajeError('Must select a country');
            return false
        }
        return true;
    }
}

//Utilizando la API de forma sincrónica, con ayuda de los ".then"
function buscarClima() {
    let responseStatus = 0;
    let urlFetch = `${urlBase}${city},${country}&appid=${apiKey}`;
    console.log(urlFetch);
    fetch(urlFetch)
        .then(function (response) {
            responseStatus = response.status;
            return response.json();
        })
        .catch(reason => mensajeError(`API fetch problem: ${reason.message}`))
        .then(function (datos) {
            if (responseStatus === 404) {
                mensajeError(`City "${ciudadInput.value}" not found`);
                formulario.reset();
            }
            if (responseStatus === 200) {
                weather = datos.weather[0];
                main = datos.main;
                visibility = datos.visibility
                wind = datos.wind;
                clouds = datos.clouds;
                weatherTitle.innerText = `${city.toUpperCase()}, ${countryName}`;
                mostrarResultadoUs();
                formulario.reset();
            }
        })
}

//Creo fuera del scope de las funciones los elementos de HTML que voy a usar
const weatherCard = document.createElement('div');
const weatherTitle = document.createElement('h2');
weatherTitle.classList.add('font-bold', 'text-white', 'text-center', 'my-3');
const clima = document.createElement('p');
const temperatura = document.createElement('p');
const visibilidad = document.createElement('p');
const viento = document.createElement('p');
const toggleMessage = document.createElement('div');


function mostrarResultadoMetric() {
    resultado.innerHTML = '';
    weatherCard.className = '';
    weatherCard.classList.add('bg-indigo-800', 'text-yellow-200', 'text-center', 'font-semibold', 'my-2', 'px-3', 'py-4', 'border', 'rounded');
    clima.id = "climaMetric";
    clima.innerHTML = `Weather: ${weather.main} (${weather.description})`;
    temperatura.innerHTML = `Temperatura: ${(main.temp-273.15).toFixed(1)}°C | Feels like: ${(main.feels_like-273.15).toFixed(1)}°C`;
    visibilidad.innerHTML = `Visibility: ${(visibility/1000).toFixed(2)}km`;
    const windDirection = getWindDirection(wind.deg);
    viento.innerHTML = `Wind: ${wind.speed}km/h from the ${windDirection}`;
    toggleMessage.innerText = "Click to toggle to US units";
    toggleMessage.className = '';
    toggleMessage.classList.add('text-center', 'text-gray-300', 'font-thin', 'mt-5', 'text-xs');

    weatherCard.appendChild(weatherTitle);
    weatherCard.appendChild(clima);
    weatherCard.appendChild(temperatura);
    weatherCard.appendChild(visibilidad);
    weatherCard.appendChild(viento);
    weatherCard.appendChild(toggleMessage);
    resultado.appendChild(weatherCard);
}

function mostrarResultadoUs() {
    resultado.innerHTML = '';
    weatherCard.className = '';
    weatherCard.classList.add('bg-gray-900', 'text-teal-400', 'text-center', 'my-2', 'px-3', 'py-4', 'border', 'rounded');
    clima.id = "climaUs";
    clima.innerHTML = `Weather: ${weather.main} (${weather.description})`;
    temperatura.innerHTML = `Temperatura: ${((main.temp-273.15)*(9/5)+32).toFixed(1)}°F | Feels like: ${((main.feels_like-273.15)*(9/5)+32).toFixed(1)}°F`;
    visibilidad.innerHTML = `Visibility: ${(visibility/1000/1.609).toFixed(2)}mi`;
    const windDirection = getWindDirection(wind.deg);
    viento.innerHTML = `Wind: ${(wind.speed/1.609).toFixed(2)}mi per hour from the ${windDirection}`;
    toggleMessage.innerText = "Click to toggle to Metric units";
    toggleMessage.className = '';
    toggleMessage.classList.add('text-center', 'text-red-300', 'font-thin', 'mt-5', 'text-xs');

    weatherCard.appendChild(weatherTitle);
    weatherCard.appendChild(clima);
    weatherCard.appendChild(temperatura);
    weatherCard.appendChild(visibilidad);
    weatherCard.appendChild(viento);
    weatherCard.appendChild(toggleMessage);
    resultado.appendChild(weatherCard);

}

//Al hacer click en el área de Resultado, se cambiará la información mostrada
resultado.addEventListener('click', function () {
    if (clima.id === "climaUs") {
        mostrarResultadoMetric();
    } else if (clima.id === "climaMetric") {
        mostrarResultadoUs();
    }
})

//Para convertir la informaicón obtenida en grados a puntos cardinales
function getWindDirection(grados) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    const index = Math.round(Number(grados) / 22.5);
    return directions[index];

}

//Para gestionar los mensajes de error
function mensajeError(mensaje) {
    const errorMessage = document.getElementById('errorMessage');

    if (!errorMessage) {
        const nuevoDiv = document.createElement('div');
        nuevoDiv.id = 'errorMessage';
        nuevoDiv.classList.add('bg-red-600', 'rounded-md', 'border', 'text-white', 'text-center', 'mt-5', 'py-2', 'block');
        nuevoDiv.innerText = mensaje;
        resultado.parentElement.appendChild(nuevoDiv);

        setTimeout(() => {
            document.getElementById('errorMessage').remove();
        }, 3000);
    }
}


//Reconocimiento de voz para la ciudad utilizando la API de Mozilla (webkit)
const speechRecognition = webkitSpeechRecognition;
const recognition = new speechRecognition();
recognition.lang = 'en-US';

const mic = document.getElementById('microphone');
mic.addEventListener('click', function (e) {
    e.preventDefault();
    recognition.start();
    recognition.onstart = function () {
        console.log('Empieza a grabar');
        mic.innerText = 'Recording...';
        mic.disabled = true;
        mic.classList.remove('bg-white', 'text-blue-700');
        mic.classList.add('bg-red-800', 'text-white');
    }
    recognition.onspeechend = function () {
        console.log('terminó la grabación');
        recognition.stop();
        mic.innerText = 'Press to speak';
        mic.disabled = false;
        mic.classList.remove('bg-red-800', 'text-white');
        mic.classList.add('bg-white', 'text-blue-700');
    }
    recognition.onnomatch = function (e) {
        console.log(e);
        mensajeError("Ooops! We couldn't get the name of the Ciy");
    }
    recognition.onerror = function (e) {
        console.log(`Error: ${e.error}`);
        mensajeError("Ooops! We couldn't get the name of the Ciy");
    }
    recognition.onresult = function (e) {
        console.log('entra al result');
        let {
            transcript,
            confidence
        } = e.results[0][0];
        if (transcript === "") {
            mensajeError("Ooops! We couldn't get the name of the Ciy");
        }
        console.log(transcript);
        console.log(`${(confidence*100).toFixed(2)}%`);
        if (confidence > 0.9) {
            console.log('Funciona!');
            ciudadInput.innerText = transcript;
            ciudadInput.value = transcript;
        } else {
            mensajeError("Ooops! We couldn't get the name of the Ciy");
        }
    }
})

//Se generará el HTML para las ciudades hard-coded
async function showFixedCity(APIData, idioma, urlImage) {
    let language = idioma.toUpperCase();
    let datos = getDatosLanguage(APIData, language);


    const newCity = document.createElement('div');
    const html = `
    <div class="flex max-w-full mt-5" id="citiesContainer">
        <div class="max-w-sm w-full lg:max-w-full lg:flex">
            <div class="h-48 lg:h-56 lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden"
            style="background-image: url('${urlImage}')" title="${APIData.city}, ${APIData.country}">
            </div>
            <div class="max-w border-r border-b border-l border-gray-400 lg:w-full lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r px-4 py-2 flex flex-col justify-between leading-normal">
                <div class="mb-5">
                    <div class="text-gray-900 font-bold text-xl mb-2">${APIData.city}, ${APIData.country}
                    </div>
                    <p class="text-gray-700 text-base">Now: <strong>${datos.estado}</strong>  (${datos.descripcion})</p>
                    <p class="text-gray-700 text-base">Temperature: <strong>${datos.temp}</strong> (<span>Min: ${datos.temp_min} | Max: ${datos.temp_max} </span>)</p>
                    <p class="text-gray-700 text-base">Humidity: <strong>${datos.humedad}%</strong> (<span>Feels like: ${datos.sensacion}</span>)</p>
                    <p class="text-gray-700 text-base">Wind: <strong>${datos.viento}</strong> from the <strong>${datos.direccion}</strong></p>
                    <p class="text-gray-700 text-base">Pressure: <strong>${datos.presion}</strong></p>
                    <p class="text-gray-700 text-base">Visibility: <strong>${datos.visibilidad}</strong></p>
                </div>
                <div class="flex items-center">
                    <div class="text-sm">
                        <p class="text-gray-600" id="updatedTime"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    newCity.innerHTML = html;
    citiesContainer.appendChild(newCity);
    console.log(APIData);
}

//Utilizando la API de forma asíncrona para hacer sucesivas llamadas y cargar las ciudades "hard-coded"
async function loadFixedCity(cityFixed, countryFixed) {
    let responseStatus = 0;
    let urlFetch = `${urlBase}${cityFixed},${countryFixed}&appid=${apiKey}`;
    try {
        const response = await fetch(urlFetch);
        const datos = await response.json();
        responseStatus = response.status;

        if (responseStatus === 404) {
            console.log(`CityFixed "${ciudadInput.value}" not found`);
        }
        if (responseStatus === 200) {
            let datosCityFixed = {
                city: cityFixed,
                country: countryFixed,
                weather: datos.weather[0],
                main: datos.main,
                visibility: datos.visibility,
                wind: datos.wind,
                clouds: datos.clouds
            }
            return datosCityFixed;
        }
    } catch (error) {
        console.log(`API fetch problem: ${reason.message}`);
    }
}

//Toma el objeto de datos que devuelve la API y retorna un objeto con datos en Métrico o Americano
function getDatosLanguage(datos, idioma) {
    if (idioma === "EN") {
        return {
            temp: `${((datos.main.temp-273.15)*(9/5)+32).toFixed(1)}°F`,
            temp_min: `${((datos.main.temp_min-273.15)*(9/5)+32).toFixed(1)}°F`,
            temp_max: `${((datos.main.temp_max-273.15)*(9/5)+32).toFixed(1)}°F`,
            sensacion: `${((datos.main.feels_like-273.15)*(9/5)+32).toFixed(1)}°F`,
            humedad: datos.main.humidity,
            presion: `${(datos.main.pressure*0.03).toFixed(2)} inches`,
            visibilidad: `${(datos.visibility/1000/1.609).toFixed(2)} mi`,
            estado: datos.weather.main,
            descripcion: datos.weather.description,
            viento: `${(datos.wind.speed/1.609).toFixed(2)} mi/h`,
            direccion: getWindDirection(datos.wind.deg)
        }
    }
    if (idioma === 'ES') {
        return {
            temp: `${(datos.main.temp-273.15).toFixed(1)}°C`,
            temp_min: `${(datos.main.temp_min-273.15).toFixed(1)}°C`,
            temp_max: `${(datos.main.temp_max-273.15).toFixed(1)}°C`,
            sensacion: `${(datos.main.feels_like-273.15).toFixed(1)}°C`,
            humedad: datos.main.humidity,
            presion: `${datos.main.pressure} hPa`,
            visibilidad: `${(datos.visibility/1000).toFixed(2)} km`,
            estado: datos.weather.main,
            descripcion: datos.weather.description,
            viento: `${datos.wind.speed} km/h`,
            direccion: getWindDirection(datos.wind.deg)
        }
    }
}


//Se controla el sistema de unidades con un toggle
toggleUnits.addEventListener('change', function () {
    //checked = true --> Metric
    console.log(toggleUnits.checked);
    if (toggleUnits.checked) {
        citiesContainer.innerHTML = '';
        globalLang = 'ES';
        showFixedCity(dataCity1, globalLang, '/images/rosario.jpg');
        showFixedCity(dataCity2, globalLang, '/images/bilbao.jpg');
        showFixedCity(dataCity3, globalLang, '/images/lima.jpg');
        showFixedCity(dataCity4, globalLang, '/images/brandon.jpg');
    } else {
        citiesContainer.innerHTML = '';
        globalLang = 'EN';
        showFixedCity(dataCity1, globalLang, '/images/rosario.jpg');
        showFixedCity(dataCity2, globalLang, '/images/bilbao.jpg');
        showFixedCity(dataCity3, globalLang, '/images/lima.jpg');
        showFixedCity(dataCity4, globalLang, '/images/brandon.jpg');
    }
})