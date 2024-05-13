/*
* Group: Francis Corona, Ian Stewart
* Project: Getting to Know JavaScript - Project 1
* Due: 5/14/24, 1:00 PM EDT
*/

import boxen from "boxen";
import yargs from "yargs";
import {hideBin} from 'yargs/helpers'

// Parse command-line arguments to get cordinates
const argv = yargs(hideBin(process.argv))
        .option('latitude', {
                alias: 'lat',
                description: 'Latitude coordinate',
                type: 'number',
                demandOption: false // Required option
        })
        .option('longitude', {
                alias: 'log',
                description: 'longitude coordinate',
                type: 'number',
                demandOption: false // Required option
        })
        .option('hourly', {
                alias: 'H',
                description: 'view hourly data',
                type: 'boolean',
                default: false // Required option
        })
        .argv;

// Access the command line arguments
let {latitude, longitude, hourly} = argv;

// Check to see if user inputted valid cordinates
const pattern = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/g; //regex pattern for valid latitude value
let coordinates = "42.9635,-85.8886";

if (pattern.test(latitude + "," + longitude)) {
        coordinates = latitude + "," + longitude;
} else {
        console.log("Using default values:");
}

const url = 'https://api.weather.gov/points/' + coordinates // Weather Forecast API URL


// Gets forecast url from the primary API
const requestForecast = fetch(url)
        .then(r => r.json())
        .then(json => {
                try { // Returns forecast from api
                        return json.properties.forecast;
                }
                catch { // Catches api error and returns error message
                        return json.title;
                }
        });


// Gets hourly forecast url from the primary API
const requestForecastHourly = fetch(url)
        .then(r => r.json())
        .then(json => {
                try { // Returns hourly forecast from api
                        return json.properties.forecastHourly;
                }
                catch { // Catches api error and returns error message
                        return json.title;
                }
        });


if (hourly) {
        // Parses and returns data for hourly forecast
        requestForecastHourly.then(hourlyForecast => {
                fetch(hourlyForecast) // Fetching url and making a promise 
                .then(r => r.json())
                .then(json => {
                        const periods = json.properties.periods; // Accessing the periods array
                        for (let i = 0; i < 12; i++){ // For loop to iterate over next 12 hours
                                const period = periods[i]; // Defines new const period for each iteration

                console.log(boxen(
                        "Temperature: " + period.temperature + // Print Temperature
                        "\n\n" + period.shortForecast, // Print short forecast
                        {padding: 1, margin: 1, width: 100, title: "Current Weather"})); // Boxen and title
                        }
                })
                .catch(error => {
                        console.error("Unable to get weather data: " + hourlyForecast); // Throw error message given by the api
                });
        });

} else {
        // Parses and returns data for forecast
        requestForecast.then(forecast => {
                fetch(forecast) // Fetching url and making a promise 
                .then(r => r.json())
                .then(json => {
                        const periods = json.properties.periods; // Accessing the periods array
                        for (let i = 0; i < periods.length; i++){ // For loop to iterate over each period
                                const period = periods[i]; // Defines new const period for each iteration

                console.log(boxen(
                        "Temperature: " + period.temperature + // Print Temperature
                        "\nHumidity: " + period.relativeHumidity.value + // Print Humidity
                        "\nWind Speed: " + period.windSpeed + // Print Wind Speed
                        "\n\n" + period.shortForecast + // Print short forecast
                        "\n" + period.detailedForecast, // Print Detailed forecast
                        {padding: 1, margin: 1, width: 100, title: period.name})); // Boxen and title
                        }
                })
                .catch(error => {
                        console.error("Unable to get weather: " + forecast); // Throw error message given by the api
                });
        });
} 