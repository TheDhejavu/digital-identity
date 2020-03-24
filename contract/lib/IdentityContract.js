
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
     *
     * queryAllOrgIdentityRequest()
     * 
     * @param 
     * @returns
    */
    queryAllOrgIdentityRequest(ctx, args) {

    }
    /**
     *
     * queryAllGrantedRequest()
     * 
     * @param 
     * @returns
    */
    queryAllGrantedRequest(ctx, args) {

    }
    /**
     *
     * requestUserIdentity()
     * 
     * @param 
     * @returns
    */
    requestUserIdentity(ctx, args) {

    }
    /**
     *
     * grantOrgAccessToIdentity()
     * 
     * @param 
     * @returns
    */
    grantOrgAccessToIdentity(ctx, args) {

    }
    /**
     *
     * revokeOrgAccessToIdentity()
     * 
     * @param 
     * @returns
    */
    revokeOrgAccessToIdentity(ctx, args) {

    }
    /**
     *
     * createOrg()
     * 
     * @param 
     * @returns
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
     * @returns
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
