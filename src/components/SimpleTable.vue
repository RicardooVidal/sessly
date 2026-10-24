<template>
  <div class="dt-wrapper">
    <label class="mobile-sort">
      Ordenar por
      <select v-model="sortColumn" @change="sortRows">
        <option v-for="(column, index) in columns" :key="column.key" :value="index">{{ column.label }}</option>
      </select>
      <button type="button" @click="toggleSort" :aria-label="sortDirection === 'asc' ? 'Ordenar decrescente' : 'Ordenar crescente'">{{ sortDirection === 'asc' ? 'Crescente ↑' : 'Decrescente ↓' }}</button>
    </label>
    <table ref="tableRef" class="display"></table>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import 'datatables.net-dt/css/jquery.dataTables.css'

export default {
  props: {
    data: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    actions: { type: Array, default: () => [] },
    perPage: { type: Number, default: 10 },
    selectable: { type: Boolean, default: false },
    height: { type: String, default: '400px' },
  },
  emits: ['row-click', 'action-click'],
  setup(props, { emit }) {
    const router = useRouter()
    const tableRef = ref(null)
    const sortColumn = ref(0)
    const sortDirection = ref('asc')
    const sortRows = () => dt?.order([Number(sortColumn.value), sortDirection.value]).draw()
    const toggleSort = () => {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      sortRows()
    }
    let dt = null
    let $ = null
    let disposed = false
    const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[char]))

    const initTable = async () => {
      const jq = (await import('jquery')).default
      window.$ = window.jQuery = jq
      $ = jq

      const DataTableLib = (await import('datatables.net-dt')).default

      if (disposed || !tableRef.value) return
      if (dt) {
        dt.clear().rows.add(props.data).draw(false)
        return
      }

      const columns = props.columns.map(col => ({
        title: col.label,
        data: col.key,
        defaultContent: '',
        render: (value) => {
          if (value == null) return ''
          return typeof col.mask === 'function' ? col.mask(String(value)) : escapeHtml(value)
        },
      }))

      if (props.actions.length > 0) {
        columns.push({
          title: 'Ações',
          data: null,
          orderable: false,
          className: 'actions-cell',
          searchable: false,
          render: function(data, type, row) {
            if (type !== 'display') return ''
            return '<div class="table-actions">' + props.actions.map((action, index) => {
              if (action.redirectLink && !row[action.redirectLink]) return ''
              const tone = action.type === 'delete' ? 'danger' : 'default'
              return `<button type="button" class="table-action table-action--${tone}" data-action="${index}">${escapeHtml(action.label || action.type)}</button>`
            }).join('') + '</div>'
          }
        })
      }

      const options = {
        columns,
        data: props.data,
        autoWidth: false,
        createdRow: (row) => {
          Array.from(row.cells).forEach((cell, index) => {
            cell.dataset.label = props.columns[index]?.label || 'Ações'
          })
        },
        paging: true,
        pageLength: props.perPage,
        lengthMenu: [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, 'Todos']],
        language: {
          search: 'Buscar:',
          lengthMenu: 'Mostrar _MENU_ registros',
          info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
          emptyTable: 'Nenhum registro disponível',
          zeroRecords: 'Nenhum resultado encontrado para esta busca',
          infoEmpty: 'Nenhum registro',
          infoFiltered: '(filtrado de _MAX_ registros)',
          searchPlaceholder: 'Pesquisar registros...',
          paginate: { next: 'Próxima', previous: 'Anterior', first: 'Primeira', last: 'Última' }
        },
        dom: 'lfrtip',
      }

      dt = new DataTableLib(tableRef.value, options)

      dt.on('click', 'tbody tr', function(event) {
        if (event.target.closest('button, a, input, select')) return
        const rowData = dt.row(this).data()
        if (rowData && props.selectable) {
          emit('row-click', rowData)
        }
      })

      $(tableRef.value).on('click', '.table-action', function(e) {
        e.preventDefault()
        e.stopPropagation()
        const action = props.actions[Number(this.dataset.action)]
        const row = dt.row($(this).closest('tr')).data()
        if (!action || !row) return
        if (action.redirectLink) {
          const target = new URL(row[action.redirectLink], window.location.origin)
          if (['https:', 'http:'].includes(target.protocol)) {
            window.open(target.href, '_blank', 'noopener,noreferrer')
          }
          return
        }
        const url = action.url?.replace('{uuid}', encodeURIComponent(row.uuid))
        if (action.type === 'delete') {
          emit('action-click', { url, row })
        } else if (url) {
          router.push(url)
        }
      })
    }

    onMounted(() => {
      nextTick(() => {
        initTable()
      })
    })

    onUnmounted(() => {
      disposed = true
      if ($ && tableRef.value) $(tableRef.value).off('click', '.table-action')
      if (dt) {
        dt.destroy()
        dt = null
      }
    })


    watch(() => props.data, () => {
      nextTick(() => {
        initTable()
      })
    }, { deep: true })

    return { tableRef, sortColumn, sortDirection, sortRows, toggleSort }
  }
}
</script>

<style scoped>
.mobile-sort { display: none; }
.mobile-sort select, .mobile-sort button { min-height: 44px; padding: 8px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface); color: var(--text); font: inherit; min-width: 0; max-width: 100%; }
.mobile-sort select { flex: 1; }
.mobile-sort button { cursor: pointer; }

.dt-wrapper { width: 100%; min-width: 0; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
:deep(table.dataTable) { width: 100% !important; table-layout: fixed; border-collapse: collapse; margin: 16px 0 !important; }
:deep(table.dataTable th), :deep(table.dataTable td) { white-space: normal; overflow-wrap: anywhere; padding: 12px 10px; vertical-align: middle; text-align: left; }
:deep(table.dataTable th) { background: var(--surface-muted); font-size: 12px; color: var(--muted); }
:deep(table.dataTable td) { font-size: 14px; border-bottom: 1px solid var(--border); }
:deep(table.dataTable tbody tr:hover) { background: var(--surface-muted); }
:deep(.table-actions) { display: flex; flex-wrap: wrap; gap: 6px; }
:deep(.table-action) { display: inline-flex; align-items: center; justify-content: center; min-height: 36px;border: 1px solid var(--border); border-radius: 7px; background: var(--surface); color: var(--primary); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; max-width: 100%; }
:deep(.table-action:hover) { background: var(--surface-hover); }
:deep(.table-action--danger) { color: var(--danger); border-color: var(--danger-border); }
:deep(.table-action--danger:hover) { background: var(--danger-bg); }
:deep(button:focus-visible), :deep(input:focus-visible), :deep(select:focus-visible) { outline: 2px solid var(--primary); outline-offset: 2px; }
:deep(:is(.dataTables_filter, .dt-search) input), :deep(:is(.dataTables_length, .dt-length) select) { border: 1px solid var(--border); border-radius: 7px; padding: 8px; max-width: 100%; background: var(--surface); }
:deep(:is(.dataTables_filter, .dt-search)), :deep(:is(.dataTables_length, .dt-length)), :deep(:is(.dataTables_info, .dt-info)), :deep(:is(.dataTables_paginate, .dt-paging)) { font-size: 13px; margin-bottom: 10px; }
:deep(:is(.dataTables_paginate, .dt-paging)) { display: flex; flex-wrap: wrap; justify-content: flex-end; }
:deep(:is(.dataTables_paginate, .dt-paging) span) { display: flex; flex-wrap: wrap; }
:deep(:is(.dataTables_paginate, .dt-paging) :is(.paginate_button, .dt-paging-button)) { border-radius: 6px !important; padding: 7px 10px !important; }
@media (max-width: 1100px) {
  .mobile-sort { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 13px; }
  .dt-wrapper { padding: 12px; }
  :deep(table.dataTable thead) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  :deep(table.dataTable), :deep(table.dataTable tbody) { display: block; width: 100%; }
  :deep(table.dataTable tbody tr) { display: block; margin-bottom: 12px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface); }
  :deep(table.dataTable tbody td) { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 3fr); gap: 12px; padding: 10px 0; width: 100% !important; box-shadow: none !important; }
  :deep(table.dataTable tbody td::before) { content: attr(data-label); font-size: 12px; font-weight: 600; color: var(--muted); }
  :deep(table.dataTable tbody td:last-child) { border-bottom: 0; }
  :deep(table.dataTable tbody td.dataTables_empty), :deep(table.dataTable tbody td.dt-empty) { display: block; text-align: center; }
  :deep(.table-action) { min-height: 44px; }
}
@media (max-width: 600px) {
  :deep(:is(.dataTables_filter, .dt-search)), :deep(:is(.dataTables_length, .dt-length)), :deep(:is(.dataTables_info, .dt-info)), :deep(:is(.dataTables_paginate, .dt-paging)) { float: none; text-align: left; width: 100%; }
  :deep(:is(.dataTables_filter, .dt-search) label) { display: flex; align-items: center; gap: 8px; }
  :deep(:is(.dataTables_filter, .dt-search) input) { flex: 1; min-width: 0; width: 100%; }
  :deep(:is(.dataTables_paginate, .dt-paging)) { justify-content: center; }
  :deep(table.dataTable tbody td.actions-cell) { display: block; }
  :deep(td.actions-cell::before) { display: block; margin-bottom: 8px; }
  :deep(.table-actions) { gap: 8px; }
  :deep(.table-action) { flex: 1; }
}
</style>
