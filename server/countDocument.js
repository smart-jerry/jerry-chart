const countDocument = function(db, latLngs = []) {
  // const countDocument = function(db, latLngs = [], callback) {
  // Get the documents collection
  // console.log(latLngs instanceof Array, 9000)
  const arr = []
  const collection = db.collection('Riyadh')
  // db.collection('all')
  //   .find({
  //     lat: { $gte: 24.6922868, $lte: 24.7268938 },
  //     lng: { $gte: 46.6295794, $lte: 46.641858 }
  //   })
  //   .count((err, res) => {
  //     console.log(err, 12)
  //     console.log(res, 22)
  //   })
  // let count = data => {
  //   return new Promise(async (resolve, reject) => {
  //     console.log(data, 2233)

  //     // console.log(a, 955)
  //     collection.find(data).count(function(err, res) {
  //       if (err === null) {
  //         console.log(res, 5123)
  //         resolve(res)
  //       } else {
  //         reject(err)
  //       }
  //     })
  //   })
  // }

  for (let item of latLngs) {
    arr.push(
      collection
        .find({
          lat: { $gte: item.lat, $lte: item.nextLat },
          lng: { $gte: item.lng, $lte: item.nextLng }
        })
        .count()
    )
    // arr.push(
    //   count({
    //     lat: { $gte: item.lat, $lte: item.nextLat },
    //     lng: { $gte: item.lng, $lte: item.nextLng }
    //   })
    // )
  }
  // return arr
  return Promise.all(arr)
    .then(res => {
      console.log(res, 234)
      // callback(res)
      Promise.resolve(res)
      return res
    })
    .catch(err => {
      Promise.reject(err)
      return err
    })
}

module.exports = countDocument
