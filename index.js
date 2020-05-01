const express = require('express');
require('./src/db/mongoose');
const userRouter = require('./src/routers/user');
const taskRouter = require('./src/routers/task');

const app = express();
const port = process.env.PORT; //npm i env-cmd --save-dev => bunu yükledik. Amaç .env dosyasındaki key value değerlerne projede process.env. diye ulaşabilmemiz.
                                 // bunun içinde projeyi alıştırıken package.json'da nodemon ile çalıştırmadan hemen önce şunu yazdık => env-cmd ./config/dev.env
                                 //bu sayede program alışırken yüklediğimiz olan env-cmd'ye bizim .env file'ımızın yerini götermiş olduk. (./config/dev.env)



//app.use(express.json()); => Automatically pass incoming JSON to an object. Bunu yapmazsan postman'de istek atarken body'de yolladığın değerleri json objesi olarak alamazsın.
//Şimdi ise req.body (user.js:12) => komutuyla kod içerisinde  json objesi olarak alabiliyorum.

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () =>{
   console.log('Server is up on port ' + port)
});


//Kendime Not:

// 1.) req.query => url'den parametre alımı.
// http://localhost:3000/products?search=games&name=murat => böyle bir istek attığımda req.query çıktısı şu olacaktır => { search: 'games', name: 'murat' }

// 2.) req.params
// router.get('/users/:id', (req, res) => {...}  => böyle bir eşleşme yaklandığında ise id değerini req.params.id ile alabilirsin.

// 3.) req.body
// Postman'den yazdığın api'yi test ederken body'kısmında gönderdiğin json objesini burada req.body diye alabilirsin. Burda önemli olan ;
// index.js'de olduğu gibi  => app.use(express.json()); => komutunu yazman. Bu sayede body'den gelen değerleri geldii gibi obje olarak kullanabilirsin.
