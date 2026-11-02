<template>
  <div>
    <div class="page-hero">
      <h1>Paciente</h1>
      <div class="page-actions">
        <router-link to="/patients" class="btn">Voltar</router-link>
      </div>
    </div>

    <div v-if="loading">Carregando...</div>
    <div v-else-if="patient">
      <div class="card">
        <h2>{{ patient.name }}</h2>
        <p><strong>Email:</strong> {{ patient.email }}</p>
        <p><strong>Telefone:</strong> {{ patient.phone }}</p>

        <h3>Editar</h3>
        <PatientForm
          :modelValue="patient"
          :url="`/api/patient/${patient.id}`"
          method="put"
          @save="onSave"
          @cancel="$router.push('/patients')"
        />
      </div>
    </div>
    <div v-else>Não encontrado</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import PatientForm from '../../components/patients/PatientForm.vue'
import { api } from '../../composables/useApi.js'

export default {
  props: ['id'],
  setup(props) {
    const patient = ref(null)
    const loading = ref(false)

    const load = async () => {
      loading.value = true
      try {
        const res = await api.get(`/api/patient/${props.id}`)
        patient.value = res.data.data
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    onMounted(load)

    const onSave = () => {
      load()
    }

    return { patient, loading, onSave }
  },
}
</script>
