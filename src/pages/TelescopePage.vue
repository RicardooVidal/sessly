<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../composables/useApi'

const message = ref('')
const router = useRouter()

onMounted(async () => {
  try {
    const token = localStorage.getItem('sessly:token')
    if (!token) {
      await router.replace('/login')
      return
    }

    const { data } = await api.post('/api/telescope-access', {}, {
      headers: { Authorization: `Bearer ${token}` },
      showToast: false,
      showLoading: false,
    })
    window.location.replace(data.url)
  } catch (error) {
    if ([401, 403].includes(error.response?.status)) {
      await router.replace('/login')
      return
    }
    message.value = 'Não foi possível acessar o Telescope. Tente novamente.'
  }
})
</script>

<template>
  <p v-if="message">{{ message }}</p>
</template>
