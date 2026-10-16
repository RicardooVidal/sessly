<template>
  <div class="field-width form-row date-picker" :class="{ 'has-error': error }"
    :data-field-width="width != null ? '' : null"
    :style="{ '--form-field-width': typeof width === 'number' ? `${width}px` : width }"
  >
    <label v-if="label" :for="inputId" class="label-text">
      {{ label }} <small v-if="required">*</small>
    </label>
    <VueDatePicker
      v-bind="$attrs"
      :model-value="modelValue"
      :model-type="modelType"
      :locale="ptBR"
      :formats="{ input: format, preview: format }"
      :time-config="{ enableTimePicker: enableTime, is24: true }"
      :disabled-dates="disabledDates"
      :disabled="disabled"
      :input-attrs="{ id: inputId, required, clearable }"
      :action-row="{ selectBtnLabel: 'Selecionar', cancelBtnLabel: 'Cancelar' }"
      :placeholder="placeholder"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <small v-if="error" class="error">{{ error }}</small>
    <small v-else-if="hint" class="hint">{{ hint }}</small>
  </div>
</template>

<script>
import { useId } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ptBR } from 'date-fns/locale'
import '@vuepic/vue-datepicker/dist/main.css'

export default {
  name: 'DatePicker',
  components: { VueDatePicker },
  inheritAttrs: false,
  props: {
    width: { type: [String, Number], default: null },
    id: { type: String, default: '' },
    label: { type: String, default: '' },
    modelValue: { type: [String, Date], default: '' },
    modelType: { type: String, default: "yyyy-MM-dd'T'HH:mm" },
    format: { type: String, default: 'dd/MM/yyyy HH:mm' },
    placeholder: { type: String, default: 'Selecione a data e o horário' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    enableTime: { type: Boolean, default: true },
    disabledDates: { type: [Array, Function], default: () => [] },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup() {
    return { ptBR, generatedId: useId() }
  },
  computed: {
    inputId() {
      return this.id || `date-picker-${this.generatedId}`
    },
  },
}
</script>

<style scoped>
.date-picker :deep(.dp--input) {
  padding-inline-start: 12px;
  padding-inline-end: 76px;
  font-size: 13px;
  padding: 4px !important;
}
.date-picker :deep(.dp--input-not-clearable) {
  padding-inline-end: 40px !important;
}
.date-picker :deep(.dp--input-icon) {
  inset-inline-start: auto;
  inset-inline-end: 0;
}
.date-picker :deep(.dp--clear-btn) {
  inset-inline-end: 36px;
}
.date-picker.has-error :deep(.dp--input) {
  border-color: #ef4444;
}
</style>
