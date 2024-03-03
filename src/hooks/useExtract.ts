import { IOperation, IProtyle, Protyle } from 'siyuan'
import { ref } from 'vue'
import { appendBlock } from '@/api/public'

const luteEngine = globalThis.Lute.New()
const MAKEDATE = 'custom-make-date'
const SOURCEROAD = 'custom-source-road'

const extractTransactionsId = ref('')
export const useExtract = () => {
  const extract = async (protyle: IProtyle & { getInstance: () => Protyle }) => {
    const selectNode = document.querySelectorAll('.protyle-wysiwyg--select')
    switch (selectNode.length) {
      case 0:
        // 行内选中文本，或者直接在块中点击了快捷键
        // content[1] md content[2] contentMd content[3] id
        const content = await getSelectionContent('Md', protyle)
        console.log(content)
        if (content[1]) {
          // 以该文本为内容创建一个摘录
          const newQuote = `
>${content[2]}
{: custom-kp-b="extract"}
`
          appendBlock({
            data: newQuote,
            dataType: 'markdown',
            parentID: content[3]
          })
        } else {
          // 不存在内容，则把这个块转为摘录块
          // 直接用document的话会查询到面包屑上面去
          const node = protyle.wysiwyg.element.querySelector(`[data-node-id='${content[3]}']`)
          // node.classList.add('protyle-wysiwyg--select')
          // const { doOperations, undoOperations } = genTransactionOperations([node])
          // protyle.getInstance().transaction(doOperations, undoOperations)
          quoteTransaction(protyle, [node])
        }
        break
      default:
        // 选中了一个块或者多个块
        // protyle.getInstance().turnIntoOneTransaction(selectNode, 'Blocks2Blockquote')
        // const { doOperations, undoOperations } = genTransactionOperations(selectNode)
        // protyle.getInstance().transaction(doOperations, undoOperations)
        quoteTransaction(protyle, selectNode)
      // 选中了多个块
    }
  }
  const quoteTransaction = (protyle, selectedNode) => {
    if (selectedNode.length) {
      const { doOperations, undoOperations } = genTransactionOperations(selectedNode)
      protyle.getInstance().transaction(doOperations, undoOperations)
    } else {
      const { doOperations, undoOperations } = genTransactionOperations([selectedNode])
      protyle.getInstance().transaction(doOperations, undoOperations)
    }
  }

  // 构建transaction的doOperations,插入的quote块需要同时插入一些自定义属性
  const genTransactionOperations = (selectsElement: Element[]) => {
    // 传入的是节点数组的情况
    const quoteId = globalThis.Lute.NewNodeID()
    const quoteElement = document.createElement('div')
    quoteElement.classList.add('bq')
    quoteElement.setAttribute('data-node-id', quoteId)
    quoteElement.setAttribute('data-type', 'NodeBlockquote')
    quoteElement.setAttribute('custom-kp-b', 'extract')
    quoteElement.innerHTML = '<div class="protyle-attr" contenteditable="false"></div>'
    const previousId = selectsElement[0].getAttribute('data-node-id')
    const parentId = selectsElement[0]!.parentElement.getAttribute('data-node-id')
    const doOperations: IOperation[] = [
      {
        action: 'insert',
        quoteId,
        data: quoteElement.outerHTML,
        nextID: previousId,
        parentID: parentId
      }
    ]

    if (selectsElement[0].previousElementSibling) {
      selectsElement[0].before(quoteElement)
    } else {
      selectsElement[0].parentElement.prepend(quoteElement)
    }

    let itemPreviousId: string
    const undoOperations: IOperation[] = []
    selectsElement.forEach((item, index) => {
      item.classList.remove('protyle-wysiwyg--select')
      item.removeAttribute('select-start')
      item.removeAttribute('select-end')
      const itemId = item.getAttribute('data-node-id')
      undoOperations.push({
        action: 'move',
        id: itemId,
        previousID: itemPreviousId || quoteId,
        parentID: parentId
      })
      doOperations.push({
        action: 'move',
        id: itemId,
        previousID: itemPreviousId,
        parentID: quoteId
      })
      quoteElement.lastElementChild.before(item)

      itemPreviousId = item.getAttribute('data-node-id')
      if (index === selectsElement.length - 1) {
        undoOperations.push({
          action: 'delete',
          id: quoteId
        })
      }
    })

    return { doOperations, quoteId, undoOperations }
  }

  return {
    extractTransactionsId,
    extract
  }
}

// 获取选择内容
// 来源：https://github.com/zxhd863943427/siyuan-plugin-flash-enhance/blob/562be3b3be0a809bf59fd4c269ee84b783801ec3/src/api/IR.ts#L67
export async function getSelectionContent(mode: string, protyle: IProtyle) {
  const currentPage = protyle.element
  //页面无.protyle-wysiwyg--select，说明未选中块，而是内容
  const slectMult = currentPage.querySelector('.protyle-wysiwyg--select') != null
  let selectedContent
  if (slectMult) {
    selectedContent = await getMultSelectionContent(currentPage, mode, protyle)
  } else {
    selectedContent = getMonSelectionContent(mode, protyle)
    // updateContentStyle(protyle)
  }
  return selectedContent

  async function getMultSelectionContent(root: HTMLElement, mode: string, protyle: IProtyle) {
    let md
    let sourceRoadMd
    let content
    let source
    const elemnet = root.getElementsByTagName('div')
    const sourceTitle = getSourceTitle(protyle)
    const select = Array.from(elemnet).filter((chapter) => chapter.classList.contains('protyle-wysiwyg--select'))
    const AllSelection = document.createElement('div')
    for (const se of select) {
      const item = se.cloneNode(true) as HTMLElement
      source = se.getAttribute('data-node-id')
      item.setAttribute('data-node-id', getNewID())
      item.querySelectorAll('[data-node-id]').forEach((subNode) => {
        subNode.setAttribute('data-node-id', getNewID())
      })
      AllSelection.appendChild(item)
      // await updateBlockStyle(se)
    }
    const [_, sourceRoadElement] = extractSourceRoad(root)
    switch (mode) {
      case 'StdMd':
        md = luteEngine.BlockDOM2StdMd(AllSelection.innerHTML)
        sourceRoadMd = luteEngine.BlockDOM2StdMd(sourceRoadElement.innerHTML)
        break
      case 'Md':
        md = luteEngine.BlockDOM2Md(AllSelection.innerHTML)
        sourceRoadMd = luteEngine.BlockDOM2Md(sourceRoadElement.innerHTML)
        break
    }
    content = luteEngine.BlockDOM2Content(AllSelection.innerHTML)
    // md = md + `\n((${source} "来源"))`
    const contentMd = md
    md = md = `${md}

{{{row
((${source} "${sourceTitle}"))

${sourceRoadMd}
    
${genTodayDate()}
{: ${MAKEDATE}="true"}
}}}
{: ${SOURCEROAD}="true"}`
    return [md, content, contentMd, source]
  }

  async function getMonSelectionContent(mode: string, protyle: IProtyle) {
    let md
    let sourceRoadMd
    let content

    const sourceTitle = getSourceTitle(protyle)

    const range = getSelection().getRangeAt(0)
    const selected = range.cloneContents()
    const source = getContentSource(range)
    // updateContentStyle(protyle)
    const element = document.createElement('div')

    const [_, sourceRoadElement] = extractSourceRoad(protyle.element)

    element.appendChild(selected)
    switch (mode) {
      case 'StdMd':
        md = luteEngine.BlockDOM2StdMd(element.innerHTML)
        sourceRoadMd = luteEngine.BlockDOM2StdMd(sourceRoadElement.innerHTML)
        break
      case 'Md':
        md = luteEngine.BlockDOM2Md(element.innerHTML)
        sourceRoadMd = luteEngine.BlockDOM2Md(sourceRoadElement.innerHTML)
        break
    }
    content = luteEngine.BlockDOM2Content(element.innerHTML)
    const contentMd = md
    md = md = `${md}

{{{row
((${source} "${sourceTitle}"))

${sourceRoadMd}
    
${genTodayDate()}
{: ${MAKEDATE}="true"}
    
}}}
{: ${SOURCEROAD}="true"}`

    return [md, content, contentMd, source]
  }

  function extractSourceRoad(node: HTMLElement): [HTMLElement, HTMLElement] {
    const cloneNode = node.cloneNode(true) as HTMLElement
    let sourceRoadElement = cloneNode.querySelector('[custom-source-road]')
    if (!sourceRoadElement) {
      sourceRoadElement = document.createElement('div')
    }
    sourceRoadElement.remove()
    sourceRoadElement.querySelector('[custom-make-date]')?.remove()
    return [cloneNode as HTMLElement, sourceRoadElement as HTMLElement]
  }

  function getSourceTitle(protyle: IProtyle): string {
    if (getSourceId(protyle) === protyle.block.parentID && protyle.title) {
      return protyle.title.editElement.innerText
    }
    const firstNode = protyle.element.querySelector(
      `div[data-node-id='${getSourceId(protyle)}'] > div:nth-child(1)`
    ) as HTMLElement
    if (firstNode) {
      return firstNode.innerText.slice(0, 30)
    }
    const noIdFirstNode = protyle.element.querySelector(`div[data-node-id] > div:nth-child(1)`) as HTMLElement
    if (noIdFirstNode) {
      return noIdFirstNode.innerText.slice(0, 30)
    }
    return '来源'
  }

  function getSourceId(protyle: IProtyle) {
    return protyle.block.id
  }

  function getBlock(node: HTMLElement): HTMLElement {
    if (node != null && (!exist(node.getAttribute) || node.getAttribute('data-node-id') === null)) {
      return getBlock(node.parentElement)
    }
    return node
  }

  function getContentSource(range: Range) {
    return getBlock(range.startContainer as HTMLElement).getAttribute('data-node-id')
  }

  function exist(obj: any) {
    return obj != null && obj != undefined && obj != ''
  }

  function genTodayDate() {
    const date = new Date()

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    const formatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

    return formatted
  }
  function getNewID() {
    return globalThis.Lute.NewNodeID()
  }
}