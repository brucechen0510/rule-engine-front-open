<template>
  <a-modal
    :title="modalTitle"
    :visible="visible"
    :width="700"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form-model
      ref="form"
      :model="form"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
    >
      <!-- 节点类型选择 -->
      <a-form-model-item
        v-if="mode === 'create'"
        label="节点类型"
        prop="nodeType"
        :rules="[{ required: true, message: '请选择节点类型' }]"
      >
        <a-radio-group v-model="form.nodeType" @change="handleNodeTypeChange">
          <a-radio-button value="COMPOSITE">条件组</a-radio-button>
          <a-radio-button value="LEAF">条件</a-radio-button>
        </a-radio-group>
        <div class="help-text">
          <div v-if="form.nodeType === 'COMPOSITE'">
            条件组：可包含多个子条件或子条件组，支持AND/OR逻辑运算
          </div>
          <div v-else-if="form.nodeType === 'LEAF'">
            条件：具体的比较条件，包含左值、运算符、右值
          </div>
        </div>
      </a-form-model-item>

      <!-- 组合节点配置 -->
      <template v-if="form.nodeType === 'COMPOSITE'">
        <a-form-model-item
          label="组名称"
          prop="groupName"
          :rules="[{ required: true, message: '请输入条件组名称' }]"
        >
          <a-input v-model="form.groupName" placeholder="请输入条件组名称" />
        </a-form-model-item>

        <a-form-model-item label="描述" prop="groupDescription">
          <a-textarea
            v-model="form.groupDescription"
            placeholder="请输入条件组描述"
            :rows="2"
          />
        </a-form-model-item>

        <a-form-model-item
          label="逻辑关系"
          prop="logicalOperator"
          :rules="[{ required: true, message: '请选择逻辑关系' }]"
        >
          <a-radio-group v-model="form.logicalOperator">
            <a-radio value="AND">
              <a-tag color="blue">AND (且)</a-tag>
              所有子条件都成立时，该组才成立
            </a-radio>
            <a-radio value="OR">
              <a-tag color="green">OR (或)</a-tag>
              任一子条件成立时，该组就成立
            </a-radio>
          </a-radio-group>
        </a-form-model-item>
      </template>

      <!-- 叶子节点配置 -->
      <template v-if="form.nodeType === 'LEAF'">
        <a-form-model-item
          label="条件名称"
          prop="conditionName"
          :rules="[{ required: true, message: '请输入条件名称' }]"
        >
          <a-input v-model="form.conditionName" placeholder="请输入条件名称" />
        </a-form-model-item>

        <a-form-model-item label="描述" prop="conditionDescription">
          <a-textarea
            v-model="form.conditionDescription"
            placeholder="请输入条件描述"
            :rows="2"
          />
        </a-form-model-item>

        <!-- 条件配置 -->
        <a-form-model-item label="条件配置" required>
          <condition-config-form
            ref="conditionConfig"
            v-model="form.config"
            :view-select-gr="false"
          />
        </a-form-model-item>
      </template>
    </a-form-model>
  </a-modal>
</template>

<script>
import ConditionConfigForm from './ConditionConfigForm.vue'

export default {
  name: 'ConditionNodeModal',
  components: {
    ConditionConfigForm
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      mode: 'create', // create | edit
      originalNode: null,
      parent: null,
      form: {
        nodeType: 'COMPOSITE',
        // 组合节点字段
        groupName: '',
        groupDescription: '',
        logicalOperator: 'AND',
        // 叶子节点字段
        conditionName: '',
        conditionDescription: '',
        config: {
          leftValue: {
            type: null,
            valueType: null,
            value: null,
            valueName: null,
            variableValue: null,
          },
          symbol: null,
          rightValue: {
            type: null,
            valueType: null,
            value: null,
            valueName: null,
            variableValue: null,
          }
        }
      }
    }
  },
  computed: {
    modalTitle() {
      if (this.mode === 'create') {
        return this.form.nodeType === 'COMPOSITE' ? '创建条件组' : '创建条件'
      } else {
        return this.form.nodeType === 'COMPOSITE' ? '编辑条件组' : '编辑条件'
      }
    }
  },
  methods: {
    /**
     * 显示模态框
     */
    show(options) {
      this.visible = true
      this.mode = options.mode || 'create'
      this.parent = options.parent || null
      this.originalNode = options.node || null

      if (this.mode === 'create') {
        // 创建模式
        this.resetForm()
        this.form.nodeType = options.nodeType || 'COMPOSITE'
        this.form.orderNo = options.orderNo || 0

        if (this.form.nodeType === 'COMPOSITE') {
          this.form.logicalOperator = 'AND'
        }
      } else {
        // 编辑模式
        this.loadNodeData(options.node)
      }
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.form = {
        nodeType: 'COMPOSITE',
        groupName: '',
        groupDescription: '',
        logicalOperator: 'AND',
        conditionName: '',
        conditionDescription: '',
        config: {
          leftValue: {
            type: null,
            valueType: null,
            value: null,
            valueName: null,
            variableValue: null,
          },
          symbol: null,
          rightValue: {
            type: null,
            valueType: null,
            value: null,
            valueName: null,
            variableValue: null,
          }
        }
      }
    },

    /**
     * 加载节点数据
     */
    loadNodeData(node) {
      this.form.nodeType = node.nodeType

      if (node.nodeType === 'COMPOSITE') {
        this.form.groupName = node.groupName || ''
        this.form.groupDescription = node.groupDescription || ''
        this.form.logicalOperator = node.logicalOperator || 'AND'
      } else {
        this.form.conditionName = node.conditionName || ''
        this.form.conditionDescription = node.conditionDescription || ''
        this.form.config = { ...node.config } || {}
      }
    },

    /**
     * 节点类型改变
     */
    handleNodeTypeChange() {
      if (this.form.nodeType === 'COMPOSITE') {
        this.form.logicalOperator = 'AND'
      }
    },

    /**
     * 确认
     */
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 如果是叶子节点，还需要验证条件配置
          if (this.form.nodeType === 'LEAF') {
            if (this.$refs.conditionConfig && !this.$refs.conditionConfig.validate()) {
              return
            }
          }

          this.confirmLoading = true

          // 准备保存的数据
          const saveData = {
            mode: this.mode,
            nodeType: this.form.nodeType,
            parent: this.parent,
            originalNode: this.originalNode,
            orderNo: this.form.orderNo,
            data: { ...this.form }
          }

          // 延迟执行以模拟API调用
          setTimeout(() => {
            this.$emit('save', saveData)
            this.confirmLoading = false
            this.visible = false
          }, 500)
        }
      })
    },

    /**
     * 取消
     */
    handleCancel() {
      this.visible = false
      this.resetForm()
    }
  }
}
</script>

<style scoped>
.help-text {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.help-text div {
  padding: 2px 0;
}

:deep(.ant-radio) {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

:deep(.ant-radio-wrapper) {
  display: flex;
  align-items: flex-start;
}
</style>