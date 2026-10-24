<template>
  <li class="sidebar-dropdown">
    <button class="dropdown-btn" @click="toggle">
      <span class="dropdown-btn-content">
        <svg v-if="icon" class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path :d="icon" />
        </svg>
        <span>{{ label }}</span>
      </span>
      <svg class="chevron" :class="{ open }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
    <div class="dropdown-collapse" :style="{ maxHeight: open ? maxHeight : '0' }">
      <ul class="dropdown-list">
        <li v-for="opt in options" :key="opt.label">
          <router-link
            :to="opt.to"
            class="dropdown-link"
            :class="{ active: isActive(opt.to) }"
            @click="onSelect"
          >{{ opt.label }}</router-link>
        </li>
      </ul>
    </div>
  </li>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  props: {
    label: { type: String, required: true },
    icon: { type: String, default: '' },
    options: { type: Array, default: () => [] },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const route = useRoute()
    const open = ref(false)

    const maxHeight = computed(() => `${props.options.length * 44}px`)

    const isActive = (to) => {
      const target = typeof to === 'string' ? to : to.path
      return route.path === target
    }

    const hasActive = computed(() => props.options.some(o => isActive(o.to)))

    if (hasActive.value) open.value = true

    const toggle = () => (open.value = !open.value)
    const onSelect = () => emit('select')

    return { open, toggle, onSelect, isActive, maxHeight }
  }
}
</script>

<style scoped>
.sidebar-dropdown {
  margin-bottom: 2px;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--sidebar-muted);
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}

.dropdown-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.dropdown-btn-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
  opacity: 0.6;
}

.chevron.open {
  transform: rotate(180deg);
}

.dropdown-collapse {
  overflow: hidden;
  transition: max-height 0.25s ease;
}

.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 2px 0 4px 0;
}

.dropdown-link {
  display: block;
  padding: 8px 12px 8px 42px;
  border-radius: 6px;
  color: var(--sidebar-muted);
  text-decoration: none;
  font-size: 13px;
  transition: background 0.15s, color 0.15s;
}

.dropdown-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--sidebar-text);
}

.dropdown-link.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
}
</style>
