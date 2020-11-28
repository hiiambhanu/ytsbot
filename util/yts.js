const fetch = require('node-fetch');
exports.fetchTorrents = (title) => {

    return fetch('https://yts.mx/api/v2/list_movies.json?query_term=' + title)
        .then(blob => blob.json())
        .then(response => {
            let movies = response.data.movies
            if(!movies){
                return "";
            }
            let newData = movies.map(movie => {
                return { "title": movie.title, "year": movie.year, "torrents": movie.torrents };
            });
            // console.table(newData);
            return newData;
        });

}