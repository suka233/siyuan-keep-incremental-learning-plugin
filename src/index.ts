import { Dialog, getFrontend, type ICard, type ICardData, IProtyle, Menu, Plugin, type Protyle } from 'siyuan'
import type { ITab } from 'siyuan'
import 'uno.css'
import { kpIcon } from './assets/icon'
import { initKIDock, registerIcon } from '@/utils'
import './assets/index.less'
import { getSelectionContent, useExtract } from '@/hooks/useExtract'
import { type IRiffCard, useData } from '@/hooks/useData'
import { cloneDeep } from 'lodash-es'
import { setBlockAttrs, skipReviewRiffCard } from '@/api/public'
export default class KIPlugin extends Plugin {
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
    registerIcon('iconKI', '1024', kpIcon)

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
    await initKIDock(this)

    // this.eventBus.on('ws-main', (e) => {
    //   if (e.detail.cmd === 'transactions') {
    //   }
    // })

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

    this.protyleOptions = {
      toolbar: [
        'block-ref',
        'a',
        '|',
        'text',
        'strong',
        'em',
        'u',
        's',
        'mark',
        'sup',
        'sub',
        'clear',
        '|',
        'code',
        'kbd',
        'tag',
        'inline-math',
        'inline-memo',
        '|',
        {
          name: 'ki-extract',
          icon: 'iconKI',
          tipPosition: 'n',
          tip: '摘录',
          click(protyle: Protyle) {
            // console.log(protyle)
            // return
            extract(protyle.protyle)
          }
        }
      ]
    }

    // 观测DOM,自动记录闪卡界面的摘录卡的可视id
    // 自动插入闪卡的操作按钮
    // const observer = new MutationObserver((mutations) => {})

    let observer
    this.eventBus.on('loaded-protyle-static', (e) => {
      console.log(e)
      if (e.detail.protyle?.element?.parentElement?.classList.value.includes('card__main')) {
        const cardMain = e.detail.protyle.element.parentElement
        const blockElement = e.detail.protyle.contentElement!.firstElementChild!
        const blockId = e.detail.protyle.block.id!
        const blockType = blockElement.getAttribute('data-doc-type')
        const isTopic = blockType === 'NodeDocument'
        console.log(`blockId:${blockId},blockType:${blockType}`)

        if (isTopic) {
          //如果是文章，那么先滚动到书签处
          if (blockElement.getAttribute('custom-ki-bookmark')) {
            const bookmarkId = blockElement.getAttribute('custom-ki-bookmark')
            const bookmarkElement = blockElement.querySelector(`div[data-node-id="${bookmarkId}"]`)
            bookmarkElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }

          observer instanceof IntersectionObserver && observer.disconnect()
          const childDivs = e.detail.protyle.contentElement!.querySelectorAll('div[data-node-id]')
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  console.log(entry.target.getAttribute('data-node-id'))
                  const bookmarkId = entry.target.getAttribute('data-node-id')!
                  isTopic &&
                    setBlockAttrs({
                      id: blockId,
                      attrs: {
                        'custom-ki-bookmark': bookmarkId
                      }
                    })
                }
              })
            },
            { threshold: 1 }
          )

          childDivs.forEach((div) => {
            observer.observe(div)
          })
        }
      }
    })
  }

  onunload() {}

  // 创建菜单
  private addMenu(rect: DOMRect) {
    const menu = new Menu('Kmind')

    menu.addItem({
      icon: 'iconInfo',
      label: 'KI全局配置',
      click: () => {
        this.openConfigDialog('KI全局配置', 'GlobalConfig')
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
      content: `<div class="b3-dialog__content"><div id="ki-plugin-config-dialog"></div></div>`,
      width: '800px',
      height: '500px'
    })
    const root = document.getElementById('ki-plugin-config-dialog')
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
    // return options
    // 当这个方法被调用的时候，说明打开了闪卡复习界面
    // 返回的数据会被用来更新闪卡复习界面的数据

    // 先获取所有的卡
    const { allRiffCards, refreshAllRiffCards } = useData()
    await refreshAllRiffCards()
    // 生成id:card的map
    const cardMap = new Map()
    allRiffCards.value!.forEach((card) => {
      cardMap.set(card.id, cloneDeep(card))
    })
    const richCards = options.cards.map((card) => {
      return {
        ...card,
        ...cardMap.get(card.blockID)
      } as ICard & IRiffCard
    })

    // 排除掉标记为custom-kp-stop的卡片
    // 排除掉标记为custom-kp-pause的日期为今天之后的卡片，这里有个情况需要适配，custom-kp-pause如果为今天之前，那么就搜集这张卡以便统一处理
    // 按照custom-kp-priority排序
    const skipCards: Array<IRiffCard & ICard> = []
    const filterCards = richCards
      // 直接更改stop和pause卡片的due，无需手动filter
      // .filter((card) => {
      //   if (card.ial['custom-kp-stop']) {
      //     skipCards.push(card)
      //     return false
      //   } else {
      //     return true
      //   }
      //   // return !card.ial['custom-kp-dismiss']
      // })
      // .filter((card) => {
      //   return !card.ial['custom-kp-pause'] || new Date(card.ial['custom-kp-pause']) < new Date()
      // })
      .sort((a, b) => {
        const APriority = a.ial['custom-kp-priority'] || 50
        const BPriority = b.ial['custom-kp-priority'] || 50
        return APriority - BPriority
      })

    await Promise.all(skipCards.map((card) => skipReviewRiffCard(card.cardID, card.deckID)))
    console.log(skipCards)
    console.log(options)
    console.log(richCards)
    console.log(filterCards)
    return Object.assign(options, {
      cards: filterCards
    })
  }
}
