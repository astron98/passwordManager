const aes256 = require("aes256")

exports.encrypting = async function(key, plaintext){
    try {
        return aes256.encrypt(key, plaintext);

    }
    catch(err) {
        console.log(err)
    }
}

exports.decrypting = async function(key, ciphertext){
    try {
        return aes256.decrypt(key, ciphertext);

    }
    catch(err) {
        console.log(err)
    }
}