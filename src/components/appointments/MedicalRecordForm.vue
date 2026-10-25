<template>
  <section class="medical-record" :aria-busy="busy">
    <h2>Prontuário</h2>
    <div v-if="busy" class="medical-record-loading" role="status">
      <span class="medical-record-spinner" aria-hidden="true"></span>
      {{ importing ? 'Importando prontuário...' : 'Carregando prontuário...' }}
    </div>
    <div :inert="busy">
      <span>Importar prontuário: </span>
      <div id="button-import-medical-record" class="btn">
        <input
          ref="docxInput"
          type="file"
          accept=".docx"
          :disabled="busy"
          @change="importDocx"
        />
      </div>
      <div class="editor-wrapper" v-if="editor">

        <div class="toolbar">
          <button
            type="button"
            :class="{ active: editor.isActive('bold') }"
            @click="editor.chain().focus().toggleBold().run()"
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            :class="{ active: editor.isActive('italic') }"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            <em>I</em>
          </button>

          <button
            type="button"
            :class="{ active: editor.isActive('underline') }"
            @click="editor.chain().focus().toggleUnderline().run()"
          >
            <u>U</u>
          </button>

          <select @change="changeHeading($event)">
            <option value="paragraph">Normal</option>
            <option value="1">Título 1</option>
            <option value="2">Título 2</option>
            <option value="3">Título 3</option>
          </select>

          <select @change="changeFont($event)">
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>

          <button
            type="button"
            @click="editor.chain().focus().toggleBulletList().run()"
          >
            • Lista
          </button>

          <button
            type="button"
            @click="editor.chain().focus().toggleOrderedList().run()"
          >
            1. Lista
          </button>

          <button
            type="button"
            title="Diminuir recuo"
            @click="editor.chain().focus().decreaseIndent().run()"
          >
            ←
          </button>

          <button
            type="button"
            title="Aumentar recuo"
            @click="editor.chain().focus().increaseIndent().run()"
          >
            →
          </button>

          <button
            type="button"
            title="Alinhar à esquerda"
            aria-label="Alinhar à esquerda"
            :class="{ active: editor.isActive({ textAlign: 'left' }) }"
            @click="editor.chain().focus().setTextAlign('left').run()"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M3 5h18M3 9h12M3 13h18M3 17h12" />
            </svg>
          </button>

          <button
            type="button"
            title="Centralizar"
            aria-label="Centralizar"
            :class="{ active: editor.isActive({ textAlign: 'center' }) }"
            @click="editor.chain().focus().setTextAlign('center').run()"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M3 5h18M6 9h12M3 13h18M6 17h12" />
            </svg>
          </button>

          <button
            type="button"
            title="Alinhar à direita"
            aria-label="Alinhar à direita"
            :class="{ active: editor.isActive({ textAlign: 'right' }) }"
            @click="editor.chain().focus().setTextAlign('right').run()"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M3 5h18M9 9h12M3 13h18M9 17h12" />
            </svg>
          </button>

          <button
            type="button"
            @click="editor.chain().focus().undo().run()"
          >
            ↶
          </button>

          <button
            type="button"
            @click="editor.chain().focus().redo().run()"
          >
            ↷
          </button>

          <button
            type="button"
            class="insert-date"
            :disabled="busy"
            @click="appendAppointmentDate"
          >
            Inserir data da consulta
          </button>
        </div>

        <editor-content :editor="editor" />

      </div>
    </div>
  </section>
</template>

<script>
import { computed, ref } from 'vue'
import { Indent } from './extensions/Indent'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import { api } from '../../composables/useApi'
import { notify } from '../../composables/useToastr.js'

export default {
  components: {
    EditorContent,
  },

  props: {
    loading: { type: Boolean, default: false },
    appointmentDate: {
      type: String,
      default: '',
    },
    modelValue: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    const importing = ref(false)
    const busy = computed(() => props.loading || importing.value)

    const importDocx = async (event) => {
      if (busy.value) return
      if (!confirm('ATENÇÃO: Deseja importar o prontuário do arquivo? Isso substituirá o conteúdo atual.')) {
        return
      }

      const file = event.target.files[0]

      if (!file) {
        return
      }

      const formData = new FormData()

      formData.append('file', file)

      importing.value = true
      emit('importing', true)
      try {
        const response = await api.post(
          '/api/medical-record/import',
          formData,
          {
            showLoading: false,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )

        emit('update:modelValue', response.data.content)
      } catch (error) {
        console.error(error)
      } finally {
        importing.value = false
        emit('importing', false)
        event.target.value = ''
      }
    } 

    return {
      importDocx,
      importing,
      busy,
    }
  },

  emits: ['update:modelValue', 'importing'],

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        FontFamily,
        Indent,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ],

      content: this.modelValue,
      editable: !this.busy,

      onUpdate: ({ editor }) => {
        this.$emit('update:modelValue', editor.getHTML())
      },
    })
  },

  beforeUnmount() {
    this.editor?.destroy()
  },

  methods: {
    changeHeading(event) {
      const value = event.target.value

      if (value === 'paragraph') {
        this.editor.chain().focus().setParagraph().run()
        return
      }

      this.editor
        .chain()
        .focus()
        .toggleHeading({ level: Number(value) })
        .run()
    },

    changeFont(event) {
      this.editor
        .chain()
        .focus()
        .setFontFamily(event.target.value)
        .run()
    },

    appendAppointmentDate() {
      if (this.busy || !this.editor) {
        return
      }

      if (!this.appointmentDate) {
        notify('Selecione a data da consulta antes de inseri-la no prontuário', 'info')
        return
      }

      const date = new Date(this.appointmentDate)

      if (Number.isNaN(date.getTime())) {
        return
      }

      const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)

      this.editor
        .chain()
        .insertContentAt(this.editor.state.doc.content.size, [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Consulta em ${formattedDate}`,
                marks: [{ type: 'bold' }],
              },
            ],
          },
          { type: 'horizontalRule' },
          { type: 'paragraph' },
        ])
        .focus('end')
        .run()
    },
  },

  watch: {
    busy(value) {
      this.editor?.setEditable(!value)
    },
    modelValue(value) {
      if (!this.editor) {
        return
      }

      const isSame = this.editor.getHTML() === value

      if (isSame) {
        return
      }

      this.editor.commands.setContent(value)
    },
  },
}
</script>

<style>
.medical-record-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 10px;
  color: var(--primary);
  background: var(--surface-muted);
  border-radius: 6px;
}

.medical-record [inert] {
  opacity: 0.5;
}

.medical-record-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: medical-record-spin 0.8s linear infinite;
}

@keyframes medical-record-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .medical-record-spinner { animation: none; }
}

.editor-wrapper {
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.toolbar {
  display: block;
  gap: 1px;
  align-items: left;
  flex-wrap: wrap;
  padding: 8px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-muted);
}

.toolbar button {
  border: 0;
  background: transparent;
  padding: 6px 9px;
  cursor: pointer;
  border-radius: 4px;
}

.toolbar button:hover {
  background: var(--surface-hover);
}

.toolbar button.active {
  background: var(--border);
}

.toolbar button svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  vertical-align: middle;
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar .insert-date {
  margin-left: 8px;
  border: 1px solid var(--border);
}

.toolbar select {
  margin: 5px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 4px;
}

.tiptap {
  min-height: 400px;
  padding: 20px;
  outline: none;
}

#button-import-medical-record {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--primary);
  color: var(--on-primary);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin: 10px;
}
</style>