<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Entrar</h2>

      <form @submit.prevent="submit">
        <label>
          Email
          <input v-model="email" type="email" required />
        </label>

        <label>
          Senha
          <input v-model="password" type="password" required />
        </label>

        <div class="actions">
          <button class="btn" type="submit">Entrar</button>
        </div>
      </form>

      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import {onMounted, ref} from 'vue'
import { useRouter } from 'vue-router'
import { api, initApi, setTenant, login } from '../composables/useApi'
import axios from "axios";

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const companies = ref('')
    const tenant = ref('')
    const email = ref('')
    const password = ref('')
    const error = ref('')

    // ensure api is initialized (base url + withCredentials)
    initApi()

    async function submit() {
      error.value = ''
      try {
        await login({ email: email.value, password: password.value })
        await router.push('/companies')
      } catch (e) {
        // try to extract message
        error.value = (e && e.response && e.response.data && e.response.data.message) || 'Falha ao autenticar'
      }
    }

    return { tenant, email, password, submit, error }
  },
}
</script>

<style>
.login-page{display:flex;align-items:center;justify-content:center;height:100vh; padding-right: var(--sidebar-width)}
.login-card{width:320px;padding:24px;border-radius:8px;background:var(--surface);box-shadow:0 6px 18px rgba(0,0,0,.08)}
.login-card h2{margin:0 0 16px}
.login-card label{display:block;margin-bottom:12px}
.login-card input{width:100%;padding:8px;border:1px solid var(--border);border-radius:4px}
.actions{display:flex;justify-content:flex-end}

@media (max-width: 768px){
  .login-page{position: relative; display:flex;align-items:center;justify-content:center;} 
  .login-card{position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:90%; max-width:400px; padding:24px; border-radius:8px; background:var(--surface); box-shadow:0 6px 18px rgba(0,0,0,.08);}
}

</style>
