const request = require('superagent');

var fs = require('fs');
var faker = require('faker');

const total = process.argv[2];
const baseUrl = process.argv[3];
const token = process.argv[4];
const importContacts = async (total, file, headers) => {
  var array = [];
  while (total > 0) {
    array.push(Math.min(total, 3000));
    total = total - 3000;
  }

  var totalCreated = 0;
  for (const chunkedTotal of array) {
    await fs.promises.appendFile(file, headers, function (err) {
      if (err) return console.log(err);
    })

    for (let index = 0; index < chunkedTotal; index++) {
      const contact = `${faker.name.firstName()},,${faker.name.lastName()}_importcsv,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n`;
      await fs.promises.appendFile(file, contact, function (err) {
        if (err)
          return console.log(err);
      })

      totalCreated+=1;
    }

    await request.post(`${baseUrl}/v2/contacts/import`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', file).then((result) => {
          console.log(`${totalCreated} contacts imported.`);
      })
      .catch((err) => {
        throw err;
      });

    await fs.promises.unlink(file);
  };
};

const file = 'contact-import.csv';
const headers = ',,,,,,,,,,,,,,,,,ADDRESS 1,,,,ADDRESS 2,,,,,COMPANY ADDRESS,,,,,,,Key Dates,,STAGE,System Tags (Select Y if applies),,,,,,,,,,Custom Tags,Notes,,,SOCIAL MEDIA,,,,,,\n' +
  'First Name,Middle Name,Last Name,Prefix,Suffix,Full Legal Name,About,Country Code,Mobile Phone ,Country Code,Home Phone,Country Code,Work Phone,Country Code,Other  Phone,Email,Email 2,Street,City,State/Province,Postal Code,Street,City,State/Province,Postal Code,Company,Street,City,State/Province,Postal Code,Country / Region,Title,Department,Birthday,Home Anniversary,"Qualified/\n' +
  'Captured/\n' +
  'Connected",Buyer,Seller,Bought,Sold,Agent,KW Agent,Allied Resource,Talent,Referral Partner,Downline,Tags,Notes,Source,Other Source,Facebook,Twitter,Linkedin,Google+,Pinterest,Instagram,Houzz\n';

importContacts(total, file, headers);
