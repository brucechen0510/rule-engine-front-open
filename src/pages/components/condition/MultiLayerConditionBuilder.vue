<template>
  <div class="multi-layer-condition-builder">
    <a-card title="条件构建器" :bordered="false">
      <template slot="extra">
        <a-space>
          <a-button @click="testCondition" type="primary" ghost>
            <a-icon type="play-circle" />
            测试条件
          </a-button>
          <a-button @click="saveCondition" type="primary">
            <a-icon type="save" />
            保存条件
          </a-button>
        </a-space>
      </template>

      <!-- 条件树显示区域 -->
      <div class="condition-tree" v-if="conditionTree">
        <condition-node
          :node="conditionTree"
          :level="0"
          @add-child="handleAddChild"
          @edit-node="handleEditNode"
          @delete-node="handleDeleteNode"
          @change-operator="handleChangeOperator"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <a-empty description="暂无条件">
          <a-button type="primary" @click="createRootNode">创建根条件组</a-button>
        </a-empty>
      </div>
    </a-card>

    <!-- 条件节点编辑模态框 -->
    <condition-node-modal
      ref="nodeModal"
      @save="handleSaveNode"
    />

    <!-- 测试条件模态框 -->
    <condition-test-modal
      ref="testModal"
      :rule-id="ruleId"
    />
  </div>
</template>

<script>
import ConditionNode from './components/ConditionNode.vue'
import ConditionNodeModal from './components/ConditionNodeModal.vue'
import ConditionTestModal from './components/ConditionTestModal.vue'
import { getConditionTree, saveConditionTree } from '@/services/conditionNode'

export default {
  name: 'MultiLayerConditionBuilder',
  components: {
    ConditionNode,
    ConditionNodeModal,
    ConditionTestModal
  },
  props: {
    ruleId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      conditionTree: null,
      loading: false
    }
  },
  mounted() {
    this.loadConditionTree()
  },
  methods: {
    /**
     * 加载条件树
     */
    async loadConditionTree() {
      if (!this.ruleId) return

      this.loading = true
      try {
        const response = await getConditionTree(this.ruleId)
        if (response.data && response.data.rootNode) {
          this.conditionTree = response.data.rootNode
        }
      } catch (error) {
        this.$message.error('加载条件树失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建根节点
     */
    createRootNode() {
      const rootNode = {
        id: null,
        nodeType: 'COMPOSITE',
        logicalOperator: 'OR',
        groupName: '条件集',
        groupDescription: '根条件组，支持OR逻辑',
        children: [],
        orderNo: 0
      }
      this.conditionTree = rootNode
    },

    /**
     * 添加子节点
     */
    handleAddChild(parentNode, nodeType = 'COMPOSITE') {
      this.$refs.nodeModal.show({
        mode: 'create',
        nodeType: nodeType,
        parent: parentNode,
        orderNo: (parentNode.children || []).length
      })
    },

    /**
     * 编辑节点
     */
    handleEditNode(node) {
      this.$refs.nodeModal.show({
        mode: 'edit',
        node: { ...node }
      })
    },

    /**
     * 删除节点
     */
    handleDeleteNode(node, parent) {
      this.$confirm({
        title: '确认删除',
        content: `确定要删除"${node.conditionName || node.groupName}"吗？删除后将无法恢复。`,
        onOk: () => {
          if (parent && parent.children) {
            const index = parent.children.findIndex(child => child === node)
            if (index > -1) {
              parent.children.splice(index, 1)
              // 重新排序
              parent.children.forEach((child, idx) => {
                child.orderNo = idx
              })
            }
          } else {
            // 删除根节点
            this.conditionTree = null
          }
          this.$message.success('删除成功')
        }
      })
    },

    /**
     * 改变逻辑运算符
     */
    handleChangeOperator(node, operator) {
      node.logicalOperator = operator
    },

    /**
     * 保存节点
     */
    handleSaveNode(nodeData) {
      if (nodeData.mode === 'create') {
        // 创建新节点
        const newNode = {
          id: null,
          nodeType: nodeData.nodeType,
          orderNo: nodeData.orderNo,
          ...nodeData.data
        }

        if (!nodeData.parent.children) {
          nodeData.parent.children = []
        }
        nodeData.parent.children.push(newNode)
      } else if (nodeData.mode === 'edit') {
        // 编辑现有节点
        Object.assign(nodeData.originalNode, nodeData.data)
      }

      this.$message.success(nodeData.mode === 'create' ? '创建成功' : '更新成功')
    },

    /**
     * 保存条件
     */
    async saveCondition() {
      if (!this.conditionTree) {
        this.$message.warning('请先创建条件')
        return
      }

      this.loading = true
      try {
        const request = {
          ruleId: this.ruleId,
          rootNode: this.conditionTree
        }

        await saveConditionTree(request)
        this.$message.success('保存成功')

        // 重新加载条件树以获取ID等信息
        await this.loadConditionTree()
      } catch (error) {
        this.$message.error('保存失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * 测试条件
     */
    testCondition() {
      if (!this.conditionTree) {
        this.$message.warning('请先创建条件')
        return
      }

      this.$refs.testModal.show()
    }
  }
}
</script>

<style scoped>
.multi-layer-condition-builder {
  padding: 16px;
}

.condition-tree {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}
</style>