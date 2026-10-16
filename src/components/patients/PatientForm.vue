<template>
  <div class="card">
    <form class="compact-form" @submit.prevent="submit">
      <BaseInput
        label="Nome"
        v-model="form.name"
        placeholder="Nome"
        required
        :error="form.errors.name"
        @blur="form.validate('name')"
      />
      <BaseInput
          label="CPF"
          v-model="form.document"
          placeholder="CPF"
          required
          :error="form.errors.document"
          :mask="maskCPF"
          @blur="form.validate('document')",
      />
      <BaseInput
        label="Email"
        v-model="form.email"
        type="email"
        placeholder="email@exemplo.com"
        required
        :error="form.errors.email"
        @blur="form.validate('email')"
      />
      <BaseInput
        label="Telefone"
        v-model="form.phone"
        placeholder="(XX) XXXXX-XXXX"
        required
        :error="form.errors.phone"
        :mask="maskCellphone"
        @blur="form.validate('phone')"
      />

      <BaseCheckbox
          v-model="form.active"
          label="Ativo"
          :error="form.errors.active"
      />

      <BaseSelect
        label="Sexo"
        v-model="form.gender"
        :options="genderOptions"
        :error="form.errors.gender"
        @blur="form.validate('gender')"
        required
      />

      <BaseSelect
        label="Tipo de consulta"
        v-model="form.type"
        :options="typeOptions"
        :error="form.errors.type"
        @blur="form.validate('type')"
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

      <BaseSelect
        label="Tempo de consulta"
        v-model="form.time"
        :options="timeOptions"
        :error="form.errors.time"
        @blur="form.validate('time')"
        required
      />

      <BaseInput
        label="Valor"
        v-model="form.value"
        placeholder="Valor"
        :error="form.errors.value"
        :mask="maskMoney"
        @blur="form.validate('value')"
      />

      <BaseCheckbox
          v-model="form.create_appointments"
          label="Criar consultas automaticamente"
          :error="form.errors.create_appointments"
      />

      <BaseCheckbox
          v-model="form.notify_appointment"
          label="Notificar pacientes sobre consultas"
          :error="form.errors.notify_appointment"
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

      <div class="form-actions">
        <button class="btn primary" type="submit" :disabled="form.processing">
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
import { maskCPF, maskCellphone, unmask } from '../../utils/masks.js'
import {maskMoney, unmaskMoney} from '../../utils/masks.js'
import { watch } from 'vue'
import BaseCheckbox from "../forms/BaseCheckbox.vue";
import {loadTimes, loadTypes} from "../../utils/select.js";
import {genderOptions, dayOptions} from "../../utils/select.js";

export default {
  components: {BaseCheckbox, BaseInput, BaseSelect },
  props: {
    modelValue: { type: Object, default: null },
    url: { type: String, default: '/api/patient' },
    method: { type: String, default: 'post' },
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const form = useForm(props.method, props.url, {
      uuid: '',
      name: '',
      document: '',
      phone: '',
      gender: '',
      email: '',
      active: true,
      create_appointments: true,
      notify_appointment: false,
      notes: '',
      type: '',
      time: '',
      value: 0,
      day: '',
    })

    const typeOptions = loadTypes();
    const timeOptions = loadTimes();

    const populateForm = (data) => {
      if (!data) return
      form.uuid = data.uuid || ''
      form.name = data.name || ''
      form.last_name = data.last_name || ''
      form.email = data.email || ''
      form.active = data.active || false
      form.create_appointments = data.create_appointments || false
      form.notify_appointment = data.notify_appointment || false
      form.document = maskCPF(data.document || '')
      form.phone = maskCellphone(data.phone || '')
      form.value = parseFloat(data.value).toFixed(2).replace('.', ',') || 0
      form.gender = data.gender || ''
      form.notes = data.notes || ''
      form.type = data.type || ''
      form.time = data.time || ''
      form.day = data.day !== undefined ? data.day : 0
    }

    watch(() => props.modelValue, (val) => populateForm(val), { immediate: true })

    const submit = () => {
      const originalDocument = form.document
      const originalPhone = form.phone
      const originalValue = form.value

      form.value = unmaskMoney(form.value)
      form.document = unmask(form.document)
      form.phone = unmask(form.phone)

      form.submit({
        onSuccess: () => {
          emit('save')
        },
        onError: (errors) => {
          form.value = originalValue
          form.document = originalDocument
          form.phone = originalPhone
          console.error('Validation errors:', errors)
        }
      }).catch((err) => {
        form.document = originalDocument
        form.phone = originalPhone
        form.value = originalValue
      })
    }

    return {
      form,
      genderOptions,
      dayOptions,
      submit,
      maskCPF,
      maskCellphone,
      maskMoney,
      typeOptions,
      timeOptions
    }
  },
}
</script>