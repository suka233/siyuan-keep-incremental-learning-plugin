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
import { ref, inject } from 'vue'
import { Protyle } from 'siyuan'
import TopicIcon from './components/TopicIcon/index.vue'
import ItemIcon from './components/ItemIcon/index.vue'
import { useData } from '@/hooks/useData'
const { refreshTreeData, treeData, refreshAllRiffCards } = useData()

// refresh()
const test = async () => {
  await refreshAllRiffCards()
  refreshTreeData()
  // console.log(allRiffCards.value)
  // // console.log(notebooks.value)
  // treeData.value = genTree()
  // console.log(treeData.value)
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

const handleSelect = (key: [], e) => {
  window.openFileByURL(`siyuan://blocks/${key[0]}`)
  console.log(key)
  console.log(e)
}
</script>
<style scoped></style>
