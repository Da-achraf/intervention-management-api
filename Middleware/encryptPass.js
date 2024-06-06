const bcrypt = require("bcrypt");

class EncryptPass {
  static async CreateCipherPass(plainPass){
    try {
        return await bcrypt.hash(plainPass, 10)
      
    } catch (error) {
      return error.message
    }
  }

  static async ComparePasswords(EncPass, PlainPass){
    try {

      return await bcrypt.compare(PlainPass, EncPass)

    } catch (error) {
      return error.message
    }
  }

}

module.exports = EncryptPass;