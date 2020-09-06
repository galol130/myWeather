//API call: api.openweathermap.org/data/2.5/weather?q={city name},{state code},{country code}&appid={your api key}
//API key: d574b917b046ce060124a28c31721263

const formulario = document.getElementById('formulario');
const ciudadInput = document.getElementById('ciudad');
const paisInput = document.getElementById('pais');
const resultado = document.getElementById('resultado');
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

function getWindDirection(grados) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    const index = Math.round(Number(grados) / 22.5);
    return directions[index];

}


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


//Reconocimiento de voz para la ciudad
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