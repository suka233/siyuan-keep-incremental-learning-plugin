<template>
  <div>
    kp virtual tree
    <a-button @click="test">test</a-button>
    <a-tree :tree-data="treeData">
      <template #title="{ title, key }">
        <div @click="handleClick(key)">{{ title }}</div>
      </template>
    </a-tree>
  </div>
</template>

<script setup lang="ts">
import { getAllRiffCards, listNotebook } from '@/api/public'
import { ref } from 'vue'

interface ITreeNode {
  /** 标题 */
  title: string
  key: any
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
      allRiffCards.value = res.data.blocks
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

// 根据notebooks和allRiffCards生成treeData
const genTree = (): ITreeNode[] => {
  // TODO 同级节点可以根据id前面的时间排序
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
    const isTopic = card.type === 'NodeDocument'

    if (!isTopic) {
      // 非文档闪卡的话,path和hpath都不会有该块的路径，所以手动添加到后面
      // TODO 这里要适配一种情况，就是content中如果有/，要取/前面的文字，或者把content中的/去掉，否则会和已经有的/分隔符冲突
      hpaths = `${hpaths}/${card.content.replaceAll('/', '')}`
      // 把该块的id拼接到后面
      paths = `${paths}/${card.id}`
    }

    const splitPaths = paths.split('/')
    const splitHPaths = hpaths.split('/')

    splitHPaths.forEach((hpath, index) => {
      debugger
      // currentLevel在首次是空数组，之后的循环都指向上一次的children数组
      // FIXME 这里
      let foundNode = currentLevel.find((node) => node.title === hpath)
      // 末尾index
      const endIndex = splitHPaths.length - 1
      if (!foundNode) {
        const key = splitPaths[index]
        const newNode: ITreeNode = {
          title: hpath,
          key,
          isTopic: topicMap.includes(key),
          // children:
          //   index === endIndex
          //     ? [{ ...cloneDeep(card), title: card.content, key: card.id, isTopic: card.type === 'NodeDocument' }]
          //     : []
          children: []
        }

        // 在当前层级push进构造好的新节点
        currentLevel.push(newNode)
        // 将当前的层级内存地址改为上述newNode的children下，这样下次循环的时候，currentLevel.push实际上是本次的newNode.children.push
        currentLevel = newNode.children
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
        currentLevel = foundNode.children
      }
    })
  })
  return tree
}

const handleClick = (key) => {
  window.openFileByURL(`siyuan://blocks/${key}`)
}
</script>
<style scoped></style>
