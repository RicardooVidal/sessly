<template>
  <SimpleTable
    height="calc(100vh - 280px)"
    :data="companies"
    :columns="columns"
    :actions="actions"
  />
</template>

<script>
import { onMounted, ref } from 'vue'
import { api } from '../../composables/useApi.js'
import SimpleTable from '../SimpleTable.vue'
import { bool } from '../../utils/masks.js'

const dateOnly = (value) => {
  if (!value) return ''
  const [year, month, day] = String(value).slice(0, 10).split('-')
  return day && month && year ? `${day}/${month}/${year}` : value
}

export default {
  name: 'CompanyList',
  components: { SimpleTable },
  setup() {
    const companies = ref([])

    const actions = [
      { label: 'Editar', type: 'edit', url: '/admin/companies/{uuid}/edit' },
    ]

    const columns = [
      { key: 'company', label: 'Schema' },
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'E-mail' },
      { key: 'document', label: 'Documento' },
      { key: 'until', label: 'Válido até', mask: dateOnly },
      { key: 'active', label: 'Ativa', mask: bool },
    ]

    const load = async () => {
      try {
        const response = await api.get('/api/admin/companies')
        companies.value = response.data.data || []
      } catch (error) {
        console.error(error)
      }
    }

    onMounted(load)

    return { companies, columns, actions }
  },
}
</script>
