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
                default: 42.9635,
        })
        .option('longitude', {
                alias: 'log',
                description: 'longitude coordinate',
                type: 'number',
                default: -85.8886,
        })
        .option('hourly', {
                alias: 'H',
                description: 'view hourly data',
                type: 'boolean',
                default: false // Required option
        })

        .check((argv) => {
                if (argv.latitude < -90 || argv.latitude > 90) {
                        throw new Error("Latitude must be between -90 and 90.");
                }
                if (argv.longitude < -180 || argv.longitude > 180) {
                        throw new Error("Longitude must be between -180 and 180.");
                }
                return true;
        })
        .argv;

// Access the command line arguments
let {latitude, longitude, hourly} = argv;

const coordinates = argv.latitude + "," + argv.longitude;

const url = 'https://api.weather.gov/points/' + coordinates // Weather Forecast API URL with coordinates added


// Gets forecast url from the primary API
const requestForecast = fetch(url)
        .then(r => r.json())
        .then(json => {
                try { // Returns forecast from api
                        return json.properties.forecast;
                }
                catch { // Catches api error and returns error message
                        return json.detail;
                }
        })
        .catch(error => { // Throws error if there is an issue fetching url
                console.error("Fetch Failed (likely API not found):");
                throw error;
        });


// Gets hourly forecast url from the primary API
const requestForecastHourly = fetch(url)
        .then(r => r.json())
        .then(json => {
                try { // Returns hourly forecast from api
                        return json.properties.forecastHourly;
                }
                catch { // Catches api error and returns error message
                        return json.detail;
                }
        })
        .catch(error => { // Throws error if there is an issue fetching url
                console.error("Fetch Failed (likely API not found):");
                throw error;
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
                                let time = "Current"; // If period is not 0, 'current' is used in place of a time
                                if (i != 0) { // Gets the time for the current period and formats it for the boxen title
                                        const date = new Date(period.startTime);
                                        const hour = date.getHours();
                                        const amOrPm = hour >= 12 ? "pm" : "am";
                                        time = ((hour % 12) || 12).toString() + ":00" + amOrPm;
                                }

                                console.log(boxen(  // Boxen and title
                                        "Temperature: " + period.temperature + // Print Temperature
                                        "\n\n" + period.shortForecast, // Print short forecast
                                        {padding: 1, margin: 1, width: 100, title: time + " Weather"}
                                ));
                        }
                })
                .catch(error => {
                        console.error("Error getting data: " + hourlyForecast); // Throw error message given by the API
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

                                console.log(boxen( // Boxen and title
                                        "Temperature: " + period.temperature + // Print Temperature
                                        "\nHumidity: " + period.relativeHumidity.value + // Print Humidity
                                        "\nWind Speed: " + period.windSpeed + // Print Wind Speed
                                        "\n\n" + period.shortForecast + // Print short forecast
                                        "\n" + period.detailedForecast, // Print Detailed forecast
                                        {padding: 1, margin: 1, width: 100, title: period.name}
                                ));
                        }
                })
                .catch(error => {
                        console.error("Unable to get weather data: " + forecast); // Throw error message given by the API
                });
        });
} 