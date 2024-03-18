<template>
  <div class="fn__flex-1 fn__flex-column">
    <div class="block__icons">
      <div class="block__logo">
        <svg class="block__logoicon">
          <use xlink:href="#iconKI" />
        </svg>
        KeepIncremental
      </div>
      <span class="fn__flex-1 fn__space"></span>
      <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="最小化">
        <svg>
          <use xlink:href="#iconMin" />
        </svg>
      </span>
      <!--      <span id="add-draw" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="新建" @click="handleAddKmind">-->
      <!--        <svg>-->
      <!--          <use xlink:href="#iconAdd" />-->
      <!--        </svg>-->
      <!--      </span>-->
      <span id="refresh" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="刷新闪卡树" @click="handleRefresh">
        <svg>
          <use xlink:href="#iconRefresh" />
        </svg>
      </span>
    </div>
    <div class="ml-4">
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
          :height="treeHeight"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, nextTick } from 'vue'
import TopicIcon from './components/TopicIcon/index.vue'
import ItemIcon from './components/ItemIcon/index.vue'
import { useData } from '@/hooks/useData'
import { useKIDock } from '@/components/KIDock/useKIDock'
import { debounce } from 'lodash-es'
const { refreshTreeData, treeData, refreshAllRiffCards } = useData()

// refresh()
const handleRefresh = async () => {
  await refreshAllRiffCards()
  refreshTreeData()
  // console.log(allRiffCards.value)
  // // console.log(notebooks.value)
  // treeData.value = genTree()
  // console.log(treeData.value)
}

const plugin = inject('plugin')

const handleSelect = (key: [], e) => {
  console.log(key)
  console.log(e)
  if (e?.node?.dataRef?.isBox) {
    // 首级标题不可点击
    return
  }
  window.openFileByURL(`siyuan://blocks/${key[0]}`)
}

let { selectedKeys, scrollTo, expandedKeys } = useKIDock()
const treeRef = ref(null)
const handleRightClick = (e) => {
  console.log('Rclick', e)
}

onMounted(() => {
  scrollTo = (key) => {
    treeRef.value.scrollTo({ key, align: 'top' })
  }
  refreshAllRiffCards().then(() => {
    refreshTreeData()
  })

  setTimeout(() => {
    nextTick(() => {
      const wrapper = document.querySelector('.sy__keep-incremental-learning-pluginKIDock')!
      // 防抖
      const debouncedCallback = debounce((entries) => {
        for (let entry of entries) {
          const cr = entry.contentRect
          treeHeight.value = cr.height - 42
          // console.log(treeHeight.value)
        }
      }, 500)
      observer = new ResizeObserver(debouncedCallback)
      observer.observe(wrapper)
    })
  }, 100)
})

// 动态设置树的高度
const treeHeight = ref(233)
let observer: ResizeObserver

onUnmounted(() => {
  observer.disconnect()
})
</script>
<style scoped></style>
