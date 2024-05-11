const url = 'https://api.weather.gov/gridpoints/TOP/32,81/forecast' // Weather Forecast API URL
const request = fetch(url) // Fetching url and making a promise 
                .then(r => r.json()) // Parsing JSON response

                .then(json => {
                        const periods = json.properties.periods; // Accessing the periods array
                        for (let i = 0; i < periods.length; i++){ // For loop to iterate over each period
                                const period = periods[i]; // Defines new const period for each iteration

                console.log("Current Weather");
                console.log(" ");
                console.log("Temperature: " + period.temperature); // Print Temperature
                console.log("Humidity: " + period.relativeHumidity.value); // Print Humidity
                console.log("Wind Speed: " + period.windSpeed); // Print Wind Speed
                console.log(period.shortForecast); // Print short forecast
                console.log(period.detailedForecast); // Print Long forecast
                console.log(" ");
                console.log(" ");
                        }
                });


/*
const url = 'https://v2.jokeapi.dev/joke/Any' 
const request = fetch(url)
                .then(r => r.json())
                .then(json => {
                        console.log(json.setup);
                        setTimeout(x => console.log(json.delivery), 1000);
                } );
console.log(request);
*/