const { Gateway, X509WalletMixin, FileSystemWallet } = require('fabric-network')
const path = require('path');
const fs = require('fs');

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//connection information
const connection_profile_filename = config.connectionProfileFilename;
const appAdmin = config.appAdmin;
const contractName = config.contractName;
const channelName = config.channelName;
const colors = require("colors");

module.exports.getUserkey = (username, type)=> {
  let dir = path.join(process.cwd(), `/wallet/${username}`);
  dir = path.join(dir, '/keys');
  const keyPath = path.join(dir, `/${type}.pem`);
  
  if (fs.existsSync(keyPath)){
      return fs.readFileSync(keyPath, 'utf8').toString();
  }
  return false;
}


module.exports.connectToNetwork = async (identityName) => {
    try {
        let response = {};
        const gateway = new Gateway();
        let walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        // console.log('Wallet: ');
        // console.log(util.inspect(wallet));

        const userExists = await wallet.exists(identityName);
        if(!userExists){
            console.log(colors.red('An identity for the user does not exists in the wallet'));
            response.error = 'An identity for the user ' + identityName + ' does not exist in the wallet. Register ' + identityName + ' first';
            return response;
        }
        console.log('IdentityName: %s', identityName);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(appAdmin);
        if (!adminExists) {
            console.log(`An identity for the admin user ${appAdmin} does not exist in the wallet`);
            console.log('Run the enrollAdmin.js application before retrying');
            response.error = `An identity for the admin user ${appAdmin} does not exist in the wallet`;
            return response;
        }

        // connection file
        const cwdDir = process.cwd();
        const connectionProfilePath = path.join(cwdDir, connection_profile_filename);
        const connectionProfileContents = await fs.readFileSync(connectionProfilePath, 'utf8');
        
        const connectionProfile = JSON.parse(connectionProfileContents);
        // console.log('ccp: ');
        // console.log(util.inspect(connectionProfile));

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
        console.log(colors.green('Done connecting to network.'));
        // Connect to our local fabric
        const network = await gateway.getNetwork(channelName);
    
        console.log(colors.green('Connected to mychannel. '));
        // Get the contract we have installed on the peer
        const contract = await network.getContract(contractName);
    
    
        let networkObj = {
          contract: contract,
          network: network,
          gateway: gateway
        };
    
        return networkObj;
    
      } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        let response = {};
        response.error = error;
        return response;
      }
}


module.exports.invoke = async ( networkObj, func, isQuery, args) => {
    
    try {
        console.log(colors.bgGreen.black('INSIDE INVOKE'));
        console.log(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);
       
    if (isQuery === true) {
        console.log('____________IsQuery__________');
        if (args) {
          //Evaluate transaction because it's query operation....
          let response = await networkObj.contract.evaluateTransaction(func, args);
          console.log(`Transaction ${func} with args ${args} has been evaluated`);
    
          await networkObj.gateway.disconnect();
    
          return response;
          
        } else {
  
          let response = await networkObj.contract.evaluateTransaction(func);
          console.log(`Transaction ${func} without args has been evaluated`);
    
          await networkObj.gateway.disconnect();
    
          return response;
        }
      }  else {
        console.log('________NotQuery_______');
        if (args) {
            //Evaluate transaction because it's query operation....
            let response = await networkObj.contract.submitTransaction(func, args);
            console.log(`Transaction ${func} with args ${args} has been submitted`);
            await networkObj.gateway.disconnect();
      
            return response;
            
          } else {
            let response = await networkObj.contract.submitTransaction(func);
            console.log(`Transaction ${func} without args has been submitted`);
      
            await networkObj.gateway.disconnect();
            return response;
          }
      }
    }catch(error){
        console.log(error);
    }
} 