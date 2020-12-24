import {DateTime} from "luxon";
import * as Discord from "discord.js";
import youtubeDownload from "ytdl-core";
import config from "./config.json"
import youtubeStream from "youtube-audio-stream";

const helpCMD = require('./commands/help');

const client = new Discord.Client();
let connection = null;
let dispatcher = null;
let volumes = [];

const requestList = [];


client.once('ready', () => {
    console.log(`${logPrefix()}Up and Running!`);
});

client.login(config.token);
client.on('message', async message => {
        // Voice only works in guilds, if the message does not come from a guild,
        // we ignore it
        if (!message.guild) return;
        if (message.content.includes('.play', 0)) {
            // Only try to join the sender's voice channel if they are in one themselves
            if (message.member.voice.channel) {

                connection = await message.member.voice.channel.join();
                if (volumes.findIndex(x => x.serverId === message.guild) === -1) {
                    volumes.push({serverId: message.guild, volume: 50});
                }

                await runPlay(
                    message.content.replace('.play ', ''),
                    volumes[volumes.findIndex(x => x.serverId === message.guild)].volume,
                    message.author,
                    message.channel);

                //TODO Give reactions a reason
                // await message.react('⏸');
                // await message.react('🔉');
                // await message.react('🔊');



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
            requestList.push({args: args, author: message.author, channel: message.channel});
            console.info(`${logPrefix()}Added ${args}, to queue from: ${message.author}`);

        }
    }
);

/**
 * @param {Readable} runnable
 */
function playAudio(runnable, volume) {
    dispatcher = connection.play(runnable, {volume: volume / 100});
}

/**
 * @param {string} args
 * @param {int} volume
 * @param {User} author
 * @param {TextChannel | DMChannel | NewsChannel} channel
 */
async function runPlay(args, volume, author, channel) {

    if (args === '🐄') {
        let url = 'https://www.youtube.com/watch?v=lXxUPo9tRao'
    } else if (args.includes('http') || args.includes('https://')) {

        let url = new URL(args);
        if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
            playAudio(youtubeDownload(url.href, {filter: 'audioonly'}), volume);
            console.info(`${logPrefix()}Playing Song: ${url.href}`);
        } else if (url.hostname === 'spotify.com') {

        }
    }

    dispatcher.on('finish', () => {

        console.info(`${logPrefix()}Finished`);

        if (requestList.length !== 0) {
            console.info(`${logPrefix()}Continue with queue`);
            runPlay(requestList[0].args, volume, requestList[0].message, requestList[0].channel);
            requestList.shift();

            const nowPlayingEmbed = new Discord.MessageEmbed()
                .setColor('#3bd410')
                .setTitle('🎶 Now playing:')
                .setDescription(`${args}`)
                .setFooter(`Hinzugefügt von ${author.username}`, `${author.avatarURL()}`);
            channel.send(nowPlayingEmbed);

        }
    });
}

function logPrefix() {
    return "[" + DateTime.local().toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS) + "]";
}

export default {
    client,
    requestList
}