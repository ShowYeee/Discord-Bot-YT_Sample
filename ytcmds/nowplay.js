module.exports.run = async (message, serverQueue) => {
    message.channel.send(`🔊  正在播放  **${serverQueue.songs[0].title}**  (${serverQueue.songs[0].duration})  ${serverQueue.songs[0].url}`);
}

module.exports.help ={
    name: "nowplay"
}