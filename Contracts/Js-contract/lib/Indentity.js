
'use strict';
const NodeRSA = require('node-rsa');

class Indentity {
  /**
   *
   * User
   *
   * Constructor for a User object. This is what the point of the application is - create 
   * User identity or Information.
   *  
   * @param args.firstName {String} - FirstName of the user
   * @param args.lastName {String} - LastName of the user 
   * @param args.origin {String} - Origin of the user
   * @param args.country {String} - Country of the user
   * @param args.dob {Date} - Date Of Birth of the user
   * @returns - organization object
   */
  constructor(ctx, args) {
    this.firstName = args.firstName;
    this.email = args.email;
    this.phoneNumber = args.phoneNumber;
    this.lastName = args.lastName;
    this.residentialAddress = args.residentialAddress;
    if (this.__isContract) {
      delete this.__isContract;
    }
    return this;
  }

  async encrypt(ctx, public_key) {
    // Encrypt
    const key = new NodeRSA(public_key);
    const encrypted = key.encrypt(JSON.stringify(this), 'base64');
    return encrypted;
  }

  static async decrypt(ctx, private_key, encrypted) {
    // Decrypt
    const key = new NodeRSA(private_key)
    const decrypted = key.decrypt(encrypted, 'utf-8');
    return decrypted;
  }

  /**
   *
   * validateUser
   *
   * check to make sure this user has not been created and it's a valid user using an external
   * API to validate that.
   *  
   * @param userId - the unique Id for the user
   * @returns - nothing
   */
  async validateIndentity(ctx, userId) {}
  async validateBirthCertificate() {
    // Call external API
  }
  async validateOrigin() {
    // Call external API E.G Government Database
  }
  async validatePassportPhotograph() {
    // Call external API for passport validation E.G Size and validity
  }
}

module.exports = Indentity;