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
      <a-tree
        v-if="treeData?.length"
        :show-line="true"
        ref="treeRef"
        :height="233"
        :tree-data="treeData"
        @select="handleSelect"
        v-model:expanded-keys="expandedKeys"
        v-model:selected-keys="selectedKeys"
        @rightClick="handleRightClick"
      >
        <template #title="{ title, key, type, isTopic, isDismiss, params }">
          <div class="text-truncate max-w-xs">
            <span v-if="type || isTopic">
              <topic-icon v-if="type === 'NodeDocument' || isTopic" :isDismiss="isDismiss" />
              <item-icon v-else />
            </span>
            <span>
              {{ title }}
            </span>

            <!--            优先级展示-->
            <span v-if="params">
              {{ ` (${params?.ial?.['custom-card-priority'] ?? 50})` }}
            </span>
          </div>
        </template>
      </a-tree>
    </a-config-provider>
    <div id="kp-protyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { Protyle } from 'siyuan'
import TopicIcon from './components/TopicIcon/index.vue'
import ItemIcon from './components/ItemIcon/index.vue'
import { useData } from '@/hooks/useData'
import { useKIDock } from '@/components/KIDock/useKIDock'
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
  console.log(treeRef.value)
  console.log(expandedKeys.value)
  autoExpandParent.value = false
  // treeRef.value.scrollTo({ key: '20240305170626-0p3yxnf', align: 'top' })
  return
  // console.log(plugin)
  new Protyle(plugin.app, document.createElement('div'), {
    after(protyle) {
      console.log(protyle)
      protyle.turnIntoOneTransaction(document.querySelectorAll('.protyle-wysiwyg--select'), 'Blocks2Blockquote')
    }
  })
}

const handleSelect = (key: [], e) => {
  console.log(key)
  console.log(e)
  if (e?.node?.dataRef?.isBox) {
    // 首级标题不可点击
    return
  }
  window.openFileByURL(`siyuan://blocks/${key[0]}`)
}

let { selectedKeys, scrollTo, expandedKeys, autoExpandParent } = useKIDock()
const treeRef = ref(null)
const handleRightClick = (e) => {
  console.log('Rclick', e)
}

onMounted(() => {
  scrollTo = (key) => {
    treeRef.value.scrollTo({ key, align: 'top' })
  }
})
</script>
<style scoped></style>
