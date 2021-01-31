const Discord = require('discord.js');
require('dotenv').config()
const client = new Discord.Client();
const yts = require('./util/yts');
const otts = require('./util/1337x');
const searchYTS = '!syts ';
const magnetPrefix = '!myts ';
const torrentPrefix = '!torrents ';
const searchPrefix = '!s1337x ';
const magnetPrefix1337 = "!m1337x ";
const helpMessage = `To Search with yts: 
use !syts 'querytitle'. 
Then to show the torrents for a movie, send !torrents 'indexOfMovie'.
Finally, to get the magnet link, send !myts 'index'. `
    + `\nTo search with 1337x: 
use !s1337x 'query'
then, send !m1337x 'indexoftorrent' to get the magnet link`;

const numbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
let token = process.env.token;
var db = {};


var movies;
var torrents;
var res1337;

var movieIndex;
var torrentIndex;



client.on('ready', async () => {
    console.log("Successfully logged in ");
    client.user.setActivity(" !help", { type: 'LISTENING' });
});

client.on('message', async msg => {
    if (msg.author.bot) return;
    var id = msg.channel.id;
    let commandBody, args, command;

    if (db[id] === undefined || db[id] === null) {
        db[id] = {};
    }

    let embed = new Discord.MessageEmbed().setColor(0xff0000);

    if (msg.content.startsWith("!test")) {
        embed.setTitle(`Torrents`).setDescription("a");
        return msg.channel.send(embed);
    }

    if (msg.content.startsWith("!chup")) {
        commandBody = msg.content.slice('!chup'.length);
        args = commandBody.split(' ');
        command = args.shift().toLowerCase();
        return msg.channel.send(commandBody + " ");
    }

    if (msg.content.startsWith(searchYTS)) {
        commandBody = msg.content.slice(searchYTS.length);
        args = commandBody.split(' ');
        command = args.shift().toLowerCase();
        let resp = await yts.fetchTorrents(commandBody);
        db[id]['movies'] = resp;
        let index = 0;
        if (!db[id]['movies']) {
            msg.channel.send("no movie found");
            return;
        }
        let replyString = db[id].movies.reduce((replyString, torrent) => {
            return replyString + `${index++} | ${torrent.title}, | ${torrent.year}\n`
        }, '\n');
        embed.setTitle(`Torrents for ${commandBody}`).setDescription(replyString);
        let sms = await msg.channel.send(embed);
        for (let i = 0; i < index; i++) {
            if (i > 10) break;
            await sms.react(numbers[i]);
        }

        const filter = (reaction, user) => {
            return numbers.find((data) => data = reaction.emoji.name)
            return 1;
            //  reaction.emoji.name === '👍';
        };

        sms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(async (collected) => {
                console.log(collected.first().emoji.name);
                let movieId = numbers.findIndex((data, index) => data == collected.first().emoji.name);
                console.log(movieId);
                if (!db[id] || !db[id]['movies']) {
                    return msg.channel.send("Please use the commands properly");
                }
                db[id]['movieIndex'] = movieId
                db[id]['torrents'] = db[id]['movies'][movieId].torrents;
                let index = 0;

                let replyString = db[id]['torrents'].reduce((replyString, torrent) => {
                    return replyString + `${index++}  ${torrent.quality}, ${torrent.size}\n`
                }, '\n');

                embed.setTitle(`Torrents: `).setDescription(replyString);
                let sms = await msg.channel.send(embed);

                for (let i = 0; i < index; i++) {
                    if (i > 10) break;
                    await sms.react(numbers[i]);
                }

                const filter = (reaction, user) => {
                    return numbers.find((data) => data = reaction.emoji.name)
                    return 1;
                    //  reaction.emoji.name === '👍';
                };

                sms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                    .then(async (collected)=>{
                        console.log(collected.first().emoji.name);
                        let torrentId = numbers.findIndex((data, index) => data == collected.first().emoji.name);
                        console.log(torrentId);
                        db[id]['torrentIndex'] = torrentId
                        let magnetLink = getMagnet(id);
                        embed.setTitle(`Magnet Link:`).setDescription('\n' + magnetLink);
                        msg.channel.send(embed);
                    })
                    .catch(collected => {
                        sms.reactions.removeAll();
                        console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
                    });

            })
            .catch(collected => {
                sms.reactions.removeAll();
                console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
            });

    }
    else if (msg.content.startsWith(torrentPrefix)) {
        commandBody = msg.content.slice(torrentPrefix.length);
        if (!db[id] || !db[id]['movies']) {
            return msg.channel.send("Please use the commands properly");
        }
        db[id]['movieIndex'] = Number.parseInt(commandBody);
        db[id]['torrents'] = db[id]['movies'][Number.parseInt(commandBody)].torrents;
        let index = 0;

        let replyString = db[id]['torrents'].reduce((replyString, torrent) => {
            return replyString + `${index++}  ${torrent.quality}, ${torrent.size}\n`
        }, '\n');

        embed.setTitle(`Torrents: `).setDescription(replyString);
        let sms = await msg.channel.send(embed);
        for (let i = 0; i < index; i++) {
            if (i > 10) break;
            await sms.react(numbers[i]);
        }
    }
    else if (msg.content.startsWith(magnetPrefix)) {
        commandBody = msg.content.slice(magnetPrefix.length);
        db[id]['torrentIndex'] = Number.parseInt(commandBody);
        let magnetLink = getMagnet(id);
        embed.setTitle(`Magnet Link:`).setDescription('\n' + magnetLink);
        msg.channel.send(embed);
    }

    else if (msg.content.startsWith(searchPrefix)) {
        commandBody = msg.content.slice(searchPrefix.length);
        let results = await otts.fetchTorrents(commandBody);
        if (!results.length) return msg.channel.send("Sorry, no results found! :(");
        db[id]['res1337'] = results;
        let index = 0;
        let replyString = results.reduce((replyString, torrent) => {
            return replyString + `${index++} | ${torrent.title} | ${torrent.size}\n`
        }, '\n');
        embed.setTitle(`Torrents for ${commandBody}`).setDescription(replyString);
        let sms = await msg.channel.send(embed);
        for (let i = 0; i < index; i++) {
            if (i > 10) break;
            await sms.react(numbers[i]);
        }
    }

    else if (msg.content.startsWith(magnetPrefix1337)) {
        commandBody = msg.content.slice(magnetPrefix1337.length);
        if (!db[id]['res1337'] || !db[id]['res1337'][Number.parseInt(commandBody)]) {
            msg.channel.send("Please use the command properly ");
            return;
        }
        let magnetLink = await otts.fetchMagnetLink(db[id]['res1337'][Number.parseInt(commandBody)].url);
        embed.setTitle(`Magnet Link:`).setDescription(magnetLink);
        msg.channel.send(embed);

    }
    else if (msg.content.startsWith('!help')) {
        embed.setTitle(`How To Use`).setDescription(helpMessage);
        msg.channel.send(embed);
    }
});


let getMagnet = (id) => {
    let trackers = "&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969";
    if (!db[id]['torrents'] || !db[id]['movies']) return "Please use commands properly";
    let TORRENT_HASH = db[id]['torrents'][db[id]['torrentIndex']].hash;
    let title = db[id]['movies'][db[id]['movieIndex']].title;
    return "magnet:?xt=urn:btih:" + TORRENT_HASH + "&dn=" + encodeURI(title) + trackers
}

client.login(token);