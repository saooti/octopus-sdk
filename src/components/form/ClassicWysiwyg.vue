<template>
  <div class="wysiwyg-editor">
    <div v-if="editor" class="editor-menubar">
      <button
        :title="$t('Bold')"
        data-selenium="Bold"
        :class="{ 'is-active': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <FormatBoldIcon />
      </button>
      <button
        :title="$t('Italic')"
        data-selenium="Italic"
        :class="{ 'is-active': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <FormatItalicIcon />
      </button>
      <button
        :title="$t('Underline')"
        data-selenium="Underline"
        :class="{ 'is-active': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <FormatUnderlineIcon />
      </button>
      <button
        :title="$t('Link')"
        data-selenium="link"
        :class="{ 'is-active': editor.isActive('link') }"
        @click="setLink"
      >
        <LinkVariantIcon />
      </button>
      <button
        :title="$t('Delete link')"
        data-selenium="unlink"
        :disabled="!editor.isActive('link')"
        @click="editor.chain().focus().unsetLink().run()"
      >
        <LinkVariantOffIcon />
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
        <KeyboardReturnIcon />
      </button>

      <button
        :title="$t('UnorderedList')"
        data-selenium="UnorderedList"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <FormatListBulletedIcon />
      </button>
      <button
        :title="$t('List')"
        data-selenium="List"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <FormatListNumberedIcon />
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
import FormatBoldIcon from "vue-material-design-icons/FormatBold.vue";
import FormatItalicIcon from "vue-material-design-icons/FormatItalic.vue";
import FormatUnderlineIcon from "vue-material-design-icons/FormatUnderline.vue";
import LinkVariantIcon from "vue-material-design-icons/LinkVariant.vue";
import LinkVariantOffIcon from "vue-material-design-icons/LinkVariantOff.vue";
import KeyboardReturnIcon from "vue-material-design-icons/KeyboardReturn.vue";
import FormatListBulletedIcon from "vue-material-design-icons/FormatListBulleted.vue";
import FormatListNumberedIcon from "vue-material-design-icons/FormatListNumbered.vue";
import { EditorContent, Editor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import HardBreak from "@tiptap/extension-hard-break";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ClassicWysiwyg",
  components: {
    EditorContent,
    FormatBoldIcon,
    FormatItalicIcon,
    FormatUnderlineIcon,
    LinkVariantIcon,
    LinkVariantOffIcon,
    KeyboardReturnIcon,
    FormatListBulletedIcon,
    FormatListNumberedIcon,
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
        TextStyle,
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


.octopus-app {
  .wysiwyg-editor {
    .form-input {
      height: 200px;
      display: flex;
    }

    pre {
      background: var(--octopus-secondary);
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
        background: var(--octopus-secondary);
        border-width: 0;
        border-radius: var(--octopus-border-radius);
        margin: 0.2rem;
        padding: 0;
        font-size: 1.1rem;
        font-weight: 600;

        &:hover,
        &.is-active {
          background: var(--octopus-primary-transparent);
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
    /* stylelint-disable-next-line */
    .ProseMirror {
      width: 0;
      flex-grow: 1;
      overflow: auto;
    }
  }
}
</style>
