<template>
  <label class="field-width form-row"
    :data-field-width="width != null ? '' : null"
    :style="{ '--form-field-width': typeof width === 'number' ? `${width}px` : width }"
  >
    <span class="label-text">{{ label }} <small v-if="required">*</small></span>
    <input
      v-if="type === 'file'"
      type="file"
      :placeholder="placeholder"
      @change="handleFileChange"
      :required="required"
      class="base-input"
      :class="{ 'has-error': error }"
    />
    <input
      v-else
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="handleInput"
      :required="required"
      :maxlength="mask?.maxlength ?? maxlength"
      class="base-input"
      :class="{ 'has-error': error }"
    />
    <small v-if="error" class="error">{{ error }}</small>
    <small v-else-if="hint" class="hint">{{ hint }}</small>
  </label>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    width: { type: [String, Number], default: null },
    label: { type: String, default: '' },
    modelValue: { type: [String, Number, File], default: '' },
    placeholder: { type: String, default: '' },
    required: { type: Boolean, default: false },
    hint: { type: String, default: '' },
    type: { type: String, default: 'text' },
    error: { type: String, default: '' },
    mask: { type: Function, default: null },
    maxlength: { type: [Number, String], default: null },
  },
  methods: {
    handleInput(event) {
      const maskedValue = this.mask ? this.mask(event.target.value) : event.target.value
      event.target.value = maskedValue
      this.$emit('update:modelValue', maskedValue)
    },
    handleFileChange(event) {
      this.$emit('update:modelValue', event.target.files[0] || '')
    }
  }
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
