<template>
  <label class="field-width checkbox-row" :class="{ 'has-error': error }"
    :data-field-width="width != null ? '' : null"
    :style="{ '--form-field-width': typeof width === 'number' ? `${width}px` : width }"
  >
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      :required="required"
      class="base-checkbox"
    />
    <span class="label-text">{{ label }} <small v-if="required">*</small></span>
    <small v-if="error" class="error">{{ error }}</small>
    <small v-else-if="hint" class="hint">{{ hint }}</small>
  </label>
</template>

<script>
export default {
  name: 'BaseCheckbox',
  props: {
    width: { type: [String, Number], default: null },
    label: { type: String, default: '' },
    modelValue: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
  },
}
</script>

<style scoped>
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  cursor: pointer;
}

.label-text {
  font-weight: 600;
  cursor: pointer;
}

.base-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
}

.has-error .label-text {
  color: var(--error);
}

.hint {
  color: var(--muted);
  font-size: 12px;
  margin-left: auto;
}

.error {
  color: var(--error);
  font-size: 12px;
  margin-left: auto;
}
</style>
