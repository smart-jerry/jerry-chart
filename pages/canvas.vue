<template>
  <section class="container">
    <div id="map"/>
    <div id="floating-panel">
      <input 
        type="button" 
        value="Toggle visibility" 
        onclick="overlay.toggle();" >
      <input 
        type="button" 
        value="Toggle DOM attachment" 
        onclick="overlay.toggleDOM();" >
    </div>
  </section>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
export default {
  components: {},
  // head: {
  //   script: [
  //     {
  //       src:
  //         'https://maps.googleapis.com/maps/api/js?key=AIzaSyB8rhcXRSHGnvpUF4-ZbWGQpVUvDsMemQU'
  //     }
  //   ]
  // },
  data() {
    return {
      config: [
        {
          minLat: 24.4562145,
          maxLat: 24.9562145,
          minLng: 46.4132173,
          maxLng: 46.9132173
        }
      ],
      unit: 0.01,
      maxCount: 2000,
      size: 10
      // config: [
      //   {
      //     minLat: 24.1562145,
      //     maxLat: 25.5964426,
      //     minLng: 45.6132173,
      //     maxLng: 47.2410908
      //   }
      // ],
      // unit: 0.1
    }
  },
  computed: {
    latLngArr() {
      // console.log(
      //   JSON.parse(localStorage.getItem('googlemapLatLngArr')) ||
      //     this.initLatLng(),
      //   988
      // )
      return (
        JSON.parse(localStorage.getItem('googlemapLatLngArr')) ||
        this.initLatLng()
      )
    },
    countData() {
      return (
        JSON.parse(localStorage.getItem('googlemapCountData')) ||
        this.getCount()
      )
    }
  },
  mounted() {
    document
      .querySelector('.container')
      .setAttribute('style', 'height: ' + window.innerHeight + 'px')

    // axios
    //   .post('/test', [{ lat: 1, lng: 1, nextLat: 2, nextLng: 2 }])
    //   .then(res => {
    //     alert(JSON.stringify(res))
    //   })

    // axios
    //   .post('/getCount', [
    //     {
    //       lat: 24.6922868,
    //       lng: 46.6295794,
    //       nextLat: 24.7268938,
    //       nextLng: 46.641858
    //     },
    //     {
    //       lat: 24,
    //       lng: 46.62,
    //       nextLat: 25,
    //       nextLng: 46.64
    //     }
    //   ])
    //   .then(res => {
    //     // alert(JSON.stringify(res))
    // })

    // Vue.nextTick().then(() => {
    this.map()

    // localStorage.clear()
    // this.initLatLng()
    // this.getCount()
  },

  methods: {
    map() {
      let overlay

      USGSOverlay.prototype = new google.maps.OverlayView()

      let config = this.config[0]
      let minLat = config.minLat
      let maxLat = config.maxLat
      let minLng = config.minLng
      let maxLng = config.maxLng
      let canvasWidth = 300
      let latLngArr = this.latLngArr || []
      let latLngArrLength = latLngArr.length
      let size = this.size
      let totalPage = Math.ceil(latLngArrLength / size)
      let currentPage = 1
      let latLngSliceArr = []
      let countDataLocal =
        JSON.parse(localStorage.getItem('googlemapCountData')) || []
      let initMap = async () => {
        let map = new google.maps.Map(document.getElementById('map'), {
          zoom: 11,
          center: { lat: (maxLat + minLat) / 2, lng: (maxLng + minLng) / 2 },
          mapTypeId: 'roadmap'
          // mapTypeId: 'satellite'
        })

        let c = document.createElement('canvas')
        // alert(c)
        let ctx = c.getContext('2d')
        ctx.globalAlpha = 0.5
        // let latLngArrSlice = latLngArr.slice(0, 10) || []
        // let latLngArr = JSON.parse(localStorage.getItem('googlemapLatLngArr'))
        // console.log(latLngArrSlice, 555)
        let maxCount = this.maxCount
        let countData
        // let countData = JSON.parse(localStorage.getItem('googlemapCountData'))
        for (let i = 0; i < totalPage; i++) {
          let latLngArrSlice = latLngArr.slice(i * size, (i + 1) * size) || []

          // latLngSliceArr.push(latLngArrSlice)
          // setTimeout(async () => {
          if (countDataLocal.length === latLngArrLength) {
            countData = countDataLocal.slice(i * size, (i + 1) * size) || []
          } else {
            countData = await this.getCount(latLngArrSlice)
          }
          latLngArrSlice.forEach((item, index) => {
            let bounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(item.lat, item.lng),
              new google.maps.LatLng(item.nextLat, item.nextLng)
            )
            ctx.clearRect(0, 0, canvasWidth, canvasWidth)

            let count = countData[index]
            let bgc = parseInt((count / maxCount) * 255)
            ctx.fillStyle = `rgb(${bgc},${bgc},${bgc})`

            ctx.fillRect(0, 0, canvasWidth, canvasWidth)

            if (count > 500) {
              ctx.font = '100px Verdana'
            } else {
              ctx.font = '16px Verdana'
            }
            ctx.fillStyle = 'red'
            ctx.fillText(`${count}`, 10, 100)
            ctx.font = '16px Verdana'
            ctx.fillStyle = 'blue'
            ctx.fillText(`${item.lat}, ${item.lng}`, 10, 120)
            ctx.fillText(`${item.nextLat}, ${item.nextLng}`, 10, 140)
            let srcImage = c.toDataURL()
            overlay = new USGSOverlay(bounds, srcImage, map)
          })
          // }, 1)
        }
        // alert(latLngArr instanceof Array)
      }

      /** @constructor */
      function USGSOverlay(bounds, image, map) {
        // Now initialize all properties.
        this.bounds_ = bounds
        this.image_ = image
        this.map_ = map

        // Define a property to hold the image's div. We'll
        // actually create this div upon receipt of the onAdd()
        // method so we'll leave it null for now.
        this.div_ = null

        // Explicitly call setMap on this overlay
        this.setMap(map)
      }

      /**
       * onAdd is called when the map's panes are ready and the overlay has been
       * added to the map.
       */
      USGSOverlay.prototype.onAdd = function() {
        let div = document.createElement('div')
        div.style.border = 'none'
        div.style.borderWidth = '0px'
        div.style.position = 'absolute'

        // Create the img element and attach it to the div.
        let img = document.createElement('img')
        img.src = this.image_
        img.style.width = '100%'
        img.style.height = '100%'
        div.appendChild(img)

        this.div_ = div

        // Add the element to the "overlayImage" pane.
        let panes = this.getPanes()
        panes.overlayImage.appendChild(this.div_)
      }

      USGSOverlay.prototype.draw = function() {
        // We use the south-west and north-east
        // coordinates of the overlay to peg it to the correct position and size.
        // To do this, we need to retrieve the projection from the overlay.
        let overlayProjection = this.getProjection()

        // Retrieve the south-west and north-east coordinates of this overlay
        // in LatLngs and convert them to pixel coordinates.
        // We'll use these coordinates to resize the div.
        let sw = overlayProjection.fromLatLngToDivPixel(
          this.bounds_.getSouthWest()
        )
        let ne = overlayProjection.fromLatLngToDivPixel(
          this.bounds_.getNorthEast()
        )

        // Resize the image's div to fit the indicated dimensions.
        let div = this.div_
        div.style.left = sw.x + 'px'
        div.style.top = ne.y + 'px'
        div.style.width = ne.x - sw.x + 'px'
        div.style.height = sw.y - ne.y + 'px'
      }

      USGSOverlay.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_)
      }

      // Set the visibility to 'hidden' or 'visible'.
      USGSOverlay.prototype.hide = function() {
        if (this.div_) {
          // The visibility property must be a string enclosed in quotes.
          this.div_.style.visibility = 'hidden'
        }
      }

      USGSOverlay.prototype.show = function() {
        if (this.div_) {
          this.div_.style.visibility = 'visible'
        }
      }

      USGSOverlay.prototype.toggle = function() {
        if (this.div_) {
          if (this.div_.style.visibility === 'hidden') {
            this.show()
          } else {
            this.hide()
          }
        }
      }

      // Detach the map from the DOM via toggleDOM().
      // Note that if we later reattach the map, it will be visible again,
      // because the containing <div> is recreated in the overlay's onAdd() method.
      USGSOverlay.prototype.toggleDOM = function() {
        if (this.getMap()) {
          // Note: setMap(null) calls OverlayView.onRemove()
          this.setMap(null)
        } else {
          this.setMap(this.map_)
        }
      }
      google.maps.event.addDomListener(window, 'load', initMap())
      // let countData = JSON.parse(localStorage.getItem('googlemapCountData'))
      // if (countData) {
      //   google.maps.event.addDomListener(window, 'load', initMap(countData))
      // } else {
      //   console.log(latLngArrSlice, 11)
      //   this.getCount(latLngArrSlice).then(countData => {
      //     google.maps.event.addDomListener(window, 'load', initMap(countData))
      //   })
      // }
    },
    initLatLng() {
      let config = this.config[0]

      let minLat = config.minLat
      let maxLat = config.maxLat
      let minLng = config.minLng
      let maxLng = config.maxLng

      let unit = this.unit
      let latLength = (maxLat - minLat) / unit
      let lngLength = (maxLng - minLng) / unit
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
      for (let i = 0; i < latlen; i++) {
        // console.log(i,90)
        // latArr.push(i)
        for (let j = 0; j < lnglen; j++) {
          latLngArr.push({
            lat: latArr[i],
            lng: lngArr[j],
            nextLat: latArr[i + 1],
            nextLng: lngArr[j + 1]
          })
        }
      }
      localStorage.setItem('googlemapLatLngArr', JSON.stringify(latLngArr))
      // console.log(latLngArr.length, 111)
      // console.log(localStorage.getItem('googlemapLatLngArr'), 222)
      return latLngArr
    },
    getCount(latLngArr) {
      // let latLngArr = this.latLngArr
      // console.log(latLngArr instanceof Array, 777)
      return axios.post('/getCount', latLngArr).then(res => {
        // this.countData = res.data
        let countData =
          JSON.parse(localStorage.getItem('googlemapCountData')) || []

        localStorage.setItem(
          'googlemapCountData',
          JSON.stringify(countData.concat(res.data || []))
        )
        // console.log(localStorage.getItem('googlemapCountData'), 333)
        // console.log(res, 9899)
        return res.data
        // alert(JSON.stringify(res))
      })
    }
  }
}
</script>

<style>
#map {
  height: 100%;
}
/* Optional: Makes the sample page fill the window. */
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
