<template>
  <div>
    <div class="page-hero">
      <h1>Nova consulta</h1>
    </div>

    <AppointmentForm url="/api/appointment" @save="onSave" @cancel="cancel" :patients="patients" />
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import PatientForm from '../../components/patients/PatientForm.vue'
import {onMounted, ref} from "vue";
import {loadPatients} from "../../utils/select.js";
import {api} from "../../composables/useApi.js";
import AppointmentForm from "../../components/appointments/AppointmentForm.vue";

export default {
  components: {AppointmentForm, PatientForm },
  setup() {
    const router = useRouter();
    const patients = ref();

    const onSave = () => {
      router.push('/appointments')
    }

    const cancel = () => router.push('/appointments')

    onMounted(() => loadPatients(api, patients, { exclude_wait_list: 1 }))

    return { onSave, cancel, patients }
  },
}
</script>
