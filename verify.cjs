const fs = require('fs');
const p = require('./src/data/properties.json');

console.log(p.length, 'properties');
p.forEach(x => {
  console.log(`${x.id} ${x.type} ${x.bedrooms}bed £${x.price} ${x.postcodeArea} ${x.dateAdded}`);
});

let missing = 0;
p.forEach(x => {
  [...x.images, x.floorPlan].forEach(f => {
    if (!fs.existsSync('public/' + f)) {
      console.log('MISSING:', f);
      missing++;
    }
  });
});
console.log(missing === 0 ? 'All images present ✓' : missing + ' missing');