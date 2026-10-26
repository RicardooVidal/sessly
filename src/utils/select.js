export const genderOptions = [
      { value: '', label: 'Selecione' },
      { value: 'female', label: 'Feminino' },
      { value: 'male', label: 'Masculino' },
]

export const dayOptions = [
      { value: '', label: 'Selecione' },
      { value: 0, label: 'Segunda-feira' },
      { value: 1, label: 'Terça-feira' },
      { value: 2, label: 'Quarta-feira' },
      { value: 3, label: 'Quinta-feira' },
      { value: 4, label: 'Sexta-feira' },
      { value: 5, label: 'Sábado' },
      { value: 6, label: 'Domingo' },
]

export const loadPatients = async (api, patients, params = {}) => {
    try {
        const res = await api.get('/api/patient/select/get', {
            params: { active: 1, ...params },
        })
        patients.value = res.data.data || []
    } catch (e) {
        console.error(e)
    }
}

export const loadTypes = () => {
    return [
        {value: '', label: 'Selecione'},
        {value: 'daily', label: 'Diário'},
        {value: 'weekly', label: 'Semanal'},
        {value: 'bi-weekly', label: 'Quinzenal'},
        {value: 'monthly', label: 'Mensal'},
    ]
}

export const loadTimes = () => {
    return [
        {value: '', label: 'Selecione'},
        {value: '20', label: '20 Minutos'},
        {value: '30', label: '30 Minutos'},
        {value: '40', label: '40 Minutos'},
        {value: '50', label: '50 Minutos'},
        {value: '60', label: '60 Minutos'},
    ]
}

