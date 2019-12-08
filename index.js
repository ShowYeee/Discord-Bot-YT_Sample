const { Client, Attachment, Collection } = require('discord.js');
const client = new Client();
const { prefix, token } = require('./config.json');
const fs = require("fs");
const queue = new Map();
client.commends = new Collection();
client.ytcommends = new Collection();

fs.readdir("./cmds", (err,files) => {
    if(err) console.error(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if(jsfile.length <= 0){
        console.log("No commend load!!");
        return;
    }
    console.log(`Loading ${jsfile.length} commends`);

    jsfile.forEach((f,i) => {
        let props = require(`./cmds/${f}`);
        //console.log(`${i+1}: ${f} loaded!`);
        client.commends.set(props.help.name, props);

    }); 
});

fs.readdir("./ytcmds", (err,files) => {
    if(err) console.error(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if(jsfile.length <= 0){
        console.log("No commend load!!");
        return;
    }
    console.log(`Loading ${jsfile.length} ytcommends`);

    jsfile.forEach((f,i) => {
        let props = require(`./ytcmds/${f}`);
        //console.log(`${i+1}: ${f} loaded!`);
        client.ytcommends.set(props.help.name, props);
        client.ytcommends.set(props.help.name2, props);

    }); 
});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});



client.on('message', msg => {

    const serverQueue = queue.get(msg.guild.id);

    if(msg.author.bot) return;
    if(msg.channel.type === "dm") return;

    let messageArray = msg.content.split(/\s+/g);
    let commend = messageArray[0];
    let args = messageArray.slice(1);
    
    let cmd = client.commends.get(commend);
    let ytcmd = client.ytcommends.get(commend.slice(prefix.length));
    
    if(cmd) cmd.run(client, msg, args, Attachment);
    if(ytcmd) ytcmd.run(msg, serverQueue, queue);
    
 
});

client.login(token);
