import { createApp, h, Component } from 'vue'
import { add } from './helper'

const App: Component = {
  render() {
    return h('div', `1 + 2 = ${add(1, 2)}`)
  }
}

createApp(App).mount('#app')
