<template>
  <div>
    <page-layout>
      <a-card title="规则配置 (多层条件版)" :bordered="false">
        <template slot="extra">
          <a-space>
            <!-- 版本切换 -->
            <a-tooltip title="切换到传统版本">
              <a-button @click="switchToLegacyVersion" ghost>
                <a-icon type="rollback" />
                传统版本
              </a-button>
            </a-tooltip>

            <!-- 编辑人员信息 -->
            <a-popover title="当前编辑人员" trigger="click" arrow-point-at-center>
              <template slot="content">
                <a-list item-layout="horizontal" :data-source="editUsers">
                  <a-list-item slot="renderItem" slot-scope="item">
                    <a-list-item-meta
                      :description="item.lastOperation"
                    >
                      <a slot="title">{{ item.title }}</a>
                      <a-avatar
                        slot="avatar"
                        :src="item.avatar"
                      />
                    </a-list-item-meta>
                  </a-list-item>
                </a-list>
              </template>
              <a-icon type="usergroup-add" style="font-size: 18px"/>
            </a-popover>
          </a-space>
        </template>

        <vue-scroll :ops="ops" style="width:100%;height:100%">
          <a-row :style="isMobile ? 'width:1000px;margin: 0 auto' : ''">
            <a-col :span="1"/>
            <a-col :span="22">

              <!-- 多层条件构建器 -->
              <div class="condition-builder-section">
                <multi-layer-condition-builder
                  :rule-id="generalRule.ruleId"
                  ref="conditionBuilder"
                />
              </div>

              <br><br>

              <!-- 结果配置 -->
              <a-form-model ref="generalRuleForm" :model="generalRule">
                <a-card title="结果" size="small">
                  <span slot="extra">
                    <a-popover title="温馨提示">
                      <template slot="content">
                        <p>普通规则结果类型确认后，及规则发布后，则不支持修改！</p>
                        <p>（具体原因可参考链接：T320523）</p>
                      </template>
                      <a-icon type="info-circle" class="dynamic-delete-button" style="font-size: 18px"/>
                    </a-popover>
                  </span>

                  <!-- 结果配置内容保持不变 -->
                  <a-row>
                    <a-col :span="5">
                      <a-form-model-item
                        prop="action.type"
                        style="margin-bottom: 0;"
                        :rules="{
                          required: true,
                          message: '请选择结果类型',
                          trigger: ['change', 'blur'],
                        }"
                      >
                        <a-select
                          style="width:100%"
                          :disabled="generalRule.publishVersion !== null"
                          placeholder="请选择结果类型"
                          :value="valueType(generalRule.action)"
                          @change="actionValueTypeChange"
                        >
                          <a-select-option value="PARAMETER">参数</a-select-option>
                          <a-select-option value="VARIABLE">变量</a-select-option>
                          <a-select-option value="BOOLEAN">布尔</a-select-option>
                          <a-select-option value="COLLECTION">集合</a-select-option>
                          <a-select-option value="STRING">字符串</a-select-option>
                          <a-select-option value="NUMBER">数值</a-select-option>
                          <a-select-option value="DATE">日期</a-select-option>
                        </a-select>
                      </a-form-model-item>
                    </a-col>
                    <a-col :span="1"></a-col>
                    <a-col :span="18">
                      <a-form-model-item
                        prop="action.value"
                        style="margin-bottom: 0;"
                        :rules="{
                          required: true,
                          message: '请输入结果值',
                          trigger: ['change', 'blur'],
                        }"
                      >
                        <!-- 结果值配置保持原有逻辑 -->
                        <a-select
                          v-if="generalRule.action.type === 0 || generalRule.action.type === 1 || generalRule.action.type === 4"
                          show-search
                          :disabled="generalRule.action.type == null"
                          :value="generalRule.action.valueName"
                          placeholder="请输入关键字进行搜索"
                          :default-active-first-option="false"
                          :show-arrow="false"
                          :filter-option="false"
                          :not-found-content="null"
                          @search="actionSearch"
                        >
                          <a-select-option
                            v-for="d in actionSearchSelect.data"
                            :value="d.id"
                            :key="d.id"
                            @click.native="actionSearchOptionClick(d)"
                          >
                            {{ d.name }}
                          </a-select-option>
                        </a-select>

                        <a-select
                          :disabled="!generalRule.action.type"
                          v-else-if="generalRule.action.valueType === 'BOOLEAN'"
                          defaultValue="true"
                          @blur="saveAction"
                          style="width: 100%"
                          v-model="generalRule.action.value"
                          placeholder="请选择数据"
                        >
                          <a-select-option value="true">true</a-select-option>
                          <a-select-option value="false">false</a-select-option>
                        </a-select>

                        <a-input-number
                          :disabled="!generalRule.action.type"
                          @blur="saveAction"
                          v-else-if="generalRule.action.valueType === 'NUMBER'"
                          v-model="generalRule.action.value"
                          style="width: 100%"
                        />

                        <a-date-picker
                          :disabled="!generalRule.action.type"
                          @openChange="actionValueDatePickerOpenChange"
                          v-else-if="generalRule.action.valueType === 'DATE'"
                          show-time
                          @change="(date,dateString)=>(datePickerChange(generalRule.action,date,dateString))"
                          format="YYYY-MM-DD hh:mm:ss"
                          v-model="generalRule.action.value"
                          style="width: 100%"
                        />

                        <a-input
                          v-else
                          :disabled="!generalRule.action.type"
                          @blur="saveAction"
                          v-model="generalRule.action.value"
                        />
                      </a-form-model-item>
                    </a-col>
                  </a-row>
                </a-card>

                <br>

                <!-- 默认结果配置 -->
                <a-card title="默认结果" size="small">
                  <a-switch
                    :disabled="generalRule.action.valueType == null"
                    @change="enableDefaultActionChange"
                    :checked="generalRule.defaultAction.enableDefaultAction === 0"
                  />
                  <br><br>

                  <!-- 默认结果配置保持原有逻辑 -->
                  <a-row v-if="generalRule.defaultAction.enableDefaultAction === 0">
                    <a-col :span="5">
                      <a-form-model-item
                        prop="defaultAction.type"
                        style="margin-bottom: 0;"
                        :rules="{
                          required: true,
                          message: '请选择默认结果类型',
                          trigger: ['change', 'blur'],
                        }"
                      >
                        <a-select
                          style="width:100%"
                          :disabled="generalRule.action.valueType == null || generalRule.publishVersion !== null"
                          placeholder="请选择类型"
                          :value="valueType(generalRule.defaultAction)"
                          @change="defaultActionValueTypeChange"
                        >
                          <a-select-option value="PARAMETER">参数</a-select-option>
                          <a-select-option value="VARIABLE">变量</a-select-option>
                          <a-select-option value="BOOLEAN">布尔</a-select-option>
                          <a-select-option value="COLLECTION">集合</a-select-option>
                          <a-select-option value="STRING">字符串</a-select-option>
                          <a-select-option value="NUMBER">数值</a-select-option>
                          <a-select-option value="DATE">日期</a-select-option>
                        </a-select>
                      </a-form-model-item>
                    </a-col>
                    <a-col :span="1"></a-col>
                    <a-col :span="18">
                      <!-- 默认结果值配置... -->
                      <a-form-model-item
                        prop="defaultAction.value"
                        style="margin-bottom: 0;"
                        :rules="{
                          required: true,
                          message: '请输入默认结果值',
                          trigger: ['change', 'blur'],
                        }"
                      >
                        <a-input
                          v-model="generalRule.defaultAction.value"
                          placeholder="请输入默认结果值"
                        />
                      </a-form-model-item>
                    </a-col>
                  </a-row>
                </a-card>

                <br>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <a-space>
                    <a-button @click="saveRule" type="primary" :loading="saving">
                      <a-icon type="save" />
                      保存规则
                    </a-button>
                    <a-button @click="previewRule">
                      <a-icon type="eye" />
                      预览
                    </a-button>
                    <a-button @click="resetRule" :disabled="saving">
                      <a-icon type="reload" />
                      重置
                    </a-button>
                  </a-space>
                </div>
              </a-form-model>
            </a-col>
            <a-col :span="1"/>
          </a-row>
        </vue-scroll>
      </a-card>
    </page-layout>
  </div>
</template>

<script>
import MultiLayerConditionBuilder from '@/pages/components/condition/MultiLayerConditionBuilder.vue'
import { valueType } from '@/utils/value-type'
import moment from 'moment'

export default {
  name: 'ConfigV2',
  components: {
    MultiLayerConditionBuilder
  },
  props: {
    generalRule: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      saving: false,
      isMobile: false,
      ops: {
        rail: {
          opacity: 0.3
        }
      },
      editUsers: [
        {
          title: '张三',
          lastOperation: '创建了新的条件组（最后一次操作记录）',
          avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
        },
        {
          title: '李四',
          lastOperation: '修改了条件逻辑',
          avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
        }
      ],
      actionSearchSelect: {
        data: []
      }
    }
  },
  methods: {
    /**
     * 切换到传统版本
     */
    switchToLegacyVersion() {
      this.$confirm({
        title: '切换版本',
        content: '确定要切换到传统的条件配置版本吗？当前未保存的多层条件配置可能会丢失。',
        onOk: () => {
          // 这里可以添加版本切换逻辑
          // 例如：路由跳转到原有的Config.vue页面
          this.$router.push({
            name: 'config-legacy',
            params: this.$route.params
          })
        }
      })
    },

    /**
     * 值类型工具方法
     */
    valueType(obj) {
      return valueType(obj)
    },

    /**
     * 结果值类型改变
     */
    actionValueTypeChange(valueType) {
      // 处理结果值类型改变逻辑
      this.generalRule.action.valueType = valueType
      this.generalRule.action.value = undefined
      this.generalRule.action.valueName = undefined
    },

    /**
     * 默认结果值类型改变
     */
    defaultActionValueTypeChange(valueType) {
      // 处理默认结果值类型改变逻辑
      this.generalRule.defaultAction.valueType = valueType
      this.generalRule.defaultAction.value = undefined
      this.generalRule.defaultAction.valueName = undefined
    },

    /**
     * 启用默认结果改变
     */
    enableDefaultActionChange(checked) {
      this.generalRule.defaultAction.enableDefaultAction = checked ? 0 : 1
    },

    /**
     * 结果搜索
     */
    actionSearch(searchValue) {
      // 实现结果搜索逻辑
      console.log('搜索结果:', searchValue)
    },

    /**
     * 结果搜索选项点击
     */
    actionSearchOptionClick(data) {
      this.generalRule.action.value = data.id
      this.generalRule.action.valueName = data.name
    },

    /**
     * 保存结果
     */
    saveAction() {
      // 实现保存结果逻辑
      console.log('保存结果')
    },

    /**
     * 结果值日期选择器打开改变
     */
    actionValueDatePickerOpenChange(open) {
      if (!open) {
        this.saveAction()
      }
    },

    /**
     * 日期选择器改变
     */
    datePickerChange(target, date, dateString) {
      target.value = moment(date).format('YYYY-MM-DD HH:mm:ss')
      if (target === this.generalRule.action) {
        this.saveAction()
      }
    },

    /**
     * 保存规则
     */
    async saveRule() {
      // 验证表单
      try {
        await this.$refs.generalRuleForm.validate()
      } catch (error) {
        this.$message.error('请完善规则配置')
        return
      }

      this.saving = true
      try {
        // 这里调用保存规则的API
        // await saveGeneralRule(this.generalRule)

        this.$message.success('保存成功')
      } catch (error) {
        this.$message.error('保存失败: ' + error.message)
      } finally {
        this.saving = false
      }
    },

    /**
     * 预览规则
     */
    previewRule() {
      // 实现规则预览逻辑
      this.$message.info('功能开发中...')
    },

    /**
     * 重置规则
     */
    resetRule() {
      this.$confirm({
        title: '确认重置',
        content: '确定要重置所有配置吗？未保存的更改将会丢失。',
        onOk: () => {
          // 重置逻辑
          this.$refs.conditionBuilder.loadConditionTree()
          this.$message.success('重置成功')
        }
      })
    }
  }
}
</script>

<style scoped>
.condition-builder-section {
  margin-bottom: 24px;
}

.action-buttons {
  text-align: center;
  padding: 24px 0;
  border-top: 1px solid #e8e8e8;
  margin-top: 24px;
}

:deep(.condition_set) {
  border: 2px solid #1890ff;
}

:deep(.dynamic-delete-button) {
  cursor: pointer;
  position: relative;
  top: 4px;
  font-size: 24px;
  color: #999;
  transition: color 0.3s;
}

:deep(.dynamic-delete-button:hover) {
  color: #777;
}

:deep(.condition_set .ant-card-head) {
  background: #f0f7ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    :deep(.ant-space) {
      width: 100%;
      justify-content: center;
    }

    :deep(.ant-space-item) {
      margin-bottom: 8px;
    }
  }
}
</style>