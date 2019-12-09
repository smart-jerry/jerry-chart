<template>
  <section class="container">
    <div id="map"/>
  </section>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import JeddahObj from '~/server/excel/Jeddah.json'
export default {
  components: {},
  data() {
    return {}
  },
  computed: {},
  mounted() {
    document
      .querySelector('.container')
      .setAttribute('style', 'height: ' + window.innerHeight + 'px')
    // console.log(latLng, 78)
    /* Data points defined as an array of LatLng objects */
    console.log(JeddahObj, 78)
    var arr = JeddahObj.Jeddah
    var heatmapData = []
    var sliceArr = arr.slice(0)
    var len = sliceArr.length
    console.log(len, 89)
    for (let i = 0; i < len; i += 2) {
      let lat = sliceArr[i]
      let lng = sliceArr[i + 1]
      if (
        lat >= 21.429942 &&
        lat <= 21.647129 &&
        lng >= 39.101966 &&
        lng <= 39.320659
        // lat >= 21.010671 &&
        // lat <= 21.898411 &&
        // lng >= 39.002379 &&
        // lng <= 39.991356
      ) {
        heatmapData.push(new google.maps.LatLng(sliceArr[i], sliceArr[i + 1]))
      }
    }

    var map = new google.maps.Map(document.getElementById('map'), {
      // center: center,
      // center: { lat: 37.775, lng: -122.434 },
      center: { lat: 21.485628, lng: 39.252307 },
      zoom: 13,
      mapTypeId: 'roadmap'
    })

    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData
    })
    heatmap.setMap(map)
    // this.changeGradient(heatmap)
    // this.changeRadius(heatmap)
    this.changeOpacity(heatmap, 0.8)
  },

  methods: {
    changeGradient(heatmap) {
      var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
      // var gradient = gradient.reverse()
      // var gradient = ['rgba(191, 0, 31, 1)', 'rgba(255, 0, 0, 1)']
      heatmap.set('gradient', heatmap.get('gradient') ? null : gradient)
    },

    changeRadius(heatmap) {
      heatmap.set('radius', heatmap.get('radius') ? null : 20)
    },

    changeOpacity(heatmap, opacity) {
      heatmap.set('opacity', heatmap.get('opacity') ? null : opacity || 0.2)
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
