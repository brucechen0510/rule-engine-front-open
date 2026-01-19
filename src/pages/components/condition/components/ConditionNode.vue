<template>
  <div class="condition-node" :class="['node-level-' + level, 'node-type-' + node.nodeType]">

    <!-- 组合节点（条件组） -->
    <div v-if="node.nodeType === 'COMPOSITE'" class="composite-node">
      <a-card
        :bordered="true"
        :class="['composite-card', 'level-' + level]"
        size="small"
      >
        <template slot="title">
          <div class="node-header">
            <a-icon :type="level === 0 ? 'apartment' : 'folder'" />
            <span class="node-name">{{ node.groupName || '条件组' }}</span>

            <!-- 逻辑运算符切换器 -->
            <a-tag
              :color="node.logicalOperator === 'AND' ? 'blue' : 'green'"
              class="operator-tag"
              @click="toggleOperator"
            >
              {{ node.logicalOperator === 'AND' ? '且' : '或' }}
            </a-tag>
          </div>
        </template>

        <template slot="extra">
          <a-dropdown>
            <a class="action-link" @click="e => e.preventDefault()">
              <a-icon type="more" />
            </a>
            <template slot="overlay">
              <a-menu>
                <a-menu-item @click="addChildGroup">
                  <a-icon type="folder-add" />
                  添加条件组
                </a-menu-item>
                <a-menu-item @click="addChildCondition">
                  <a-icon type="plus" />
                  添加条件
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="editNode">
                  <a-icon type="edit" />
                  编辑
                </a-menu-item>
                <a-menu-item v-if="level > 0" @click="deleteNode" class="danger-item">
                  <a-icon type="delete" />
                  删除
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>

        <!-- 组合节点的子节点 -->
        <div class="children-container">
          <div v-if="!node.children || node.children.length === 0" class="empty-children">
            <a-empty :image="false" description="暂无子条件">
              <a-button-group>
                <a-button @click="addChildGroup" size="small">
                  <a-icon type="folder-add" />
                  添加条件组
                </a-button>
                <a-button @click="addChildCondition" size="small" type="primary">
                  <a-icon type="plus" />
                  添加条件
                </a-button>
              </a-button-group>
            </a-empty>
          </div>

          <div v-else class="children-list">
            <!-- 逻辑运算符连接线 -->
            <div
              v-for="(child, index) in node.children"
              :key="child.id || index"
              class="child-wrapper"
            >
              <!-- 运算符标识 -->
              <div v-if="index > 0" class="operator-connector">
                <a-tag
                  :color="node.logicalOperator === 'AND' ? 'blue' : 'green'"
                  size="small"
                >
                  {{ node.logicalOperator === 'AND' ? 'AND' : 'OR' }}
                </a-tag>
              </div>

              <!-- 递归渲染子节点 -->
              <condition-node
                :node="child"
                :level="level + 1"
                :parent="node"
                @add-child="$emit('add-child', $event, arguments[1])"
                @edit-node="$emit('edit-node', $event)"
                @delete-node="$emit('delete-node', $event, node)"
                @change-operator="$emit('change-operator', $event, arguments[1])"
              />
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 叶子节点（具体条件） -->
    <div v-else class="leaf-node">
      <a-alert
        :type="getConditionStatus()"
        :message="getConditionDisplay()"
        :description="node.conditionDescription"
        showIcon
        closable
        @close="deleteNode"
      >
        <template slot="action">
          <a-button @click="editNode" size="small" type="link">
            <a-icon type="edit" />
            编辑
          </a-button>
        </template>
      </a-alert>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConditionNode',
  props: {
    node: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    parent: {
      type: Object,
      default: null
    }
  },
  methods: {
    /**
     * 切换逻辑运算符
     */
    toggleOperator() {
      const newOperator = this.node.logicalOperator === 'AND' ? 'OR' : 'AND'
      this.$emit('change-operator', this.node, newOperator)
    },

    /**
     * 添加子条件组
     */
    addChildGroup() {
      this.$emit('add-child', this.node, 'COMPOSITE')
    },

    /**
     * 添加子条件
     */
    addChildCondition() {
      this.$emit('add-child', this.node, 'LEAF')
    },

    /**
     * 编辑节点
     */
    editNode() {
      this.$emit('edit-node', this.node)
    },

    /**
     * 删除节点
     */
    deleteNode() {
      this.$emit('delete-node', this.node, this.parent)
    },

    /**
     * 获取条件状态
     */
    getConditionStatus() {
      if (!this.node.config) return 'warning'

      const { leftValue, symbol, rightValue } = this.node.config
      if (!leftValue || !symbol || !rightValue) return 'warning'
      if (!leftValue.value || !rightValue.value) return 'warning'

      return 'info'
    },

    /**
     * 获取条件显示文本
     */
    getConditionDisplay() {
      if (!this.node.config) {
        return `${this.node.conditionName || '未命名条件'} (未配置)`
      }

      const { leftValue, symbol, rightValue } = this.node.config

      if (!leftValue || !symbol || !rightValue) {
        return `${this.node.conditionName || '未命名条件'} (配置不完整)`
      }

      const leftDisplay = this.getValueDisplay(leftValue)
      const rightDisplay = this.getValueDisplay(rightValue)
      const symbolDisplay = this.getSymbolDisplay(symbol)

      return `${this.node.conditionName || '未命名条件'}: ${leftDisplay} ${symbolDisplay} ${rightDisplay}`
    },

    /**
     * 获取值显示文本
     */
    getValueDisplay(valueConfig) {
      if (!valueConfig) return '?'

      if (valueConfig.valueName) {
        return valueConfig.valueName
      }

      if (valueConfig.value) {
        return valueConfig.value
      }

      return '未配置'
    },

    /**
     * 获取运算符显示文本
     */
    getSymbolDisplay(symbol) {
      const symbolMap = {
        'EQ': '等于',
        'NE': '不等于',
        'GT': '大于',
        'GE': '大于等于',
        'LT': '小于',
        'LE': '小于等于',
        'CONTAIN': '包含',
        'NOT_CONTAIN': '不包含'
      }
      return symbolMap[symbol] || symbol
    }
  }
}
</script>

<style scoped>
.condition-node {
  margin: 8px 0;
}

/* 不同层级的样式 */
.node-level-0 .composite-card {
  border: 2px solid #1890ff;
  background: #f0f7ff;
}

.node-level-1 .composite-card {
  border: 2px solid #52c41a;
  background: #f6ffed;
}

.node-level-2 .composite-card {
  border: 2px solid #fa8c16;
  background: #fff7e6;
}

.node-level-3 .composite-card {
  border: 2px solid #722ed1;
  background: #f9f0ff;
}

/* 节点头部 */
.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-name {
  font-weight: 600;
}

.operator-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.operator-tag:hover {
  transform: scale(1.1);
}

/* 操作链接 */
.action-link {
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.action-link:hover {
  background-color: #f0f0f0;
}

/* 子节点容器 */
.children-container {
  margin-top: 16px;
}

.empty-children {
  text-align: center;
  padding: 20px;
}

.children-list {
  position: relative;
}

.child-wrapper {
  margin-bottom: 12px;
}

.operator-connector {
  text-align: center;
  margin: 8px 0;
}

/* 叶子节点 */
.leaf-node {
  margin: 8px 0;
}

/* 危险操作样式 */
.danger-item {
  color: #ff4d4f !important;
}

.danger-item:hover {
  color: #ff4d4f !important;
  background-color: #fff2f0 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .children-container {
    margin-left: 0;
  }

  .node-header {
    flex-wrap: wrap;
  }
}
</style>