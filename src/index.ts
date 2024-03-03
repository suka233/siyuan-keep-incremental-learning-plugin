import { Dialog, getFrontend, type ICardData, IProtyle, Menu, Plugin, type Protyle } from 'siyuan'
import type { ITab } from 'siyuan'
import 'uno.css'
import { kpIcon } from './assets/icon'
import { initKPDock, registerIcon } from '@/utils'
import './assets/index.less'
import { getSelectionContent, useExtract } from '@/hooks/useExtract'
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
    const { extract, extractTransactionsId } = useExtract()
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

    this.eventBus.on('ws-main', (e) => {
      if (e.detail.cmd === 'transactions') {
        // 如果id等于摘录id，则执行摘录操作
        if (e.detail.sid === extractTransactionsId.value) {
          // 设置custom-b:extract,custom-kp-dismiss:true
        }
      }
    })

    this.addCommand({
      langKey: 'extractNote',
      langText: '摘录',
      hotkey: '⌥E',
      editorCallback: (protyle) => {
        console.log(protyle)
        const instance: Protyle = protyle.getInstance()
        console.log(instance)
        //
        // const selectNode = document.querySelectorAll('.protyle-wysiwyg--select')
        //
        // switch (selectNode.length) {
        //   case 0:
        //     return
        //   case 1:
        //     instance.turnIntoTransaction(selectNode[0], 'Blocks2Ps')
        //     break
        //   default:
        //     instance.turnIntoTransaction(selectNode, 'Blocks2Blockquote')
        // }
        //
        // this.extractTransactionsId = protyle.id
        // this.extract(protyle)
        extract(protyle)
      }
    })

    // this.protyleOptions = {
    //   toolbar: [
    //     'block-ref',
    //     'a',
    //     '|',
    //     'text',
    //     'strong',
    //     'em',
    //     'u',
    //     's',
    //     'mark',
    //     'sup',
    //     'sub',
    //     'clear',
    //     '|',
    //     'code',
    //     'kbd',
    //     'tag',
    //     'inline-math',
    //     'inline-memo',
    //     '|',
    //     {
    //       name: 'kp-extract',
    //       icon: 'iconKProgressive',
    //       tipPosition: 'n',
    //       tip: '摘录',
    //       click(protyle: Protyle) {
    //         console.log(protyle.hasClosestBlock())
    //         const currentId = getSelection().anchorNode.parentNode.getAttribute('data-node-id')
    //       }
    //     }
    //   ]
    // }
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

  // 摘录操作
  public async extract(protyle: IProtyle) {
    const selectionContent = await getSelectionContent('Md', protyle)
    console.log(selectionContent)
  }

  async updateCards(options: ICardData) {
    // 当这个方法被调用的时候，说明打开了闪卡复习界面
    // 返回的数据会被用来更新闪卡复习界面的数据

    // 先获取所有的卡
    console.log(options)
    return options
  }
}
