/**
 * simple-mind-map的一些类型
 */

/**
 * 节点数据类型
 */
declare type NodeTreeType = {
  title?: string
  key?: string
  _node?: any
  children?: NodeTreeType[]
}

/**
 * getData(true) 返回的数据类型
 */
declare type MapFullDataType = {
  /**
   * 布局名称
   */
  layout?: string
  /**
   * 节点数据
   */
  root?: NodeTreeType
  /**
   * 主题
   */
  theme?: {
    template: string
    config: object
  }
  /**
   * 视图信息
   */
  view?: {
    transform: object
    state: object
  }
}

/**
 * kmind专用数据格式
 */
declare interface KmindFullDataType extends MapFullDataType {
  /**
   * 节点数据
   */
  kmind?: KmindConfigType
}

/**
 * kmind配置数据类型
 */
declare interface KmindConfigType {
  /**
   * 数据存储形式
   */
  saveType?: 'file' | 'block'
  /**
   * 文件路径
   */
  filePath?: string
  /**
   * 导图模式
   */
  localeConfig?: KmindLocaleConfigType
}

declare interface KmindLocaleConfigType {
  /**
   * 是否是禅模式
   */
  isZenMode?: boolean
  /**
   * 是否是全屏
   */
  isFullScreen?: boolean
}

// 缓存文件的结构
declare interface KmindTempConfigType {
  /**
   * 新功能通知标识
   */
  newFeatNotify: Record<string, string | boolean>
}

declare interface KnoteTempConfigType {
  /**
   * 选择的笔记本
   */
  dailyNotebookId: string
}
