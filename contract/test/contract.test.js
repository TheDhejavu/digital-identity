const IdentityContract  = require('../lib/IdentityContract');
const contract = new IdentityContract();

// Create new Identity
console.log("NEW IDENTITY")
contract.createIdentity('', JSON.stringify(
    {
        firstName: 'akinola',
        lastName: 'ayodeji',
        dob:"1998-23-09",
        residentialAddress: "Ado-Ekiti",
        email: 'akinayodeji4all@gmail.com',
        passCode: 'akkks'
    }
));


// Create new org
console.log("NEW ORganisation")
contract.createOrg('', JSON.stringify(
    {
        name: 'GtBank',
        description: 'akinayodeji4all@gmail.com',
        location: 'NG-Lagos'
    }
))