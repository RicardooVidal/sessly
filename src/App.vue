<template>
  <div :class="['layout', themeClass]">
    <div class="mobile-topbar" v-if="isMobile">
      <button @click="toggleSidebar">☰</button>
      <span class="brand-div">
        <div class="brand">Sessly</div>
      </span>
    </div>

    <aside :class="['sidebar', { open: sidebarOpen }]" v-if="checkHasTenant">
      <span class="brand-div">
        <h1 class="brand">Sessly</h1>
        <span>Beta</span>
      </span>
      <nav>
        <ul>
          <li v-if="isRoot" class="sidebar-link-item">
            <router-link to="/admin/companies" class="sidebar-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
              </svg>
              <span>Empresas</span>
            </router-link>
          </li>
          <li class="sidebar-link-item">
            <router-link to="/dashboard" class="sidebar-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </router-link>
          </li>
          <SidebarDropdown
            label="Pacientes"
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            :options="[
              { to: '/patients', label: 'Listar' },
              { to: '/patients/new', label: 'Novo' },
              { to: '/wait-list', label: 'Lista de espera' },
            ]"
            @select="closeSidebar"
          />
          <SidebarDropdown
              label="Contratos"
              icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              :options="[
              { to: '/contracts', label: 'Listar' },
              { to: '/contracts/new', label: 'Novo' },
            ]"
              @select="closeSidebar"
          />
          <SidebarDropdown
            label="Agenda"
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            :options="[
              { to: '/appointments', label: 'Listar Consultas' },
              { to: '/appointments/new', label: 'Nova consulta' },
            ]"
            @select="closeSidebar"
          />
          <SidebarDropdown
            label="Financeiro"
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            :options="[
              { to: '/finance', label: 'Resumo' },
              { to: '/finance/reports', label: 'Relatórios' },
            ]"
            @select="closeSidebar"
          />
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="theme-switcher">
          <label for="app-theme">Tema:</label>
          <select id="app-theme" v-model="theme">
            <option value="default">Padrão</option>
            <option value="dark">Escuro</option>
            <option value="pink">Rosa</option>
            <option value="red">Vermelho</option>
          </select>
        </div>
        <button class="btn btn-logout" type="button" @click="handleLogout" title="Sair">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"/>
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </aside>
    <!-- overlay closes sidebar on mobile when open -->
    <div v-if="isMobile && sidebarOpen" class="overlay" @click="closeSidebar"></div>

    <main class="content" @click="onMainClick">
      <Loading v-if="isLoading" />
      <div v-if="errorMessage" class="error-banner">
        <div>
          <strong>Erro JS:</strong> {{ errorMessage }}
        </div>
        <button @click="errorMessage = ''" class="btn">Fechar</button>
      </div>
      <router-view />
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import SidebarDropdown from './components/SidebarDropdown.vue'
import {useRouter} from "vue-router";
import {authUser, logout} from "./composables/useApi.js";
import {hasTenant} from "./composables/useApi.js";
import Loading from './components/Loading.vue'
import { isLoading } from './composables/useLoading'

export default {
  components: { SidebarDropdown, Loading },
  setup() {
    const isMobile = ref(false)
    const sidebarOpen = ref(false)
    const router = useRouter()
    const checkHasTenant = computed(() => hasTenant());
    const isRoot = computed(() => Number(authUser.value?.id) === 1)

    const check = () => (isMobile.value = window.innerWidth <= 768)
    onMounted(() => {
      check()
      window.addEventListener('resize', check)
    })

    const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value)
    const closeSidebar = () => (sidebarOpen.value = false)

    // Theme handling
    const savedTheme = localStorage.getItem('sessly:theme')
    const theme = ref(['default', 'pink', 'red', 'dark'].includes(savedTheme) ? savedTheme : 'default')
    const themeClass = computed(() => `theme-${theme.value}`)
    watch(theme, (value) => {
      document.documentElement.classList.remove('theme-default', 'theme-pink', 'theme-red', 'theme-dark')
      document.documentElement.classList.add(`theme-${value}`)
      localStorage.setItem('sessly:theme', value)
    }, { immediate: true })

    const onMainClick = () => {
      if (isMobile.value && sidebarOpen.value) closeSidebar()
    }

    const errorMessage = ref('')

    // global error handlers to surface issues in the UI during development
    const onError = (ev) => {
      errorMessage.value = ev.message || String(ev)
    }
    const onRejection = (ev) => {
      try {
        errorMessage.value = (ev && ev.reason && ev.reason.message) || String(ev)
      } catch (e) {
        errorMessage.value = String(ev)
      }
    }
    onMounted(() => {
      window.addEventListener('error', onError)
      window.addEventListener('unhandledrejection', onRejection)
    })
    onUnmounted(() => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    })

    const handleLogout = async () => {
      try {
        await logout()
      } catch (e) {
        console.error(e)
      } finally {
        router.push({ path: '/login', replace: true }).catch(err => console.error(err))
      }
    }

    return { authUser, isMobile, sidebarOpen, toggleSidebar, closeSidebar, theme, themeClass, onMainClick, errorMessage, handleLogout, checkHasTenant, isRoot, isLoading }
  },
}
</script>

<style scoped>
.brand-div {
  text-align: center;
  margin-bottom: 24px;
}

.brand {
  margin: 0;
  font-size: 22px;
  letter-spacing: 0.5px;
}

.sidebar nav {
  flex: 1;
  overflow-y: auto;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-link-item {
  margin-bottom: 2px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--sidebar-muted);
  text-decoration: none;
  font-size: 14px;
  transition: background 0.15s, color 0.15s;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.sidebar-link.router-link-active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
}

.sidebar-link svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.theme-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.theme-switcher label {
  color: var(--sidebar-muted);
  font-size: 13px;
}

.theme-switcher select {
  flex: 1;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: var(--sidebar-text);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}

.theme-switcher option {
  background: var(--surface);
  color: var(--text);
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fff;
}

.btn-logout svg {
  width: 18px;
  height: 18px;
}
</style>
