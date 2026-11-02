<template>
  <div class="page-hero">
    <h1>Empresas</h1>
    <div class="page-actions">
      <router-link to="/companies" class="btn">Acessar sistema</router-link>
      <router-link to="/admin/companies/new" class="btn primary">Nova empresa</router-link>
    </div>
  </div>

  <CompanyList />
</template>

<script>
import CompanyList from '../../components/admin/CompanyList.vue'

export default {
  name: 'CompanyAdminPage',
  components: { CompanyList },
}
</script>
