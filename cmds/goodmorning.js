module.exports.run = async (client, msg, arg, Attachment) => {
    var rng = require("../rngimage.js");
    var attachment = new Attachment(rng.rngimage('morning'));
    msg.channel.send(attachment); 
}
module.exports.help ={
    name: "早安noda"
}