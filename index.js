const fs = require('fs');

const cities = JSON.parse(
    fs.readFileSync('./transfez/city.json', 'utf8')
);

const provinces = JSON.parse(
    fs.readFileSync('./transfez/province.json', 'utf8')
);


const geo_provinces = JSON.parse(
    fs.readFileSync('./geo/province.json', 'utf8')
);

const geo_cities = JSON.parse(
    fs.readFileSync('./geo/city.json', 'utf8')
);

console.log('transfez_provinces:', provinces.data.length);
console.log('transfez_cities:', cities.data.length);

console.log('---------------------');
console.log('geo_provinces:', geo_provinces.data.length);
console.log('geo_cities:', geo_cities.data.length);

console.log('---------------------');
let invalidProvinces = 0;
for (const province of geo_provinces.data) {
    const tz = provinces.data.find(
        (p) => p.name === province.name.toUpperCase()
    );

    if (!tz) {
        invalidProvinces++;
        console.log('Province not found in transfez_provinces:', province.name);
    }
}

const seen = new Set();
for (const province of geo_provinces.data) {
    if (seen.has(province.name)) {
        console.log('Duplicate province:', province.name, province.id);
        continue;
    }

    seen.add(province.name);
}

let missingProvinces = [];
const geoProvinceNames = new Set(
    geo_provinces.data.map((p) => p.name.toUpperCase())
);
for (const province of provinces.data) {
    if (!geoProvinceNames.has(province.name.toUpperCase())) {
        missingProvinces.push(province);
    }
}
console.log('Invalid provinces:', invalidProvinces);
console.log('Valid provinces:', geo_provinces.data.length - invalidProvinces);
console.log('Missing provinces:', missingProvinces.length);
console.log('Missing provinces list:');
missingProvinces.forEach((p) => console.log(' -', p.name));
console.log('---------------------');



for (const province of provinces.data) {
    var provinceCities = cities.data.filter(
        (c) => c.province_id === province.id
    );
    province.cities = provinceCities;
    province.city_names = provinceCities.map((c) =>
        c.name.toUpperCase().replace(/^(KAB\.|KOTA)\s*/, '')
    );
}

for (const province of geo_provinces.data) {
    var provinceCities = geo_cities.data.filter(
        (c) => c.state_id === province.id
    );
    province.cities = provinceCities;
    province.city_names = provinceCities.map((c) => c.name.toUpperCase());

    const p = provinces.data.find((p) => p.name === province.name.toUpperCase())
    if (p && p.city_names.length) {
        const comparison = compareCities(
            p.city_names,
            province.city_names
        );

        console.log('Province:', province.name);
        if (comparison.missing.length) {
            console.log('Missing cities:', comparison.missing.length);
        }
        if (comparison.extra.length) {
            console.log('Invalid cities:', comparison.extra.length);
        }

    } else {
        console.log('Province:', province.name);
        console.log('No cities found in transfez for this province.');
    }

}


function compareCities(correct, target) {
    const correctSet = new Set(correct);
    const targetSet = new Set(target);

    return {
        missing: correct.filter((city) => !targetSet.has(city)),
        extra: target.filter((city) => !correctSet.has(city)),
        same: correct.filter((city) => targetSet.has(city)),
    };
}
