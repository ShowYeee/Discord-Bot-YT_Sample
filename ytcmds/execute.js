module.exports.run = async (message, serverQueue, queue) => {

    const ytdl = require('ytdl-core');
    const ytpl = require('ytpl');

    const args = message.content.split(' ');
    const voiceChannel = message.member.voiceChannel;

    //錯誤判斷
    if(!args[1]) return message.reply(':x: 請輸入網址');
        if (!voiceChannel) return message.reply(':x: 你必須進入一個語音頻道內');
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.reply(':x: 我的權限不足');
        }
    if(!args[1].startsWith("http")) return message.reply(':x: 請輸入有效網址');
    
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
        var deletevideo = 0;
        ytpl(args[1], function(err, playlist) {

            if(err) throw err;
            var start = 0;


            //檢查從第幾首歌開始
            if(args[1].includes("index=")){  
                start = parseInt(args[1].substr(args[1].lastIndexOf("index=")+6, 4)); //從index=第幾首歌開始
                start--;
            }
            
            for(i = start; i < playlist.items.length ; i++){
                const asong = {
                    title: playlist.items[i].title,
                    url: playlist.items[i].url_simple,
                    duration: playlist.items[i].duration,
                };
                if(asong.duration === null){
                    deletevideo++;
                    continue;               
                }
                if(!serverQueue){
                    queueContruct.songs.push(asong);
                }else{
                    serverQueue.songs.push(asong);
                }       		
            }

        message.channel.send(`:ballot_box_with_check:    **${playlist.items.length-start+1-deletevideo}**  首歌已加入播放佇列`);
        });
    }else{
        var songInfo = ''; 
        try{
            songInfo = await ytdl.getInfo(args[1]);
        }catch(err){
            console.log(err);
            return message.channel.send(`:x: 糟了，這首歌似乎不能加入 (被檢舉 or 地區不支援)`);
        }
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
        message.channel.send(`:ballot_box_with_check:    **${song.title}**  ${song.duration} 已加入播放佇列`);
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

    

    function play(guild, song, message){
        const serverQueue = queue.get(guild.id);
        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }
        console.log('Now playing :' + song.title + "(" + song.duration + ")"); 
        message.channel.send(`:loud_sound:   開始播放  **${song.title}**  (${song.duration})`);
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
    
    function formatSecond(secs) {          
        var hr = Math.floor(secs / 3600);
        var min = Math.floor((secs - (hr * 3600)) / 60);
        var sec = parseInt( secs - (hr * 3600) - (min * 60));
        
        while (min.length < 2) { min = '0' + min; }
        while (sec.length < 2) { sec = '0' + min; }
        if (hr) hr += ':';
        return hr + min + ':' + sec;
    }
}

module.exports.help ={
    name: "play",
    name2: "p"
}