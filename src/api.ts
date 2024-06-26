/**
 * Copyright (c) 2023 frostime. All rights reserved.
 * https://github.com/frostime/sy-plugin-template-vite
 *
 * See API Document in [API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
 * API 文档见 [API_zh_CN.md](https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md)
 */

import { fetchSyncPost, IWebSocketData } from 'siyuan'

async function request(url: string, data: any) {
  const response: IWebSocketData = await fetchSyncPost(url, data)
  const res = response.code === 0 ? response.data : null
  return res
}

// **************************************** Noteboook ****************************************

export type ReslsNotebooks = {
  notebooks: Notebook[]
}

export async function lsNotebooks(): Promise<ReslsNotebooks> {
  const url = '/api/notebook/lsNotebooks'
  return request(url, '')
}

export async function openNotebook(notebook: NotebookId) {
  const url = '/api/notebook/openNotebook'
  return request(url, { notebook: notebook })
}

export async function closeNotebook(notebook: NotebookId) {
  const url = '/api/notebook/closeNotebook'
  return request(url, { notebook: notebook })
}

export async function renameNotebook(notebook: NotebookId, name: string) {
  const url = '/api/notebook/renameNotebook'
  return request(url, { notebook: notebook, name: name })
}

export async function createNotebook(name: string): Promise<Notebook> {
  const url = '/api/notebook/createNotebook'
  return request(url, { name: name })
}

export async function removeNotebook(notebook: NotebookId) {
  const url = '/api/notebook/removeNotebook'
  return request(url, { notebook: notebook })
}

export type ResGetNotebookConf = {
  box: string
  conf: NotebookConf
  name: string
}

export async function getNotebookConf(notebook: NotebookId): Promise<ResGetNotebookConf> {
  const data = { notebook: notebook }
  const url = '/api/notebook/getNotebookConf'
  return request(url, data)
}

export async function setNotebookConf(notebook: NotebookId, conf: NotebookConf): Promise<NotebookConf> {
  const data = { notebook: notebook, conf: conf }
  const url = '/api/notebook/setNotebookConf'
  return request(url, data)
}

// **************************************** Document ****************************************
export async function createDocWithMd(notebook: NotebookId, path: string, markdown: string): Promise<DocumentId> {
  const data = {
    notebook: notebook,
    path: path,
    markdown: markdown
  }
  const url = '/api/filetree/createDocWithMd'
  return request(url, data)
}

export async function renameDoc(notebook: NotebookId, path: string, title: string): Promise<DocumentId> {
  const data = {
    doc: notebook,
    path: path,
    title: title
  }
  const url = '/api/filetree/renameDoc'
  return request(url, data)
}

export async function removeDoc(notebook: NotebookId, path: string) {
  const data = {
    notebook: notebook,
    path: path
  }
  const url = '/api/filetree/removeDoc'
  return request(url, data)
}

export async function moveDocs(fromPaths: string[], toNotebook: NotebookId, toPath: string) {
  const data = {
    fromPaths: fromPaths,
    toNotebook: toNotebook,
    toPath: toPath
  }
  const url = '/api/filetree/moveDocs'
  return request(url, data)
}

export async function getHPathByPath(notebook: NotebookId, path: string): Promise<string> {
  const data = {
    notebook: notebook,
    path: path
  }
  const url = '/api/filetree/getHPathByPath'
  return request(url, data)
}

export async function getHPathByID(id: BlockId): Promise<string> {
  const data = {
    id: id
  }
  const url = '/api/filetree/getHPathByID'
  return request(url, data)
}

// **************************************** Asset Files ****************************************
export type ResUpload = {
  errFiles: string[]
  succMap: { [key: string]: string }
}

export async function upload(assetsDirPath: string, files: any[]): Promise<ResUpload> {
  const form = new FormData()
  form.append('assetsDirPath', assetsDirPath)
  for (const file of files) {
    form.append('file[]', file)
  }
  const url = '/api/asset/upload'
  return request(url, form)
}

// **************************************** Block ****************************************
export type ResdoOperations = {
  doOperations: doOperation[]
  undoOperations: doOperation[] | null
}
type DataType = 'markdown' | 'dom'
export async function insertBlock(dataType: DataType, data: string, previousID: BlockId): Promise<ResdoOperations> {
  const data1 = {
    dataType: dataType,
    data: data,
    previousID: previousID
  }
  const url = '/api/block/insertBlock'
  return request(url, data1)
}

export async function appendBlock(
  dataType: DataType,
  data: string,
  parentID: BlockId | DocumentId
): Promise<ResdoOperations> {
  const data1 = {
    dataType: dataType,
    data: data,
    parentID: parentID
  }
  const url = '/api/block/appendBlock'
  return request(url, data1)
}

export async function updateBlock(dataType: DataType, data: string, id: BlockId): Promise<ResdoOperations> {
  const data1 = {
    dataType: dataType,
    data: data,
    id: id
  }
  const url = '/api/block/updateBlock'
  return request(url, data1)
}

export async function deleteBlock(id: BlockId): Promise<ResdoOperations> {
  const data = {
    id: id
  }
  const url = '/api/block/deleteBlock'
  return request(url, data)
}

export async function moveBlock(
  id: BlockId,
  previousID: PreviousID | null = null,
  parentID: ParentID | null = null
): Promise<ResdoOperations> {
  const data = {
    id: id,
    previousID: previousID,
    parentID: parentID
  }
  const url = '/api/block/moveBlock'
  return request(url, data)
}

export type ResGetBlockKramdown = {
  id: BlockId
  kramdown: string
}

export async function getBlockKramdown(id: BlockId): Promise<ResGetBlockKramdown> {
  const data = {
    id: id
  }
  const url = '/api/block/getBlockKramdown'
  return request(url, data)
}

export type ChildBlock = {
  id: BlockId
  type: BlockType
  subtype?: BlockSubType
}
export async function getChildBlocks(id: BlockId): Promise<ChildBlock[]> {
  const data = {
    id: id
  }
  const url = '/api/block/getChildBlocks'
  return request(url, data)
}

// **************************************** Attributes ****************************************
export async function setBlockAttrs(id: BlockId, attrs: { [key: string]: string }) {
  const data = {
    id: id,
    attrs: attrs
  }
  const url = '/api/attr/setBlockAttrs'
  return request(url, data)
}

export async function getBlockAttrs(id: BlockId): Promise<{ [key: string]: string }> {
  const data = {
    id: id
  }
  const url = '/api/attr/getBlockAttrs'
  return request(url, data)
}

// **************************************** SQL ****************************************

export async function sql(sql: string): Promise<any[]> {
  const sqldata = {
    stmt: sql
  }
  const url = '/api/query/sql'
  return request(url, sqldata)
}

export async function getBlockByID(blockId: string): Promise<Block> {
  const sqlScript = `select * from blocks where id ='${blockId}'`
  const data = await sql(sqlScript)
  return data[0]
}

// **************************************** Template ****************************************

export type ResGetTemplates = {
  content: string
  path: string
}
export async function render(id: DocumentId, path: string): Promise<ResGetTemplates> {
  const data = {
    id: id,
    path: path
  }
  const url = '/api/template/render'
  return request(url, data)
}

export async function renderSprig(template: string): Promise<string> {
  const url = '/api/template/renderSprig'
  return request(url, { template: template })
}

// **************************************** File ****************************************

export async function getFile(path: string): Promise<any> {
  const data = {
    path: path
  }
  const url = '/api/file/getFile'
  try {
    const file = await fetchSyncPost(url, data)
    return file
  } catch (error_msg) {
    return null
  }
}

export async function putFile(path: string, isDir: boolean, file: any) {
  const form = new FormData()
  form.append('path', path)
  form.append('isDir', isDir.toString())
  // Copyright (c) 2023, terwer.
  // https://github.com/terwer/siyuan-plugin-importer/blob/v1.4.1/src/api/kernel-api.ts
  form.append('modTime', Math.floor(Date.now() / 1000).toString())
  form.append('file', file)
  const url = '/api/file/putFile'
  return request(url, form)
}

export async function removeFile(path: string) {
  const data = {
    path: path
  }
  const url = '/api/file/removeFile'
  return request(url, data)
}

export type ResReadDir = {
  isDir: boolean
  name: string
}
export async function readDir(path: string): Promise<ResReadDir> {
  const data = {
    path: path
  }
  const url = '/api/file/readDir'
  return request(url, data)
}

export type ResExportMdContent = {
  hPath: string
  content: string
}
export async function exportMdContent(id: DocumentId): Promise<ResExportMdContent> {
  const data = {
    id: id
  }
  const url = '/api/export/exportMdContent'
  return request(url, data)
}

export type PandocArgs = string
export async function pandoc(args: PandocArgs[]) {
  const data = {
    args: args
  }
  const url = '/api/convert/pandoc'
  return request(url, data)
}

// **************************************** System ****************************************
export type ResBootProgress = {
  progress: number
  details: string
}
export async function bootProgress(): Promise<ResBootProgress> {
  return request('/api/system/bootProgress', {})
}

export async function version(): Promise<string> {
  return request('/api/system/version', {})
}

export async function currentTime(): Promise<number> {
  return request('/api/system/currentTime', {})
}
