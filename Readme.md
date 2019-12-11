1.) mongodb server zip indirdik.
2.) /users/murat/ altına koyduk rename (mongodb) olarak
3.) /users/murat/ yeni bi dosya oluşturdul mongodb-data diye.
4.) konsolda herhangi bi yerde çalıştır => /Users/murat/mongodb/bin/mongod.exe --dbpath=/Users/murat/mongodb-data (bunun çalışır durumda olmassı lazım konsolda localhost db srever'unu ayakta tutar.)
5.) mongodb admin tool için robo3T indir connect yap.
6.) proje oluştur. Oluşturduğun projeye git. 
7.= npm init -y
8.) npm i mongodb@3.1.10

-----------mongoose-----(orm like hibernate)------
-) npm i mongoose@5.3.16


-------------------mongoose ile herokuda çalışabilmek için db konfigirasyonu----
1.) Mongo DB atlas' sitesine gidip yeni bir proje oluşturduk ve bir cluster buld ettik. 
2.) Connect dedik ve ip adresimizi değiştirdik. 0.0.0.0/0
3.) Aynı yerden hemen bi db user oluşturcaz. username = (taskapp)  şifre = 13murat09
4.) Son adım oalrak connect database yapıcaz bunu compass üzerinden yapıcaz indirmiştiik compass'ı.
5.) url' kopyaladık sonra compassı açtık cınnect dedik db'mize bağlandı.
6.) url'deki cluster0-ybv96.mongodb.net => bu kısmı kopyaladım compass'de new connection diyip Hostname kısmına yapıştırdım.
7.) srv record işaretledim. Authentication = username passwrod seçtim.
8.) username = taskapp ve password ksıımlarına 13murat09 yazdım.
9.) Favorite name = Production MongoDB Database (buraya kadar ki her alanı boş bıraktım.)
Artık robo3t ihtiyacımız yok.

------------------------------DEPLOYYYYYYYYYYYYYYYYYY--------------
1.) git init
2.) .gitignore oluşturdum ve için de göndermek istemediğim dosyaları yada dizinleri yazdım.
3.) git status ile gidilecek olanları son kez kontrol ettim. Aslında sadece package'ler , src , index.js dosyaları kalmalı.
4.) git add . => staging are'ya aldım.
5.) git commit -m "init commit"
6.) github adresmiie gidip yeni bi repository oluşturdum.
7.) …or push an existing repository from the command line => altındaki 2 satır kodu sırasıyla çalışyırıyoruz.
8.) githubdaki bulunduğun sayfayı yenile ve projeni orada gör. 

devam ediyoruz heroku ile

9.) heroku create murat-task-manager
10.) Öncekinden farkı olarak bu projede dev.env'daki değişkenlerimizin config ayarlarını herokuya tanıtmamız gerekiyor.
11.) heroku config:set key=value
12.) heroku config
13.) heroku config:unset key 
14.) heroku config => bunu tekrar çalıştırarak git status gibi düşün bunu. durumu görmek için çalışyırıyoruz. Şuan bomboş bir key value confiğimiz var.
15.) şimdi gerçekten ihtiyacımızo lan key value ları setlemeye geldi.
16.) heroku config:set JWT_SECRET=thisisasecretformyapp SENDGRID_API_KEY=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 
17.) atlas sitesine geri dön connect de ve Connect your application seç. Daha sonra short SRV connection string seç ve çıkan url kopyala.
18.) <password> kısmını 13murat09 ile değştirdikten sonra /test kısmınıda kendi db adım ile değiştiriyorum ve son hali aşağıdaki gibi. Son olarak elimizdeki url'i heroku'ya yukardaki gibi setlicez.
19.) heroku config:set MONGODB_URL='mongodb+srv://taskapp:13murat09@cluster0-ybv96.mongodb.net/task-manager-api?retryWrites=true'
20.) heroku config diyerek kontrol edebilirimi key value değerlerimi.
21.) dev.end'deki PORT kısmını heroku config'de tanımlamamıza gerek yok hereko port olayını kendisi yönetiyor.
22.) git push heroku master
23.) Bunu yapınca bazı hatalar aşdım araştıdığımda çözm şu oldu.
    23.1.) npm i sharp@latest
    23.2.) git add .
    23.3.) git commit -m"sharp latest"
    23.4.) git push 
    23.5.) git push heroku master
    
24.)https://murat-task-manager.herokuapp.com => deploy balarılı bir şekilde olduktan sonra konsolda çıkan bu url'i alıp
25.) postman'de prod environment'da url kısmına bunu setleyebilriim artık buraya istek atıcam.

