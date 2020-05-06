'use strict';
const crypto = require("crypto");
class Organization {

  /**
   *
   * Organization
   *
   * Constructor for a Organization object. This is what the point of the application is - create 
   * Organizations.
   *  
   * @param args.name {String} - Name of the Organization E.G bank 
   * @param args.location {String} - Location of the organization 
   * @param args.description {String} - About the organization
   * @param args.type {String} - Type of organization or market focus
   * @returns - organization object
   */
  constructor(ctx, args) {
    this.name = args.name;
    this.location = args.location;
    this.description = args.description;
    this.passCode = args.passCode;
    this.type = args.type;
    this.dataType = "organization"
    this.uid = crypto.randomBytes(20).toString('hex');
    if (this.__isContract) {
      delete this.__isContract;
    }
    return this;
  }

  /**
   *
   * validateOrganization
   *
   * check to make sure this organizatio has not been created and it's a valid organization using an external
   * API to validate that.
   *  
   * @param orgId - the unique Id for the organzation
   * @returns - nothing
   */
  async validateOrganization(ctx, orgId) {}
}

module.exports = Organization;