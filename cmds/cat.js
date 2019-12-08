module.exports.run = async (client, msg, arg, Attachment) => {
    var rng = require("../rngimage.js");
    var attachment = new Attachment(rng.rngimage('cat'));
    msg.channel.send(attachment); 
}
module.exports.help ={
    name: "貓咪占卜"
}