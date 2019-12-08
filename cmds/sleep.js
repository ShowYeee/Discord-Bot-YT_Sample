module.exports.run = async (client, msg, arg, Attachment) => {
    msg.reply('很好啊，快睡');
    var attachment = new Attachment('./image/sleep.jpg');
    msg.channel.send(attachment); 
}
module.exports.help ={
    name: "那我也要睡啦"
}