module.exports.run = async (message, serverQueue) => {
    if (!message.member.voiceChannel) return message.reply('❗️ 你必須進入一個語音頻道內');
    if (!serverQueue) return message.reply('❗️ 播放佇列沒能讓你skip');
    serverQueue.connection.dispatcher.end();
}
module.exports.help ={
    name: "skip"
}