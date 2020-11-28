const fetch = require('node-fetch');
const cheerio = require('cheerio');


exports.fetchTorrents = (title) => {
    return fetch('https://1337x.to/search/' + title + '/1/', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0' } })
        .then(blob => blob.text())
        .then(html => {
            // console.log(html);

            const $ = cheerio.load(html);
            let body = $('.box-info').find('table').find('tbody').find('tr').find('td').find('a');
            // let rows = body.find('tr');
            // console.log(body);
            let rows = Array.from(body);
            // console.log(rows);

            let results = [];

            for (let row of rows) {
                if (results.length === 10) break;
                if (row.attribs.href.toString().startsWith('/torrent')) {
                    results.push({ "title": row.firstChild.data, "url": row.attribs.href.toString() });
                }
            }
            return results;
        });

}

exports.fetchMagnetLink = (url) => {

    // url = '/torrent/4639668/Scam-1992-the-Harshad-Mehta-Story-S01-E01-10-WebRip-720p-Hindi-AAC-x264-mkvCinemas-Telly/'
    return fetch('https://1337x.to' + url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0' } })
        .then(blob => blob.text())
        .then(html => {
            // console.log(html);
            const $ = cheerio.load(html);
            let mgt = $('.l5b4613c7bb5efe6921d695588a9454a64f296919.l7ab9f0e184e904fc8b200661b8673170b7449204').find('a');

            // for(let d of Array.from(mgt)){
            //     if(d.attribs.href.startsWith('magnet')){
            //         console.log(d.attribs.href);
            //     }
            // }
            // console.log(mgt[0].attribs.href);

            return mgt[0].attribs.href;

        });
}

// fetchMagnetLink();

// fetchTorrents("Scam 1992");