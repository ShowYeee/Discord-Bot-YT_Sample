module.exports.run = async (message, serverQueue, queue) => {
    if (!message.member.voiceChannel ) return message.reply('❗️ 你必須進入一個語音頻道內');

    try{
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        return message.channel.send(`🎵 已斷開連結，感謝使用`);

    }catch(err){
        console.log(err);
        return message.reply('❗️ 你必須進入一個語音頻道內');
    }
}
module.exports.help ={
    name: "stop"
}