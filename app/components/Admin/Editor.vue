<script setup>
import { useEditor, EditorContent, Extension } from '@tiptap/vue-3'
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Underline } from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'

import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Link as LinkIcon, 
  Image as ImageIcon, Quote, Undo, Redo,
  AlignCenter, AlignLeft, AlignRight, AlignJustify,
  Type, Palette
} from 'lucide-vue-next'

// Custom FontSize Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
    }
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({
      HTMLAttributes: {
        class: 'max-w-full rounded-sm shadow-md my-4 h-auto'
      }
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-[#01803d] font-bold underline decoration-2 underline-offset-4 cursor-pointer hover:text-[#016932]'
      }
    }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    FontSize
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// Watch for external content changes
watch(() => props.modelValue, (val) => {
  if (val !== editor.value?.getHTML()) {
    editor.value?.commands.setContent(val, false)
  }
})

const setLink = () => {
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('Masukkan URL:', previousUrl)

  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const addImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('image', file)
        
        const res = await $fetch('/api/v1/editor/upload', {
          method: 'POST',
          body: formData
        })
        
        if (res.url) {
          editor.value.chain().focus().setImage({ src: res.url }).run()
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('Gagal mengupload gambar. Pastikan file valid dan tidak terlalu besar.')
      }
    }
  }
  input.click()
}

const setFontSize = (size) => {
  if (size === 'default') {
    editor.value.chain().focus().unsetFontSize().run()
  } else {
    editor.value.chain().focus().setFontSize(size).run()
  }
}

const fontSizes = [
  { label: 'Kecil', value: '12px' },
  { label: 'Normal', value: 'default' },
  { label: 'Besar', value: '20px' },
  { label: 'Sangat Besar', value: '32px' },
]

const colors = [
  { name: 'Hijau Baznas', value: '#01803d' },
  { name: 'Kuning Baznas', value: '#fecb00' },
  { name: 'Hitam', value: '#1e293b' },
  { name: 'Merah', value: '#ef4444' },
  { name: 'Biru', value: '#3b82f6' },
]
</script>

<template>
  <div v-if="editor" class="editor-container bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
    <!-- Toolbar -->
    <div class="toolbar p-2 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-1 items-center sticky top-0 z-20">
      <!-- History -->
      <div class="flex items-center gap-1 pr-2 border-r border-slate-200 mr-1">
        <button @click="editor.chain().focus().undo().run()" class="p-1.5 rounded hover:bg-white hover:shadow-sm text-slate-500 transition-all"><Undo class="w-4 h-4" /></button>
        <button @click="editor.chain().focus().redo().run()" class="p-1.5 rounded hover:bg-white hover:shadow-sm text-slate-500 transition-all"><Redo class="w-4 h-4" /></button>
      </div>

      <!-- Basic Formatting -->
      <div class="flex items-center gap-1 pr-2 border-r border-slate-200 mr-1">
        <button 
          @click="editor.chain().focus().toggleBold().run()" 
          :class="{ 'bg-emerald-600 text-white shadow-md': editor.isActive('bold') }"
          class="p-1.5 rounded hover:bg-emerald-50 text-slate-600 transition-all"
        >
          <Bold class="w-4 h-4" />
        </button>
        <button 
          @click="editor.chain().focus().toggleItalic().run()" 
          :class="{ 'bg-emerald-600 text-white shadow-md': editor.isActive('italic') }"
          class="p-1.5 rounded hover:bg-emerald-50 text-slate-600 transition-all"
        >
          <Italic class="w-4 h-4" />
        </button>
        <button 
          @click="editor.chain().focus().toggleUnderline().run()" 
          :class="{ 'bg-emerald-600 text-white shadow-md': editor.isActive('underline') }"
          class="p-1.5 rounded hover:bg-emerald-50 text-slate-600 transition-all"
        >
          <UnderlineIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Font Size Dropdown -->
      <div class="flex items-center gap-1 pr-2 border-r border-slate-200 mr-1 relative group">
        <div class="flex items-center gap-1 p-1.5 rounded hover:bg-emerald-50 text-slate-600 cursor-pointer transition-all">
          <Type class="w-4 h-4" />
          <span class="text-[9px] font-black uppercase tracking-widest">Size</span>
        </div>
        <div class="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-sm py-1 hidden group-hover:block z-50 min-w-[120px]">
          <button 
            v-for="s in fontSizes" :key="s.value"
            @click="setFontSize(s.value)"
            class="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 hover:text-[#01803d]"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Alignment -->
      <div class="flex items-center gap-1 pr-2 border-r border-slate-200 mr-1">
        <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'text-[#01803d] bg-emerald-50': editor.isActive({ textAlign: 'left' }) }" class="p-1.5 rounded hover:bg-emerald-50 text-slate-600"><AlignLeft class="w-4 h-4" /></button>
        <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'text-[#01803d] bg-emerald-50': editor.isActive({ textAlign: 'center' }) }" class="p-1.5 rounded hover:bg-emerald-50 text-slate-600"><AlignCenter class="w-4 h-4" /></button>
        <button @click="editor.chain().focus().setTextAlign('right').run()" :class="{ 'text-[#01803d] bg-emerald-50': editor.isActive({ textAlign: 'right' }) }" class="p-1.5 rounded hover:bg-emerald-50 text-slate-600"><AlignRight class="w-4 h-4" /></button>
        <button @click="editor.chain().focus().setTextAlign('justify').run()" :class="{ 'text-[#01803d] bg-emerald-50': editor.isActive({ textAlign: 'justify' }) }" class="p-1.5 rounded hover:bg-emerald-50 text-slate-600"><AlignJustify class="w-4 h-4" /></button>
      </div>

      <!-- Colors -->
      <div class="flex items-center gap-1 pr-2 border-r border-slate-200 mr-1 relative group">
        <button class="p-1.5 rounded hover:bg-emerald-50 text-slate-600 flex items-center gap-1">
          <Palette class="w-4 h-4" />
        </button>
        <div class="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-sm p-2 hidden group-hover:grid grid-cols-5 gap-2 z-50">
          <button 
            v-for="c in colors" :key="c.value"
            @click="editor.chain().focus().setColor(c.value).run()"
            :style="{ backgroundColor: c.value }"
            class="w-5 h-5 rounded-full border border-slate-200 hover:scale-125 transition-transform shadow-sm"
            :title="c.name"
          ></button>
          <button @click="editor.chain().focus().unsetColor().run()" class="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-400">X</button>
        </div>
      </div>

      <!-- Lists & Others -->
      <div class="flex items-center gap-1 pr-2 border-r border-slate-200 mr-1">
        <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'text-[#01803d] bg-emerald-50': editor.isActive('bulletList') }" class="p-1.5 rounded hover:bg-emerald-50 text-slate-600"><List class="w-4 h-4" /></button>
        <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'text-[#01803d] bg-emerald-50': editor.isActive('orderedList') }" class="p-1.5 rounded hover:bg-emerald-50 text-slate-600"><ListOrdered class="w-4 h-4" /></button>
        <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'text-[#01803d] bg-emerald-50': editor.isActive('blockquote') }" class="p-1.5 rounded hover:bg-emerald-50 text-slate-600"><Quote class="w-4 h-4" /></button>
      </div>

      <!-- Link & Image -->
      <div class="flex items-center gap-1">
        <button 
          @click="setLink" 
          :class="{ 'bg-[#01803d] text-white shadow-md': editor.isActive('link') }"
          class="p-1.5 rounded hover:bg-emerald-50 text-slate-600 transition-all"
        >
          <LinkIcon class="w-4 h-4" />
        </button>
        <button @click="addImage" class="p-1.5 rounded hover:bg-emerald-50 text-slate-600 transition-all"><ImageIcon class="w-4 h-4" /></button>
      </div>
    </div>

    <!-- Editor Body -->
    <EditorContent :editor="editor" class="editor-content p-6 min-h-[400px] outline-none prose prose-slate max-w-none prose-emerald" />
  </div>
</template>

<style scoped>
.editor-content :deep(.tiptap) {
  min-height: 400px;
  outline: none;
}

.editor-content :deep(p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>
