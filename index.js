const Discord = require('discord.js');
require('dotenv').config()
const client = new Discord.Client();
const yts = require('./util/yts');
const otts = require('./util/1337x');
const searchYTS = '!syts ';
const searchPrefix = '!s1337x ';
const helpMessage = `To Search with yts: 
use !syts 'query'.`
    + `\nTo search with 1337x: 
use !s1337x 'query'
Then use emoji reacts to get the torrents`;

const numbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
let token = process.env.token;
var db = {};

let commandBody, args, command;
let embed = new Discord.MessageEmbed().setColor(0xff0000);
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


    if (db[id] === undefined || db[id] === null) {
        db[id] = {};
    }

    if (msg.content.startsWith("!chup")) {
        commandBody = msg.content.slice('!chup'.length);
        args = commandBody.split(' ');
        command = args.shift().toLowerCase();
        return msg.channel.send(commandBody + " ");
    }

    if (msg.content.startsWith(searchYTS)) {
        handleYts(id, msg);
    }

    else if (msg.content.startsWith(searchPrefix)) {
        handle1337x(id, msg);
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

async function handle1337x(id, msg) {

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
    let flag = 0;

    for (let i = 0; i < index; i++) {
        if (i > 10 || flag) break;
        await sms.react(numbers[i]);
        if (i == 0) {
            const filter = (reaction, user) => {
                return numbers.find((data) => data = reaction.emoji.name) && !user.bot;
            };

            sms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(async (collected) => {

                    let torrentId = numbers.findIndex((data, index) => data == collected.first().emoji.name);
                    if (!db[id]['res1337'] || !db[id]['res1337'][torrentId]) {
                        msg.channel.send("Please use the command properly ");
                        return;
                    }
                    sms.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                    flag = 1;
                    let magnetLink = await otts.fetchMagnetLink(db[id]['res1337'][torrentId].url);
                    embed.setTitle(`Magnet Link:`).setDescription(magnetLink);
                    msg.channel.send(embed);
                })
                .catch(collected => {
                    console.log("here");
                    sms.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                });
        }
    }
}

async function handleYts(id, msg) {
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

    let flag = 0;
    for (let i = 0; i < index; i++) {
        if (i > 10 || flag) break;
        await sms.react(numbers[i]);
        if (i == 0) {
            const filter = (reaction, user) => {
                return numbers.find((data) => data = reaction.emoji.name) && !user.bot;
            };

            sms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(async (collected) => {

                    let movieId = numbers.findIndex((data, index) => data == collected.first().emoji.name);
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
                    flag = 1;
                    let fflag = 0
                    for (let i = 0; i < index; i++) {
                        if (i > 10 || fflag) break;
                        await sms.react(numbers[i]);

                        if (i === 0) {
                            const filter = (reaction, user) => {
                                return numbers.find((data) => data = reaction.emoji.name) && !user.bot;
                            };

                            sms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                                .then(async (collected) => {

                                    let torrentId = numbers.findIndex((data, index) => data == collected.first().emoji.name);
                                    db[id]['torrentIndex'] = torrentId
                                    let magnetLink = getMagnet(id);
                                    embed.setTitle(`Magnet Link:`).setDescription('\n' + magnetLink);
                                    sms.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                    fflag = 1;
                                    msg.channel.send(embed);
                                })
                                .catch(collected => {
                                    sms.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                                });
                        }
                    }

                })
                .catch(collected => {
                    console.log("here");
                    sms.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                });
        }
    }
}