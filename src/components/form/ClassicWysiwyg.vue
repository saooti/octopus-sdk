<template>
  <div class="wysiwyg-editor">
    <div v-if="editor" class="editor-menubar">
      <button
        :title="$t('Bold')"
        data-selenium="Bold"
        :class="{ 'is-active': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <svg>
          <path
            transform="translate(8, 8)"
            d="M17.194 10.962A6.271 6.271 0 0012.844.248H4.3a1.25 1.25 0 000 2.5h1.013a.25.25 0 01.25.25V21a.25.25 0 01-.25.25H4.3a1.25 1.25 0 100 2.5h9.963a6.742 6.742 0 002.93-12.786zm-4.35-8.214a3.762 3.762 0 010 7.523H8.313a.25.25 0 01-.25-.25V3a.25.25 0 01.25-.25zm1.42 18.5H8.313a.25.25 0 01-.25-.25v-7.977a.25.25 0 01.25-.25h5.951a4.239 4.239 0 010 8.477z"
          />
        </svg>
      </button>
      <button
        :title="$t('Italic')"
        data-selenium="Italic"
        :class="{ 'is-active': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <svg>
          <path
            transform="translate(8, 8)"
            d="M22.5.248h-7.637a1.25 1.25 0 000 2.5h1.086a.25.25 0 01.211.384L4.78 21.017a.5.5 0 01-.422.231H1.5a1.25 1.25 0 000 2.5h7.637a1.25 1.25 0 000-2.5H8.051a.25.25 0 01-.211-.384L19.22 2.98a.5.5 0 01.422-.232H22.5a1.25 1.25 0 000-2.5z"
          />
        </svg>
      </button>
      <button
        :title="$t('Underline')"
        data-selenium="Underline"
        :class="{ 'is-active': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <svg>
          <path
            transform="translate(8, 8)"
            d="M22.5 21.248h-21a1.25 1.25 0 000 2.5h21a1.25 1.25 0 000-2.5zM1.978 2.748h1.363a.25.25 0 01.25.25v8.523a8.409 8.409 0 0016.818 0V3a.25.25 0 01.25-.25h1.363a1.25 1.25 0 000-2.5H16.3a1.25 1.25 0 000 2.5h1.363a.25.25 0 01.25.25v8.523a5.909 5.909 0 01-11.818 0V3a.25.25 0 01.25-.25H7.7a1.25 1.25 0 100-2.5H1.978a1.25 1.25 0 000 2.5z"
          />
        </svg>
      </button>
      <button
        :title="$t('Link')"
        data-selenium="link"
        :class="{ 'is-active': editor.isActive('link') }"
        @click="setLink"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path
            transform="translate(2, 2)scale(0.8)"
            d="M7.7574 10.5858L4.92897 13.4142C3.7574 14.5858 3.7574 16.4853 4.92897 17.6569L6.34319 19.0711C7.51476 20.2427 9.41425 20.2427 10.5858 19.0711L13.4143 16.2427M9.87873 14.1214L14.1214 9.87873M10.5858 7.7574L13.4142 4.92897C14.5858 3.7574 16.4853 3.7574 17.6569 4.92897L19.0711 6.34319C20.2427 7.51476 20.2427 9.41425 19.0711 10.5858L16.2427 13.4143"
            stroke="#000000"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        :title="$t('Delete link')"
        data-selenium="unlink"
        :disabled="!editor.isActive('link')"
        @click="editor.chain().focus().unsetLink().run()"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path
            transform="translate(2, 2)scale(0.8)"
            d="M7.05029 11.2929L4.92897 13.4142C3.7574 14.5858 3.7574 16.4853 4.92897 17.6568L6.34319 19.0711C7.51476 20.2426 9.41425 20.2426 10.5858 19.0711L12.7071 16.9497M5.00004 5L19 19"
            stroke="#000000"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            transform="translate(2, 2)scale(0.8)"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.8358 10.75L9.17156 13.4142C8.78103 13.8048 8.78103 14.4379 9.17156 14.8284C9.56208 15.219 10.1952 15.219 10.5858 14.8284L13.25 12.1642L11.8358 10.75ZM17.4926 13.5785L16.0784 12.1643L16.2426 12L17.6568 10.5858L18.3639 9.87872C19.145 9.09767 19.145 7.83134 18.3639 7.05029L16.9497 5.63608C16.1687 4.85503 14.9024 4.85503 14.1213 5.63608L13.4142 6.34319L12 7.7574L11.8358 7.92161L10.4216 6.5074L10.5858 6.34319L12 4.92897L12.7071 4.22187C14.2692 2.65977 16.8019 2.65977 18.3639 4.22187L19.7782 5.63608C21.3403 7.19818 21.3403 9.73084 19.7782 11.2929L19.0711 12L17.6568 13.4143L17.4926 13.5785ZM13.25 9.33581L13.4142 9.1716C13.8047 8.78107 14.4379 8.78107 14.8284 9.1716C15.2189 9.56212 15.2189 10.1953 14.8284 10.5858L14.6642 10.75L13.25 9.33581Z"
            fill="#000000"
          />
        </svg>
      </button>
      <button
        :title="$t('Heading3')"
        data-selenium="Heading3"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>
      <button
        :title="$t('Heading4')"
        data-selenium="Heading4"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
      >
        H4
      </button>
      <button
        :title="$t('Line break')"
        data-selenium="lineBreak"
        @click="editor.chain().focus().setHardBreak().run()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M18 6v6H7.83l2.58-2.59L9 8l-5 5l5 5l1.41-1.41L7.83 14H20V6h-2Z"
          />
        </svg>
      </button>

      <button
        :title="$t('UnorderedList')"
        data-selenium="UnorderedList"
        class="saooti-ul"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <svg>
          <circle transform="translate(8, 8)" cx="2.5" cy="3.998" r="2.5" />
          <path
            transform="translate(8, 8)"
            d="M8.5 5H23a1 1 0 000-2H8.5a1 1 0 000 2z"
          />
          <circle transform="translate(8, 8)" cx="2.5" cy="11.998" r="2.5" />
          <path
            transform="translate(8, 8)"
            d="M23 11H8.5a1 1 0 000 2H23a1 1 0 000-2z"
          />
          <circle transform="translate(8, 8)" cx="2.5" cy="19.998" r="2.5" />
          <path
            transform="translate(8, 8)"
            d="M23 19H8.5a1 1 0 000 2H23a1 1 0 000-2z"
          />
        </svg>
      </button>
      <button
        :title="$t('List')"
        data-selenium="List"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <svg>
          <path
            transform="translate(8, 8)"
            d="M7.75 4.5h15a1 1 0 000-2h-15a1 1 0 000 2zm15 6.5h-15a1 1 0 100 2h15a1 1 0 000-2zm0 8.5h-15a1 1 0 000 2h15a1 1 0 000-2zM2.212 17.248a2 2 0 00-1.933 1.484.75.75 0 101.45.386.5.5 0 11.483.63.75.75 0 100 1.5.5.5 0 11-.482.635.75.75 0 10-1.445.4 2 2 0 103.589-1.648.251.251 0 010-.278 2 2 0 00-1.662-3.111zm2.038-6.5a2 2 0 00-4 0 .75.75 0 001.5 0 .5.5 0 011 0 1.031 1.031 0 01-.227.645L.414 14.029A.75.75 0 001 15.248h2.5a.75.75 0 000-1.5h-.419a.249.249 0 01-.195-.406L3.7 12.33a2.544 2.544 0 00.55-1.582zM4 5.248h-.25A.25.25 0 013.5 5V1.623A1.377 1.377 0 002.125.248H1.5a.75.75 0 000 1.5h.25A.25.25 0 012 2v3a.25.25 0 01-.25.25H1.5a.75.75 0 000 1.5H4a.75.75 0 000-1.5z"
          />
        </svg>
      </button>
      <button
        :title="$t('Display HTML')"
        data-selenium="Display-HTML"
        class="html-button"
        :class="{ 'is-active': isHtmlDisplay }"
        @click="isHtmlDisplay = !isHtmlDisplay"
      >
        HTML
      </button>
    </div>
    <editor-content
      v-if="!isHtmlDisplay"
      class="form-input html-wysiwyg-content"
      :class="{
        'border border-danger': errorDescription,
        disabled: isDisabled,
      }"
      :editor="editor"
    />
    <pre
      v-else
      class="form-input"
      :class="{
        'border border-danger': errorDescription,
        disabled: isDisabled,
      }"
    ><code>{{ html }}</code></pre>
  </div>
</template>

<script lang="ts">
import { EditorContent, Editor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import HardBreak from "@tiptap/extension-hard-break";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicWysiwyg",
  components: {
    EditorContent,
  },

  props: {
    content: { default: undefined, type: String },
    errorDescription: { default: false, type: Boolean },
    isDisabled: { default: false, type: Boolean },
  },
  emits: ["update:content"],
  data() {
    return {
      isHtmlDisplay: false as boolean,
      html: this.content as string,
      editor: null as Editor | null,
    };
  },
  watch: {
    content(): void {
      if (this.content === this.html) {
        return;
      }
      this.initContent();
    },
    isDisabled(): void {
      if (this.editor) {
        this.editor.setOptions({
          editable: true !== this.isDisabled,
        });
      }
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false,
        }),
        HardBreak,
      ],
      content: "",
      editable: true !== this.isDisabled,
      onUpdate: this.updateHtml,
    });
    this.initContent();
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  },

  methods: {
    initContent(): void {
      if (undefined !== this.content && this.editor && !this.editor.isFocused) {
        this.editor.commands.setContent(this.content);
        this.html = this.editor.getHTML();
      }
    },
    updateHtml(): void {
      if (this.editor) {
        this.html = this.editor.getHTML().trim();
        if (
          this.html.startsWith("<p>") &&
          this.html.endsWith("</p>") &&
          1 === (this.html.match(/<p>/g) || []).length
        ) {
          this.html = this.html.substring(3, this.html.length - 4);
        }
        this.html = this.html.replaceAll("&nbsp;", " ");
        this.$emit("update:content", this.html);
      }
    },
    setLink() {
      if (!this.editor) {
        return;
      }
      const previousUrl = this.editor.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);
      if (!url) {
        return;
      }
      if ("" === url) {
        this.editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      this.editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    },
  },
});
</script>
<style lang="scss">
@import "@scss/_variables.scss";
.octopus-app {
  .wysiwyg-editor {
    .form-input {
      height: 200px;
      display: flex;
    }
    pre {
      background: #ddd;
      margin: 0;
    }
    code {
      display: block;
      white-space: pre-wrap;
      width: 0;
      flex-grow: 1;
      overflow: auto;
    }
    .editor-menubar {
      display: flex;
      padding: 0.2rem;
      flex-wrap: wrap;
      button {
        width: 40px;
        height: 40px;
        background: $octopus-secondary-color;
        border-width: 0;
        border-radius: $octopus-borderradius;
        margin: 0.2rem;
        padding: 0;
        font-size: 1.1rem;
        font-weight: 600;
        &:hover,
        &.is-active {
          background: $primaryColorTransparent;
        }
      }
      .html-button {
        font-size: 12px;
      }
      svg {
        width: 40px;
        height: 40px;
      }
    }
    .ProseMirror {
      width: 0;
      flex-grow: 1;
      overflow: auto;
    }
  }
}
</style>
