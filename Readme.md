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
5.) 

