module.exports.run = async (client, msg, arg, Attachment) => {
    var num = Math.floor(Math.random()*100)+1;
    if(num <= 40){
        var attachment = new Attachment('./image/5brides/5GIF/'+ (Math.floor(Math.random()*5)+1) + '.gif');
        msg.channel.send(attachment);
    }else{
        var rng = require("../rngimage.js");
        var attachment = new Attachment(rng.rngimage('5brides'));
        msg.channel.send(attachment);
    }
}
module.exports.help ={
    name: "五等分占卜"
}