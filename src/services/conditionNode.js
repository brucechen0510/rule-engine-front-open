import request from '@/utils/request'

const api = {
  conditionTree: '/api/condition/node/tree',
  create: '/api/condition/node/create',
  update: '/api/condition/node/update',
  delete: '/api/condition/node/delete',
  move: '/api/condition/node/move',
  test: '/api/condition/node/test'
}

/**
 * 获取条件树
 * @param {number} ruleId 规则ID
 * @returns {Promise}
 */
export function getConditionTree(ruleId) {
  return request({
    url: `${api.conditionTree}/${ruleId}`,
    method: 'GET'
  })
}

/**
 * 保存条件树
 * @param {Object} data 条件树数据
 * @returns {Promise}
 */
export function saveConditionTree(data) {
  return request({
    url: `${api.conditionTree}/save`,
    method: 'POST',
    data
  })
}

/**
 * 创建条件节点
 * @param {Object} data 节点数据
 * @returns {Promise}
 */
export function createConditionNode(data) {
  return request({
    url: api.create,
    method: 'POST',
    data
  })
}

/**
 * 更新条件节点
 * @param {Object} data 节点数据
 * @returns {Promise}
 */
export function updateConditionNode(data) {
  return request({
    url: api.update,
    method: 'POST',
    data
  })
}

/**
 * 删除条件节点
 * @param {number} id 节点ID
 * @returns {Promise}
 */
export function deleteConditionNode(id) {
  return request({
    url: api.delete,
    method: 'POST',
    data: { id }
  })
}

/**
 * 移动条件节点
 * @param {Object} data 移动数据
 * @returns {Promise}
 */
export function moveConditionNode(data) {
  return request({
    url: api.move,
    method: 'POST',
    data
  })
}

/**
 * 测试条件
 * @param {Object} data 测试数据
 * @returns {Promise}
 */
export function testCondition(data) {
  return request({
    url: api.test,
    method: 'POST',
    data
  })
}