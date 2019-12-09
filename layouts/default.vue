<template>
  <div>
    <div 
      v-if="!isLogin" 
      class="login-modal">
      <input 
        v-model="password"
        class="pw" 
        type="password">
      <div 
        class="confirm" 
        @click="login">confirm</div>
    </div>
    <nuxt v-if="isLogin" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLogin: false,
      password: ''
    }
  },
  mounted() {
    if (localStorage.getItem('isLogin')) {
      this.isLogin = true
    }
  },
  methods: {
    login() {
      if (this.password === '123456map') {
        this.isLogin = true
        localStorage.setItem('isLogin', true)
        // location.pathname = '/'
      }
    }
  }
}
</script>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
.login-modal {
  margin: 200px auto;
  border: 1px solid #ccc;
  overflow: hidden;
  padding: 50px;
  display: inline-block;
  border-radius: 16px;
  background: #f7f7f7;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}
.pw {
  height: 40px;
  border-radius: 5px;
  width: 250px;
  border: 1px solid #ccc;
  float: left;
  margin-right: 20px;
  padding: 10px;
}
.confirm {
  border-radius: 5px;
  background-color: #ef8246;
  height: 40px;
  width: 80px;
  text-align: center;
  color: #fff;
  cursor: pointer;
  float: left;
  line-height: 40px;
  font-size: 16px;
  font-weight: bold;
}
.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
