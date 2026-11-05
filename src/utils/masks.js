export function maskCPF(value) {
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
maskCPF.maxlength = 14

export function maskCellphone(value) {
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
}
maskCellphone.maxlength = 15

export function maskMoney(value) {
    if (!value && value !== 0) return ''

    const str = String(value)

    let hasDecimal = false
    let integerRaw = str
    let decimalRaw = ''

    if (str.includes(',')) {
        hasDecimal = true
        const parts = str.split(',')
        integerRaw = parts.slice(0, -1).join('')
        decimalRaw = parts[parts.length - 1]
    } else if (str.includes('.')) {
        hasDecimal = true
        const lastDot = str.lastIndexOf('.')
        integerRaw = str.slice(0, lastDot)
        decimalRaw = str.slice(lastDot + 1)
    }

    integerRaw = integerRaw.replace(/\D/g, '')
    decimalRaw = decimalRaw.replace(/\D/g, '').slice(0, 2)

    if (integerRaw.length === 0 && decimalRaw.length === 0) return ''

    const integer = integerRaw.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    if (hasDecimal) {
        return `${integer},${decimalRaw}`
    }

    return integer
}
maskMoney.maxlength = 18

export function gender(value) {
    switch (value) {
        case 'male' :
            return 'Masculino'
        case 'female':
            return 'Feminino'
    }
}

export function bool(value) {
    if (value === 'true') {
        return 'SIM';
    }

    return 'NÃO';
}

export function date(value) {
    if (!value) return ''
    const d = new Date(value)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

export function download(value) {
    if (!value) return '';
    console.log(value);
    return '<a href=' + value + ' target="_blank">Download</a>';
}

export function type(value) {
    switch (value) {
        case 'daily':
            return 'Diário';
        case 'weekly':
            return 'Semanal';
        case 'bi-weekly':
            return 'Quinzenal';
        case 'monthly':
            return 'Mensal';
    }
}

export function presence(value) {
    switch (value) {
        case 'present':
            return 'Presente';
        case 'present_to_receive':
            return 'Presente - A receber';
        case 'pending':
            return 'Pendente';
        case 'absent':
            return 'Ausente';
    }
}


export function moneyReal(value) {
    return 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',');
}

export function unmask(value) {
    return value ? String(value).replace(/\D/g, '') : '';
}

export function unmaskMoney(value) {
    value = String(value).replace(/\./g, '').replace(',', '.');
    return parseFloat(value) || 0;
}
