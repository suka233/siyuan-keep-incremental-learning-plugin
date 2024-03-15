import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import CardControl from '@/components/CardControl/index.vue'
import type { IRiffCard } from '@/hooks/useData'
import { confirm, showMessage } from 'siyuan'
import dayjs from 'dayjs'
import {
  batchSetBlockAttrs,
  batchSetRiffCardsDueTime,
  getBlockAttrs,
  getBlockInfo,
  listDocsByPath,
  setBlockAttrs
} from '@/api/public'
import { KIAttr } from '@/enum'
import { addCard, addDocToTopic } from '@/hooks/useExtract'

export const useCardControlApp = () => {
  const initCardControllerApp = (root, params: any) => {
    const cardController = createApp(CardControl).provide('params', params)
    cardController.use(Antd).mount(root)
  }

  const dismiss = (cards: Array<Pick<IRiffCard, 'id' | 'riffCardID' | 'riffCard'>>, callback: Function) => {
    return new Promise((resolve, reject) => {
      confirm(
        `确定Dismiss这${cards.length}张摘录卡吗？`,
        '您可以随时在闪卡树中取消dismiss',
        async () => {
          // custom-ki-dismiss: 当前日期|原本到期日期
          // 将这张卡推迟100年，按照目前的医学水平，您有生之年应该不会见到这张卡了，但是如果您真的见到了，那么请联系我，我请您吃饭 23333

          await batchSetBlockAttrs(
            cards.map((card) => ({
              id: card.id,
              attrs: {
                [KIAttr.dismiss]: `${dayjs().format('YYYYMMDDHHmmss')}|${card?.riffCard?.due ?? ''}`
              }
            }))
          )

          await batchSetRiffCardsDueTime(
            cards.map((card) => {
              return {
                id: card.riffCardID,
                due: dayjs().add(100, 'year').format('YYYYMMDDHHmmss')
              }
            })
          )

          callback()
          resolve()
        },
        async () => {
          reject()
        }
      )
    })
  }

  // 设置兄弟文档为闪卡，自动评分3分并自动推迟2天
  // 入参，当前卡片的id，评分数，推迟的天数，可选：向上or向下查找
  const goIncremental = async (id: string, rating = 3, delay = 2, direction?: 'up' | 'down' = 'up') => {
    const { data: blockInfo } = await getBlockInfo(id)
    const pathArr = blockInfo.path.split('/')
    // 去除最后一个元素，即获得父文档路径
    pathArr.pop()
    const parentPath = `${pathArr.join('/')}.sy`
    // 获取父文档id
    const parentDocId = pathArr.pop()
    const { data: parentDocAttrs } = await getBlockAttrs(parentDocId)

    if (!parentDocAttrs?.[KIAttr['incremental']]) {
      // 不存在此标记，不进行任何操作
      showMessage('该文档并未加入渐进式阅读流程')
      return
    }

    const {
      data: { files: docsList }
    } = await listDocsByPath(blockInfo.box, parentPath)
    console.log('docsList', docsList)

    if (docsList.length === 1) {
      // TODO 当前文档是唯一的文档
      showMessage(`当前文档没有兄弟文档，请检查`)
      return
    }

    // 获取当前文档的索引
    const currentDocIndex = docsList.findIndex((doc) => doc.id === id)

    if (currentDocIndex === 0) {
      // TODO 当前文档是第一个文档
      showMessage(`恭喜您已经完成了这个系列文档的渐进式阅读~`)
      return
    }

    // 默认向上查找
    const { id: nextDocId, name: nextDocTitle } = docsList[currentDocIndex - 1]
    // 获取父文档优先级属性
    const priority = parentDocAttrs['custom-card-priority'] ?? 50
    // 下一篇文档加入闪卡
    await addCard(nextDocId)
    // 下一篇文档设置属性
    await setBlockAttrs({
      id: nextDocId,
      attrs: {
        'custom-card-priority': priority,
        [KIAttr['first-extract']]: dayjs().format('YYYYMMDDHHmmss')
      }
    })

    showMessage(`正在将下一篇兄弟文档加入渐进式阅读流程:${nextDocTitle}`)
    setTimeout(async () => {
      await addDocToTopic(nextDocId, rating, delay)
      showMessage(`成功将下一篇兄弟文档加入渐进式阅读流程:${nextDocTitle}`)
    }, 5000)
  }

  return {
    initCardControllerApp,
    dismiss,
    goIncremental
  }
}
