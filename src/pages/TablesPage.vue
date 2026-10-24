<template>
  <div>
    <div class="page-hero">
      <h1>Tables & Select2 - Exemplo</h1>
    </div>

    <div class="card">
      <label class="label-text">Select2 (pesquisável)</label>
    <SelectSearch :options="options" v-model="selSingle" placeholder="Pesquisar..." />

      <label class="label-text" style="margin-top:12px">Select (multi)</label>
      <SelectSearch :options="options" v-model="selMulti" multiple />

      <hr />

      <h3>Client-side pagination (sem prop pagination)</h3>
      <SimpleTable :data="rows" :columns="columns" :perPage="5" selectable @row-click="handleRowClick" />

      <hr />

      <h3>Server-side pagination (com prop pagination - Laravel)</h3>
      <p style="font-size:12px;color:var(--muted)">Este exemplo simula a estrutura do Laravel ao passar a prop pagination</p>
      <SimpleTable
        :data="paginationData"
        :columns="columns"
        :pagination="pagination"
        selectable
        @row-click="handleRowClick"
        @page-change="handlePageChange"
        @sort="handleSort"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import SelectSearch from '../components/SelectSearch.vue'
import SimpleTable from '../components/SimpleTable.vue'

export default {
  components: { SelectSearch, SimpleTable },
  setup() {
    const options = ref([
      { value: '1', label: 'Opção 1' },
      { value: '2', label: 'Opção 2' },
      { value: '3', label: 'Opção 3' },
    ])

    const selSingle = ref('')
    const selMulti = ref([])

    const rows = ref([
      { id: 1, name: 'Fulano de Tal', email: 'fulano@exemplo.com', phone: '(11) 99999-0000', document: '123.456.789-00', address: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP' },
      { id: 2, name: 'Beltrano Silva', email: 'beltrano@exemplo.com', phone: '(21) 98888-1111', document: '987.654.321-00', address: 'Avenida Brasil, 456', city: 'Rio de Janeiro', state: 'RJ' },
    ])

    const columns = [
      { key: 'name', label: 'Nome Completo'},
      { key: 'email', label: 'Email Principal' },
      { key: 'phone', label: 'Telefone Celular' },
      { key: 'document', label: 'CPF/CNPJ' },
      { key: 'address', label: 'Endereço Completo' },
      { key: 'city', label: 'Cidade' },
      { key: 'state', label: 'Estado' }
    ]

    // Exemplo de estrutura de paginação do Laravel
    const paginationData = ref([
      { id: 10, name: 'Fulano de Tal', email: 'fulano.tal@empresa.muittolongo.com', phone: '(11) 99999-0000', document: '123.456.789-00', address: 'Rua das Flores, 123, Apartamento 456', city: 'São Paulo', state: 'SP' },
      { id: 11, name: 'Beltrano Silva', email: 'beltrano.silva@outroemail.com.br', phone: '(21) 98888-1111', document: '987.654.321-00', address: 'Avenida Brasil, 456', city: 'Rio de Janeiro', state: 'RJ' },
      { id: 12, name: 'Ciclano Oliveira', email: 'ciclano.oliveira@qualquercoisa.net', phone: '(31) 97777-2222', document: '456.123.789-00', address: 'Praça da República, 789', city: 'Belo Horizonte', state: 'MG' },
    ])

    const pagination = ref({
      current_page: 1,
      last_page: 3,
      per_page: 5,
      total: 14,
      next_page_url: '/api/patients?page=2',
      prev_page_url: null,
      // Laravel também pode mandar links no formato: [{url: '...', label: '...', active: true}, ...]
    })

    const handleRowClick = (row) => {
      console.log('row clicked', row)
    }

    const handlePageChange = (page) => {
      console.log('Page changed to:', page)
      // Aqui você faria a chamada API: api.get(`/api/patients?page=${page}`)
      // e atualizaria paginationData e pagination com o resultado
      pagination.value.current_page = page
    }

    const handleSort = (key) => {
      console.log('Sort by:', key)
      // Aqui você faria a chamada API com ordenação
    }

    return { options, rows, columns, selSingle, selMulti, paginationData, pagination, handleRowClick, handlePageChange, handleSort }
  },
}
</script>