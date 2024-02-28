import { Plugin } from 'siyuan'
import KPDock from '@/components/KPDock/index.vue'
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

export const initKPDock = async (plugin: Plugin) => {
  let KPApp
  plugin.addDock({
    config: {
      position: 'LeftBottom',
      size: {
        width: 200,
        height: 0
      },
      icon: 'iconKProgressive',
      title: 'KProgressive'
    },
    type: 'KProgressiveDock',
    init() {
      const root = this.element
      KPApp = createApp(KPDock).provide('plugin', plugin)
      KPApp.use(Antd).mount(root)
      this.data.destroy = () => {
        root && KPApp.unmount()
      }
    },
    data: {},
    beforeDestroy() {
      this.data.destroy && this.data.destroy()
    }
  })
  return KPApp
}
