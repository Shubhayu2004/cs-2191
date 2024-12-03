const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    fullname:{
        firstname:{
            type: String,
            required: true,
            minlength: [1,'First Name must be atleast 1 character long'],
            
        },
        lastname:{
            type: String,
            required: true,
            minlength: [1,'Last Name must be atleast 1 character long'],
        }
    },
    email:{
        type: String,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],

    },
    password:{
        type: String,
        required: true,
        select: false,
    },
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
    return token;
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password ,this.password);
    
}
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
    
}

const userModel = mongoose.model('user' , userSchema);

module.exports = userModel;

