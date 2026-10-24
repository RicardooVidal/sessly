<template>
  <label class="field-width form-row"
    :data-field-width="width != null ? '' : null"
    :style="{ '--form-field-width': typeof width === 'number' ? `${width}px` : width }"
  >
    <span class="label-text">{{ label }} <small v-if="required">*</small></span>
    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)" class="base-input" :class="{ 'has-error': error }">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <small v-if="error" class="error">{{ error }}</small>
    <small v-else-if="hint" class="hint">{{ hint }}</small>
  </label>
</template>

<script>
export default {
  name: 'BaseSelect',
  props: {
    width: { type: [String, Number], default: null },
    label: { type: String, default: '' },
    modelValue: { type: [String, Number], default: '' },
    options: { type: Array, default: () => [] },
    required: { type: Boolean, default: false },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
  },
}
</script>

<style scoped>
.form-row{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.label-text{font-weight:600}
.base-input{padding:8px;border:1px solid var(--border);border-radius:6px}
.base-input.has-error{border-color:var(--error)}
.hint{color:var(--muted);font-size:12px}
.error{color:var(--error);font-size:12px}
</style>
