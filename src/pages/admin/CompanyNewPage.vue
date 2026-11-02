<template>
  <div class="page-hero">
    <h1>Nova empresa</h1>
  </div>

  <CompanyForm
    url="/api/admin/companies"
    @save="onSave"
    @cancel="cancel"
  />
</template>

<script>
import { useRouter } from 'vue-router'
import CompanyForm from '../../components/admin/CompanyForm.vue'

export default {
  name: 'CompanyNewPage',
  components: { CompanyForm },
  setup() {
    const router = useRouter()

    const onSave = () => router.push('/admin/companies')
    const cancel = () => router.push('/admin/companies')

    return { onSave, cancel }
  },
}
</script>
