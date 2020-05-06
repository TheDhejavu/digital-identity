const { Contract } = require('fabric-contract-api');
const crypto = require("crypto");

let Organization = require('./Organization.js');
let Identity = require('./Indentity.js');
let IdentityRequestSummary = require('./IdentityRequestSummary.js');

class IdentityContract extends Contract {
    async init(ctx) {
        console.info("Initialized smart contract");
    }
    /**
     * Evaluate a queryString
     *
     * @param {Context} ctx the transaction context
     * @param {String} queryString the query string to be evaluated
    */
   async queryWithQueryString(ctx, queryString) {

    console.log('query String');
    console.log(JSON.stringify(queryString));

    let resultsIterator = await ctx.stub.getQueryResult(queryString);
    let allResults = [];

    while (true) {
      let res = await resultsIterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};

        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;

        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }

        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await resultsIterator.close();
        console.info(allResults);
        console.log(JSON.stringify(allResults));
        return JSON.stringify(allResults);
      }
    }
  }
  /**
   *
   * deleteMyAsset
   *
   * Deletes a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to delete
   * @returns - nothing - but deletes the value in the world state
   */
  async deleteMyAsset(ctx, myAssetId) {
    const exists = await this.myAssetExists(ctx, myAssetId);
    if (!exists) {
      throw new Error(`The my asset ${myAssetId} does not exist`);
    }

    await ctx.stub.deleteState(myAssetId);
    return { error: false, message: `deleted ${myAssetId}`}
  }
  /**
   *
   * readMyAsset
   *
   * Reads a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to read
   * @returns {JSON}
   */
    async readMyAsset(ctx, myAssetId) {

        const exists = await this.myAssetExists(ctx, myAssetId);

        if (!exists) {
            // throw new Error(`The my asset ${myAssetId} does not exist`);
            let response = {
                message: `The my asset ${myAssetId} does not exist`,
                error: true
            };
            return response;
        }

        const buffer = await ctx.stub.getState(myAssetId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }
    /**
     *
     * myAssetExists
     *
     * Checks to see if a key exists in the world state. 
     * @param {String} myAssetId - the key of the asset to read
     * @returns {Boolean} indicating if the asset exists or not. 
     */
    async myAssetExists(ctx, myAssetId) {

        const buffer = await ctx.stub.getState(myAssetId);
        return (!!buffer && buffer.length > 0);
    }
    /**
      *
      * requestUserIdentity
      * 
      * @param {Context} ctx the transaction context
      * @param {String} args.identityId
      * @returns {Object}
    */
    async requestUserIdentity(ctx, args) {
        let response = {};
        args = JSON.parse(args);
        const userType = await this.getCurrentUserType(ctx);
        if(userType !== "identity"){
          response.userType = userType;
          response.error = 'Access Denied. Only a user with type identity is allowed to perform this action';
          return response;
        }

        if( !args.identityId) {
          response.error = 'IdentityId  is required';
          return response;
        }
        
        const orgIdentity = await this.getCurrentUserId(ctx);
        const organization = await this.readMyAsset(orgIdentity);
        
        if(!organization.uid) {
          response.error = 'Invalid Organization';
          return response;
        }

        // Check if identity exist 
        let identityQueryString = { 
          selector: {
            uid: args.identityId, 
            dataType: "identity" 
          }
        };

        // Check if organization has already requested for identity already;
        let requestQueryString = {
          selector: {
            identityId: args.identityId,
            orgId: args.orgId,
            dataType: "identity-request",
          },
        };
        
        let requestSummaryResults = await this.queryWithQueryString(ctx,  JSON.stringify(requestQueryString));
        requestSummaryResults =JSON.parse(requestSummaryResults);
        if (requestSummaryResults && requestSummaryResults[0]) {
          response.error = 'You have requested for this identity information already. Wait until you are granted access to it.';
          response.data = requestSummaryResults;
          return response;
        }

        let identityResults = await this.queryWithQueryString(ctx,  JSON.stringify(identityQueryString));
        identityResults =JSON.parse(identityResults);
        if (identityResults && !identityResults[0]){
          response.error = 'Identity not found';
          response.data = identityResults[0];
          return response;
        }

        args.orgId = organization.uid;
        const newRequest = new IdentityRequestSummary(ctx, args);
        // update state with new organization
        await ctx.stub.putState(newRequest.uid, Buffer.from(JSON.stringify(newRequest)));
        
        response = {
            data: newRequest,
            error: false,
            message: `Indentity request has been initialized`
        };
        return response;
    }
     /**
      *
      * grantOrgAccessToUserIdentity
      * 
      * @param {Context} ctx the transaction context
      * @param {String} args.requestId
      * @param {String} args.identityId
      * @returns {Object}
    */
    async grantOrgAccessToUserIdentity(ctx, args) {
        let response = {};
        args = JSON.parse(args);
        if(userType !== "identity"){
          response.userType = userType;
          response.error = 'Access Denied. Only a user with type identity is allowed to perform this action';
          return response;
        }
        if( !args.identityId && !args.requestId) {
          response.error = 'requestId and identityId is required';
          return response;
        }
        // Check if organization exist too
        let requestQueryString = { 
          selector: { 
            uid: args.requestId,
            dataType: "identity-request"  
          }
        };

        let requestResults = await this.queryWithQueryString(ctx,  JSON.stringify(requestQueryString));
        requestResults =JSON.parse(requestResults);
        if (requestResults && !requestResults[0]) {
          response.error = 'Identity Request not found';
          return response;
        }
        if(requestResults[0].Record.identityId !== args.identityId ) {
          response.error = 'You are not allowed to perform this action';
          return response;
        }

        requestResults[0].Record.status = 'granted';

        await ctx.stub.putState(args.requestId, Buffer.from(JSON.stringify(requestResults[0].Record)));
        
        response = {
            error: false,
            message: `Indentity request has been Granted.`,
            data: requestResults[0].Record,
        };
        return response;
    }
    /**
      *
      * revokeOrgAccessToUserIdentity
      * 
      * @param {Context} ctx the transaction context
      * @param {String} args.requestId
      * @param {String} args.identityId
      * @returns {Object}
    */
    async revokeOrgAccessToUserIdentity(ctx, args) {
        let response = {};
        args = JSON.parse(args);
        const userType = await this.getCurrentUserType(ctx);
        if(userType !== "identity"){
          response.userType = userType;
          response.error = 'Access Denied. Only a user with type identity is allowed to perform this action';
          return response;
        }
        if( !args.identityId && !args.requestId) {
          response.error = 'requestId and identityId is required';
          return response;
        }
        // Check if organization exist too
        let requestQueryString = { 
          selector: { 
            uid: args.requestId,
            dataType: "identity-request"  
          }
        };

        let requestResults = await this.queryWithQueryString(ctx,  JSON.stringify(requestQueryString));
        requestResults =JSON.parse(requestResults);
        if (requestResults && !requestResults[0]) {
          response.error = 'Identity Request not found';
          return response;
        }
        if(requestResults[0].Record.identityId !== args.identityId ) {
          response.error = 'You are not allowed to perform this action';
          return response;
        }

        requestResults[0].Record.status = 'revoked';

        await ctx.stub.putState(args.requestId, Buffer.from(JSON.stringify(requestResults[0].Record)));
        
        response = {
            error: false,
            message: `Indentity request has been Revoked.`,
            data: requestResults[0].Record,
        };
        return response;
    }
    /**
     *
     * getAndDecryptIdentity
     * 
     * @param {String} args.requestId 
     * @returns {Object}
    */
    async getAndDecryptIdentity(ctx, args) {
        args = JSON.parse(args);

        let identityQueryString = {
          selector: {
            dataType: 'identity',
            uid: args.identityId,
          }
        }

        let identityResults = await this.queryWithQueryString(ctx,  JSON.stringify(identityQueryString));
        identityResults =JSON.parse(identityResults);
        identityResults[0].Record.identity = await Identity.decrypt(ctx, args.privateKey, identityResults[0].Record.identity);
        identityResults[0].Record.identity = JSON.parse(identityResults[0].Record.identity);

        delete identityResults[0].Record.passCode;
        return {
          error: false,
          data: identityResults[0].Record,
        };
    }
     /**
     *
     * getRequestedIdentity
     * 
     * @param {String}
     * @returns {Object}
    */
    async getRequestedIdentity(ctx, args) {
        args = JSON.parse(args);

        let requestQueryString = {
            selector: {
              dataType: "identity-request",
            }
        };

        if(args.selector) 
        requestQueryString.selector = { 
          ...requestQueryString.selector,
          ...args.selector
        };

        let requestResults = await this.queryWithQueryString(ctx,  JSON.stringify(requestQueryString));
        requestResults = JSON.parse(requestResults);

        for( let i in requestResults) {
          let identityQueryString = {
            selector: {
              dataType: 'identity',
              uid: requestResults[i].Record.identityId,
            }
          }
  
          let identityResults = await this.queryWithQueryString(ctx,  JSON.stringify(identityQueryString));
          identityResults =JSON.parse(identityResults);
          requestResults[i].Record.identity = {
            userName: identityResults[0].Record.userName,
          }
        }

        return {
          error: false, 
          data: requestResults,
        };
    }
    /**
     *
     * createOrg()
     * 
     * @param 
     * @returns {Object}
     */
    async createOrg(ctx, args) {
        let response = {};
        args = JSON.parse(args);
        const userType = await this.getCurrentUserType(ctx);
        if(userType !== "organization"){
          response.userType = userType;
          response.error = 'Access Denied. Only an organization is allowed to perform this action';
          return response;
        }
        //create a new identity
        let newOrg = await new Organization(ctx, args);

        //update state with new organization
        await ctx.stub.putState(args.identity, Buffer.from(JSON.stringify(newOrg)));
        
        response = {
            uid: newOrg.uid,
            userType: userType,
            message: `organization has been created with id ${newOrg.uid} and it has been updated in the world state`
        };
       
        return response;
    }
    /**
     *
     * createIdentity()
     * 
     * @param 
     * @returns {Object}
     */
    async createIdentity(ctx, args) {
        let response = {};
        args = JSON.parse(args);
        const userType = await this.getCurrentUserType(ctx);
        if(userType !== "identity"){
          response.userType = userType;
          response.error = 'Access Denied. Only a user with type identity is allowed to perform this action';
          return response;
        }
        //create a new identity
        let newUserIdentity = await new Identity(ctx, args);
       
        let signNewUserIdentity = await newUserIdentity.encrypt(ctx, args.publicKey);
       
        let uid = crypto.randomBytes(7).toString('hex');
        uid = uid.toUpperCase();
        
        // update state with new identity
        await ctx.stub.putState(args.userName,  Buffer.from(JSON.stringify({ 
            identity: signNewUserIdentity,
            dataType: "identity",
            userName: args.userName,
            passCode: args.passCode,
            uid, 
        })));
        
        const response = {
            error: false,
            message: `Identity has been created with UNIQUE ID ${uid} and it has been updated in the world state`,
            identity: uid,
        };
        return response;
    }
    /**
        * getCurrentUserId
        * To be called by application to get the type for a user who is logged in
        *
        * @param {Context} ctx the transaction context
        * Usage:  getCurrentUserId ()
      */
     async getCurrentUserId(ctx) {

      let id = [];
      id.push(ctx.clientIdentity.getID());
      var begin = id[0].indexOf("/CN=");
      var end = id[0].lastIndexOf("::/C=");
      let userid = id[0].substring(begin + 4, end);
      return userid;
    }
    /**
      * getCurrentUserType
      * To be called by application to get the type for a user who is logged in
      *
      * @param {Context} ctx the transaction context
      * Usage:  getCurrentUserType ()
    */
    async getCurrentUserType(ctx) {

      let userid = await this.getCurrentUserId(ctx);
      
      if (userid == "admin") {
          return userid;
      }
      return ctx.clientIdentity.getAttributeValue("usertype");
  }
}
module.exports = IdentityContract;
