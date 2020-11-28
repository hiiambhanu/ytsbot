const Discord = require('discord.js');
require('dotenv').config()
const client = new Discord.Client();
const yts = require('./util/yts');
const searchPrefix = '!search ';
const magnetPrefix = '!magnet ';
const torrentPrefix = '!torrents ';

let token = process.env.token;

var movies;
var torrents;

var movieIndex;
var torrentIndex;


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if (msg.author.bot) return;

    if (msg.content.startsWith(searchPrefix)) {
        const commandBody = msg.content.slice(searchPrefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();

        console.log(commandBody);

        let resp = await yts.fetchTorrents(commandBody);
        // console.table(resp);

        movies = resp;
        let index = 0;
        let replyString = movies.reduce((replyString, torrent) => {
            // console.log(torrent);
            return replyString + `${index++}  ${torrent.title}, ${torrent.year}\n`
        }, '\n');
        msg.reply(replyString);
    }
    else if (msg.content.startsWith(torrentPrefix)) {
        const commandBody = msg.content.slice(torrentPrefix.length);
        console.log(commandBody);
        movieIndex = Number.parseInt(commandBody);
        torrents = movies[Number.parseInt(commandBody)].torrents;
        let index = 0;

        let replyString = torrents.reduce((replyString, torrent) => {
            // console.log(torrent);
            return replyString + `${index++}  ${torrent.quality}, ${torrent.size}\n`
        }, '\n');
        msg.reply(replyString);



    }
    else if (msg.content.startsWith(magnetPrefix)) {
        // msg.reply('magnet');
        const commandBody = msg.content.slice(magnetPrefix.length);
        // let magnetLink = getMagnet(torre)
        torrentIndex = Number.parseInt(commandBody);

        let magnetLink = getMagnet();
        msg.reply('\n' + magnetLink);
    }

    if (msg.content === 'ping') {
        msg.reply('pong');

    }
});


let getMagnet = () => {
    let trackers = "&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969";
    
    if (!torrents || !movies) return "Please use commands properly";
    let TORRENT_HASH = torrents[torrentIndex].hash;
    let title = movies[movieIndex].title;
    return "magnet:?xt=urn:btih:" + TORRENT_HASH + "&dn=" + encodeURI(title) + trackers
}

client.login(token);