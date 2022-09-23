import Vue from 'vue'
import App from './App.vue'

import './index.css'

const app = new Vue({
  render(createElement) {
    return createElement(App)
  }
})

app.$mount('#app')
