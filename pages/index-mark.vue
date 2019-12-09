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
      size: 500
    }
  },
  computed: {},
  mounted() {
    document
      .querySelector('.container')
      .setAttribute('style', 'height: ' + window.innerHeight + 'px')
    this.initmap()
  },

  methods: {
    initmap() {
      let _this = this
      let config = this.config[0]
      let minLat = config.minLat
      let maxLat = config.maxLat
      let minLng = config.minLng
      let maxLng = config.maxLng
      let myCenter = new google.maps.LatLng(
        (maxLat + minLat) / 2,
        (maxLng + minLng) / 2
      )

      function init() {
        let mapProp = {
          center: myCenter,
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        _this.map = new google.maps.Map(document.getElementById('map'), mapProp)
      }
      google.maps.event.addDomListener(window, 'load', init())

      this.readerMark('Riyadh')
      this.readerMark('Makkah')
      this.readerMark('Jeddah')
    },
    async readerMark(regin_name) {
      let regionName = regin_name || 'Riyadh'
      // 查询表（regionName）中一共有多少条数据
      let totalCount = await this.selectTotal({ regionName: regionName })

      if (totalCount.result == '1') {
        alert('数据库未启动。')
        return false
      }
      // console.log(totalCount.totalNum, '33333333333333333333333333333333')
      // 一共有多少页
      let totalPageNum = Math.ceil(totalCount.totalNum / this.size)
      // select date from database
      for (let i = 1; i < totalPageNum; i++) {
        // 数据太多，临时控制为5000条，因为地图会卡死
        if (i > 10) {
          return
        }

        let selectedNum = this.size * (i - 1)
        let sdate = await this.getMark({
          skip: selectedNum,
          limitNum: this.size,
          regionName: regionName,
          currentPage: i
        })
        // create a mark on map
        for (let j = 0, lenj = sdate.length; j < lenj; j++) {
          let latlng = new google.maps.LatLng(sdate[j].lat, sdate[j].lng)
          let marker = new google.maps.Marker({
            position: latlng,
            map: this.map
          })
        }
      }
    },
    getMark(options) {
      return axios.post('/getMark', options).then(res => {
        return res.data
      })
    },
    selectTotal(options) {
      return axios.post('/getTotal', options).then(res => {
        return res.data
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
