const mongoose = require('mongoose');

function connectTodb(){
    mongoose.connect(process.env.DB_CONNECT,
         {useNewurlParser: true , useUnifiedTopology: true}
        ).then(() => {
            console.log(`Connected to DB`);

        }).catch(err => console.log(err));

}

module.exports = connectTodb;