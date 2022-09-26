import Vue from 'vue'
import App from './App.vue'

const app = new Vue({
  render(createElement) {
    return createElement(App)
  }
})

app.$mount('#app')
