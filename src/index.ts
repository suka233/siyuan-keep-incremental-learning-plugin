import { Dialog, getFrontend, Menu, Plugin, type Protyle } from 'siyuan'
import type { ITab } from 'siyuan'
import 'uno.css'
import { kpIcon } from './assets/icon'
import { initKPDock, registerIcon } from '@/utils'
import { createApp } from 'vue'
import './assets/index.less'
import Antd from 'ant-design-vue'
import { setBlockAttrs } from '@/api/public'
export default class KProgressivePlugin extends Plugin {
  // private isMobile!: boolean
  // public menuElement!: HTMLElement
  // public dialogElement!: HTMLElement
  // private tab?: () => IModel
  tabs: Array<{
    name: string
    tab: ITab
  }>
  private menuElement: HTMLElement
  private isMobile: boolean
  constructor(options) {
    super(options)
    // this.tab = undefined
    this.tabs = []
  }
  async onload() {
    // 注册图标
    registerIcon('iconKProgressive', '1024', kpIcon)

    const frontEnd = getFrontend()
    this.isMobile = frontEnd === 'mobile' || frontEnd === 'browser-mobile'

    // 初始化顶栏菜单按钮
    // this.menuElement = this.addTopBar({
    //   icon: 'iconKnote',
    //   title: this.i18n.openKNote,
    //   position: 'right',
    //   callback: () => {
    //     let rect = this.menuElement.getBoundingClientRect()
    //     // 如果被隐藏，则使用更多按钮
    //     if (rect.width === 0) {
    //       rect = document.querySelector('#barMore')!.getBoundingClientRect()
    //     }
    //     this.addMenu(rect)
    //   }
    // })

    // 初始化tab
    // this.tab = initKvideoTab(this)

    // 初始化dock
    await initKPDock(this)

  }

  onunload() {}

  // 创建菜单
  private addMenu(rect: DOMRect) {
    const menu = new Menu('Kmind')

    menu.addItem({
      icon: 'iconInfo',
      label: 'kprogressive全局配置',
      click: () => {
        this.openConfigDialog('kprogressive全局配置', 'GlobalConfig')
      }
    })

    // menu.addItem({
    //   icon: 'iconInfo',
    //   label: 'Kmind文件夹',
    //   click: () => {
    //     this.openConfigDialog('Kmind文件夹', 'KmindDock')
    //   }
    // })

    if (this.isMobile) {
      menu.fullscreen()
    } else {
      menu.open({
        x: rect.left,
        y: rect.bottom
      })
    }
  }

  // 打开配置Dialog
  private openConfigDialog(title: string, type?: string) {
    new Dialog({
      title,
      content: `<div class="b3-dialog__content"><div id="kprogressive-plugin-config-dialog"></div></div>`,
      width: '800px',
      height: '500px'
    })
    const root = document.getElementById('kprogressive-plugin-config-dialog')
    // new Protyle(this.app, root, {
    //   blockId: '20230712105058-fkptf24'
    // })
    // console.log(this.app)
    // const configDialogApp = createApp(KnoteDialog, { type })
    // configDialogApp.use(Antd)
    // configDialogApp.mount(root!)
  }
}
