<template>
  <a-modal
    title="条件测试"
    :visible="visible"
    :width="800"
    :confirm-loading="testing"
    @ok="handleTest"
    @cancel="handleCancel"
  >
    <a-form-model
      ref="form"
      :model="form"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-model-item label="测试参数">
        <div class="param-input-area">
          <a-textarea
            v-model="paramText"
            placeholder="请输入JSON格式的测试参数，例如：&#10;{&#10;  &quot;用户年龄&quot;: 25,&#10;  &quot;用户性别&quot;: &quot;男&quot;,&#10;  &quot;用户等级&quot;: &quot;VIP&quot;&#10;}"
            :rows="8"
          />
          <div class="param-help">
            <a-alert
              message="参数说明"
              description="请输入JSON格式的测试参数，参数名称应与条件中使用的参数名称一致。系统会使用这些参数值来执行条件判断。"
              type="info"
              show-icon
            />
          </div>
        </div>
      </a-form-model-item>
    </a-form-model>

    <!-- 测试结果显示 -->
    <div v-if="testResult" class="test-result">
      <a-divider>测试结果</a-divider>

      <!-- 总体结果 -->
      <a-alert
        :type="testResult.result ? 'success' : 'error'"
        :message="`测试结果: ${testResult.result ? '通过' : '不通过'}`"
        :description="`执行时间: ${testResult.executionTime}ms`"
        show-icon
        style="margin-bottom: 16px;"
      />

      <!-- 错误信息 -->
      <a-alert
        v-if="testResult.errorMessage"
        type="error"
        :message="testResult.errorMessage"
        style="margin-bottom: 16px;"
      />

      <!-- 执行日志 -->
      <div v-if="testResult.logs && testResult.logs.length > 0">
        <h4>执行日志</h4>
        <a-timeline>
          <a-timeline-item
            v-for="(log, index) in testResult.logs"
            :key="index"
            :color="getLogColor(log)"
          >
            <div class="log-item">
              <div class="log-header">
                <a-tag :color="log.nodeType === 'LEAF' ? 'blue' : 'green'">
                  {{ log.nodeType === 'LEAF' ? '条件' : '条件组' }}
                </a-tag>
                <span class="log-name">{{ log.nodeName }}</span>
                <a-tag :color="log.result ? 'success' : 'error'">
                  {{ log.result ? '通过' : '不通过' }}
                </a-tag>
                <span class="log-time">{{ log.executionTime }}ms</span>
              </div>
              <div v-if="log.detail" class="log-detail">
                {{ log.detail }}
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { testCondition } from '@/services/conditionNode'

export default {
  name: 'ConditionTestModal',
  props: {
    ruleId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      visible: false,
      testing: false,
      paramText: '',
      form: {},
      testResult: null
    }
  },
  methods: {
    /**
     * 显示模态框
     */
    show() {
      this.visible = true
      this.testResult = null
      this.paramText = this.getDefaultParams()
    },

    /**
     * 获取默认参数示例
     */
    getDefaultParams() {
      return JSON.stringify({
        "用户年龄": 25,
        "用户性别": "男",
        "用户等级": "VIP",
        "订单金额": 1000,
        "是否新用户": true
      }, null, 2)
    },

    /**
     * 执行测试
     */
    async handleTest() {
      // 解析参数
      let params = {}
      if (this.paramText.trim()) {
        try {
          params = JSON.parse(this.paramText)
        } catch (error) {
          this.$message.error('参数格式错误，请输入有效的JSON格式')
          return
        }
      }

      this.testing = true
      try {
        const response = await testCondition({
          ruleId: this.ruleId,
          params: params
        })

        this.testResult = response.data
        this.$message.success('测试完成')
      } catch (error) {
        this.$message.error('测试失败: ' + error.message)
      } finally {
        this.testing = false
      }
    },

    /**
     * 取消
     */
    handleCancel() {
      this.visible = false
      this.testResult = null
      this.paramText = ''
    },

    /**
     * 获取日志颜色
     */
    getLogColor(log) {
      if (log.result) {
        return 'green'
      } else {
        return 'red'
      }
    }
  }
}
</script>

<style scoped>
.param-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-help {
  font-size: 12px;
}

.test-result {
  margin-top: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.log-item {
  padding: 8px 0;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.log-name {
  flex: 1;
  font-weight: 600;
}

.log-time {
  color: #666;
  font-size: 12px;
}

.log-detail {
  margin-top: 4px;
  color: #666;
  font-size: 12px;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #d9d9d9;
}

:deep(.ant-timeline-item-content) {
  margin-left: 20px;
}
</style>