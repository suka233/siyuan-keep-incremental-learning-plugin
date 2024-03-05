import { Plugin } from 'siyuan'
import KIDock from '@/components/KIDock/index.vue'
import { createApp } from 'vue'
import Antd from 'ant-design-vue'

// 注册icon
export const registerIcon = (name, size, svg) => {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<svg style="position: absolute; width: 0; height: 0; overflow: hidden;" xmlns="http://www.w3.org/2000/svg">
      <defs>
          <symbol id="${name}" viewBox="0 0 ${size} ${size}">
              ${svg}
          </symbol>
      </defs>
  </svg>`
  )
}

export const initKIDock = async (plugin: Plugin) => {
  let KIApp
  plugin.addDock({
    config: {
      position: 'LeftBottom',
      size: {
        width: 200,
        height: 0
      },
      icon: 'iconKI',
      title: 'KeepIncremental'
    },
    type: 'KIDock',
    init() {
      const root = this.element
      KIApp = createApp(KIDock).provide('plugin', plugin)
      KIApp.use(Antd).mount(root)
      this.data.destroy = () => {
        root && KIApp.unmount()
      }
    },
    data: {},
    beforeDestroy() {
      this.data.destroy && this.data.destroy()
    }
  })
  return KIApp
}
