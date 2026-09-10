const fs = require('fs');

const csv = fs.readFileSync('kemendagri/data.csv', 'utf-8');

const rows = csv.trim().split('\n');

const headers = rows[0].split(',');

const data = rows.slice(1).map(row => {
    const values = row.split(',');

    return Object.fromEntries(
        headers.map((header, index) => [
            header,
            values[index]
        ])
    );
});


const provinces = data
    .filter(item => !item.kode_wilayah.includes('.'))
    .map(province => ({
        name: province.provinsi_kabupaten_kota,
        cityNames: data
            .filter(city =>
                city.kode_wilayah.startsWith(province.kode_wilayah + '.')
            )
            .map(city => city.provinsi_kabupaten_kota)
    }));

const transfezProvinces = JSON.parse(
    fs.readFileSync('./transfez/province.json', 'utf8')
);

const transfezCities = JSON.parse(
    fs.readFileSync('./transfez/city.json', 'utf8')
);


const noCity = [];
for (const province of provinces) {
    const tz = transfezProvinces.data.find(
        (p) => {
            if (province.name === "P A P U A") {
                province.name = "PAPUA";
                return p.name === "PAPUA";
            }
            return p.name === province.name;
        }
    );
    if (tz) {
        province.transfezID = tz.id;
    }

    province.cities = [];
    for (const city of province.cityNames) {
        const cityName = city.trim().replace(/\s+/g, ' ');
        let tzCity = transfezCities.data.find((c) => {
            return c.province_id === province.transfezID && c.name === cityName;
        });


        // regional expansion for Papua provinces, since they are not in the same province_id
        if ([
            'PAPUA SELATAN',
            'PAPUA PEGUNUNGAN',
            'PAPUA BARAT DAYA',
            'PAPUA TENGAH',
            'PAPUA BARAT',
            'PAPUA TIMUR',
            'PAPUA TENGGARA',
            'PAPUA BARAT DAYA'
        ].includes(province.name)) {
            tzCity = transfezCities.data.find((c) => {
                const check = [33, 34, 35, 36, 37, 38].includes(c.province_id)
                return check && c.name === cityName;
            });
        }

        if(cityName === "KAB. TOBA") {
            tzCity = transfezCities.data.find((c) => {
                return  c.name === "KAB. TOBA SAMOSIR";
            });
        }

        if(cityName === "KAB. PANGKAJENE DAN KEPULAUAN") {
            tzCity = transfezCities.data.find((c) => {
                return  c.name === "KAB. PANGKAJENE KEPULAUAN";
            });
        }

        if (tzCity) {
            province.cities.push({
                name: city,
                transfezID: tzCity.id
            });
        } else {
            province.cities.push({
                name: city,
                transfezID: null
            });
            noCity.push({
                province: province.name,
                city: city
            });
        }
    }


}

fs.writeFileSync(
    './result/output.json',
    JSON.stringify(provinces, null, 2)
);

console.log("missing data:", noCity);