// 此插件的自定义属性enum
export enum KIAttr {
  // 存储的数据格式为 dismiss的时间 | 该卡原本的到期日
  dismiss = 'custom-ki-dismiss',
  /**
   * 渐进式阅读文档标记，
   * 有此标记的卡片，在子文档被dismiss的时候，会自动遍历子文档的兄弟文档，
   * 并将兄弟设为闪卡，自动评分3分并自动推迟2天
   */
  incremental = 'custom-ki-incremental',
  /**
   * 首次摘录标记
   * custom-ki-first-extract : dayjs().format('YYYYMMDDHHmmss')
   * 会在特定的时机推迟所有带有custom-ki-first-extract: xxx 属性的卡，并删除这个属性。
   * 暂定的时机为updateCards方法被调用的时候
   */
  'first-extract' = 'custom-ki-first-extract',
  /**
   * topic的书签
   */
  bookmark = 'custom-ki-bookmark'
}

/**
 * 其它插件的自定义属性
 */
export enum OuterAttr {
  /**
   * 闪卡的优先级
   */
  priority = 'custom-card-priority'
}

// 配色方案
export enum KIColorScheme {
  // 默认
  default = 'default',
  // 黑色
  dark = 'dark',
  // 白色
  light = 'light'
}
