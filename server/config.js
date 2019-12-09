const config = {
  unit: 0.01,
  Riyadh: {
    minLat: 24.4562145,
    maxLat: 24.9562145,
    minLng: 46.4132173,
    maxLng: 46.9132173
  }
}

db.system.js.update(
  {
    _id: 'myAddFunction2'
  },
  {
    value: function(config) {
      const unit = config.unit
      let minLat = config.minLat
      let maxLat = config.maxLat
      let minLng = config.minLng
      let maxLng = config.maxLng

      // let latLength = (maxLat - minLat) / unit
      // let lngLength = (maxLng - minLng) / unit
      let latArr = []
      let lngArr = []
      let baseNum = 100000000
      for (
        let i = minLat;
        i <= maxLat;
        i = (i.toFixed(7) * baseNum + unit * baseNum) / baseNum
      ) {
        latArr.push(i)
      }
      for (
        let j = minLng;
        j <= maxLng;
        j = (j.toFixed(7) * baseNum + unit * baseNum) / baseNum
      ) {
        lngArr.push(j)
      }

      // console.log(latArr, 97)
      // console.log(lngArr, 98)

      let latlen = latArr.length - 1
      let lnglen = lngArr.length - 1
      let latLngArr = []
      const collection = db.getCollection('Riyadh')
      let countArr = []
      for (let i = 0; i < latlen; i++) {
        // console.log(i,90)
        // latArr.push(i)
        for (let j = 0; j < lnglen; j++) {
          //       latLngArr.push({
          //         lat: latArr[i],
          //         lng: lngArr[j],
          //         nextLat: latArr[i + 1],
          //         nextLng: lngArr[j + 1]
          //       })
          countArr.push(
            collection
              .find({
                lat: { $gte: latArr[i], $lte: latArr[i + 1] },
                lng: { $gte: lngArr[j], $lte: lngArr[j + 1] }
              })
              .count()
          )
        }
      }
      return countArr
    }
  }
)
export default config
