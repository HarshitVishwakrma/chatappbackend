const admin = require('firebase-admin');
const serviceAccount = require('./chatapplication-fefe7-firebase-adminsdk-ce6js-bc88d77903.json');

admin.initializeApp({
    credential : admin.credential.cert(serviceAccount),
    storageBucket : 'gs://chatapplication-fefe7.appspot.com'
})

const bucket = admin.storage().bucket();

module.exports = bucket;