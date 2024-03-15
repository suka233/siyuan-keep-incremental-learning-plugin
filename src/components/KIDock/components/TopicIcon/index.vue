<template>
  <span :class="isDismiss ? 'ki-topic-dismiss-icon' : 'ki-topic-icon'">T</span>
</template>

<script lang="ts" setup>
defineProps<{
  isDismiss: boolean
}>()
</script>

<style scoped lang="less">
.ki-topic-icon {
  color: white;
  background-color: #00ff0099;
  //text-shadow: -2px 0 0 #000, 2px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000;
  -webkit-text-stroke: 1px black;
  width: 1.2rem;
  display: inline-block;
  text-align: center;
  font-weight: bolder;
}

.ki-topic-dismiss-icon {
  color: white;
  background-color: #ffff0099;
  //text-shadow: -2px 0 0 #000, 2px 0 0 #000, 0 1px 0 #000, 0 -1px 0 #000;
  -webkit-text-stroke: 1px black;
  width: 1.2rem;
  display: inline-block;
  text-align: center;
  font-weight: bolder;
}
</style>
