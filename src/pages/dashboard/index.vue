<template>
  <div>
    <div class="page-hero">
      <div>
        <h1>{{ greeting }}, {{ userName }} <span aria-hidden="true">👋</span></h1>
        <p class="page-subtitle">{{ currentDateLabel }}</p>
      </div>
      <button
        type="button"
        class="btn"
        :disabled="loading"
        @click="load"
      >
        {{ loading ? 'Atualizando...' : 'Atualizar' }}
      </button>
    </div>

    <div v-if="loading && !summary" class="card">Carregando...</div>

    <template v-else-if="summary">
      <div class="summary-grid">
        <article class="summary-card summary-card--primary">
          <span class="summary-card__label">Atendimentos hoje</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.today.appointments_count) }}
          </strong>
          <span class="summary-card__hint">
            {{ formatNumber(summary.today.present_count) }} realizados ·
            {{ formatNumber(summary.today.pending_count) }} pendentes
          </span>
        </article>

        <article class="summary-card summary-card--primary">
          <span class="summary-card__label">Atendimentos na semana</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.week.appointments_count) }}
          </strong>
          <span class="summary-card__hint">
            Segunda a domingo · {{ formatNumber(summary.week.present_count) }} realizados
          </span>
        </article>
      </div>

      <div class="summary-grid summary-grid--secondary">
        <article class="summary-card">
          <span class="summary-card__label">Realizados hoje</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.today.present_count) }}
          </strong>
          <span class="summary-card__hint">Presenças confirmadas</span>
        </article>

        <article class="summary-card">
          <span class="summary-card__label">Pendentes hoje</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.today.pending_count) }}
          </strong>
          <span class="summary-card__hint">Aguardando confirmação</span>
        </article>

        <article class="summary-card">
          <span class="summary-card__label">Faltas na semana</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.week.absent_count) }}
          </strong>
          <span class="summary-card__hint">Ausências registradas</span>
        </article>

        <article class="summary-card">
          <span class="summary-card__label">Taxa de comparecimento</span>
          <strong class="summary-card__value">
            {{ formatPercent(summary.week.attendance_rate) }}
          </strong>
          <span class="summary-card__hint">Da semana</span>
        </article>
      </div>

      <div class="summary-grid summary-grid--secondary">
        <article class="summary-card">
          <span class="summary-card__label">Pacientes ativos</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.patients.active_count) }}
          </strong>
          <span class="summary-card__hint">
            {{ formatNumber(summary.patients.new_this_month) }} novos neste mês
          </span>
        </article>

        <article class="summary-card">
          <span class="summary-card__label">Contratos a vencer</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.contracts.expiring_in_thirty_days) }}
          </strong>
          <span class="summary-card__hint">Próximos 30 dias</span>
        </article>

        <router-link to="/wait-list" class="summary-card summary-card--link">
          <span class="summary-card__label">Lista de espera</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.wait_list.count) }}
          </strong>
          <span class="summary-card__hint">Pacientes aguardando vaga</span>
        </router-link>
      </div>

      <section class="card agenda-card">
        <div class="agenda-card__header">
          <div>
            <h2>Agenda de hoje</h2>
            <p>Próximos atendimentos pendentes</p>
          </div>
          <router-link to="/appointments" class="btn">Ver agenda</router-link>
        </div>

        <div v-if="!summary.next_appointments.length" class="agenda-card__empty">
          Nenhum atendimento pendente para hoje.
        </div>

        <ul v-else class="agenda-list">
          <li
            v-for="appointment in summary.next_appointments"
            :key="appointment.uuid"
            class="agenda-item"
          >
            <span class="agenda-item__time">{{ formatTime(appointment.date) }}</span>
            <div class="agenda-item__patient">
              <strong>{{ appointment.patient.name }}</strong>
              <span>{{ formatPresence(appointment.presence) }}</span>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <div v-else class="card">Não foi possível carregar o dashboard.</div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { api, authUser } from '../../composables/useApi.js'

const numberFormatter = new Intl.NumberFormat('pt-BR')
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'full',
})
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

const presenceLabels = {
  absent: 'Faltou',
  pending: 'Pendente',
  present: 'Realizado',
  present_to_receive: 'Presente - A receber',
}

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

export default {
  name: 'DashboardIndex',
  setup() {
    const summary = ref(null)
    const loading = ref(false)
    const greetingReference = ref(new Date())

    let requestId = 0

    const load = async () => {
      const currentRequest = ++requestId
      greetingReference.value = new Date()
      loading.value = true

      try {
        const response = await api.get('/api/dashboard/summary')

        if (currentRequest === requestId) {
          summary.value = response.data.data || null
        }
      } catch (error) {
        if (currentRequest === requestId) {
          summary.value = null
        }

        console.error(error)
      } finally {
        if (currentRequest === requestId) {
          loading.value = false
        }
      }
    }

    const greeting = computed(() => {
      const hour = greetingReference.value.getHours()

      if (hour < 12) return 'Bom dia'
      if (hour < 18) return 'Boa tarde'

      return 'Boa noite'
    })

    const userName = computed(() => {
      const name = typeof authUser.value?.name === 'string'
        ? authUser.value.name.trim()
        : ''

      if (!name) return 'Usuário'

      const firstName = name.split(/\s+/)[0]

      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
    })

    const currentDateLabel = computed(() => {
      const generatedAt = summary.value?.generated_at
      const date = generatedAt ? new Date(generatedAt) : new Date()

      return capitalize(dateFormatter.format(date))
    })
    const formatNumber = (value) => numberFormatter.format(Number(value) || 0)
    const formatPercent = (value) => `${percentFormatter.format(Number(value) || 0)}%`
    const formatTime = (value) => timeFormatter.format(new Date(value))
    const formatPresence = (value) => presenceLabels[value] || 'Pendente'

    onMounted(load)

    return {
      summary,
      loading,
      greeting,
      userName,
      currentDateLabel,
      load,
      formatNumber,
      formatPercent,
      formatTime,
      formatPresence,
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.summary-card--primary {
  border-color: var(--primary);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
}

.summary-card--link {
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s, transform 0.15s;
}

.summary-card--link:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
}

.summary-card--link:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.summary-card__label {
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
}

.summary-card__value {
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.1;
}

.summary-card__hint {
  color: var(--muted);
  font-size: 12px;
}

.summary-grid--secondary .summary-card {
  min-height: 96px;
}

.summary-grid--secondary .summary-card__value {
  font-size: clamp(22px, 3vw, 30px);
}

.agenda-card {
  margin-top: 4px;
}

.agenda-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.agenda-card__header h2 {
  margin: 0;
  font-size: 20px;
}

.agenda-card__header p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.agenda-card__empty {
  color: var(--muted);
  font-size: 14px;
  padding: 12px 0;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.agenda-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
}

.agenda-item__time {
  min-width: 56px;
  color: var(--primary);
  font-weight: 700;
  font-size: 15px;
}

.agenda-item__patient {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.agenda-item__patient span {
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 640px) {
  .page-hero .btn {
    width: 100%;
  }

  .agenda-card__header .btn {
    width: 100%;
  }
}
</style>
