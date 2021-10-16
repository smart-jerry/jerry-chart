
<template>
  <section class="container">
    <div class="notice">notice:{{ pacMsg }}</div>
    <div class="pac-box">
      <input 
        id="pac-input" 
        type="text" >
    </div>
    <div id="map"/>
    <!-- <div class="search">
      <input 
        v-model="searchText" 
        type="text" >
      <ul>
        <li 
          v-for="(prediction, index) in predictions" 
          :key="index" 
          @click="onSelect(prediction)">{{ prediction.description }}</li>
      </ul>
    </div> -->

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
      predictions: '',
      pacMsg: '',
      geocoder: null
    }
  },
  computed: {},
  watch: {
    // async searchText(newWords) {
    //   if (newWords.length > 1) {
    //     console.log(newWords, '=======999')
    //     this.searchPlaces(newWords)
    //   }
    // }
  },
  created() {},
  async mounted() {
    // 设置容器宽高
    document
      .querySelector('.container')
      .setAttribute('style', 'height: ' + window.innerHeight + 'px')
    // 1，设置初始化经纬度--用户当前ip
    /**
     * this.getCurrentPos() // 根据html新特性定位用户当前位置
     * this.getCurrentPosByHttp() // 通过http请求来定位当前位置
     * this.findPlace() // 根据用户查询经纬度
     */
    const ipLocation = await this.getCurrentPosByHttp()
    this.ipLocation = ipLocation
    console.log(ipLocation, '===ip====')
    // 2，初始化地图
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: ipLocation,
      zoom: 13,
      mapTypeControl: true
    })
    // 3, 设置搜索自动填充--根据文字查询经纬度；根据placeid查询详细地址信息
    this.service = new google.maps.places.PlacesService(this.map)
    this.geocoder = new google.maps.Geocoder()
    // 根据input框的输入搜索相关联的地址---联想输入
    // this.autocompleteService = new google.maps.places.AutocompleteService()
    // 根据内容，查询ip，并定位
    this.findPlace('test')

    // 4, 地点自动完成--搜索
    const defaultBounds = {
      north: this.ipLocation.lat + 0.1,
      south: this.ipLocation.lat - 0.1,
      east: this.ipLocation.lng + 0.1,
      west: this.ipLocation.lng - 0.1
    }
    const input = document.getElementById('pac-input')
    const options = {
      bounds: defaultBounds,
      fields: [
        'address_components',
        'formatted_address',
        'geometry',
        'place_id',
        'name'
      ],
      strictBounds: false,
      types: ['establishment']
    }
    const autocomplete = await new google.maps.places.Autocomplete(
      input,
      options
    )
    console.log(autocomplete, '========autocompleteMsg')
    autocomplete.addListener('place_changed', () => {
      this.marker.setVisible(false)
      // If the place has a geometry, then present it on a map.
      const place = autocomplete.getPlace()
      console.log(place, '==========place')
      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport)
      } else {
        this.map.setCenter(place.geometry.location)
        this.map.setZoom(17)
      }

      this.marker.setPosition(place.geometry.location)
      this.marker.setVisible(true)
      this.pacMsg = place.formatted_address
    })

    this.map.addListener('center_changed', () => {
      // 3 seconds after the center of the map has changed, pan back to the
      // marker.
      console.log('------ center change', this.map.getCenter())
      this.marker.setPosition(this.map.getCenter())
      window.setTimeout(() => {
        // this.map.panTo(this.marker.getPosition())
      }, 3000)
    })

    this.map.addListener('idle', () => {
      console.log('====== 地图拖拽结束')
      let curPosMiddle = this.map.getCenter()
      if (this.geocoder) {
        this.geocoder.geocode(
          {
            location: curPosMiddle
          },
          (results, status) => {
            console.log(results)
          }
        )
      }
    })
  },
  methods: {
    // 打标
    setMark(localPlace) {
      this.marker = new google.maps.Marker({
        position: localPlace,
        map: this.map,
        draggable: false,
        label: 'ddddd'
      })
      // this.map.setCenter(localPlace)
      this.marker.addListener('dragend', event => {
        console.log('dddd', event)
      })
    },
    // 从搜索列表中选择内容------废弃
    async onSelect(prediction) {
      let place = await this.getPlaceDetail(prediction.place_id)
      console.log(place, '=======place')
      this.searchText = prediction.description
      // { lat: 24.7062145, lng: 46.6632173 }
      this.setMark({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      })
      const addressDetail = {
        latlng:
          place.geometry.location.lat() + ',' + place.geometry.location.lng(),
        formattedAddress: prediction.description
      }
      console.log(addressDetail, '=======addressDetail')
      return addressDetail
    },
    // 根据place ID获取地址详细信息---废弃
    getPlaceDetail(placeId) {
      const request = {
        placeId,
        fields: [
          'address_components',
          'formatted_address',
          'place_id',
          'geometry',
          'types'
        ]
      }
      return new Promise(resolve => {
        this.service.getDetails(request, place => {
          resolve(place)
        })
      })
    },
    // 当前定位-----废弃
    getCurrentPos() {
      let infoWindow = new google.maps.InfoWindow()
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }

            infoWindow.setPosition(pos)
            infoWindow.setContent('Location found.')
            infoWindow.open(this.map)
            this.map.setCenter(pos)
          },
          () => {
            handleLocationError(true, infoWindow, this.map.getCenter())
          }
        )
      } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, this.infoWindow, this.map.getCenter())
      }
    },
    // 获取当前地理位置的错误处理---废弃
    handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos)
      infoWindow.setContent(
        browserHasGeolocation
          ? 'Error: The Geolocation service failed.'
          : 'Error: Your browser does not support geolocation.'
      )
      infoWindow.open(this.map)
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
    // 根据输入自动查询详细地址---废弃
    searchPlaces(searchContent) {
      const defaultCountryRange = ['sa', 'jo', 'ae']
      console.log('d jinru searchpllace', this.autocompleteService)
      this.autocompleteService.getPlacePredictions(
        {
          input: searchContent,
          location: this.ipLocation,
          radius: 60 * 10
        },
        (predictions, status) => {
          console.log(status, '========status')

          this.predictions = predictions
          console.log(this.predictions, '======predictions', predictions)
        }
      )
    },
    // 根据文字查询经纬度
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
      this.service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          console.log(results)
          const localtion = results[0].geometry.location
          this.ipLocation = localtion
          this.setMark(localtion)
        }
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
.container {
  display: flex;
  flex-direction: column;
  padding: 30px;
  box-sizing: border-box;
  position: relative;
}
.notice {
  height: 40px;
  background-color: bisque;
  border: 1px solid burlywood;
  margin-bottom: 10px;
}
#map {
  flex-grow: 1;
}
.search {
  position: absolute;
  top: 120px;
  border: 1px solid #d5d5d5;
  left: 45px;
  right: 45px;
  background: cornflowerblue;
}
.search input {
  height: 40px;
  width: 100%;
}
.search li {
  padding: 5px;
  color: #666666;
}
.pac-box input {
  height: 40px;
  width: 100%;
  border: 1px solid #d5d5d5;
}
</style>
