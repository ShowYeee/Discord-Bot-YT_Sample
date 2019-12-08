const { Client, Attachment } = require('discord.js');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const client = new Client();
const queue = new Map();
const { prefix, token } = require('./config.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

if (msg.author.bot) return;
if (!msg.content.startsWith(prefix)) return;

const serverQueue = queue.get(msg.guild.id);

if (msg.content.startsWith(`${prefix}play`) || msg.content.startsWith(`${prefix}p`)) {
try {
    execute(msg, serverQueue);
        return;
}catch (err) {
    message.channel.send("好像出了點差錯...請重新輸入")
    return;
}
    
} else if (msg.content.startsWith(`${prefix}skip`)) {
    skip(msg, serverQueue);
    return;
} else if (msg.content.startsWith(`${prefix}stop`)) {
    stop(msg, serverQueue);
    return;
} else if (msg.content.startsWith(`${prefix}nowplaying`) || msg.content.startsWith(`${prefix}np`)) {
    nowplaying(msg, serverQueue);
    return;
}else if(msg.content.startsWith(`${prefix}queue`) || msg.content.startsWith(`${prefix}q`)){
    songlist(msg, serverQueue);
}else {
    //msg.reply('❗️ 請輸入有效指令')
    return;
}
});  

function formatSecond(secs) {          
var hr = Math.floor(secs / 3600);
var min = Math.floor((secs - (hr * 3600)) / 60);
var sec = parseInt( secs - (hr * 3600) - (min * 60));

while (min.length < 2) { min = '0' + min; }
while (sec.length < 2) { sec = '0' + min; }
if (hr) hr += ':';
return hr + min + ':' + sec;
}

async function execute(message, serverQueue) {
const args = message.content.split(' ');
const voiceChannel = message.member.voiceChannel;

//錯誤判斷
if(!args[1]) return message.reply('❗️ 請輸入網址');
    if (!voiceChannel) return message.reply('❗️ 你必須進入一個語音頻道內');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return message.reply('❗️ 我的權限不足');
    }
if(!args[1].startsWith("http")) return message.reply('❗️ 請輸入有效網址');
    
var queueContruct = {};

    if (!serverQueue) {
        queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        };

        queue.set(message.guild.id, queueContruct);
    }

    //網址為播放清單
    if(args[1].includes("list=")){
        ytpl(args[1], function(err, playlist) {

            console.log(playlist);
            if(err) throw err;
            var start = 0;

            //檢查從第幾首歌開始
            if(args[1].includes("index=")){  
                start = parseInt(args[1].substr(args[1].lastIndexOf("index=")+6, 4)); //從index=第幾首歌開始
            }
            
            for(i = start; i < playlist.items.length ; i++){
                const asong = {
                    title: playlist.items[i].title,
                    url: playlist.items[i].url_simple,
                    duration: playlist.items[i].duration,
                };
                if(!serverQueue){
                    queueContruct.songs.push(asong);
                }else{
                    serverQueue.songs.push(asong);
                }       		
            }

        message.channel.send(`✔️  **${playlist.items.length-start+1}**  首歌已加入播放佇列`);
        });
    }else{
        const songInfo = await ytdl.getInfo(args[1]);
        const song = {
            title: songInfo.title,
            url: songInfo.video_url,
            duration: formatSecond(songInfo.length_seconds),
        };
        if(!serverQueue){
            queueContruct.songs.push(song);
        }else{
            serverQueue.songs.push(song);
        }
        message.channel.send(`✔️  **${song.title}**  ${song.duration} 已加入播放佇列`);
    }

    //呼叫播放函式
    if(!serverQueue){
        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0],message);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    }    
}

function skip(message, serverQueue) {
    if (!message.member.voiceChannel) return message.reply('❗️ 你必須進入一個語音頻道內');
    if (!serverQueue) return message.reply('❗️ 播放佇列沒能讓你skip');
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voiceChannel) return message.reply('❗️ 你必須進入一個語音頻道內');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    return message.channel.send(`🎵  ${client.user}  已斷開連結，感謝使用`);
}

function play(guild, song, message) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    console.log('Now playing :' + song.title + "(" + song.duration + ")"); 
    message.channel.send(`🔊  開始播放  **${song.title}**  (${song.duration})`);
    //若server端網速太慢會造成影片播到最後10~15秒突然停止播放的情況，必須設定highWaterMark參數 (Reftence : https://github.com/fent/node-ytdl-core/issues/402)
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url, { filter: 'audioonly',highWaterMark: 1<<25 }))
        .on('end', () => {
            console.log('Music ended!');
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0],message);
        })
        .on('error', error => {
            console.error(error);
        });
    dispatcher.setVolumeLogarithmic(serverQueue.volume/5);
}

function nowplaying (message, serverQueue){
    return message.channel.send(`🔊  正在播放  **${serverQueue.songs[0].title}**  (${serverQueue.songs[0].duration})  ${serverQueue.songs[0].url}`);
}


function songlist (message, serverQueue) {
    if (!serverQueue || serverQueue.songs.length == 1) return message.reply('❗️ 播放佇列是空的');
    const args = message.content.split(' ');
    
    //一些參數設定
    var start = 1;
    var end = 10;
    if(args[1]) end = args[1];
    if(args[2]){
        if(args[2] > args[1]){
            start = args[1];
            end = args[2];
        }else{
            start = args[2];
            end = args[1];
        }	
    }
    if(end > serverQueue.songs.length-1) return message.reply(`❗️ 播放佇列只有 **${serverQueue.songs.length}** 首歌`);
    
    //建立 embed
    var playembed = {
        embed: {
            title : `總共有 **${serverQueue.songs.length}** 首歌在佇列中`,
            fields :[],
        }
    }
    for(i = start ; i <= end ; i++){	
        const asong = {
            name : `**${[i]}.**  [${serverQueue.songs[i].duration}]  **${serverQueue.songs[i].title}**` ,
            value :serverQueue.songs[i].url,
        };
        playembed.embed.fields.push(asong);	
    }
    
    message.channel.send(`:arrow_forward:   正在播放  **${serverQueue.songs[0].title}**  (${serverQueue.songs[0].duration})`);
    return message.channel.send(playembed);	
}
  
  
  client.login(token);
  