
<template>
  <section class="container">
    <div class="pac-box">
      <input 
        id="pac-input" 
        type="text" >
    </div>
    <div id="map"/>
    <div class="notice">{{ pacMsg }}</div>
  </section>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
export default {
  components: {},
  data() {
    return {
      map: null,
      ipLocation: {},
      searchText: '',
      pacMsg: '',
      geocoder: null
    }
  },
  computed: {},
  watch: {},
  created() {},
  async mounted() {
    // 1，设置初始化经纬度--用户当前ip
    /**
     * this.getCurrentPos() // 根据html新特性定位用户当前位置
     * this.getCurrentPosByHttp() // 通过http请求来定位当前位置
     * this.findPlace() // 根据用户查询经纬度
     */
    this.ipLocation = await this.getCurrentPosByHttp()
    // 2，初始化地图-及监听
    this.initMap(this.ipLocation)
    this.initMark() // 初始化mark及监听
    this.geocoder = new google.maps.Geocoder() // 根据经纬度获取地址信息
    // this.initInfoWindow()
    // 3, 新增地址，根据输入的内容，查询ip，并定位
    this.findPlace('hangzhou')
    // 4, 搜索
    this.initSearch()
  },
  methods: {
    // 初始化map
    initMap(ipLocation) {
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: ipLocation,
        language: 'CN',
        zoom: 15,
        mapTypeControl: false,
        zoomControl: true,
        disableDefaultUI: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
      })
      // 地图平移或缩放事件
      this.map.addListener('idle', e => {
        // console.log('结束')
        // 获取地图边界
        const bounds = this.map.getBounds()
        const ne = bounds.getNorthEast() // LatLng of the north-east corner
        const sw = bounds.getSouthWest() // LatLng of the south-west corder
        const lat1 = sw.lat(),
          lat2 = ne.lat(),
          lng1 = sw.lng(),
          lng2 = ne.lng()
        // console.log(lat1, lat2, '=====mapb', lng1, lng2)
        // 获取marker的经纬度
        const markB = this.marker.getPosition()
        if (!markB) return
        const lat = markB.lat(),
          lng = markB.lng()
        // console.log(lat, lng, '======markB')
        // console.log(lat1 < lat, lat < lat2, '======markB')
        const latIn = lat > lat1 && lat < lat2 ? true : false
        const lngIn = lng > lng1 && lng < lng2 ? true : false
        // 超出边界才会重现定位
        if (!latIn || !lngIn) {
          let curPosMiddle = this.map.getCenter()
          if (this.geocoder) {
            this.getAddressByGeocoder(curPosMiddle, {
              rePostion: true,
              isCenter: false
            })
          }
        }
      })
    },
    // 初始化标记和监听
    initMark() {
      const locationMarker = {
        path:
          'M22 10.5c0 .895-.13 1.76-.35 2.588C20.025 20.723 13.137 28.032 11 28 9.05 28 3.2 21.28.926 14.71.334 13.42 0 11.997 0 10.5c0-.104.013-.206.017-.31C.014 10.117 0 10.04 0 9.967c-.005-.67.065-1.112.194-1.398C1.144 3.692 5.617 0 11 0c5.416 0 9.906 3.74 10.82 8.657.112.29.18.696.18 1.31 0 .083-.013.167-.015.25.003.095.015.188.015.283zM11 5.833c-2.705 0-4.898 2.09-4.898 4.667S8.295 15.167 11 15.167s4.898-2.09 4.898-4.667c0-2.578-2.193-4.667-4.898-4.667z',
        fillColor: 'blue',
        fillOpacity: 1,
        strokeColor: '#E84643'
      }
      this.marker = new google.maps.Marker({
        map: this.map,
        draggable: true,
        icon: locationMarker
      })
      this.marker.addListener('dragend', event => {
        // console.log(event.latLng.lng(), event.latLng.lat(), '======event')
        this.getAddressByGeocoder(event.latLng, {
          rePostion: false,
          isCenter: true
        })
      })
    },
    // 根据经纬度获取用户详细信息
    getAddressByGeocoder(location, options) {
      this.geocoder.geocode(
        {
          location: location
        },
        (results, status) => {
          this.pasrseAddress(results, status, options)
        }
      )
    },
    // 搜索
    async initSearch() {
      const defaultBounds = {
        north: this.ipLocation.lat + 0.1,
        south: this.ipLocation.lat - 0.1,
        east: this.ipLocation.lng + 0.1,
        west: this.ipLocation.lng - 0.1
      }
      const input = document.getElementById('pac-input')
      const options = {
        bounds: defaultBounds,
        fields: ['geometry'],
        strictBounds: false,
        types: ['establishment']
      }
      const autocomplete = await new google.maps.places.Autocomplete(
        input,
        options
      )
      // console.log(autocomplete, '========autocompleteMsg')
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        this.getAddressByGeocoder(place.geometry.location, {
          rePostion: true,
          isCenter: true
        })
      })
    },
    // 信息面板---需求变更，废弃
    initInfoWindow() {
      const infoWindow = new google.maps.InfoWindow()
      infoWindow.close()
      const contentString =
        '<div id="content">' +
        '<div>Choose this localtion</div>' +
        '<div id="go-box"> 点我选择地址' +
        '</div>' +
        '</div>'
      infoWindow.setContent(contentString)
      // infoWindow.setContent(this.marker.getTitle())
      infoWindow.open(this.marker.getMap(), this.marker)
      infoWindow.addListener('click', () => {
        alert(';;;;')
      })
    },
    // 获取地理位置--http请求
    async getCurrentPosByHttp() {
      const API_KEY = 'AIzaSyB8rhcXRSHGnvpUF4-ZbWGQpVUvDsMemQU'
      const response = await axios.post(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${API_KEY}`,
        { considerIp: true }
      )
      return response.data.location
      // new google.maps.LatLng(response.data.location)
    },
    // 新增地址时 根据文字查询经纬度
    findPlace(val) {
      const request = {
        query: val,
        fields: [
          'name',
          'geometry',
          'formatted_address',
          'plus_code',
          'business_status',
          'place_id'
        ]
      }
      this.service = new google.maps.places.PlacesService(this.map)
      this.service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // console.log(results, '=======results==findPlaceFromQuery')
          this.ipLocation = results[0].geometry.location
          // console.log(this.ipLocation, '==========ipLocation')
          this.marker?.setPosition(this.ipLocation.latLng)
        }
      })
    },
    // 得到选择列表
    async pasrseAddress(results, status, options) {
      // console.log(results, '=======results')
      if (status === 'OK') {
        this.marker.setVisible(false)
        results = results.sort(
          (x, y) => y.address_components.length - x.address_components.length
        )
        let getAddressList = this.getAddressDetail(
          results[1].address_components
        )
        const addressStr = getAddressList
          .map(item => item.res)
          .filter(item => !!item)
          .join(',')

        // console.log(getAddressList, '=======getAddressList')
        const location = results[1].geometry.location
        const postcode = this.addressResult(
          results[1].address_components,
          'postal_code'
        )
        // console.log(location.lng(), location.lat(), '========locationget')
        // 是否需要重新定位---移动mark不需要重新定位
        if (options.rePostion === true) {
          console.log('into is reposition')
          this.marker?.setPosition(location)
        }
        this.marker.setVisible(true)
        if (options.isCenter === true) {
          console.log('into is center')
          this.map.panTo(this.marker.getPosition())
        }
        // await this.getAddressLocation(
        //   location.lat().toString(),
        //   location.lng().toString()
        // )

        const stateT = {
          googleMapSourceData: results[1].address_components,
          latitude: location.lat().toString(),
          longitude: location.lng().toString(),
          postcode: postcode,
          getAddress: addressStr,
          // usableRange : state.response.usableRange,
          // addressCity : state.response.addressCity,
          getAddressFlag: true
        }
        // console.log(stateT, '======state')
        this.pacMsg = stateT
      }
    },
    // 解析地址 国家 省 城市 区 路 邮编
    addressResult(result, detailName) {
      let res =
        (result.find(x => (x.types || []).includes(detailName)) || {})
          .long_name || ''
      return res
    },
    // 解析地址 国家 省 城市 区 路 邮编
    getAddressDetail(result) {
      let detailNameList = [
        'locality',
        'political',
        'premise',
        'route',
        'street_number'
      ]
      let getDetailNames = []
      detailNameList.reverse().map(item => {
        let res1 =
          (result.find(x => (x.types || []).includes(item)) || {}).long_name ||
          ''
        getDetailNames.push({ name: item, res: res1 })
      })

      return getDetailNames
    },
    choseAddress() {
      alert('xuanze wol')
    }
  }
}
</script>

<style>
/* Optional: Makes the sample page fill the window. */
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}
.container {
  padding: 30px;
  box-sizing: border-box;
  width: 100%;
  height: 100vh;
}
.notice {
  min-height: 40px;
  background-color: bisque;
  border: 1px solid burlywood;
  margin-bottom: 50px;
  height: auto;
}
#map {
  /* flex-grow: 1; */
  height: 400px;
  margin-bottom: 10px;
}
.pac-box input {
  height: 40px;
  width: 100%;
  border: 1px solid #d5d5d5;
}

/* 信息框 */
.gm-style .gm-style-iw-c {
  background-color: blue;
  padding: 0;
}
.gm-style-iw-d {
  background-color: blue;
  overflow: hidden !important;
}
.gm-style .gm-style-iw-t::after {
  background: blue;
}
.gm-ui-hover-effect {
  display: none !important;
}
</style>
