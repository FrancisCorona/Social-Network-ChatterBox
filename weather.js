const argv = yargs(hideBin(process.argv))
        .option('latitude', {
                alias: 'lat',
                description: 'Latitude coordinate',
                type: 'number',
                demandOption: false // Required option
        })
        .option('verbose', {
                alias: 'v',
                description: 'Verbose mode',
                type: 'boolean',
                default: false // Optional, default value is false
        })
        .argv;

// Access the command line arguments
let {latitude, verbose} = argv;


const url = 'https://api.weather.gov/points/39.7456,-97.0892' // Weather Forecast API URL
const defaultCords = "42.9635,-85.8886"

// Gets forecast url from the primary API
const requestForecast = fetch(url)
                .then(r => r.json())
                .then(json => json.properties.forecast);

// Gets hourly forecast url from the primary API
const requestForecastHourly = fetch(url)
                .then(r => r.json())
                .then(json => json.properties.forecastHourly);

requestForecast.then(forecast => {
        const forecastURL = forecast;
        const forecastHourlyURL = forecast + "/hourly";

        const periods = json.properties.periods; // Accessing the periods array
        for (let i = 0; i < periods.length; i++) { // For loop to iterate over each period
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
const forecast = fetch(url) // Fetching url and making a promise 
                .then(r => r.json()) // Parsing JSON response

                .then(json => {
                        const periods = json.properties.periods; // Accessing the periods array
                        for (let i = 0; i < periods.length; i++) { // For loop to iterate over each period
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
                */