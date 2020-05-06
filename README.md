<img width="400" alt="Digital identity logo" src="https://raw.githubusercontent.com/TheDhejavu/node-digital-identity/master/assets/logo.png">

# Digital-identity
The traditional identity systems of today are fragmented, insecure, and exclusive. Blockchain enables more secure management and storage of digital identities by providing unified, inter-operable, and tamper-proof infrastructure with key benefits to enterprises and users. This is a simple implementation of a <strong>digital identity system</strong> using blockchain technlogoy and it's built on IBM hyperledger fabric using smart contract coupled with an API for interfacing with the fabric sdk and a client application built with React for performing variety of actions.


## How it works 

### Flow Diagram(Developer) 1

<img alt="Digital identity logo" src="https://raw.githubusercontent.com/TheDhejavu/node-digital-identity/master/assets/digital-identity.png">

### Flow Diagram(User) 2
<img alt="Digital identity logo" src="https://raw.githubusercontent.com/TheDhejavu/node-digital-identity/master/assets/node-digital-identity.png">\


## Prerequisites
- NodeJS (Smart contract)
- Git
- Curl
- Python
- Hyperledger Fabric v2.0
- Docker & Golang
- Vscode IBM Blockchain Extention 
- Vscode version 1.39

## Clone Repository
    git clone https://github.com/TheDhejavu/digital-identity

## Setup

### Fabric Network & Smart Contract
#### Get started 
Install & setup docker and Golang if you don't have them installed already 

Docker: https://www.docker.com/products/docker-desktop

Golang: https://golang.org/dl/

#### Setup hyper ledger fabric
setup all the images needed for Hyperledger Fabric v2.0. create a new folder or a navigate to a blank folder via your CLI and run the below command 

    curl -sSL https://bit.ly/2ysbOFE | bash -s 2.0.0

The command above downloads and executes a bash script that will download and extract all of the platform-specific binaries you will need to set up our network and place them into the folder you navigated to. It retrieves the following platform-specific 

    binaries:
    configtxgen,
    configtxlator,
    cryptogen,
    discover,
    idemixgen
    orderer,
    peer
    fabric-ca-client

Read more: https://hyperledger-fabric.readthedocs.io/en/release-2.0/install.html

#### Setup Vscode IBM Blockchain Extention

The IBM Blockchain Platform extension helps developers to create, test, and debug smart contracts, connect to Hyperledger Fabric environments, and build applications that transact on your blockchain network.

##### Install: 

https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform

### Smart contract 

#### Install

there are two smart contracts located inside this repo. Javascript & Golang but the Golang is currently under development. Add Js-contract to your Vscode workspace and install & instatiate it

### Install the CLI application

From the digital-identity directory inside `cli-application`, navigate to the JS folder.
cd `JS`

 Run the following command to install the application dependencies. It will take about a minute to complete:

    npm install

This process is installing the key application dependencies defined in `package.json`
 
Create a global symlink for the CLI dependency with npm link.

    npm link

#### Config files 

create `config.json` file in the `cli-application/JS` folder and add the following information

    {
    "connectionProfileFilename":"fabric_connection.json",
    "channelName":"mychannel",
    "appAdmin": "admin",
    "caName": "http://localhost:17050",
    "contractName":"identity"
    }

create `fabric_connection.json` file in the `cli-application/JS` folder and export your connection file from vscode IBM blockchain extention. paste this data into your `fabric_connection.json`

#### Example 
    {
    "certificateAuthorities": {
        "Org1CA": {
            "caName": "ca",
            "url": "http://localhost:17050"
        }
    },
    "client": {
        "connection": {
            "timeout": {
                "orderer": "300",
                "peer": {
                    "endorser": "300"
                }
            }
        },
        "organization": "Org1MSP"
    },
    "name": "Org1",
    "organizations": {
        "Org1MSP": {
            "certificateAuthorities": [
                "Org1CA"
            ],
            "mspid": "Org1MSP",
            "peers": [
                "Org1Peer1"
            ]
        }
    },
    "peers": {
        "Org1Peer1": {
            "url": "grpc://localhost:17051"
        }
    },
    "version": "1.0.0"
}

#### CLI Commands

Enroll Admin

    node enrollAdmin.js

Register User

    node registerUser.js -name=<USERNAME>

Register organization

    node registerOrg.js -org=<ORG_ID>

#### TAKE NOTE
User

    -u --user <USER>
Query

    --query 

Arguments 

    -a --argument <ARGS>

#### Major Commands

Create Identity

    dig run createIdentity -u <USERNAME> -a '{ firstName: 'akinola', lastName: <LASTNAME>, userName: <USERNAME>, dob: <DOB>, residentialAddress: <ADDRESS>, email: <EMAIL>, passCode: <PASSCODE>}'

Create Organisation

    dig run createOrg -u <ORG_ID> -a '{ name: <NAME>, description: <DESCRIPTION>, location: <LOCATION>, type: <TYPE_OF_ORG>, identity: <ORG_ID> }'

Query all data

    dig run queryWithQueryString -u ayodeji -a '{ "selector": { }}' --query

Request for user identity

    dig run requestUserIdentity -u <ORG_ID> -a '{"identityId": <ID> }'

Get Request identity

    dig run getRequestedIdentity -u ayodeji -a '{ "selector": { }}' --query

Grant organization access to identity

    dig run grantOrgAccessToIdentity -u ayodeji -a '{"requestId": <ID>, "orgId": <ORG_UID>}'

Revoke organization access to identity

    dig run revokeOrgAccessToIdentity -u ayodeji -a '{"requestId": <ID>, "orgId": <ORG_UID>}'


### References 
- https://github.com/IBM/Create-BlockchainNetwork-IBPV20
- IBM E-Vote https://github.com/IBM/evote
- ABAC https://github.com/IBM/fabric-contract-attribute-based-access-control