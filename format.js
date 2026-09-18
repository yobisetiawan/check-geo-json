const fs = require('fs');

const indo = {
    "name": "Indonesia",
    "cca2": "ID",
    "cca3": "IDN",
    "dialCode": "62",
    "currencyCode": "IDR",
    "states": []
}

const data = JSON.parse(
    fs.readFileSync('./result/output.json', 'utf8')
);

for (const province of data) {

    const p = {
        "name": province.name,
        "code": province.kode_wilayah,
        "countryCode": "ID",
        cities: []
    }

    for (const city of province.cities) {
        p.cities.push({

            "id": "ID." + city.id,
            "name": city.name,
            "countryCode": "ID",
            "stateCode": province.kode_wilayah

        });
    }

    indo.states.push(p);

}

fs.writeFileSync(
    './result/indonesia.json',
    JSON.stringify(indo, null, 2)
);