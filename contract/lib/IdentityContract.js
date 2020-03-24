
'use strict';

//import Hyperledger Fabric 1.4 SDK
const { Contract } = require('fabric-contract-api');
const path = require('path');
const fs = require('fs');
const NodeRSA = require('node-rsa');

//import our file which contains our constructors and auxiliary function
let Organization = require('./Organization.js');
let Identity = require('./Indentity');
let IdentityRequestSummary = require('./IdentityRequestSummary.js');

class IdentityContract{
    init() {
        console.log("Initialize Hyperldeger fabric smart contract. Viola!!!");
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

        // eslint-disable-next-line no-constant-condition
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
   * readMyAsset
   *
   * Reads a key-value pair from the world state, based on the key given.
   *  
   * @param myAssetId - the key of the asset to read
   * @returns - nothing - but reads the value in the world state
   */
    async readMyAsset(ctx, myAssetId) {

        const exists = await this.myAssetExists(ctx, myAssetId);

        if (!exists) {
        // throw new Error(`The my asset ${myAssetId} does not exist`);
        let response = {};
            response.error = `The my asset ${myAssetId} does not exist`;
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
     * @param myAssetId - the key of the asset to read
     * @returns boolean indicating if the asset exists or not. 
     */
    async myAssetExists(ctx, myAssetId) {

        const buffer = await ctx.stub.getState(myAssetId);
        return (!!buffer && buffer.length > 0);
    }
    /**
     *
     * queryAllOrgIdentityRequest()
     * 
     * @param args.userAddress {String}
     * @param args.orgAddress {String}
     * @returns
    */
    queryIdentityRequestByOrgOrUser(ctx, { userAddress, orgAddress }) {
        let queryString = {
            selector: {}
        };

        if(userAddress) queryString.selector.userAddress = userAddress;
        if(orgAddress) queryString.selector.userAddress = orgAddress;
      
        let requestResults = JSON.parse(await this.queryWithQueryString(ctx, JSON.stringify(queryString)));

        return  requestResults
    }
    /**
     *
     * requestUserIdentity()
     * 
     * @param args.userAddress
     * @param args.orgAddress
     * @returns {Object}
    */
    requestUserIdentity(ctx, args) {
        args = JSON.parse(args);
        const newRequest = new IdentityRequestSummary(ctx, args);
        
        // update state with new organisation
        await ctx.stub.putState(newRequest.id, Buffer.from(JSON.stringify(newRequest)));
        
        const response = {
            address: newRequest.address,
            message: `Indenity request has been initialized`
        };

        return response;
    }
    /**
     *
     * grantOrgAccessToIdentity()
     * 
     * @param args.userAddress
     * @param args.orgAddress
     * @param args.privateKey
     * @param args.requestId
     * @returns
    */
    grantOrgAccessToIdentity(ctx, args) {
        let response = {};
        args = JSON.parse(args);
        let requestResults = this.queryRequestByUserAndOrg( args.userAddress, args.orgAddress);
        if(!requestResults && requestResults[0]){
            response.error = 'Invalid request';
            return response;
        }
        requestResults[0].granted = true;

        let requestResult = await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(requestResults[0])));
        let identity = this.readMyAsset(args.userAddress);
        identity = Identity.decrypt(ctx, args.privateKey, identity);

        response = {
            message: "User Identity decrypted and sent",
            identity
        }
        return response
    }
     /**
     *
     * queryRequestByUserAndOrg()
     * 
     * @param userAddress
     * @param orgAddress
     * @returns {Object}
    */
    queryRequestByUserAndOrg(userAddress, orgAddress) {
        let queryString = {
            selector: {
              userAddress: userAddress,
              orgAddress: orgAddress,
            }
        };
      
        let requestResults = JSON.parse(await this.queryWithQueryString(ctx, JSON.stringify(queryString)));
        return  requestResults
    }
    /**
     *
     * revokeOrgAccessToIdentity()
     * 
     * @param 
     * @returns {Object}
    */
    revokeOrgAccessToIdentity(ctx, args) {
        let response = {};
        args = JSON.parse(args);
        let requestResults = this.queryRequestByUserAndOrg( args.userAddress, args.orgAddress);
        if(!requestResults && requestResults[0]){
            response.error = 'Invalid request';
            return response;
        }

        requestResults[0].granted = false;

        let requestResult = await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(requestResults[0])));

        return requestResult;
    }
    /**
     *
     * createOrg()
     * 
     * @param 
     * @returns {Object}
     */
    async createOrg(ctx, args) {
        args = JSON.parse(args);

        //create a new identity
        let newOrg = await new Organization(ctx, args);
       
        //update state with new organisation
        // await ctx.stub.putState(newOrg.address, Buffer.from(JSON.stringify(newOrg)));
        
        const response = {
            address: newOrg.address,
            message: `Organisation has been created with address ${newOrg.address} and it has been updated in the world state`
        };
        console.log(response);
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
        args = JSON.parse(args);

        //create a new identity
        let newUserIdentity = await new Identity(ctx, args);
        const key = new NodeRSA().generateKeyPair();
       
        const publicKey = key.exportKey('pkcs1-public-pem');
        const privateKey = key.exportKey('pkcs1-private-pem');

        let signNewUserIdentity = newUserIdentity.encrypt(ctx, publicKey);
        
        //update state with new identity
        // await ctx.stub.putState(newUserIdentity.address, signNewUserIdentity);
        
        const response = {
            address: newUserIdentity.address,
            privateKey: privateKey,
            message: `Identity has been created with address ${newUserIdentity.address} and it has been updated in the world state`
        };
        console.log(response)
        return response;
    }
}
module.exports = IdentityContract;
