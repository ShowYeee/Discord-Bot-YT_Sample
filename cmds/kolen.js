module.exports.run = async (client, msg, arg, Attachment) => {
    var attachment = new Attachment('./image/kolen.jpg');
    msg.channel.send(attachment); 
}
module.exports.help ={
    name: "可憐哪"
}