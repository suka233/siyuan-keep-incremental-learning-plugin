<template>
  <div>
    kp virtual tree
    <a-button @click="test">genTree</a-button>
    <a-button @click="turnIntoOne">trunIntoOne</a-button>
    <a-config-provider
      :theme="{
        components: {
          Tree: {
            colorBgContainer: 'transparent'
          }
        }
      }"
    >
      <a-tree :tree-data="treeData" @select="handleSelect">
        <template #title="{ title, key, type, isTopic }">
          <div class="text-truncate max-w-xs">
            <span v-if="type || isTopic">
              <topic-icon v-if="type === 'NodeDocument' || isTopic" />
              <item-icon v-else />
            </span>
            {{ title }}
          </div>
        </template>
      </a-tree>
    </a-config-provider>
    <div id="kp-protyle"></div>
  </div>
</template>

<script setup lang="ts">
import { getAllRiffCards, listNotebook } from '@/api/public'
import { ref, inject } from 'vue'
import { Protyle } from 'siyuan'
import TopicIcon from './components/TopicIcon/index.vue'
import ItemIcon from './components/ItemIcon/index.vue'

interface ITreeNode {
  /** 标题 */
  title: string
  key: any
  /**
   * 类型
   * NodeDocument
   */
  type?: string
  /**
   * 是否是摘录卡,适配 非文档块 被手动标记为摘录卡的情况
   */
  isTopic?: boolean
  children?: ITreeNode | []
}

/**
 * 先获取笔记本
 */
const notebooks = ref<Array<any>>()
const allRiffCards = ref<Array<any>>()
const treeData = ref<Array<ITreeNode>>()

const refresh = async () => {
  listNotebook().then((res) => {
    notebooks.value = res.data.notebooks

    getAllRiffCards().then((res) => {
      // 简单排下序
      allRiffCards.value = (res.data.blocks as [])
        // 排除失效闪卡
        .filter((item) => item.box)
        .sort((a, b) => {
          const timestampA = Number(a.id.split('-')[0])
          const timestampB = Number(b.id.split('-')[0])
          return timestampA - timestampB
        })
    })
  })
}

refresh()
const test = async () => {
  await refresh()
  console.log(allRiffCards.value)
  // console.log(notebooks.value)
  treeData.value = genTree()
  console.log(treeData.value)
}

const plugin = inject('plugin')
const turnIntoOne = () => {
  // console.log(plugin)
  new Protyle(plugin.app, document.createElement('div'), {
    after(protyle) {
      console.log(protyle)
      protyle.turnIntoOneTransaction(document.querySelectorAll('.protyle-wysiwyg--select'), 'Blocks2Blockquote')
    }
  })
}

// 根据notebooks和allRiffCards生成treeData
// FIXME 在多次摘录的时候，生成的树还是有一些问题，待排查
const genTree = (): ITreeNode[] => {
  const tree: ITreeNode[] = []
  const notebookMap = new Map(notebooks.value!.map((notebook) => [notebook.id, notebook.name]))
  const topicMap = allRiffCards.value!.filter((item) => item.type === 'NodeDocument').map((item) => item.id)
  console.log(topicMap)

  allRiffCards.value!.forEach((card) => {
    let currentLevel = tree
    const notebookName = notebookMap.get(card.box)
    // 拼接笔记本名称到hpath中
    let hpaths = (notebookName ?? '') + card.hPath
    // 拼接笔记本id到path中，并且由于最后的path总是以.sy结尾，所以要去掉这个.sy
    let paths = `${card.box}${card.path}`.split('.')[0]
    // 是否是文档块
    const isNodeDocument = card.type === 'NodeDocument'

    if (!isNodeDocument) {
      // 非文档闪卡的话,path和hpath都不会有该块的路径，所以手动添加到后面
      // TODO 这里要适配一种情况，就是content中如果有/，要取/前面的文字，或者把content中的/去掉，否则会和已经有的/分隔符冲突
      // TODO 这里还要适配一种情况，文档下面的摘录卡，如果要在文档树中展示层级状态，那么摘录的时候在自定义属性里面要加上自定义的hpath和path，然后在这里进行手动拼接
      hpaths = `${hpaths}/${card.content.replaceAll('/', '')}`
      // 把该块的id拼接到后面
      paths = `${paths}/${card.id}`
    }

    const splitPaths = paths.split('/')
    const splitHPaths = hpaths.split('/')

    splitHPaths.forEach((hpath, index) => {
      debugger
      // currentLevel在首次是空数组，之后的循环都指向上一次的children数组
      // FIXME 这里采用title和hpath匹配，不确定会不会有问题
      let foundNode = currentLevel.find((node) => node.title === hpath)
      // 末尾index
      const endIndex = splitHPaths.length - 1
      if (!foundNode) {
        const key = splitPaths[index]
        const newNode: ITreeNode = {
          title: hpath,
          key,
          // 是否是摘录卡
          isTopic: topicMap.includes(key),
          // children:
          //   index === endIndex
          //     ? [{ ...cloneDeep(card), title: card.content, key: card.id, isTopic: card.type === 'NodeDocument' }]
          //     : []
          children: []
        }

        if (index === endIndex) {
          newNode.type = card.type
        }

        // 在当前层级push进构造好的新节点
        currentLevel.push(newNode)
        // 将当前的层级内存地址改为上述newNode的children下，这样下次循环的时候，currentLevel.push实际上是本次的newNode.children.push
        currentLevel = newNode.children as ITreeNode[]
      } else {
        // 适配
        // if (index === endIndex && foundNode.key !== card.id) {
        // if (index === endIndex) {
        //   foundNode.children.push({
        //     ...cloneDeep(card),
        //     title: card.content,
        //     key: card.id,
        //     isTopic: card.type === 'NodeDocument'
        //   })
        // }
        currentLevel = foundNode.children as ITreeNode[]
      }
    })
  })
  return tree
}

const handleSelect = (key: [], e) => {
  window.openFileByURL(`siyuan://blocks/${key[0]}`)
  console.log(key)
  console.log(e)
}
</script>
<style scoped></style>
