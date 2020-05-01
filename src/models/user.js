
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
        type: Buffer //store binary image data.
    }
},{
    timestamps: true //bunu yazarsan db'de kendisi otomatik her user objesine createdAt ve updatedAt field'larını eklicektir.
});


//virtual= sanal demek. Yani bu tasks filed'ı db'de saklanmicak. AMacı sadece aradaki ilişikiyi belirleme.
//Yani burdaki ilişkiden şöyle bahsediyorsun. Benim user modelimdki _id (localField) ile Task (ref) modelindeki owner (foreignField) ilişki içerisinde.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

//toJSON => otomatik olarak res.send(user) user objesi döndüğün her yerde tokens array'ini , password ve avatar field'larını aşağıdaki kod sayesinde siliyoruz ekrandan.
// responseData => password and tokensarray not see anymore.
userSchema.methods.toJSON = function () {

    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

userSchema.methods.generateAuthToken = async function () {//routers\user.js:29'da çağırılan method.User yani model ismi ile değilde bir örneği bir objesi ile yani küçüçk user ile çağrıldığından statics değilde methods kullandık.
    const user = this;
    const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    // const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '0 seconds'}); // 0 saniye sonra geçersiz olsun dedik. Böyle süre de verilebilir.

    user.tokens = user.tokens.concat({ token }); //Ben mesela farklı farklı cihazlardan login olcam. Her seferinde tek bir token döndürürsem o anlık ne olur diğer hesaplardan çıkış yapar..
                                                 // Ben bu yüzden User modelimin içine tokens array'i oluşturdum ki eski tokenlar'ımıda tutayım ne olur ne olmaz.
    await user.save();

    return token;
};

userSchema.statics.findByCredentials = async (email, password)=> { //routers\user.js:28'de çağırılan method. User yani class ismi ile direk çağırıldığından static yaptık.
                                                                    // login olmak isteyen user'ın email ve password'unun eşleşme işlemine bakılıyor.
    const user = await User.findOne({ email });

    if (!user){
        throw new Error('Unable to login.!')
    }
    const isMatch = await bcrypt.compare(password, user.password); //Gelen password değeri ile (first argument) user'ın db'de yazılı olan hash'li olan parolası(second argument) eşit ise true.

    if (!isMatch){
        throw new Error('Unable to login!')
    }

    return user;
};

// function arrow function olamaz. Burda yaptığımız şey middleware. 2 şekilde ulaşılabilir.
// pre ile önce yapılması istediğin, post ile sonra çalışmasını istediğin şeyleri yapabilirsin.
// ben burada pre save diyerek user kaydedilmeden önce yapmak istediğm işlemleri belirliyorum.
// hash the plain text password before saving.
userSchema.pre('save', async function (next) {
    const user = this;

    console.log('just before saving!.');

    if (user.isModified('password')){// user.isModified ?=> birisi yeni user oluşturduğunda veya zaten olan bir user'ın parolasını değiştirmek istediğinde rue döner.
        user.password = await bcrypt.hash(user.password, 8); //second argument=> how many times the hashing algorithm is executed.
    }

    next(); // Kodun bittiğini belirtmek amacıyla en sona yazıyoruz. Yazmazsak fonskiyonun çalışması durmicak.
});

//delete user tasks when user is remove. Herhangi bir user remove etmeden heemn önce bende user'a ait taskları siliyorum.
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
