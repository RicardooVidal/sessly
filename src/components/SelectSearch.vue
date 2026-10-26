<template>
  <div class="field-width select-search form-row" @click.stop
    :data-field-width="width != null ? '' : null"
    :style="{ '--form-field-width': typeof width === 'number' ? `${width}px` : width }"
  >
    <div v-if="multiple" class="tags">
      <span v-for="(t,i) in internalValue" :key="i" class="tag">{{ findLabel(t) }} <button type="button" @click="remove(i)">×</button></span>
    </div>

    <span class="label-text">{{ label }} <small v-if="required">*</small></span>

    <label>
      <input
          v-if="disabled"
          :value="multiple ? '' : findLabel(modelValue)"
          :placeholder="placeholder"
          class="base-input"
          :class="{ 'has-error': error, 'is-disabled': disabled }"
          disabled
      />
      <input
          v-else
          ref="inputEl"
          :placeholder="placeholder"
          v-model="query"
          @focus="openDropdown"
          @keydown.enter.prevent="selectHighlighted"
          class="base-input"
          :class="{ 'has-error': error }"
      />
      <small v-if="error" class="error">{{ error }}</small>
      <small v-else-if="hint" class="hint">{{ hint }}</small>
    </label>

    <ul v-if="open && !disabled && filtered.length" class="dropdown">
      <li
        v-for="(o, idx) in filtered"
        :key="o.value"
        :class="{ highlighted: idx === highlighted }"
        @click="select(o.value)"
        @mouseenter="highlighted = idx"
      >
        {{ o.label }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export default {
  props: {
    width: { type: [String, Number], default: null },
    label: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    modelValue: { type: [String, Array], default: '' },
    multiple: { type: Boolean, default: false },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const query = ref('')
    const open = ref(false)
    const highlighted = ref(0)
    const internalValue = ref(props.multiple ? (props.modelValue || []) : (props.modelValue || ''))

    // close dropdown when clicking outside or pressing Escape
    const onDocClick = (e) => {
      // if click inside component, ignore
      const root = e.target.closest && e.target.closest('.select-search')
      if (!root) open.value = false
    }

    const onKey = (e) => { if (e.key === 'Escape') open.value = false }

    onMounted(() => {
      document.addEventListener('click', onDocClick)
      document.addEventListener('keydown', onKey)
    })

    onUnmounted(() => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    })

    watch(() => props.modelValue, (v) => {
      internalValue.value = props.multiple ? (v || []) : (v || '')
      if (!props.multiple && v) query.value = findLabel(v)
    })

    const filtered = computed(() => {
      if (!query.value) return props.options
      return props.options.filter(o => o.label.toLowerCase().includes(query.value.toLowerCase()))
    })

    const findLabel = function (val) {
      return (props.options.find(o => o.value == val) || {}).label || val;
    }

    watch(() => props.options, () => {
      if (!props.multiple && props.modelValue) query.value = findLabel(props.modelValue)
    })

    watch(() => props.disabled, (disabled) => {
      if (disabled) open.value = false
    })

    const openDropdown = () => {
      if (!props.disabled) open.value = true
    }

    const select = (val) => {
      if (props.disabled) return
      if (props.multiple) {
        const arr = Array.isArray(internalValue.value) ? [...internalValue.value] : []
        if (!arr.includes(val)) arr.push(val)
        internalValue.value = arr
        emit('update:modelValue', arr)
        // keep dropdown open for multi-select but reset query and keep focus
        open.value = true
        // focus input for next search
        setTimeout(()=>{ if (inputEl.value) inputEl.value.focus() }, 0)
      } else {
        internalValue.value = val
        emit('update:modelValue', val)
        open.value = false
        query.value = findLabel(val)
      }
      if (props.multiple) query.value = ''
    }

    const remove = (idx) => {
      if (!props.multiple || props.disabled) return
      const arr = [...internalValue.value]
      arr.splice(idx, 1)
      internalValue.value = arr
      emit('update:modelValue', arr)
    }

    const selectHighlighted = () => {
      if (props.disabled) return
      const item = filtered.value[highlighted.value]
      if (item) select(item.value)
    }

    const inputEl = ref(null)

    return { query, filtered, select, internalValue, remove, highlighted, open, openDropdown, selectHighlighted, findLabel, inputEl }
  },
}
</script>

<style scoped>
.label-text{font-weight:600}
.form-row{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.select-search{position:relative}
.dropdown{position:absolute;left:0;right:0;background:var(--surface);border:1px solid var(--border);max-height:200px;overflow:auto;z-index:40;margin:4px 0;padding:0;list-style:none}
.dropdown li{padding:8px;cursor:pointer}
.dropdown li.highlighted{background:var(--surface-hover)}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}
.tag{background:var(--surface-muted);padding:4px 8px;border-radius:999px}
.base-input{padding:8px;border:1px solid var(--border);border-radius:6px}
.base-input.has-error{border-color:var(--error)}
.base-input.is-disabled{background:var(--surface-muted);color:var(--muted);cursor:not-allowed}
.hint{color:var(--muted);font-size:12px}
.error{color:var(--error);font-size:12px}
</style>
