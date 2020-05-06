const { IdentityContract }  = require('..');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
// const expect = require('chai').expect;
chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }
}

const publicKey = 
`-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA92ZeEQ4sMzDVO9a9rH+fLDmU7VJzKVws8fDeMs43WJxnQjpX2WLK
PYxm5YeVMv/XFU+ZvX4IkSk7OCsziG1Kmo9CLZuOHhm0taDm9SsMpmXjuuk1gXr9
QxZoLX41TRxOf2/2smKUuLuvoG46T40sJraagJJr5LA+s+BEMNeNvjkFKhCoq5j5
ShZGHKS5hdf8889Nhr7PtAUAW2sMBCZOk6nQ+vcjocDIjzkgU2DT/ed8AxYJp4xx
3WR7oM//0YoFZ/1fsUeNaGHvaqaB+sidqJ86HqStE97g53eHqkuD3yEEeBFprMs2
YPxJMSb8/2VSX7LnO94Fy+OnNGI6DVRekQIDAQAB
-----END RSA PUBLIC KEY-----`;

describe("Begin Test Phase", function(){
    let contract;
    let ctx;
    let identityId;
    let orgId;

    this.timeout(10000);

    before(async () => {
        contract = new IdentityContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('@dejavu').resolves(Buffer.from('{"fullname":"Test Name"}'));
        const user =  {
            firstName: 'akinola',
            lastName: 'ayodeji',
            userName: "ayodeji",
            dob:"1998-23-09",
            residentialAddress: "Ado-Ekiti",
            email: 'akinayodeji4all@gmail.com',
            passCode: 'akkks',
            publicKey,
        };
        const identity = await contract.createIdentity(ctx, JSON.stringify(user));
        identityId = identity.uid;
        
        let org = {
            name: 'DigitalBank',
            description: 'A digital banking firm',
            location: 'NG-Lagos',
            type: 'Banking',
            identity:"ORG_E2244"
        };
        org = await contract.createOrg(ctx, JSON.stringify(org))
        orgId = org.uid;
    })

    describe('#createIdentity', () => {

        it('should create user identity and return an object with error key as false', ( done ) => {
            const user =  {
                firstName: 'akinola',
                lastName: 'ayodeji',
                userName: "ayodeji",
                dob:"1998-23-09",
                residentialAddress: "Ado-Ekiti",
                email: 'akinayodeji4all@gmail.com',
                passCode: 'akkks',
                publicKey,
            };
            contract.createIdentity(ctx, JSON.stringify(user))
            .then( cb=>{
                cb.should.be.an('object').have.own.property('error').be.false;
                done()  
            })
           
        })

    });
    
    describe('#createOrg', () => {

        it('should create organisation and return an object', async () => {
            const org = {
                name: 'DigitalBank',
                identity:"E52_Digital_bank",
                description: 'A digital banking firm',
                location: 'NG-Lagos'
            };
            const cb = await contract.createOrg(ctx, JSON.stringify(org))
            cb.should.be.an('object').have.own.property('uid').be.a('string');
        });

    });

    describe('#myAssetExists', () => {

        it('should return true if my asset exist', async () => {
            await contract.myAssetExists(ctx, '@dejavu').should.eventually.be.true;
        }).timeout(10000);

        it('should return false if my asset does not exist', async () => {
            await contract.myAssetExists(ctx, '_dejavu').should.eventually.be.false;
        }).timeout(10000);
    });

    describe('#readMyAsset', () => {

        it('should return my asset', async () => {
            await contract.readMyAsset(ctx, '@dejavu').should.eventually.deep.equal({ fullname: 'Test Name' });
        }).timeout(10000);

        it('should return response with error', async () => {
            const cb = await contract.readMyAsset(ctx, '_dejavu')
            cb.should.have.own.property('error').be.true;
        }).timeout(10000);
    });
    
})