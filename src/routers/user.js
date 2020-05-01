const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

const router = new express.Router();


router.post('/users', async (req,res)=>{
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    }catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/login', async (req, res)=>{

   try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token})

   } catch (e) {
        res.status(400).send();
   }
});

//İkinci parametre olarak auth verdik. Bu şu demek;
// /users/logout 'a istek atanb ir kişi için ilk önce auth middleware'i çalışacaktır. Auth fonksiyounda next(); komutu çalıştığı an bizim 3. parametredeki metodumuz çalışacaktır.
router.post('/users/logout', auth, async (req, res)=>{


    //Burda yaptığımız şey şu; Biz User modelinde tokens saklıyorduk. Çünkü telden pc'den tablet'den girdim hepsi için farklı token -ım var ve ben bunları ordaki array'de tutuyordum.
    //Kullanıcı logout olduğunda ise o kullnaıcıının tokenlarının (req.user.tokens) içinden logout yaptığı o anki token'ı (req.token) siliyorum. Bu sayede diğer yerlerdeki tokenlarına dokunmamış oluyorum.
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();
        res.send();
    }catch (e) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res)=>{

    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch (e) {
        res.status(500).send();
    }
});

router.get('/users/me', auth,async (req, res) => {
        res.send(req.user);
});

//Get All Users
router.get('/users', async(req, res) => {
    User.find({}).then(users => {
        res.send(users);
    }).catch(e => {
        res.status(500).send(e);
    });
});

//Get user by id
router.get('/users/:id',async(req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if (!user){
            return res.status(404).send();
        }
        res.send(user);
    }catch (e) {
        res.status(500).send(e);
    }
});

//-----------------------------------------------------------------------------------------

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));
    //every =>bi tane bile uyuşmayan olursa result false.
    //every ile Burda yapılmak istenen şey update etmek için gönderdiğin body json'ındaki tüm değerlerin gerçekten de o tabloda var olması. Kullanıcı olmayan bir alanı update etmek isteyebilir hata vercek bu sayede.

    if (!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'});
    }

    //Update işleminde neden findByIdAndUpdate fonksiyonunu kullanmadım sence?
    //Bunun cevabı aşağıdaki eski ama yorum olarak duran kodda.
    try {
        updates.forEach((update)=> req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    }catch (e) {
        res.status(404).send(e);
    }
});






//---------------------------Artık login olan kullanıcıyı update edicemiz için id'sini almamıza gerek kalmadı.---------------------

/*router.patch('/users/:id', async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));//every =>bi tane bile uyuşmayan olursa result false.

    if (!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'});
    }

    try {
        const user = await User.findById(req.params.id);
        updates.forEach((update)=> user[update] = req.body[update]);
        await user.save();


    //Yukardaki 3 satır kod ile bi alttaki yoruma alınan satır aynı işlemi yapıyor. Yukarda dolaylı yoldan yapıyoruz sadece. Peki neden ?
    // Adam password'unu güncellmeke istiyor diyelim. Ancak bizim password güncelleenirken ki çalışan hashleme olayımız nerdeydi?
    //models\uer.js => pre('save') fonksiyounda idi. Yani Bu fonksiyon herhangi bir save olma işleminden hemen önce çalışıyordu.
    //Eğer altsatırdaki gibi yapsaydık save işlemi olmadığından bizim password'umuz hashlenmicekti.
    //Bu yüzden ilk önce ilgili user'ı bulduk daha sonrasında ilgili alanlarını güncelleyip save methodu ile kayettik ki => pre('save') methoduna girsin ve password hashlensin.

    //const user = await User.findByIdAndUpdate(req.params.id, req.body,{ new: true,runValidators: true }); // new :true => updatelenmiş userı geri döndür.


                                                                                                                // runValidators: true => olmayan bi alanı update'lemeye çalıştığında kontrol eder hata verdirtir.
        if (!user){
            return res.status(404).send();
        }
        res.send(user);
    }catch (e) {
        res.status(404).send(e);
    }
});*/



//auth'a uğradığından req.user kullanabiliriz. Artık giriş yapan kullanıcı var bizde çünkü.
router.delete('/users/me', auth, async (req, res)=>{
    try {
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name);
        res.send(req.user);
    }catch (e) {
        res.status(500).send();
    }
});

const upload = multer({
    //dest:'avatars', => bunu eklersek kendi file system'imizde avatars klasörü altına kaydedicek. Eğer silmezsek multer bize 192. satırda kullandığımız gibi bir response dönmez.
    // Bu yüzden bunu kaldırıyoruz ki aşağıda bize response dönsün.(192). Ve biz de artık file system'e değil user objesine kayedebilelim.
    limits:{
        fileSize: 1000000  //set a limit for the max file size (bytes) (this case 1 mb)
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined,true); //first argument error, second argument => true  => upload excepted.
    }//                                                             => false => upload rejected.

});

//upload.single('upload') => upload postman'de body kısmındaki key değerine eşittir.
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{

    //sharp => we can resize the image. If you dont want to use sharp. => const buffer = req.file.buffer;
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();

//Db'ye seçilen içeriğin binary data'lı halini kaydetmiş olduk. Bunu eğer kullanmak istersen ön trafta js olarak mesela şöyle kullanabilirsin.
//<img src="data:image/jpg;base64,burayaBinaryDataStringiGelecek" /> böyle render edebilirsin.
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
});

//http://localhost:3000/users/5dee74487edef40a0406dfbd/avatar
router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get('/users/:id/avatar', async (req, res)=>{
   try {
       const user = await User.findById(req.params.id);

       if (!user || !user.avatar){
            throw new Error();
       }
       res.set('Content-Type','image/jpg'); //bunu set etmezsem resim olarak göremem. İçeriğin ne olduğunu belirtiyorum burda.
       res.send(user.avatar)

//http://localhost:3000/users/5eaad76afc7c0b3b0834216f/avatar => adresine gidersek resmi browser'da görebiliriz.
// veya yukardaki gibi js'de render etmek istersen şöylede yapabilirsin. <img src="http://localhost:3000/users/5eaad76afc7c0b3b0834216f/avatar" />
   } catch (e) {
       res.status(400).send();
   }
});

/*router.delete('/users/:id',async (req, res)=>{

    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    }catch (e) {
        res.status(500).send();
    }
});*/
module.exports = router;
