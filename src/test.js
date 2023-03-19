const dbutils = require('../data/dbutils');

dbutils.nextplayerspot('table')
  .then(nextspot => {
    console.log(nextspot);
  })
  .catch(err => {
    console.error(err);
  });
