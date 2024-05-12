/*
* Group: Francis Corona, Ian Stewart
* Project: Getting to Know JavaScript - Project 1
* Due: 5/14/24, 1:00 PM EDT
*/

import boxen from "boxen";

const url = 'https://api.weather.gov/gridpoints/TOP/32,81/forecast' // Weather Forecast API URL
const request = fetch(url) // Fetching url and making a promise 
                .then(r => r.json()) // Parsing JSON response

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
                        {padding: 1, margin: 1, width: 100, title: "Current Weather"})); // Boxen and title
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