const url = 'https://v2.jokeapi.dev/joke/Any'
const request = fetch(url)
                .then(r => r.json())
                .then(json => {
                        console.log(json.setup);
                        setTimeout(x => console.log(json.delivery), 1000);
                } );
console.log(request);
