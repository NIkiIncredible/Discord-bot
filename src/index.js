import {DateTime} from "luxon";
import * as Discord from "discord.js";
import youtubeDownload from "ytdl-core";
import config from "./config.json"
import youtubeStream from "youtube-audio-stream";

const logPrefix = "[" + DateTime.local().toLocaleString(DateTime.DATETIME_MED) + "] ";
const helpCMD = require('./commands/help');

const client = new Discord.Client();
let connection = null;
let dispatcher = null;
let volumes = [];

const requestList = [];


client.once('ready', () => {
    console.log(`${logPrefix}Up and Running!`);
});

client.login(config.token);
client.on('message', async message => {
        // Voice only works in guilds, if the message does not come from a guild,
        // we ignore it
        if (!message.guild) return;
        if (message.content.includes('.play', 0)) {
            // Only try to join the sender's voice channel if they are in one themselves
            if (message.member.voice.channel) {
                runPlay(message);

                //TODO Give reactions a reason
                // await message.react('⏸');
                // await message.react('🔉');
                // await message.react('🔊');

                dispatcher.on('finish', () => {
                    message.react('✅');
                    if (requestList.length !== 0) {
                        playAudio(message);
                    }
                });

            } else {
                message.reply('Bitte join erst einem Voicechannel!');
            }
        } else if (message.content === '.pause') {
            if (dispatcher !== null) {
                dispatcher.pause();
            } else {
                message.reply("Der Bot spielt gerade nichts ab!");
                message.react('⛔️')
            }
        } else if (message.content === '.resume') {
            if (dispatcher !== null) {
                dispatcher.resume();
            } else {
                message.reply("Der Bot spielt gerade nichts ab!");
                message.react('⛔️')
            }
        } else if (message.content === '.stop') {
            if (dispatcher !== null) {
                dispatcher.destroy();
                dispatcher = null;
            }
        } else if (message.content.includes('.volume')) {
            // console.log(message.content);
            const volume = message.content.replace('.volume ', '');
            // console.log(volume);
            if (volume !== '' && parseInt(volume) >= 0 && parseInt(volume) <= 100) {
                dispatcher.setVolume(parseInt(volume) / 100);
                volumes.splice(volumes.findIndex(x => x.serverId === message.guild), 1);
                volumes.push({serverId: message.guild, volume: parseInt(volume)});
                await message.reply("Du hast die Lautstärke auf " + volume + " gestellt.")
            } else {
                await message.reply("Gibt bitte eine lautstärke zwischen 0 und 100 an.");
                await message.react('⛔️')
            }
        } else if (message.content === '.leave') {
            connection.disconnect();
            connection = null;
        } else if (message.content.includes('.add')) {
            const args = message.content.replace('.add ', '');
            requestList.push(args);
            console.info(`${logPrefix}Added Song: ${url.href}, to queue from: ${message.author}`);

        }
    }
);

/**
 * @param {function(*=): void} runnable
 */
function playAudio(runnable, volume) {
    dispatcher = connection.play(runnable, {volume: volume / 100});
}

async function runPlay(message) {
    connection = await message.member.voice.channel.join();
    let args = message.content.replace('.play ', '');

    if (volumes.findIndex(x => x.serverId === message.guild) === -1) {
        volumes.push({serverId: message.guild, volume: 50});
    }
    const volume = volumes[volumes.findIndex(x => x.serverId === message.guild)].volume;

    if (args === '🐄') {
        let url = 'https://www.youtube.com/watch?v=lXxUPo9tRao'
    } else if (args.includes('http') || args.includes('https://')) {

        let url = new URL(args);

        if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
            playAudio(youtubeDownload(url.href, {filter: 'audioonly'}), volume);
            console.info(`${logPrefix}Playing Song: ${url.href}, requested from: ${message.author}`);
        } else if (url.hostname === 'spotify.com') {

        }
    }
}

export default {
    client,
    requestList
}