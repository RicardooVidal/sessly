<template>
  <div class="page-hero">
    <h1>Editar empresa</h1>
  </div>

  <div v-if="loading">Carregando...</div>
  <div v-else-if="error" class="error">{{ error }}</div>

  <CompanyForm
    v-if="company"
    :model-value="company"
    :url="url"
    method="put"
    @save="onSave"
    @cancel="cancel"
  />
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../composables/useApi.js'
import CompanyForm from '../../components/admin/CompanyForm.vue'

export default {
  name: 'CompanyEditPage',
  components: { CompanyForm },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const company = ref(null)
    const loading = ref(true)
    const error = ref('')
    const url = `/api/admin/companies/${route.params.uuid}`

    const load = async () => {
      loading.value = true
      error.value = ''

      try {
        const response = await api.get(url)
        company.value = response.data?.data ?? null

        if (!company.value) {
          error.value = 'Empresa não encontrada.'
        }
      } catch (e) {
        console.error(e)
        error.value = 'Não foi possível carregar a empresa.'
      } finally {
        loading.value = false
      }
    }

    const onSave = () => router.push('/admin/companies')
    const cancel = () => router.push('/admin/companies')

    onMounted(load)

    return { company, loading, error, url, onSave, cancel }
  },
}
</script>
