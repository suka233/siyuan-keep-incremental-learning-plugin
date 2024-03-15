<template>
  <div class="flex justify-between h-42px">
    <button class="b3-button b3-button--warning" aria-label="会自动将相邻的兄弟文档加入为摘录卡" @click="handleDismiss">
      Dismiss
    </button>
    <a-popover
      overlayClassName="w-20rem"
      title="请输入需要推迟的天数并点击确定"
      trigger="click"
      v-model:open="delayOpen"
      placement="bottom"
    >
      <button class="b3-button b3-button--info">推迟该卡</button>
      <template #content>
        <a-row class="p-2">
          <a-col :span="18"><a-input-number v-model:value="delayDate" /></a-col>
          <a-col :span="4"><a-button @click="handleDelay">确认</a-button></a-col>
        </a-row>
        <!--        <a-calendar v-model:value="delayDate" :fullscreen="false" @panelChange="onPanelChange" />-->
      </template>
    </a-popover>

    <button class="b3-button b3-button--success" @click="positionToTree">定位</button>
    <!--    <a-date-picker v-model:value="pauseDate" :bordered="false" placeholder="推迟该卡至" />-->

    <!--    <a-progress-->
    <!--      :percent="prsiority"-->
    <!--      :stroke-color="['#7f8381', '#658173', '#508168', '#357c58', '#7c3535', '#ad2d2d', '#d11b1b', '#ff0000']"-->
    <!--      :steps="8"-->
    <!--      :format="(percent) => `优先级${percent}`"-->
    <!--    />-->
    <!--    <div class="cursor-pointer inline-block">Dismiss</div>-->
    <!--    <a-button type="text" class="inline-block">推迟</a-button>-->
    <!--    <div class="inline-block">闪卡树</div>-->
    <a-slider
      class="inline-block w-50%"
      v-model:value="priority"
      :marks="marks"
      :included="false"
      @after-change="handleChangePriority"
    />
    <span class="vertical-mid line-height-42px">{{ priority }}</span>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { useData } from '@/hooks/useData'
import dayjs, { type Dayjs } from 'dayjs'
import { confirm } from 'siyuan'
import { batchSetRiffCardsDueTime, setBlockAttrs } from '@/api/public'
import { KIAttr } from '@/enum'
import { useCardControlApp } from '@/hooks/useCardControlApp'
import { useKIDock } from '@/components/KIDock/useKIDock'
import { debounce } from 'lodash-es'
const { jumpAction, blockId } = inject('params') as any
const { allRiffCards } = useData()
const cardInfo = allRiffCards.value!.find((item) => item.id === blockId)!
const priority = ref(cardInfo?.ial?.['custom-card-priority'] ?? 50)
console.log(cardInfo)
const decline = () => {
  priority.value = Math.max(priority.value - 1, 1)
}
const increase = () => {
  priority.value = Math.min(priority.value + 1, 100)
}
const marks = ref({
  0: '最低',
  10: '低',
  30: '中低',
  50: '中',
  70: '较高',
  90: '高',
  100: '紧急'
})

const delayOpen = ref(false)
const { dismiss, goIncremental } = useCardControlApp()
const handleDismiss = () => {
  dismiss([cardInfo], jumpAction).then(() => {
    goIncremental(cardInfo.id)
  })
}

// 推迟日期
const delayDate = ref<number>(2)
// const onPanelChange = (date: Dayjs) => {
//   delayDate.value = date
// }
const handleDelay = async () => {
  await batchSetRiffCardsDueTime([
    {
      id: cardInfo.riffCardID,
      due: dayjs().add(delayDate.value, 'day').format('YYYYMMDDHHmmss')
    }
  ])
  delayOpen.value = false
  jumpAction()
}

const { setSelectedKeys } = useKIDock()

const positionToTree = () => {
  // 构造一下paths
  let paths = `${cardInfo.box}${cardInfo.path}`.split('.')[0]
  if (cardInfo.type === 'NodeDocument') {
    paths = `${paths}/${cardInfo.id}`
  }
  setSelectedKeys(paths.split('/'), [cardInfo.id])
  // scrollTo(cardInfo.id)
}
positionToTree()
const { refreshAllRiffCards, refreshTreeData } = useData()

const handleChangePriority = async (value: number) => {
  await setBlockAttrs({
    id: cardInfo.id,
    attrs: {
      'custom-card-priority': value.toString()
    }
  })

  // TODO 刷新树,这里直接调用会不生效，因为上述更改还未索引，所以需要等待一会儿，准备用后台任务来搞一下
  setTimeout(async () => {
    await refreshAllRiffCards()
    refreshTreeData()
  }, 3000)
}
</script>

<style scoped lang="less"></style>
