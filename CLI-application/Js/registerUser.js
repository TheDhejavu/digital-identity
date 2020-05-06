
const { Gateway, X509WalletMixin, FileSystemWallet } = require('fabric-network');
const NodeRSA = require('node-rsa');
const path = require('path');
const fs = require('fs');

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);


//connection information
let connection_profile_filename = config.connectionProfileFilename;
let appAdmin = config.appAdmin;
  
async function registerUser() {
    try{
        const item = process.argv.slice(2)[0].split('=');
        const name = item[0];
        const value = item[1];
        if(name !='-name' || !value) 
        return console.info("Command not found");

        let identityName = value;
        const gateway = new Gateway();
        let walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        const userExists = await wallet.exists(identityName);
        if(userExists){
            console.log('An identity for the user already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(appAdmin);
        if (!adminExists) {
            console.log(`An identity for the admin user ${appAdmin} does not exist in the wallet`);
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // connection file
        const cwdDir = process.cwd();
        const connectionProfilePath = path.join(cwdDir, connection_profile_filename);
        const connectionProfileContents = await fs.readFileSync(connectionProfilePath, 'utf8');
        
        const connectionProfile = JSON.parse(connectionProfileContents);

        //connect to the network
        const options = {
            wallet: wallet,
            identity: appAdmin,
            discovery: {
                asLocalhost: true,
                enabled:true
            }
        }
        await gateway.connect(connectionProfile, options )

        // get the fabric client ca for the admin
        const ca = gateway.getClient().getCertificateAuthority()
        const adminIdentity = gateway.getCurrentIdentity();
        console.log(`AdminIdentity: + ${adminIdentity}`);
        
        // Register user
        const secret = await ca.register({
            affiliation: "org1",
            enrollmentID: identityName,
            role: "client",
            attributes: [
                {
                    name: 'usertype',
                    value: 'identity'
                }
            ]
        }, adminIdentity);
        
        //Enroll User
        const enrollment = await ca.enroll({ 
            enrollmentID: identityName, 
            enrollmentSecret: secret 
        });

        const userIdentity = X509WalletMixin.createIdentity("Org1MSP", enrollment.certificate, enrollment.key.toBytes());

        wallet.import(identityName, userIdentity);
        console.log('Successfully registered and enrolled admin user ' + identityName + ' and imported it into the wallet');

        // The key-pairs will be used to encrypt end decrypt user data becuase the wallet ECDSA key-pairs 
        // basically supports signing of data.
        // write RSA public key
        const key = new NodeRSA().generateKeyPair();
       
        let publicKey = key.exportKey('pkcs1-public-pem');
        let privateKey = key.exportKey('pkcs1-private-pem');
        
        let dir = path.join(walletPath, identityName);
        dir = path.join(dir, '/keys');
        const publicKeyPath = path.join(dir, '/public.pem');
        const privateKeyPath =  path.join(dir,'/private.pem');

        fs.mkdirSync(dir);
        // write public key
        fs.openSync(publicKeyPath, 'w');
        fs.writeFileSync(publicKeyPath, publicKey, 'utf8');

        // write private key
        fs.openSync(privateKeyPath, 'w');
        fs.writeFileSync(privateKeyPath, privateKey, 'utf8');

    }catch(error){
        console.log(error)
    }   
}

registerUser();