<template>
  <div class="condition-config-form">
    <!-- 左值配置 -->
    <a-row :gutter="16">
      <a-col :span="24">
        <div class="form-section">
          <div class="section-title">左值</div>
          <a-row :gutter="8">
            <a-col :span="8">
              <a-select
                v-model="leftValueTypeDisplay"
                placeholder="请选择类型"
                @change="leftValueTypeChange"
              >
                <a-select-option value="PARAMETER">参数</a-select-option>
                <a-select-option value="VARIABLE">变量</a-select-option>
                <a-select-option v-if="viewSelectGR" value="GENERAL_RULE">普通规则</a-select-option>
                <a-select-option value="BOOLEAN">布尔</a-select-option>
                <a-select-option value="COLLECTION">集合</a-select-option>
                <a-select-option value="STRING">字符串</a-select-option>
                <a-select-option value="NUMBER">数值</a-select-option>
                <a-select-option value="DATE">日期</a-select-option>
              </a-select>
            </a-col>
            <a-col :span="16">
              <!-- 参数/变量/规则选择 -->
              <a-select
                v-if="value.leftValue.type === 0 || value.leftValue.type === 1 || value.leftValue.type === 10"
                show-search
                v-model="value.leftValue.value"
                :value="value.leftValue.valueName"
                placeholder="请输入关键字进行搜索"
                :default-active-first-option="false"
                :show-arrow="false"
                :filter-option="false"
                :not-found-content="null"
                @search="leftValueSearch"
                @change="leftValueChange"
              >
                <a-select-option
                  v-for="d in leftSearchData"
                  :value="d.id"
                  :key="d.id"
                  @click.native="leftValueOptionClick(d)"
                >
                  {{ d.name }}
                </a-select-option>
              </a-select>
              <!-- 布尔值选择 -->
              <a-select
                v-else-if="value.leftValue.valueType === 'BOOLEAN'"
                v-model="value.leftValue.value"
                placeholder="请选择数据"
              >
                <a-select-option value="true">true</a-select-option>
                <a-select-option value="false">false</a-select-option>
              </a-select>
              <!-- 数值输入 -->
              <a-input-number
                v-else-if="value.leftValue.valueType === 'NUMBER'"
                v-model="value.leftValue.value"
                style="width: 100%"
              />
              <!-- 日期选择 -->
              <a-date-picker
                v-else-if="value.leftValue.valueType === 'DATE'"
                show-time
                v-model="value.leftValue.value"
                @change="(date, dateString) => datePickerChange(value.leftValue, date, dateString)"
                style="width: 100%"
              />
              <!-- 文本输入 -->
              <a-input
                v-else
                v-model="value.leftValue.value"
                placeholder="请输入值"
              />
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>

    <!-- 运算符配置 -->
    <a-row :gutter="16" style="margin-top: 16px;">
      <a-col :span="24">
        <div class="form-section">
          <div class="section-title">运算符</div>
          <a-select
            v-model="value.symbol"
            placeholder="请选择运算符"
            :disabled="!value.leftValue.value && value.leftValue.type !== 2"
          >
            <a-select-option
              v-for="op in operators"
              :value="op.name"
              :key="op.name"
            >
              {{ op.explanation }}
            </a-select-option>
          </a-select>
        </div>
      </a-col>
    </a-row>

    <!-- 右值配置 -->
    <a-row :gutter="16" style="margin-top: 16px;">
      <a-col :span="24">
        <div class="form-section">
          <div class="section-title">右值</div>
          <a-row :gutter="8">
            <a-col :span="8">
              <a-select
                v-model="rightValueTypeDisplay"
                placeholder="请选择类型"
                :disabled="!value.leftValue.value && value.leftValue.type !== 2"
                @change="rightValueTypeChange"
              >
                <a-select-option
                  v-if="value.leftValue.valueType != null"
                  value="PARAMETER"
                >
                  参数
                </a-select-option>
                <a-select-option
                  v-if="value.leftValue.valueType != null"
                  value="VARIABLE"
                >
                  变量
                </a-select-option>
                <a-select-option
                  v-if="value.leftValue.valueType != null && viewSelectGR"
                  value="GENERAL_RULE"
                >
                  普通规则
                </a-select-option>
                <a-select-option v-if="isRightTypeSelectView('BOOLEAN')" value="BOOLEAN">
                  布尔
                </a-select-option>
                <a-select-option v-if="isRightTypeSelectView('COLLECTION')" value="COLLECTION">
                  集合
                </a-select-option>
                <a-select-option v-if="isRightTypeSelectView('STRING')" value="STRING">
                  字符串
                </a-select-option>
                <a-select-option v-if="isRightTypeSelectView('NUMBER')" value="NUMBER">
                  数值
                </a-select-option>
                <a-select-option v-if="isRightTypeSelectView('DATE')" value="DATE">
                  日期
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="16">
              <!-- 参数/变量/规则选择 -->
              <a-select
                v-if="value.rightValue.type === 0 || value.rightValue.type === 1 || value.rightValue.type === 10"
                show-search
                v-model="value.rightValue.value"
                :value="value.rightValue.valueName"
                placeholder="请输入关键字进行搜索"
                :default-active-first-option="false"
                :show-arrow="false"
                :filter-option="false"
                :not-found-content="null"
                @search="rightValueSearch"
                @change="rightValueChange"
              >
                <a-select-option
                  v-for="d in rightSearchData"
                  :value="d.id"
                  :key="d.id"
                  @click.native="rightValueOptionClick(d)"
                >
                  {{ d.name }}
                </a-select-option>
              </a-select>
              <!-- 布尔值选择 -->
              <a-select
                v-else-if="value.rightValue.valueType === 'BOOLEAN'"
                v-model="value.rightValue.value"
                placeholder="请选择数据"
              >
                <a-select-option value="true">true</a-select-option>
                <a-select-option value="false">false</a-select-option>
              </a-select>
              <!-- 数值输入 -->
              <a-input-number
                v-else-if="value.rightValue.valueType === 'NUMBER'"
                v-model="value.rightValue.value"
                style="width: 100%"
              />
              <!-- 日期选择 -->
              <a-date-picker
                v-else-if="value.rightValue.valueType === 'DATE'"
                show-time
                v-model="value.rightValue.value"
                @change="(date, dateString) => datePickerChange(value.rightValue, date, dateString)"
                style="width: 100%"
              />
              <!-- 文本输入 -->
              <a-input
                v-else
                v-model="value.rightValue.value"
                placeholder="请输入值"
              />
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { valueType } from '@/utils/value-type'
import { getSymbolByValueType } from '@/utils/symbol'
import { selectSearch } from '@/utils/selectSearch'
import { setDefaultValue } from '@/utils/json'
import moment from 'moment'

export default {
  name: 'ConditionConfigForm',
  props: {
    value: {
      type: Object,
      default: () => ({
        leftValue: {
          type: undefined,
          valueType: undefined,
          value: undefined,
          valueName: undefined,
          variableValue: undefined,
        },
        symbol: undefined,
        rightValue: {
          type: undefined,
          valueType: undefined,
          value: undefined,
          valueName: undefined,
          variableValue: undefined,
        }
      })
    },
    viewSelectGR: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      operators: [],
      leftSearchData: [],
      rightSearchData: []
    }
  },
  computed: {
    leftValueTypeDisplay() {
      return valueType(this.value.leftValue)
    },
    rightValueTypeDisplay() {
      return valueType(this.value.rightValue)
    }
  },
  methods: {
    /**
     * 验证表单
     */
    validate() {
      const { leftValue, symbol, rightValue } = this.value

      if (!leftValue || !leftValue.value) {
        this.$message.error('请配置左值')
        return false
      }

      if (!symbol) {
        this.$message.error('请选择运算符')
        return false
      }

      if (!rightValue || !rightValue.value) {
        this.$message.error('请配置右值')
        return false
      }

      return true
    },

    /**
     * 左值类型改变
     */
    leftValueTypeChange(valueType) {
      this.value.leftValue = {
        value: undefined,
        valueName: undefined,
        variableValue: undefined,
        valueType: undefined,
      }

      if (valueType === 'PARAMETER') {
        this.value.leftValue.type = 0
      } else if (valueType === 'VARIABLE') {
        this.value.leftValue.type = 1
      } else if (valueType === 'GENERAL_RULE') {
        this.value.leftValue.type = 10
      } else {
        this.value.leftValue.type = 2
        this.value.leftValue.valueType = valueType

        if (valueType !== this.value.rightValue.valueType) {
          this.value.rightValue = setDefaultValue(this.value.rightValue)
          this.value.symbol = undefined
          this.operators = []
        }

        this.operators = getSymbolByValueType(valueType)
      }

      this.leftSearchData = []
    },

    /**
     * 左值搜索
     */
    leftValueSearch(searchValue) {
      selectSearch(
        {
          name: searchValue,
          valueType: null
        },
        data => (this.leftSearchData = data),
        this.value.leftValue.type
      )
    },

    /**
     * 左值改变
     */
    leftValueChange(value) {
      // 处理值变化
    },

    /**
     * 左值选项点击
     */
    leftValueOptionClick(data) {
      let leftValue = this.value.leftValue
      leftValue.value = data.id
      leftValue.valueType = data.valueType
      leftValue.valueName = data.name

      if (leftValue.type === 1 && data.type === 2) {
        leftValue.variableValue = data.value
      }

      if (data.valueType !== this.value.rightValue.valueType) {
        this.value.rightValue = setDefaultValue(this.value.rightValue)
        this.operators = getSymbolByValueType(data.valueType)
        this.value.symbol = undefined
      }
    },

    /**
     * 右值类型选择视图判断
     */
    isRightTypeSelectView(valueType) {
      if (this.value.rightValue.valueType === valueType) {
        return true
      }
      if (this.value.leftValue.valueType === null) {
        return false
      }
      if (this.value.leftValue.valueType === valueType) {
        return true
      }

      if (this.value.leftValue.valueType === 'COLLECTION') {
        if (this.value.symbol === null) {
          return true
        }
        return this.value.symbol === 'CONTAIN' || this.value.symbol === 'NOT_CONTAIN'
      }
    },

    /**
     * 右值类型改变
     */
    rightValueTypeChange(valueType) {
      this.value.rightValue = {
        value: undefined,
        valueName: undefined,
        variableValue: undefined,
        valueType: undefined,
      }

      if (valueType === 'PARAMETER') {
        this.value.rightValue.type = 0
      } else if (valueType === 'VARIABLE') {
        this.value.rightValue.type = 1
      } else if (valueType === 'GENERAL_RULE') {
        this.value.rightValue.type = 10
      } else {
        this.value.rightValue.type = 2
        this.value.rightValue.valueType = valueType
      }

      this.rightSearchData = []
    },

    /**
     * 右值搜索
     */
    rightValueSearch(searchValue) {
      selectSearch(
        {
          name: searchValue,
          valueType: this.getRValueType(this.value.leftValue.valueType, this.value.symbol)
        },
        data => (this.rightSearchData = data),
        this.value.rightValue.type,
        null
      )
    },

    /**
     * 获取右值类型
     */
    getRValueType(valueType, symbol) {
      if (valueType == null) {
        return []
      }

      if (valueType === 'COLLECTION' && symbol != null) {
        if (symbol === 'CONTAIN' || symbol === 'NOT_CONTAIN') {
          return ["STRING", "NUMBER", "BOOLEAN", "COLLECTION", "DATE"]
        }
      }
      return new Array(valueType)
    },

    /**
     * 右值改变
     */
    rightValueChange(value) {
      // 处理值变化
    },

    /**
     * 右值选项点击
     */
    rightValueOptionClick(data) {
      let rightValue = this.value.rightValue
      rightValue.value = data.id
      rightValue.valueType = data.valueType
      rightValue.valueName = data.name

      if (rightValue.type === 1 && data.type === 2) {
        rightValue.variableValue = data.value
      }
    },

    /**
     * 日期选择器改变
     */
    datePickerChange(valueConfig, date) {
      valueConfig.value = moment(date).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style scoped>
.condition-config-form {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 16px;
  background: #fafafa;
}

.form-section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.form-section:last-child {
  margin-bottom: 0;
}

:deep(.ant-select),
:deep(.ant-input),
:deep(.ant-input-number),
:deep(.ant-date-picker) {
  width: 100%;
}
</style>