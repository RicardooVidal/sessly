<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Selecione a empresa</h2>

      <form @submit.prevent="submit">
        <BaseSelect label="" v-model="tenant" :options="companies"/>

        <div class="actions">
          <button class="btn" type="submit">Continuar</button>
        </div>
      </form>

      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import {onMounted, ref} from 'vue'
import { useRouter } from 'vue-router'
import {api, initApi, setTenant, login, authUser, tenantUser} from '../composables/useApi'
import {currentUser} from "../composables/useApi";
import axios from "axios";
import BaseSelect from "../components/forms/BaseSelect.vue";

export default {
  name: 'CompanyPage',
  components: {BaseSelect},
  setup() {
    const router = useRouter()
    const companies = ref('')
    const tenant = ref('')
    const error = ref('');

    // ensure api is initialized (base url + withCredentials)
    initApi()

    const load = async (uuid) => {
      try {
        const res = await api.get(`/api/companies`)
        companies.value = (res.data.data|| []).map(c => ({ value: c.uuid, label: c.company }))
        tenant.value = companies.value[0]?.value
      } catch (e) {
        console.error(e)
        if (e && e.response && e.response.status === 401) {
          await router.push('/login');
        }
      }
    }

    onMounted(load)

    async function submit() {
      error.value = ''
      try {
        // set tenant globally for subsequent requests
        setTenant(tenant.value)

        // Persist tenant for future sessions and set header globally
        try {
          localStorage.setItem('mindease:tenant', tenant.value)
          const user = await currentUser();
          authUser.value = user.data
          tenantUser.value = tenant.value
        } catch (e) {
          authUser.value = false
          tenantUser.value = false
        }

        if (tenant) api.defaults.headers.common['X-Tenant'] = tenant.value

        const redirect = router.currentRoute.value.query.redirect || '/'
        await router.push(redirect)
      } catch (e) {
        error.value = 'Falha ao autenticar'
      }
    }

    return { tenant, submit, error, companies }
  },
}
</script>

<style>
.login-page{display:flex;align-items:center;justify-content:center;height:100vh}
.login-card{width:320px;padding:24px;border-radius:8px;background:var(--surface);box-shadow:0 6px 18px rgba(0,0,0,.08)}
.login-card h2{margin:0 0 16px}
.login-card label{display:block;margin-bottom:12px}
.login-card input{width:100%;padding:8px;border:1px solid var(--border);border-radius:4px}
.actions{display:flex;justify-content:flex-end}
</style>
