<template>
  <div>
    <div class="page-hero">
      <h1>Relatórios</h1>
      <p class="page-subtitle">Gere a planilha de pagamentos por mês ou período.</p>
    </div>

    <div class="card report-form">
      <div class="form-grid">
        <BaseSelect
          label="Tipo"
          v-model="periodType"
          :options="periodTypeOptions"
          :disabled="isRunning"
        />

        <DatePicker
          v-if="periodType === 'month'"
          id="report-month"
          v-model="month"
          label="Mês"
          placeholder="Selecione o mês"
          model-type="yyyy-MM"
          format="MM/yyyy"
          month-picker
          auto-apply
          :enable-time="false"
          :clearable="false"
          :disabled="isRunning"
          required
        />

        <DatePicker
          v-else
          id="report-period"
          v-model="period"
          label="Período"
          placeholder="Selecione o período"
          model-type="yyyy-MM-dd"
          format="dd/MM/yyyy"
          range
          auto-apply
          :enable-time="false"
          :clearable="false"
          :disabled="isRunning"
          hint="Serão considerados os meses completos do intervalo."
          required
        />

        <SelectSearch
          label="Paciente"
          v-model="patientUuid"
          :options="patientOptions"
          placeholder="Todos os pacientes"
          :disabled="isRunning"
        />
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn primary"
          :disabled="!canGenerate"
          @click="generate"
        >
          {{ starting ? 'Iniciando...' : 'Gerar relatório' }}
        </button>
        <button
          v-if="isRunning"
          type="button"
          class="btn"
          :disabled="cancelling"
          @click="cancel"
        >
          {{ cancelling ? 'Cancelando...' : 'Cancelar geração' }}
        </button>
      </div>
    </div>

    <div v-if="report" class="card report-status">
      <div class="report-status__header">
        <div>
          <strong>{{ report.status_description }}</strong>
          <span class="report-status__meta">
            {{ report.period_label }} · {{ report.processed_patients }} de {{ report.total_patients }} pacientes
          </span>
        </div>
        <span class="report-status__percent">{{ report.progress }}%</span>
      </div>

      <div class="progress" role="progressbar" :aria-valuenow="report.progress" aria-valuemin="0" aria-valuemax="100">
        <div class="progress__bar" :style="{ width: `${report.progress}%` }"></div>
      </div>

      <p v-if="report.status === 'queued'" class="hint">
        Na fila
      </p>

      <p v-if="report.status === 'failed' && report.error_message" class="error">
        {{ report.error_message }}
      </p>

      <div v-if="report.status === 'completed' && report.download_url" class="report-status__actions">
        <a :href="report.download_url" class="btn primary" target="_blank" rel="noopener">
          Baixar relatório
        </a>
        <span class="hint">O link de download é temporário.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import SelectSearch from '../../components/SelectSearch.vue'
import BaseSelect from '../../components/forms/BaseSelect.vue'
import DatePicker from '../../components/forms/DatePicker.vue'
import { api } from '../../composables/useApi.js'
import { notify } from '../../composables/useToastr.js'

const now = new Date()
const pad = (value) => String(value).padStart(2, '0')
const toMonthValue = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
const toDateValue = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const periodType = ref('month')
const month = ref(toMonthValue(now))
const period = ref([
  toDateValue(new Date(now.getFullYear(), now.getMonth(), 1)),
  toDateValue(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
])
const patientUuid = ref('')
const patients = ref([])
const report = ref(null)
const starting = ref(false)
const cancelling = ref(false)
let pollTimer = null

const terminalStatuses = ['completed', 'failed', 'cancelled']
const periodTypeOptions = [
  { value: 'month', label: 'Mensal' },
  { value: 'period', label: 'Período' },
]

const isRunning = computed(
  () => !!report.value && !terminalStatuses.includes(report.value.status)
)

const selectedMonth = computed(() => {
  if (!month.value) {
    return ''
  }

  return typeof month.value === 'string'
    ? month.value
    : toMonthValue(month.value)
})

const formatDate = (value) => {
  if (!value) {
    return ''
  }

  return typeof value === 'string' ? value : toDateValue(value)
}

const selectedPeriod = computed(() => {
  if (!Array.isArray(period.value) || period.value.length !== 2) {
    return null
  }

  const startDate = formatDate(period.value[0])
  const endDate = formatDate(period.value[1])

  if (!startDate || !endDate) {
    return null
  }

  return {
    start_date: startDate,
    end_date: endDate,
  }
})

const canGenerate = computed(() => {
  if (starting.value || isRunning.value) {
    return false
  }

  return periodType.value === 'month' ? !!selectedMonth.value : !!selectedPeriod.value
})

const patientOptions = computed(() => [
  { value: '', label: 'Todos os pacientes' },
  ...patients.value.map((patient) => ({
    value: patient.uuid,
    label: patient.name,
  })),
])

const stopPolling = () => {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

const schedulePoll = () => {
  stopPolling()

  if (!report.value || terminalStatuses.includes(report.value.status)) {
    return
  }

  pollTimer = setTimeout(poll, 2000)
}

const poll = async () => {
  if (!report.value || terminalStatuses.includes(report.value.status)) {
    return
  }

  try {
    const response = await api.get(`/api/reports/${report.value.uuid}`, {
      showLoading: false,
      showToast: false,
    })

    report.value = response.data.data

    if (terminalStatuses.includes(report.value.status)) {
      if (report.value.status === 'completed') {
        notify('Relatório gerado com sucesso!', 'success')
      } else if (report.value.status === 'failed') {
        notify('Não foi possível gerar o relatório.', 'error')
      }

      return
    }
  } catch (error) {
    console.error(error)
  }

  schedulePoll()
}

const loadPatients = async () => {
  try {
    const response = await api.get('/api/patient/select/get', {
      params: { active: 1 },
      showLoading: false,
      showToast: false,
    })

    patients.value = response.data.data || []
  } catch (error) {
    console.error(error)
  }
}

const generate = async () => {
  if (!canGenerate.value) {
    return
  }

  starting.value = true
  stopPolling()

  const payload = {
    patient_uuid: patientUuid.value || null,
  }

  if (periodType.value === 'month') {
    payload.month = selectedMonth.value
  } else {
    Object.assign(payload, selectedPeriod.value)
  }

  try {
    const response = await api.post(
      '/api/reports',
      payload,
      { showLoading: false, showToast: false }
    )

    report.value = response.data.data
    notify('Relatório em geração.', 'success')
    schedulePoll()
  } catch (error) {
    console.error(error)
  } finally {
    starting.value = false
  }
}

const cancel = async () => {
  if (!report.value || cancelling.value) {
    return
  }

  cancelling.value = true

  try {
    const response = await api.post(
      `/api/reports/${report.value.uuid}/cancel`,
      {},
      { showLoading: false, showToast: false }
    )

    report.value = response.data.data
    stopPolling()
    notify('Geração cancelada.', 'info')
  } catch (error) {
    console.error(error)
  } finally {
    cancelling.value = false
  }
}

onMounted(loadPatients)
onUnmounted(stopPolling)
</script>

<style scoped>
.page-subtitle {
  color: var(--muted);
  margin-top: 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.report-status {
  margin-top: 16px;
}

.report-status__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.report-status__meta {
  display: block;
  color: var(--muted);
  font-size: 13px;
  margin-top: 2px;
}

.report-status__percent {
  font-size: 20px;
  font-weight: 700;
}

.progress {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: var(--surface-muted);
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background: var(--primary, #2f80ed);
  transition: width 0.3s ease;
}

.report-status__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.hint {
  color: var(--muted);
  font-size: 13px;
  margin-top: 10px;
}

.error {
  color: var(--error);
  font-size: 13px;
  margin-top: 10px;
}
</style>
