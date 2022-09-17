const  fs = require('fs');
const faker= require('@faker-js/faker');

const readFile = ()=> {
    let r = fs.readFileSync('./inputFiles/exporters.json').toString();
    return JSON.parse(r);
}

const appendFile = (data)=>{
    let r = readFile();
    let allData = r.concat(JSON.parse(data))

    fs.writeFileSync('./inputFiles/exporters.json', JSON.stringify(allData), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

const updateFile = (data)=>{
    let result = {};
    let r = readFile();
    //const jsObj = JSON.parse(data)

    const jsObj =data
    // in case of delete
    const fileEntries = r.map(el=> el.id)
    const newEntries= jsObj.map(el=> el.id)

    r = r.filter(el=> newEntries.includes(el.id) );

    // compare data with flag update true to corresponding r

    const updated =jsObj.filter(d=>d.flagUpd);
    updated.forEach(rowUpd => {
        const idx = r.findIndex(el=> el.id == rowUpd.id)
        if (idx == -1) {
            //is a new exporter, set up some data

            r= r.concat(
            { id: rowUpd.id, name: rowUpd.val, source: "drools",
                address: {
                    street: faker.faker.address.street(),
                    city: faker.faker.address.city(),
                    ZipCode: faker.faker.address.zipCode()
                },
                since: faker.faker.date.past().toLocaleDateString(),
                numOfDeclarations: {
                    jan: faker.faker.finance.amount(200, 2000, 0),
                    feb: faker.faker.finance.amount(200, 2000, 0),
                    mar: faker.faker.finance.amount(200, 2000, 0),
                    avr: faker.faker.finance.amount(200, 2000, 0),
                    may: faker.faker.finance.amount(200, 2000, 0),
                    jun: faker.faker.finance.amount(200, 2000, 0)
                }
            })
            result = r;
        }
        else
            r[idx].name = rowUpd.val
    })


    //notification of updating to clients



    // real update

    fs.writeFileSync('./inputFiles/exporters.json', JSON.stringify(r), function (err) {
        if (err) throw err;
    });

    return r;
}

module.exports = {readFile, appendFile,updateFile};