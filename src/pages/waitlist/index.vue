<template>
  <div>
    <div class="page-hero">
      <div>
        <h1>Lista de espera</h1>
        <p class="page-subtitle">{{ waitingCountLabel }}</p>
      </div>
    </div>

    <section class="card add-card">
      <div class="add-card__header">
        <h2>Adicionar paciente</h2>
        <p>Selecione um paciente ativo para entrar na lista.</p>
      </div>

      <form class="add-form" @submit.prevent="addPatient">
        <SelectSearch
          :key="selectKey"
          label="Paciente"
          :options="availablePatientOptions"
          v-model="selectedPatientUuid"
          placeholder="Pesquisar paciente..."
          :error="formError"
        />
        <button
          class="btn primary"
          type="submit"
          :disabled="!selectedPatientUuid || adding || loading"
        >
          {{ adding ? 'Adicionando...' : 'Adicionar' }}
        </button>
      </form>

      <p
        v-if="!loading && !availablePatientOptions.length"
        class="empty-options"
      >
        Nenhum paciente ativo disponível para adicionar.
      </p>
    </section>

    <div v-if="loading" class="card">Carregando...</div>

    <SimpleTable
      v-else
      height="calc(100vh - 420px)"
      :data="waitList"
      :columns="columns"
      :actions="actions"
      @action-click="handleActionClick"
    />
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import SimpleTable from '../../components/SimpleTable.vue'
import SelectSearch from '../../components/SelectSearch.vue'
import { api } from '../../composables/useApi.js'
import { notify } from '../../composables/useToastr.js'

const entryDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export default {
  components: { SelectSearch, SimpleTable },
  setup() {
    const waitList = ref([])
    const patients = ref([])
    const selectedPatientUuid = ref('')
    const selectKey = ref(0)
    const formError = ref('')
    const loading = ref(true)
    const adding = ref(false)

    const columns = [
      { key: 'patient.name', label: 'Paciente' },
      {
        key: 'created_at',
        label: 'Data de entrada',
        mask: (value) => value ? entryDateFormatter.format(new Date(value)) : '',
      },
    ]

    const actions = [
      { label: 'Remover', type: 'delete', url: '/wait-list/{uuid}' },
    ]

    const waitingCountLabel = computed(() => {
      if (loading.value) return 'Carregando...'

      const count = waitList.value.length

      return count === 1
        ? '1 paciente aguardando vaga'
        : `${count} pacientes aguardando vaga`
    })

    const availablePatientOptions = computed(() => {
      const waitingPatientUuids = new Set(
        waitList.value.map((item) => item.patient_uuid)
      )

      return patients.value
        .filter((patient) => !waitingPatientUuids.has(patient.uuid))
        .map((patient) => ({
          value: patient.uuid,
          label: patient.name,
        }))
    })

    const load = async (showLoader = true) => {
      if (showLoader) loading.value = true

      try {
        const [waitListResponse, patientsResponse] = await Promise.all([
          api.get('/api/wait-list'),
          api.get('/api/patient/select/get', {
            params: { active: 1 },
          }),
        ])

        waitList.value = waitListResponse.data.data || []
        patients.value = patientsResponse.data.data || []
      } catch (error) {
        console.error(error)
      } finally {
        if (showLoader) loading.value = false
      }
    }

    const addPatient = async () => {
      if (!selectedPatientUuid.value || adding.value) return

      formError.value = ''
      adding.value = true

      try {
        await api.post(
          '/api/wait-list',
          { patient_uuid: selectedPatientUuid.value },
          { showToast: false }
        )

        selectedPatientUuid.value = ''
        selectKey.value += 1
        notify('Paciente adicionado à lista de espera.', 'success')
        await load(false)
      } catch (error) {
        const validationErrors = error.response?.data?.errors?.patient_uuid
        formError.value = Array.isArray(validationErrors)
          ? validationErrors[0]
          : 'Não foi possível adicionar o paciente.'

        if (error.response?.status !== 422) {
          notify('Não foi possível adicionar o paciente.', 'error')
        }
      } finally {
        adding.value = false
      }
    }

    const handleActionClick = async ({ row }) => {
      const patientName = row.patient?.name || 'este paciente'

      if (!confirm(`Remover ${patientName} da lista de espera?`)) return

      try {
        await api.delete(`/api/wait-list/${row.uuid}`, {
          showToast: false,
        })

        notify('Paciente removido da lista de espera.', 'success')
        await load(false)
      } catch (error) {
        console.error(error)
        notify('Não foi possível remover o paciente.', 'error')
      }
    }

    watch(selectedPatientUuid, () => {
      formError.value = ''
    })

    onMounted(load)

    return {
      waitList,
      selectedPatientUuid,
      selectKey,
      formError,
      loading,
      adding,
      columns,
      actions,
      waitingCountLabel,
      availablePatientOptions,
      addPatient,
      handleActionClick,
    }
  },
}
</script>

<style scoped>
.page-subtitle {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.add-card {
  margin-bottom: 16px;
}

.add-card__header h2 {
  margin: 0;
  font-size: 18px;
}

.add-card__header p {
  margin: 4px 0 16px;
  color: var(--muted);
  font-size: 13px;
}

.add-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
}

.add-form :deep(.select-search) {
  flex: 1 1 300px;
  max-width: 420px;
}

.add-form .btn {
  min-height: 40px;
}

.empty-options {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 640px) {
  .add-form {
    align-items: stretch;
    flex-direction: column;
  }

  .add-form :deep(.select-search),
  .add-form .btn {
    max-width: none;
    width: 100%;
  }
}
</style>
