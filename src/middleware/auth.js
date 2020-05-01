const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {

    //jwt.sign({_id:'abc123'}, 'selam') => diyelim ki sen böyle token ürettin.
    //verify yaptığın yerde return olacak çıktı şudur=> {_id:'abc123', iat:'2314123'} => burdan _id'yi çekebilirsin.

    try {
        //Burada sen postman'den istek atarken Authorization kısmına Bearer token => değerini set edip atıyorsun..
        //Burada yaptığı şey req.header('Authorization') ile Bearer token değerini alıyor. Bearer kısmını boşluk ile değiştiriyor elinde sadece saf token kalıyor.

         const token = req.header('Authorization').replace('Bearer ','');
         console.log(token);
         const decoded = jwt.verify(token, process.env.JWT_SECRET);


         console.log(decoded);
         const user = await User.findOne({ _id: decoded._id, 'tokens.token': token});

        if (!user){
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    }catch (e) {
        res.status(401).send({error: 'Please authenticate.'})
    }
};

module.exports = auth;
