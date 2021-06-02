const fetch = require('node-fetch');
const cheerio = require('cheerio');


exports.fetchTorrents = (title) => {
    return fetch('https://1337x.is/search/' + title + '/1/', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0' } })
        .then(blob => blob.text())
        .then(html => {
            // console.log(html);

            const $ = cheerio.load(html);
            let body = $('.box-info').find('table').find('tbody').find('tr').find('td').find('a');
            let sizes = $('.box-info').find('table').find('tbody').find('tr').find('.coll-4');

            // let rows = body.find('tr');
            // console.log(body);
            let rows = Array.from(body);
            // console.log(rows);
            let sarr = Array.from(sizes);
            let results = [];
            let i = 0;
            for (let row of rows) {
                if (results.length === 10) break;
                if (row.attribs.href.toString().startsWith('/torrent')) {
                    results.push({ "title": row.firstChild.data, "url": row.attribs.href.toString(), "size": sarr[i].firstChild.data || "na" });
                    i++;
                }
            }
            return results;
        }).catch(err => {
            console.error(err);
            return [];
        });


}

exports.fetchMagnetLink = (url) => {

    // url = '/torrent/4639668/Scam-1992-the-Harshad-Mehta-Story-S01-E01-10-WebRip-720p-Hindi-AAC-x264-mkvCinemas-Telly/'
    return fetch('https://1337x.is' + url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0' } })
        .then(blob => blob.text())
        .then(html => {
            // console.log(html);
            const $ = cheerio.load(html);
            let mgt = $('a');
            // console.log(mgt);


            for (let d of Array.from(mgt)) {
                if (d.attribs.href.startsWith('magnet')) {
                    return d.attribs.href
                    // console.log(d.attribs.href);
                }
            }
            // console.log(mgt);
            // console.log(mgt[0].attribs.href);

            // return mgt[0].attribs.href;

            return "there was an error";

        });
}

// fetchMagnetLink();

// fetchTorrents("Scam 1992");