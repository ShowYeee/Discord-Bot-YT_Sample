module.exports.run = async (message, serverQueue, queue) => {
    if (!serverQueue || serverQueue.songs.length == 1) return message.reply(':x: 播放佇列是空的');
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
    if(end > serverQueue.songs.length-1) return message.reply(`:x: 播放佇列只有 **${serverQueue.songs.length}** 首歌`);
    
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
    
    message.channel.send(`:loud_sound:    正在播放  **${serverQueue.songs[0].title}**  (${serverQueue.songs[0].duration})`);
    return message.channel.send(playembed);
}
module.exports.help ={
    name: "queue"
}