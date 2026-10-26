import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { client, HttpResponseError, HttpCancelledError, HttpNetworkError } from 'laravel-precognition'
import App from './App.vue'
import './styles.css'

import PatientIndex from './pages/patients/index.vue'
import ContractIndex from './pages/contracts/index.vue'
import DashboardIndex from './pages/dashboard/index.vue'
import FinanceIndex from './pages/finance/index.vue'
import AppointmentIndex from './pages/appointments/index.vue'
import AppointmentNewPage from "./pages/appointments/AppointmentNewPage.vue";
import AppointmentEditPage from "./pages/appointments/AppointmentEditPage.vue";
import WaitListPage from './pages/waitlist/index.vue'
import PatientNewPage from './pages/patients/PatientNewPage.vue'
import PatientDetailPage from './pages/patients/PatientDetailPage.vue'
import AlfacePage from './pages/AlfacePage.vue'
import TablesPage from './pages/TablesPage.vue'
import LoginPage from './pages/LoginPage.vue'
import { initApi, api } from './composables/useApi'
import { authUser, tenantUser, currentUser } from './composables/useApi'
import CompanyPage from "./pages/CompanyPage.vue";
import PatientEditPage from "./pages/patients/PatientEditPage.vue";
import ContractNewPage from "./pages/contracts/ContractNewPage.vue";
import ContractEditPageDeprecated from "./pages/contracts/ContractEditPage-DEPRECATED.vue";
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: LoginPage },
  { path: '/companies', component: CompanyPage },
  { path: '/contracts', component: ContractIndex },
  { path: '/contracts/new', component: ContractNewPage },
  { path: '/contracts/:id/edit', component: ContractEditPageDeprecated },
  { path: '/dashboard', component: DashboardIndex },
  { path: '/finance', component: FinanceIndex },
  { path: '/patients', component: PatientIndex },
  { path: '/patients/new', component: PatientNewPage },
  { path: '/wait-list', component: WaitListPage },
  { path: '/patients/:id/edit', component: PatientEditPage },
  { path: '/patients/:id', component: PatientDetailPage, props: true },
  { path: '/appointments', component: AppointmentIndex },
  { path: '/appointments/new', component: AppointmentNewPage },
  { path: '/appointments/:id/edit', component: AppointmentEditPage },
  { path: '/alface', component: AlfacePage },
  { path: '/tables', component: TablesPage },
]

const router = createRouter({ history: createWebHistory(), routes })

// Global auth guard: ensures routes (except /login) require authentication
router.beforeEach(async (to, from, next) => {
    try {
      authUser.value = (await currentUser()).data;
      tenantUser.value =  await localStorage.getItem('mindease:tenant')

      if (!tenantUser.value || !authUser.value) {
        if (to.path === '/login' || to.path === '/companies') {
          return next()
        }

        throw new Error('User not authenticated or tenant not set');
      } else {
          if (to.path === '/login' || to.path === '/companies') {
            return next({ path: '/'})
          }
      }
    } catch (e) {
      authUser.value = false
      tenantUser.value = false;
      localStorage.removeItem('mindease:tenant')

      if (to.path === '/login' || to.path === '/companies') {
        return next()
      } else {
        return next({ path: '/login', query: { redirect: to.fullPath } })
      }
    }

  return next()
})

const app = createApp(App)
app.use(router)
initApi()
client.useHttpClient({
  getAxiosInstance: () => api,
  async request(config) {
    try {
      const response = await api.request({
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
        params: config.params,
        headers: config.headers,
        signal: config.signal,
        timeout: config.timeout ?? 30000,
        withCredentials: config.credentials === 'include',
      })
      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
      }
    } catch (error) {
      if (error.__isCancel) {
        throw new HttpCancelledError()
      }
      if (error.response) {
        throw new HttpResponseError({
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      }
      if (error.message === 'Network Error') {
        throw new HttpNetworkError()
      }
      throw error
    }
  },
}).withBaseURL(import.meta.env.VITE_API_BASE_URL)

app.component('VueDatePicker', VueDatePicker);
app.mount('#app')
