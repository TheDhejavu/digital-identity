'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//connection information
const appAdmin = config.appAdmin;
const caName =  config.caName;

async function enrollAdmin() {
    // Create a new CA client for interacting with the CA.
    const caURL = caName;
    const ca = new FabricCAServices(caURL);

     //set up connection infomation
    let walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    // Check to see if we've already enrolled the admin user.
    const adminExists = await wallet.exists(appAdmin);
    if (adminExists) {
      console.log('An identity for the admin user "admin" already exists in the wallet');
      return;
    }
    try{
        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ 
            enrollmentID: appAdmin, 
            enrollmentSecret: "adminpw" 
        });
        
        const identity = X509WalletMixin.createIdentity("Org1MSP", enrollment.certificate, enrollment.key.toBytes());
        wallet.import(appAdmin, identity);
        console.log('msg: Successfully enrolled admin user ' + appAdmin + ' and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user ' + ${appAdmin} + : ${error}`);
        process.exit(1);
    }
}

enrollAdmin();