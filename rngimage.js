module.exports  = {
    rngimage: function(FILENAME){
        var DIR = './image/'+FILENAME+"/";
        fs = require('fs');
        var len = (fs.readdirSync(DIR)).length;
        var num = Math.floor(Math.random()*len)+1;
        var filepath = DIR + num + '.jpg';
        console.log(filepath);
        return filepath;
    }   
};