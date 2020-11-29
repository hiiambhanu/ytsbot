const Discord = require('discord.js');
require('dotenv').config()
const client = new Discord.Client();
const yts = require('./util/yts');
const otts = require('./util/1337x');
const searchYTS = '!searchyts ';
const magnetPrefix = '!magnetyts ';
const torrentPrefix = '!torrents ';
const searchPrefix = '!search1337x ';
const magnetPrefix1337 = "!magnet1337x ";

let token = process.env.token;
var db = {};


var movies;
var torrents;
var res1337;

var movieIndex;
var torrentIndex;



client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if (msg.author.bot) return;

    var id = msg.channel.id;
    if (db.id === undefined || db.id === null) {
        db.id = {};
    }

    if (msg.content.startsWith(searchYTS)) {
        console.log("Searching in yts");
        const commandBody = msg.content.slice(searchYTS.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();
        console.log(commandBody);
        let resp = await yts.fetchTorrents(commandBody);
        db.id['movies'] = resp;
        let index = 0;
        if (!db.id['movies']) {
            msg.channel.send("no movie found");
            return;
        }
        let replyString = db.id.movies.reduce((replyString, torrent) => {
            return replyString + `${index++}  ${torrent.title}, ${torrent.year}\n`
        }, '\n');
        msg.channel.send(replyString);
    }
    else if (msg.content.startsWith(torrentPrefix)) {
        const commandBody = msg.content.slice(torrentPrefix.length);
        console.log(commandBody);
        db.id['movieIndex'] = Number.parseInt(commandBody);
        db.id['torrents'] = db.id['movies'][Number.parseInt(commandBody)].torrents;
        let index = 0;

        let replyString = db.id['torrents'].reduce((replyString, torrent) => {
            return replyString + `${index++}  ${torrent.quality}, ${torrent.size}\n`
        }, '\n');
        msg.channel.send(replyString);
    }
    else if (msg.content.startsWith(magnetPrefix)) {
        const commandBody = msg.content.slice(magnetPrefix.length);
        db.id['torrentIndex'] = Number.parseInt(commandBody);
        let magnetLink = getMagnet(id);
        msg.channel.send('\n' + magnetLink);
    }

    else if (msg.content.startsWith(searchPrefix)) {
        const commandBody = msg.content.slice(searchPrefix.length);
        let results = await otts.fetchTorrents(commandBody);
        db.id['res1337'] = results;
        let index = 0;
        let replyString = results.reduce((replyString, torrent) => {
            return replyString + `${index++}  ${torrent.title}\n`
        }, '\n');
        msg.channel.send(replyString);
    }

    else if (msg.content.startsWith(magnetPrefix1337)) {
        const commandBody = msg.content.slice(magnetPrefix1337.length);
        if (!db.id['res1337'] || !db.id['res1337'][Number.parseInt(commandBody)]) {
            msg.channel.send("Please use the command properly ");
            return;
        }
        let magnetLink = await otts.fetchMagnetLink(db.id['res1337'][Number.parseInt(commandBody)].url);
        msg.channel.send(magnetLink);
    }
    else if (msg.content.startsWith('!help')) {
        msg.channel.send(`To Search with yts: 
        use !searchyts 'querytitle'. 
        Then to show the torrents for a movie, send !torrent 'indexOfMovie'.
        Finally, to get the magnet link, send !magnet 'index'. `
            + `\nTo search with 1337x: 
        use !search1337x 'query'
        then, send !magnet1337x 'indexoftorrent' to get the magnet link`);
    }
});


let getMagnet = (id) => {
    let trackers = "&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969";
    if (!db.id['torrents'] || !db.id['movies']) return "Please use commands properly";
    let TORRENT_HASH = db.id['torrents'][db.id['torrentIndex']].hash;
    let title = db.id['movies'][db.id['movieIndex']].title;
    return "magnet:?xt=urn:btih:" + TORRENT_HASH + "&dn=" + encodeURI(title) + trackers
}

client.login(token);