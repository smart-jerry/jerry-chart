import * as React from 'react';
import { inject, observer } from 'mobx-react';

import {AppInfoService} from '@@services/native_client_protocol/app_info.service'
import { JavascriptBridgeService } from '@common/services/javascript_bridge.service'
import WebviewService from '@@/services/native_client_protocol/webview.service';
import { HttpService } from '@@services/http.service';
import NavigationService from '@@/services/navigation.service';
import {ROUTE_PATH} from '@@/routes/enum';
import {trackService} from '@@/services/track.service';

import {IAddressLocation} from './api_id/addressLocation'
import { IStore, stores } from '@@/store';
import {googleMap,languageKey} from '@@/constants/language'

import Toast from '@@views/components/dynamic_component/toast';
import CommonPage from '@@/views/components/common_page';

import centerIcon from './images/center-icon.png'
import backIcon from './images/back-icon.png'
import locationIcon from './images/location-icon.png'
import searchIcon from './images/search-icon.png'
import './index.scoped.scss'

interface IProps {
  store: IStore;
}

let google: any

@inject("store")
class AddressManageGoogleMap extends React.Component<IProps, any> {
  public javascriptBridgeService: JavascriptBridgeService = new JavascriptBridgeService();
  public map: any;
  public geocoder: any;
  public marker: any;
  public markerListenDrag: any; // 标注拖拽名
  public markerListenClick: any; // 标注点击事件名
  public mapListener: any;
  public language: languageKey;
  
  constructor(props: any) {
    super(props);
    this.language = stores.SiteInfoTable.siteInfo.language || 'CN'
  }

  public state = {
    pageFlag: true,
    getAddress: '', // 地址
    postcode: '', // 邮编
    latitude: '', // 纬度
    longitude: '', // 经度
    googleMapSourceData: [],
    lat: '', // 手机定位纬度
    lng: '', // 手机定位经度
    title: '',
    usableRange: true, // 是否在服务范围
    getAddressFlag:false,
    locationFlag: false, // 用户是否开启手机定位,
    addressCity:'',
    response: {},
    deviceFlag: true,
    safeAreaInsetBottom: 0,
    language:''
  }

  async componentDidMount() {
    let _this = this;
    console.log('componentDidMount');
    console.log('url经纬度======', this.props.store.SiteInfoTable!.siteInfo.latitude, this.props.store.SiteInfoTable!.siteInfo.longitude)
    const getAdds = new AppInfoService()
    const [err, getAppLocalAddress] = await getAdds.getAppLocalAddress()
    console.log(getAppLocalAddress,'====获取首位定位信息')
    this.setState({
      lat: getAppLocalAddress.latitude,
      lng: getAppLocalAddress.longitude,
      locationFlag:true
    })
    this.javascriptBridgeService.sendToNative('webview', 'getWebviewInfo', {}, (response: any) => {
      if (response.safeAreaInsetBottom >= 0) {
        const state = this.state;
        state.safeAreaInsetBottom = response.safeAreaInsetBottom * 2;
        this.setState(state);
      }
    });
    
    if (this.props.store.SiteInfoTable!.siteInfo.appTypeId == 3) { // 客户端
      // url 获取经纬度 编辑
      if (this.props.store.SiteInfoTable!.siteInfo.latitude && this.props.store.SiteInfoTable!.siteInfo.longitude) {
        console.log('1componentDidMount0===经纬度');
        this.setState({
          latitude: this.props.store.SiteInfoTable!.siteInfo.latitude,
          longitude: this.props.store.SiteInfoTable!.siteInfo.longitude
        })
      } else { // 协议拿经纬度 新增
        console.log('1componentDidMount1====协议');
        const getAdds = new AppInfoService()
        const [err, getAppLocalAddress] = await getAdds.getAppLocalAddress()
        console.log(getAppLocalAddress)
        this.setState({
          latitude: getAppLocalAddress.latitude,
          longitude: getAppLocalAddress.longitude
        })
      }
    } else if(this.props.store.SiteInfoTable!.siteInfo.appTypeId == 1){ // h5嵌入外卖
      if (this.props.store.SiteInfoTable!.siteInfo.latitudeH5 && this.props.store.SiteInfoTable!.siteInfo.longitudeH5) {
        console.log('1componentDidMount0===经纬度h5');
        this.setState({
          latitude: this.props.store.SiteInfoTable!.siteInfo.latitudeH5,
          longitude: this.props.store.SiteInfoTable!.siteInfo.longitudeH5
        })
      } else { // 协议拿经纬度 新增
        console.log('1componentDidMount1====协议h5');
        const getAdds = new AppInfoService()
        const [err, getAppLocalAddress] = await getAdds.getAppLocalAddress()
        console.log(getAppLocalAddress)
        this.setState({
          latitude: getAppLocalAddress.latitude,
          longitude: getAppLocalAddress.longitude
        })
      }
    }
    this.setState({
      getAddress: googleMap.address1Key[this.language] 
    })

    this.showMap(this.language)
    
    WebviewService.closeLoading()
  }

  public async showMap(language:any) {
    let _this = this
    if (!google) {
      await this.loadGoogleMap(language)
      google = (window as any).google
      await _this.initShowMap()
    }
  }

  // 获取定位
  public async getAddressLocation(latitude:string, longitude:string) {
    const state = this.state as any
    const http = new HttpService<IAddressLocation.Options>({
      method: "POST",
      path: "/address/location",
      otherParams: {
        latitude,
        longitude,
        userLatitude: state.lat,
        userLongitude: state.lng
      },
      appendHeaders: {}
    });
    const [err, response] = await http.request<IAddressLocation.PromiseResponse>();
    if (err) {
      Toast.service.show(err.message, 2000);
      return
    }
    console.log(response)
    state.response = response
    this.setState(state)
  }

  // 初始化地图
  public initMap(latitude:string,longitude:string) { 
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: new google.maps.LatLng(latitude, longitude),
      language:'CN',
      zoom: 19,
      mapTypeControl: false,
      zoomControl: false,
      disableDefaultUI: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE
      },
      mapTypeId: google.maps.MapTypeId.TERRAIN
    })
  }

  // 初始化 圆
  public initCircle(lat: string, lng: string) { 
    let _this = this
    let myCity = new google.maps.Circle({
      center: new google.maps.LatLng(lat, lng),
      radius: 4,
      strokeColor: '#007BFF',
      strokeOpacity: 0.4,
      strokeWeight: 50,
      fillColor: '#199BFF',
      fillOpacity: 1,
    })
    myCity.setMap(this.map)
    this.map.addListener('zoom_changed', function () {
      var p = Math.pow(2, (21 - _this.map.getZoom()));
      myCity.setRadius(p);
    });
  }


  // 初始化渲染地图
  public initShowMap() {
    const state = this.state
    this.initMap(state.latitude, state.longitude)
    this.initCircle(state.lat, state.lng)
    this.geocoder = new google.maps.Geocoder()
    this.markerListenDrag = google.maps.MapsEventListener; // 标注拖拽名
    this.markerListenClick = google.maps.MapsEventListener; // 标注点击事件名
    this.mapListener = google.maps.MapsEventListener
    this.allow(this.marker, this.geocoder) // 标注 地理编码
    // 埋点
    trackService.googleMapInit({
      platform_name:stores.SiteInfoTable.siteInfo.appTypeId === '1' ? 'apph5_in_hp':'apph5',
      page_name:stores.SiteInfoTable.siteInfo.appTypeId === '1' ? 'hp_address':'pf_address'
    })
  }

  // allow 标注
  public allow(marker: any, geocoder: any) {
    const state = this.state
    let curPos = this.map.getCenter();
    // 获取默认定位
    if (this.geocoder) {
      geocoder.geocode({
        location: curPos
      }, (results: any, status: any) => {
        this.pasrseAddress(results, status, this.map, marker)
      })
    }

    // 监听地图移动开始
    this.map.addListener('dragstart', () => { 
        this.setState({
          getAddress: googleMap.address1Key[this.language] ,
          usableRange: true,
          getAddressFlag:false
        })
    })
    // 监听地图移动结束
    this.map.addListener('idle', (e: any) => {
      console.log('结束')
      let curPosMiddle = this.map.getCenter();
      if (this.geocoder) {
        geocoder.geocode({
          location: curPosMiddle
        }, (results: any, status: any) => {
          this.pasrseAddress(results, status, this.map, marker)
        })
      }
    })
  }

  // 得到选择列表
  public async pasrseAddress(results: any, status: any, map: any, marker: any) {
    const state = this.state as any
    console.log(results)
    if (status === 'OK') {
      results = results.sort((x: any, y: any) => y.address_components.length - x.address_components.length);
      let getAddressList = this.getAddressDetail(results[1].address_components)
      const addressStr = getAddressList.map((item: any) => item.res).filter((item:any)=>!!item).join(',')

     console.log(getAddressList)
      const location = results[1].geometry.location;
      const postcode = this.addressResult(results[1].address_components, 'postal_code')
      marker?.setPosition(location)

      await this.getAddressLocation(location.lat().toString(), location.lng().toString())

      state.googleMapSourceData = results[1].address_components
      state.latitude = location.lat().toString()
      state.longitude = location.lng().toString()
      state.postcode = postcode
      state.getAddress = addressStr
      state.usableRange = state.response.usableRange
      state.getAddressFlag = true
      state.addressCity = state.response.addressCity

      this.setState(state)
    }
  }

  // 解析地址 国家 省 城市 区 路 邮编
  public getAddressDetail(result: any) {
    let detailNameList = ['locality', 'political','premise','route', 'street_number']
    let getDetailNames:any= []
    detailNameList.reverse().map(item => {
      let res1 = (result.find((x: any) => (x.types || []).includes(item)) || {}).long_name || ''
      getDetailNames.push({'name':item,'res':res1})
    })

    return getDetailNames
  }

  // 解析地址 国家 省 城市 区 路 邮编
  public addressResult(result:any,detailName:string) { 
    let res = (result.find((x: any) => (x.types || []).includes(detailName)) || {}).long_name || '';
    return res
  }

  public loadGoogleMap(language: any) {
    console.log(language,'======')
    return new Promise<void>((resolve, reject) => {
      const importScript = (function(oHead) {
        function loadError(oError:any) {
          reject(oError)
          throw new URIError('The script ' + oError.target.src + ' is not accessible.');
        }

        return function(sSrc:string, fOnload:any) {
          const oScript = document.createElement('script');
          oScript.type = 'text\/javascript';
          oScript.onerror = loadError;
          if (fOnload) {
            oScript.onload = fOnload;
          }
          oHead.appendChild(oScript);
          oScript.src = sSrc;
        }

      })(document.head || document.getElementsByTagName('head')[0])
      importScript(`https://maps.googleapis.com/maps/api/js?key=AIzaSyBiWIqxLaMKtPOO_CfATg3fuN4Ujrw-tFE&sensor=false&language=${language}`, (e:any) => {
        resolve()
      })
    })
  }


  public backStart() { // 回到最开始定位
    if (this.state.locationFlag) {
      const state = this.state
      this.initMap(state.lat, state.lng)
      this.initCircle(state.lat, state.lng)
      this.geocoder = new google.maps.Geocoder()
      this.allow(this.marker, this.geocoder)
      const geocoder: any = this.geocoder
      geocoder.geocode({
        location: new google.maps.LatLng(state.lat, state.lng)
      }, (results: any, status: any) => {
        if (status == 'OK') {
          results = results.sort((x: any, y: any) => y.address_components.length - x.address_components.length);
          let getAddressList = this.getAddressDetail(results[1].address_components)
          const addressStr = getAddressList.map((item: any) => item.res).filter((item:any)=>!!item).join(',')
          this.setState({
            getAddress: addressStr
          })
        }
      })
    } else { 
      if (!this.state.lat && !this.state.lng) {
        Toast.service.show(googleMap.address3Key[this.language], 2000);
      }
    }
  }

  public async chooseAddress() { // 选择地址
    const state = this.state as any;
    // state.usableRange && state.locationFlag
    if (state.usableRange && state.getAddressFlag) {
      const zipCode: any = (state.googleMapSourceData.find((x: any) => (x.types || []).includes('postal_code')) || {}) || ''; // 编码
      const zipCodeStr = zipCode['short_name'] ? zipCode['short_name'] : '';
      // 嵌入app
      if (stores.SiteInfoTable.siteInfo.appTypeId === '3') {
        console.log(state.getAddress)
        const addressCity = {
          'long_name': state.addressCity,
          'short_name': state.addressCity,
          'types': ['addressCity', 'address_City']
        }
        state.googleMapSourceData.push(addressCity)
        this.javascriptBridgeService.sendToNative('googleMap', 'selectAddressInfo', {
          longitude: state.longitude,
          latitude: state.latitude,
          googleMapSourceData: state.googleMapSourceData,
          postalCode: zipCodeStr,
          addressStr: state.getAddress
        }, (response: any) => {
          console.log(response, '========response')
        })
        this.setState(state)
      } else if (stores.SiteInfoTable.siteInfo.appTypeId === '1') {
        NavigationService.back({
          targetRoutePath: ROUTE_PATH.ADDRESS_MANAGE$ADD_OR_EDIT,
          reTaskList: [
            {functionName: 'testBackEventFn1', callParams: {location: state.getAddress,postalCode:zipCodeStr, addressCity: state.addressCity, longitude: state.longitude,latitude: state.latitude}},
          ]
        })
      }
    }
  }
  
  public onJumpLocation() { 
    let state = this.state as any
    NavigationService.push({ pathname: ROUTE_PATH.ADDRESS_MANAGE$LOCATION, params: { latitudeH5: state.lat, longitudeH5: state.lng } }, (response: any) => { 
      if (response.isLeave === 1) {
	      NavigationService.routeBackTaskRunActuator(this);
	    }
    })
  }


  render(): any {
    const state = this.state as any
    console.log(stores.SiteInfoTable.siteInfo.language)
    return (
      <>
        {
          stores.SiteInfoTable.siteInfo.appTypeId === '3' ?
            // 嵌入式
            <div className='googleWrap'>
              <div className='mapWrap' id='map'></div>
              <img src={centerIcon} className="mapIcon"alt=""/>
              <div className='locations' onClick={() => this.backStart()}>
                <img src={backIcon} alt="" />
              </div>
              <div className='showAddress' onClick={ () => this.chooseAddress()}>
                <img src={locationIcon} alt="" />
                <div className='addressMes'>
                  <p className={this.state.usableRange ? 'pylori' : ''}>
                    {state.getAddressFlag?
                     (state.postcode ? `${state.postcode},`:'')  + state.getAddress
                      : googleMap.address1Key[this.language]}
                    </p>
                  {this.state.usableRange ? '' :  (<span>{googleMap.address2Key[this.language]}</span>)}
                </div>
                <div className={this.state.usableRange ? 'distance' : 'distance disabled'}>{state.response.distance}</div>
              </div>
            </div> :
            // h5
            <CommonPage navigation={{ appendStyle: { background: "#FFF" } }}>
              <div className='googleWrap' style={{paddingTop: '88px'}}>
                <div className='TopBox'>
                  <div className='searchBox'>
                    <img src={searchIcon} alt="" />
                    <input placeholder='搜索您的收货地址' onClick={ this.onJumpLocation.bind(this)}/>
                  </div>
                </div>
                <div className='mapWrap' id='map'></div>
                <img src={centerIcon} className="mapIcon"alt=""/>
                <div className='locations' onClick={() => this.backStart()}>
                  <img src={backIcon} alt="" />
                </div>
                <div className='showAddress' onClick={ () => this.chooseAddress()}>
                  <img src={locationIcon} alt="" />
                  <div className='addressMes'>
                    <p className={this.state.usableRange ? 'pylori' : ''}>
                    {state.getAddressFlag?
                      (state.postcode ? `${state.postcode},`:'') + state.getAddress
                      :googleMap.address1Key[this.language]}
                      </p>
                    {this.state.usableRange ? '' :  (<span>{googleMap.address2Key[this.language]}</span>)}
                  </div>
                  <div className={this.state.usableRange ? 'distance' : 'distance disabled'}>{state.response.distance}</div>    
                </div>
                <div style={{height:this.state.safeAreaInsetBottom}}></div>
              </div>
            </CommonPage>
        }
      </>
    )
  }
}

export default AddressManageGoogleMap;