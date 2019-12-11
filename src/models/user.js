
//----------------------User => users scheme and rules------------------

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required: true,
        trim:true,
        lowercase:true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error('Email is invalid.')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value){
            if (value.toLowerCase().includes('password')){
                throw new Error('Password can not contain "password"')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if (value < 0 ) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
});


userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

//toJSON => this means we have the exact same behavior any other time we are sending the user back like => res.send(user)
// responseData => password and tokensarray not see anymore.
userSchema.methods.toJSON = function () {

    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

userSchema.statics.findByCredentials = async (email, password)=> {

    const user = await User.findOne({ email });

    if (!user){
        throw new Error('Unable to login.!')
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch){
        throw new Error('Unable to login!')
    }

    return user;
};

//hash the plain text passwordbefore saving.
userSchema.pre('save', async function (next) {
    const user = this;

    console.log('just before saving!.');
//when someone creates a user or when they update their existing user password => get hashed.
    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

//delete user tasks when user is remove
userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model('User',userSchema);

//----------------------Create User and save to db------------------

/*
const me = new User({
    name:'      Murat           ',
    email:'mike@mead.IO         ',
    password: 'Murat123'

});

me.save().then(()=>{
    console.log(me)
}).catch((error)=>{
    console.log('Error :' + error)
});
*/


module.exports = User;
