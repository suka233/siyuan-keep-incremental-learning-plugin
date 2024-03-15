import { ref } from 'vue'

const selectedKeys = ref<string[]>([])
const expandedKeys = ref<string[]>([])
const autoExpandParent = ref<boolean>(false)
const scrollTo: (key) => void = () => {}
export const useKIDock = () => {
  const setSelectedKeys = (paths: string[], selectKeys: string[]) => {
    console.log(paths)
    selectedKeys.value = selectKeys
    expandedKeys.value = paths
  }

  return {
    selectedKeys,
    setSelectedKeys,
    scrollTo,
    expandedKeys,
    autoExpandParent
  }
}
