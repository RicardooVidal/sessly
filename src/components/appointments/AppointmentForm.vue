<template>
  <div class="card">
    <form class="compact-form" @submit.prevent="submit">
      <SelectSearch
          label="Paciente"
          :options="patientOptions"
          v-model="form.patient.uuid"
          placeholder="Pesquisar..."
          :error="form.errors.patient"
          :disabled="isEditing"
          :hint="isEditing ? 'Paciente não pode ser alterado após a criação.' : ''"
          required
      />
      <BaseSelect
        label="Dia da consulta"
        v-model="form.day"
        :options="dayOptions"
        :error="form.errors.day"
        @blur="form.validate('day')"
        required
      />
      <DatePicker
        id="appointment-date"
        label="Data"
        v-model="form.date"
        :disabled-dates="isDateDisabled"
        :error="form.errors.date"
        :hint="dateHint"
        required
        @update:model-value="form.validate('date')"
      />
      <BaseInput
        label="Valor"
        v-model="form.value"
        placeholder="Valor"
        required
        :error="form.errors.value"
        :mask="maskMoney"
        @blur="form.validate('value')"
      />
      <BaseSelect
        label="Presença"
        v-model="form.presence"
        :options="presenceOptions"
        :error="form.errors.presence"
        @blur="form.validate('presence')"
        required
      />

      <label class="form-row">
        <span class="label-text">Observações</span>
        <textarea
          v-model="form.notes"
          class="base-input"
          rows="3"
        ></textarea>
        <small v-if="form.errors.notes" class="error">{{ form.errors.notes }}</small>
      </label>

      <div class="form-section">
        <MedicalRecordForm
          v-model="form.medical_record"
          :appointment-date="form.date"
          :loading="loadingMedicalRecord"
          @importing="importingMedicalRecord = $event"
        />
      </div>

      <div class="form-actions">
        <button class="btn primary" type="submit" :disabled="form.processing || loadingMedicalRecord || importingMedicalRecord">
          {{ form.processing ? 'Salvando...' : 'Salvar' }}
        </button>
        <button class="btn" type="button" @click="$emit('cancel')">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script>
import BaseInput from '../forms/BaseInput.vue'
import BaseSelect from '../forms/BaseSelect.vue'
import { useForm } from 'laravel-precognition-vue'
import {maskMoney, unmaskMoney} from '../../utils/masks.js'
import {computed, ref, watch} from 'vue'
import DatePicker from '../forms/DatePicker.vue'
import BaseCheckbox from "../forms/BaseCheckbox.vue";
import SelectSearch from "../SelectSearch.vue";
import MedicalRecordForm from './MedicalRecordForm.vue'
import { api } from '../../composables/useApi.js'
import {genderOptions, dayOptions} from "../../utils/select.js";
import { notify } from '../../composables/useToastr.js'

export default {
  components: {DatePicker, SelectSearch, BaseCheckbox, BaseInput, BaseSelect, MedicalRecordForm },
  props: {
    patients: { type: Array, default: () => [] },
    modelValue: { type: Object, default: null },
    url: { type: String, default: '/api/appointment' },
    method: { type: String, default: 'post' },
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const loadPatientOptions = ref(true);
    const isEditing = computed(() => String(props.method).toLowerCase() === 'put')
    const formatMoneyValue = (value) => {
      const parsed = Number(value)
      return maskMoney((Number.isFinite(parsed) ? parsed : 0).toFixed(2))
    }

    const form = useForm(props.method, props.url, {
      uuid: '',
      patient: {uuid: ''},
      date: '',
      day: '',
      value: formatMoneyValue(0),
      presence: 'pending',
      notes: '',
      medical_record: '',
    })

    const selectedWeekday = computed(() => {
      if (form.day === '' || form.day == null) return null
      const day = Number(form.day)
      return Number.isInteger(day) && day >= 0 && day <= 6 ? (day + 1) % 7 : null
    })

    const isDateDisabled = (date) => selectedWeekday.value !== null
      && date.getDay() !== selectedWeekday.value

    const dateHint = computed(() => {
      const option = dayOptions.find(option => option.value !== '' && Number(option.value) === Number(form.day))
      return selectedWeekday.value === null
        ? 'Selecione o dia da consulta para filtrar as datas.'
        : `Datas disponíveis: ${option?.label.toLowerCase()}.`
    })

    watch(() => form.day, () => {
      if (form.date && isDateDisabled(new Date(form.date))) {
        form.date = ''
      }
    })

    const loadingMedicalRecord = ref(false)
    const importingMedicalRecord = ref(false)

    const populateForm = async (data) => {
      if (!data) {
        return
      }
      loadPatientOptions.value = false;
      const date = data.date ? new Date(data.date) : null
      const pad = (value) => String(value).padStart(2, '0')

      form.uuid = data.uuid || ''
      form.patient.uuid = data.patient.uuid || ''
      form.date = date && !Number.isNaN(date.getTime())
        ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
        : ''
      form.value = formatMoneyValue(data.value)
      form.presence = data.presence || ''
      form.notes = data.notes || ''
      form.day = data.day || ''

      loadMedicalRecord();
    }

    const loadMedicalRecord = async () => {
      if (!form.patient.uuid) {
        form.medical_record = ''
        return
      }

      loadingMedicalRecord.value = true
      try {
        const response = await api.get(`/api/medical-record/get-by-patient/${form.patient.uuid}`, { showLoading: false })
        form.medical_record = response.data.content
          ? new TextDecoder().decode(
              Uint8Array.from(atob(response.data.content), char => char.charCodeAt(0))
            )
          : ''
      } catch (error) {
        console.log(error.message);
        console.error('Error loading medical record:', error)
        form.medical_record = ''
      } finally {
        loadingMedicalRecord.value = false
      }
    }

    const loadPatientOptionsForAppointment = () => {
      if (!form.patient.uuid || !loadPatientOptions.value) {
        return
      }

      const selectedPatient = props.patients.find(p => p.uuid === form.patient.uuid)
      if (!selectedPatient) {
        notify('Paciente não encontrado', 'error')
        return
      }

      api.get(`/api/patient/options-appointments/get/${selectedPatient.uuid}`, { showLoading: false })
        .then(response => {
          const responseData = response.data.data || []
          if (responseData.length === 0) {
            return;  
          }

          form.value = formatMoneyValue(responseData.value)
          form.day = responseData.day
        })
        .catch(error => {
          notify('Não foi possível carregar os dados do paciente', 'error')
        })
    }

    const submit = () => {
      if (loadingMedicalRecord.value || importingMedicalRecord.value) return

      const originalValue = form.value

      form.value = unmaskMoney(form.value)
      const bytes = new TextEncoder().encode(form.medical_record || '')

      const encodedMedicalRecord = btoa(
        Array.from(bytes, byte => String.fromCharCode(byte)).join('')
      )

      form.submit({
        data: { medical_record: encodedMedicalRecord },
        onSuccess: () => {
          emit('save')
        },
        onError: (errors) => {
          form.value = originalValue
          console.error('Validation errors:', errors)
        }
      }).catch((err) => {
        form.value = originalValue
      })
    }

    const presenceOptions = [
      { value: '', label: 'Selecione' },
      { value: 'pending', label: 'Pendente' },
      { value: 'present', label: 'Presente' },
      { value: 'absent', label: 'Ausente' },
    ]

    const patientOptions = computed(() => {
      const options = (props.patients || []).map(p => ({ value: p.uuid, label: p.name }))
      const currentPatient = props.modelValue?.patient

      if (currentPatient?.uuid && !options.some(option => option.value === currentPatient.uuid)) {
        options.unshift({
          value: currentPatient.uuid,
          label: currentPatient.name || currentPatient.uuid,
        })
      }

      return options
    })

    watch(() => props.modelValue, (val) => populateForm(val), { immediate: true })

    watch(() => form.patient.uuid, (newUuid) => {
      if (newUuid) {
        loadPatientOptionsForAppointment()
      }
    })


    return {
      form,
      isEditing,
      isDateDisabled,
      dateHint,
      submit,
      loadMedicalRecord,
      loadingMedicalRecord,
      importingMedicalRecord,
      patientOptions,
      presenceOptions,
      maskMoney,
      genderOptions,
      dayOptions
    }
  },
}
</script>
