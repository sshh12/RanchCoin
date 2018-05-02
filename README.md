# RanchCoin

A "CryptoCurrency" for EconFair.

[Live Code](https://ranchcoin.firebaseapp.com/#)

## Features

* View balance and see transaction details
* Redeem RanchCoin code (Manually or QR code)
* Send RanchCoin (Manually/email/QR)
* Request RanchCoin (Manually/email/QR)
* Transactions validated server side
* Use Google accounts

## Dependencies

* [Firebase](https://firebase.google.com/)
* [Instascan](https://github.com/schmich/instascan)
* [QRcodeJS](https://davidshimjs.github.io/qrcodejs/)

## Setup

#### Realtime Database
```
ranchcoin
|
|--- accounts
|      |
|      |- $uid
|           |
|           |- balance
|           |- transactions
|                |- $id: %timestamp%
|
|--- certs
|      |- $certcode: %value%
|
|--- transactions
|      |- $id
|           |- amount: %amount%
|           |- receiver: %name%
|           |- sender: $uid
|           |- timestamp: %timestamp%
|           |- type: %type%
|
|--- users
|      |- $uid
|           |- email: %email%
|           |- firstname: %name[0]%
|           |- name: %name%
|           |- photoURL: %url%
```

#### CLI

1. `git clone https://github.com/sshh12/RanchCoin.git`
2. `npm install`
3. [Create](https://firebase.google.com/console) Firebase project
4. Enable Realtime Database and Google Sign-in
5. `firebase use --add`
6. `firebase deploy`

## Screenshots

![balance](https://user-images.githubusercontent.com/6625384/39553689-800be568-4e34-11e8-86f5-7d32e4927666.png) ![send](https://user-images.githubusercontent.com/6625384/39553693-8493aae4-4e34-11e8-9d55-d4ef2d335e6e.png)
