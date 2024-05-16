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
                alias: 'lon',
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
const requestForecast =  await fetch(url);
const requestForecastJson = await requestForecast.json()
let forecastURL;

try { // Returns forecast from api
        forecastURL = requestForecastJson.properties.forecast;
}
catch { // Catches api error and returns error message
        forecastURL = requestForecastJson.detail;
}


// Gets hourly forecast url from the primary API
const requestForecastHourly = await fetch(url)
const requestForecastHourlyJson = await requestForecastHourly.json()
let hourlyForecastURL;

try { // Returns hourly forecast from api
        hourlyForecastURL = requestForecastHourlyJson.properties.forecastHourly;
}
catch { // Catches api error and returns error message
        hourlyForecastURL = requestForecastHourlyJson.detail;
}


if (hourly) {
        // Parses and returns data for hourly forecast
        const hourlyForecast = await fetch(hourlyForecastURL)
        const hourlyForecastJson = await hourlyForecast.json()

        try {
                const periods = hourlyForecastJson.properties.periods; // Accessing the periods array
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
        }
        catch {
                console.error("Error getting data: " + hourlyForecastJson.detail);
        }

} else {
        // Parses and returns data for forecast
        const forecast = await fetch(forecastURL)
        const forecastJson = await forecast.json()

        try {
                const periods = forecastJson.properties.periods; // Accessing the periods array
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
        }
        catch {
                console.error("Error getting data: " + forecastJson.detail);
        }
} 