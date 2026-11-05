<template>
  <div>
    <div class="page-hero">
      <h1>Financeiro</h1>
      <div class="period-switch" role="group" aria-label="Período do resumo">
        <button
          type="button"
          class="btn"
          :class="{ primary: period === 'week' }"
          :aria-pressed="period === 'week'"
          @click="setPeriod('week')"
        >
          Semana
        </button>
        <button
          type="button"
          class="btn"
          :class="{ primary: period === 'month' }"
          :aria-pressed="period === 'month'"
          @click="setPeriod('month')"
        >
          Mês
        </button>
      </div>
    </div>

    <div class="period-navigation card">
      <button type="button" class="btn" :disabled="loading" @click="navigate(-1)">
        Anterior
      </button>
      <div class="period-navigation__label">
        <strong>{{ periodLabel || 'Carregando...' }}</strong>
        <span>
          {{ period === 'week' ? 'Semana' : 'Mês' }}
          <template v-if="loading"> · atualizando...</template>
        </span>
      </div>
      <button type="button" class="btn" :disabled="loading" @click="navigate(1)">
        Próximo
      </button>
      <button type="button" class="btn" :disabled="loading" @click="goToToday">
        Atual
      </button>
    </div>

    <div v-if="loading && !summary" class="card">Carregando...</div>

    <template v-else-if="summary">
      <div class="summary-grid">
        <article class="summary-card summary-card--primary">
          <span class="summary-card__label">Atendimentos realizados</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.appointments_count) }}
          </strong>
          <span class="summary-card__hint">Consultas com presença confirmada</span>
        </article>

        <article class="summary-card summary-card--primary">
          <span class="summary-card__label">Valores Pagos</span>
          <strong class="summary-card__value">
            {{ formatCurrency(summary.paid_amount) }}
          </strong>
          <span class="summary-card__hint">Presenças pagas no período</span>
        </article>

        <article class="summary-card summary-card--primary">
          <span class="summary-card__label">Valores a Receber</span>
          <strong class="summary-card__value">
            {{ formatCurrency(summary.receivable_amount) }}
          </strong>
          <span class="summary-card__hint">Presentes aguardando pagamento</span>
        </article>
      </div>

      <div class="summary-grid summary-grid--secondary">
        <article class="summary-card">
          <span class="summary-card__label">Ticket médio</span>
          <strong class="summary-card__value">
            {{ formatCurrency(summary.average_ticket) }}
          </strong>
        </article>

        <article class="summary-card">
          <span class="summary-card__label">Pacientes atendidos</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.patients_count) }}
          </strong>
        </article>

        <article class="summary-card">
          <span class="summary-card__label">Faltas</span>
          <strong class="summary-card__value">
            {{ formatNumber(summary.absences_count) }}
          </strong>
        </article>

        <article class="summary-card">
          <span class="summary-card__label">Taxa de comparecimento</span>
          <strong class="summary-card__value">
            {{ formatPercent(summary.attendance_rate) }}
          </strong>
        </article>
      </div>
    </template>

    <div v-else class="card">Não foi possível carregar o resumo.</div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { api } from '../../composables/useApi.js'

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

const formatDateForApi = (value) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default {
  name: 'FinanceIndex',
  setup() {
    const period = ref('month')
    const referenceDate = ref(new Date())
    const summary = ref(null)
    const loading = ref(false)

    let requestId = 0

    const load = async () => {
      const currentRequest = ++requestId
      loading.value = true

      try {
        const response = await api.get('/api/finance/summary', {
          params: {
            period: period.value,
            date: formatDateForApi(referenceDate.value),
          },
        })

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

    const setPeriod = (value) => {
      if (period.value !== value) {
        period.value = value
      }
    }

    const navigate = (direction) => {
      const current = referenceDate.value

      if (period.value === 'month') {
        referenceDate.value = new Date(
          current.getFullYear(),
          current.getMonth() + direction,
          1,
        )

        return
      }

      const next = new Date(current)
      next.setDate(next.getDate() + direction * 7)
      referenceDate.value = next
    }

    const goToToday = () => {
      const today = new Date()

      if (formatDateForApi(referenceDate.value) === formatDateForApi(today)) {
        load()

        return
      }

      referenceDate.value = today
    }

    const periodLabel = computed(() => {
      if (!summary.value) {
        return ''
      }

      const startsAt = new Date(summary.value.starts_at)
      const endsAt = new Date(summary.value.ends_at)

      if (summary.value.period === 'month') {
        const label = startsAt.toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })

        return label.charAt(0).toUpperCase() + label.slice(1)
      }

      return `${startsAt.toLocaleDateString('pt-BR')} a ${endsAt.toLocaleDateString('pt-BR')}`
    })

    const formatNumber = (value) => numberFormatter.format(Number(value) || 0)
    const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0)
    const formatPercent = (value) => `${percentFormatter.format(Number(value) || 0)}%`

    watch([period, referenceDate], load)
    onMounted(load)

    return {
      period,
      summary,
      loading,
      periodLabel,
      setPeriod,
      navigate,
      goToToday,
      formatNumber,
      formatCurrency,
      formatPercent,
    }
  },
}
</script>

<style scoped>
.period-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.period-navigation {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.period-navigation__label {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 180px;
}

.period-navigation__label span {
  color: var(--muted);
  font-size: 12px;
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

@media (max-width: 640px) {
  .period-navigation .btn {
    flex: 1;
    min-height: 44px;
  }

  .period-navigation__label {
    order: -1;
    flex-basis: 100%;
  }
}
</style>
