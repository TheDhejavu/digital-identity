'use strict';
const crypto = require("crypto");

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

    this.identityId = args.identityId;
    this.description = args.description;
    this.orgId = args.orgId;
    this.status = 'pending';
    this.dataType = 'identity-request';
    this.uid = crypto.randomBytes(20).toString('hex');
    if (this.__isContract) {
        delete this.__isContract;
    }

    return this;
  }
}

module.exports = IdentityRequestSummary;