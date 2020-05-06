#!/usr/bin/env node
const { invoke, connectToNetwork, getUserkey } = require('../fabric/network');
const { program } = require('commander');
const colors = require('colors');
const { isJson } = require('../utils');

const executeFunc = async (networkObj, type, args) => {
  let response = await invoke(networkObj, type, args.query, args.argument);
  response = isJson(response)? JSON.parse(response) : response;
  return response;
} 

const actions = {
  async getRequestedIdentity(networkObj, type, args) {
    let response = await executeFunc(networkObj, type, args);
          
    let data = response.data;
    let resp;
    for( let i in data ) {
      resp = await invoke(networkObj, "getAndDecryptIdentity", args.query, JSON.stringify({
        identity: data[i].Record.identityId,
        privateKey:  getUserkey( data[i].Record.identity.user, 'private'),
      }));
      data[i].Record.identity = JSON.parse(resp).data;
    }
    response.data = data;
    
    return response;
  },
  async requestUserIdentity(networkObj, args) {
    let response = await executeFunc(networkObj, type, args);
    return response;
  }
};

program
    .command('run <type>')
    .description('Execute a smart contract fuction with arguments') // command description
    .option('-u, --user [value]', 'user')
    .option('-a, --argument [value]', 'Function arguments', "{}")
    .option('--query', 'Specify if the execution is a query operation ', false)
    // function to execute when command is uses
    .action(async function (type, args) {
        console.log("EXECUTION");
        console.log('------------------');

        console.log('OPERATION: %s', type);
        console.log('ARGUMENTS: %s', args.argument);
        console.log('QUERY: %s', args.query);

        if(args.user) {
          const networkObj = await connectToNetwork(args.user);
          if(networkObj.error){
            console.log(colors.bgRed.black('_____ERROR_______'));
            console.log(networkObj);
            return;
          }
          
          if( type == 'createIdentity'){
            args.argument = JSON.parse(args.argument);
            args.argument['privateKey'] = getUserkey(args.user, 'private');
            args.argument['publicKey'] = getUserkey(args.user, 'public');
          }

          // console.log(args.argument);
          console.log(colors.bgGreen.black('USER PRIVATE_KEY:'))
          console.log(getUserkey(args.user, 'private'));

          args.argument = (typeof args.argument == 'object') ? JSON.stringify(args.argument) : args.argument;
          let response = {};
          if (actions.hasOwnProperty(type)) {
            response = await actions[type](networkObj, type, args);
          } else {
            response = await executeFunc(networkObj, type, args);
          }

          if (response && response.error) {
            console.log(colors.bgRed.black('_____ERROR_______'));
            console.log(response);
          } else {
            console.log(colors.bgGreen.black('_____RESPONSE_______: '));
            console.log(response);
          }
        } else {
          console.log("please specify a user using -u <name> or --user <name>")
        }
    });

// allow commander to parse `process.argv`
program.parse(process.argv);