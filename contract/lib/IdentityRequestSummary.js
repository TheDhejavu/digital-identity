'use strict';

class IdentityRequestSummary {

  /**
   *
   * IdentityRequestSummary
   *
   * Constructor for a IdentityRequestSummary object. This is what the point of the application is - request
   * for user identity in order to store it the world state and notify the user of such.
   *  
   * @param args.identityAddress {String} - identity address that organsation wants to request private information from
   * @param args.description {String} - Description of why an organization wants your information
   * @returns - organization object
   */
  constructor(ctx, args) {

    this.identityAddress = args.identityAddress;
    this.description = args.description;
    this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    if (this.__isContract) {
        delete this.__isContract;
    }

    return this;
  }
}

module.exports = IdentityRequestSummary;