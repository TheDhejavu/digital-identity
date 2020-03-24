
'use strict';

//import Hyperledger Fabric 1.4 SDK
const { Contract } = require('fabric-contract-api');
const path = require('path');
const fs = require('fs');

//import our file which contains our constructors and auxiliary function
let Organization = require('./Organization.js');
let Identity = require('./Identity.js');
let IdentityRequestSummary = require('./IdentityRequestSummary.js');

class IdentityContract extends Contract {
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
    createOrg(ctx, args) {

    }
    /**
     *
     * createIdentity()
     * 
     * @param 
     * @returns
     */
    createIdentity(ctx, args) {
        
    }
}
module.exports = IdentityContract;
