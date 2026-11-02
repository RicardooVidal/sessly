<template>
  <div class="card">
    <form class="compact-form" @submit.prevent="submit">
      <h2 class="form-section-title">Empresa</h2>

      <BaseInput
        label="Identificador do schema"
        v-model="form.company"
        placeholder="ex: minha_empresa"
        required
        :disabled="isEdit"
        hint="Usado no comando app:tenant-migrations. Não pode ser alterado depois do cadastro."
        :error="form.errors.company"
      />
      <BaseInput
        label="Nome"
        v-model="form.name"
        placeholder="Razão social ou nome da empresa"
        required
        :error="form.errors.name"
      />
      <BaseInput
        label="E-mail"
        v-model="form.email"
        type="email"
        placeholder="contato@empresa.com"
        required
        :error="form.errors.email"
      />
      <BaseInput
        label="Documento"
        v-model="form.document"
        placeholder="CNPJ ou CPF"
        required
        :error="form.errors.document"
      />
      <BaseInput
        label="Contrato"
        v-model="form.contract"
        placeholder="Referência do contrato"
        :error="form.errors.contract"
      />
      <BaseInput
        label="Válido até"
        v-model="form.until"
        type="date"
        required
        :error="form.errors.until"
      />
      <BaseCheckbox
        label="Empresa ativa"
        v-model="form.active"
        :error="form.errors.active"
      />

      <h2 class="form-section-title">Usuário vinculado</h2>

      <template v-if="showUserFields">
        <BaseInput
          label="Nome do usuário"
          v-model="form.user_name"
          required
          :error="form.errors.user_name"
        />
        <BaseInput
          label="E-mail do usuário"
          v-model="form.user_email"
          type="email"
          required
          :error="form.errors.user_email"
        />
        <BaseInput
          label="Senha"
          v-model="form.user_password"
          type="password"
          :required="!isEdit"
          :hint="isEdit ? 'Deixe em branco para manter a senha atual.' : ''"
          :error="form.errors.user_password"
        />
        <BaseInput
          label="Confirmação da senha"
          v-model="form.user_password_confirmation"
          type="password"
          :required="!isEdit"
          :error="form.errors.user_password_confirmation"
        />
      </template>
      <p v-else class="user-note">
        O usuário root não pode ser editado por esta tela.
      </p>

      <div v-if="form.errors.migration" class="form-error">
        {{ form.errors.migration }}
      </div>

      <div class="form-actions">
        <button class="btn primary" type="submit" :disabled="form.processing">
          {{ form.processing ? 'Salvando...' : submitLabel }}
        </button>
        <button class="btn" type="button" @click="$emit('cancel')">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script>
import { computed, watch } from 'vue'
import { useForm } from 'laravel-precognition-vue'
import BaseInput from '../forms/BaseInput.vue'
import BaseCheckbox from '../forms/BaseCheckbox.vue'

export default {
  name: 'CompanyForm',
  components: { BaseInput, BaseCheckbox },
  props: {
    modelValue: { type: Object, default: null },
    url: { type: String, required: true },
    method: { type: String, default: 'post' },
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const isEdit = computed(() => props.method !== 'post')

    const form = useForm(props.method, props.url, {
      company: '',
      name: '',
      email: '',
      document: '',
      contract: '',
      until: '',
      active: true,
      user_name: '',
      user_email: '',
      user_password: '',
      user_password_confirmation: '',
    })

    const populateForm = (data) => {
      if (!data) return

      form.company = data.company || ''
      form.name = data.name || ''
      form.email = data.email || ''
      form.document = data.document || ''
      form.contract = data.contract || ''
      form.until = String(data.until || '').slice(0, 10)
      form.active = data.active ?? true
      form.user_name = data.user?.name || ''
      form.user_email = data.user?.email || ''
      form.user_password = ''
      form.user_password_confirmation = ''
    }

    watch(() => props.modelValue, populateForm, { immediate: true })

    const showUserFields = computed(() => !isEdit.value || !!props.modelValue?.user)
    const submitLabel = computed(() => (isEdit.value ? 'Salvar' : 'Cadastrar e migrar'))

    const submit = () => {
      form.submit({
        onSuccess: () => emit('save'),
        onError: (errors) => console.error('Validation errors:', errors),
      }).catch(console.error)
    }

    return { form, isEdit, showUserFields, submitLabel, submit }
  },
}
</script>

<style scoped>
.form-section-title {
  flex: 0 0 100%;
  margin: 8px 0 0;
  font-size: 16px;
  color: var(--text);
}

.form-section-title:not(:first-child) {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.user-note {
  flex: 0 0 100%;
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.form-error {
  flex: 0 0 100%;
  padding: 10px 12px;
  border: 1px solid var(--danger-border, var(--error));
  border-radius: 8px;
  background: var(--danger-bg, rgba(239, 68, 68, 0.1));
  color: var(--danger, var(--error));
  font-size: 13px;
}
</style>
