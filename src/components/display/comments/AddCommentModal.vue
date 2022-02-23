<template>
  <div
    id="add-comment-modal"
    class="modal"
  >
    <div class="modal-backdrop" />
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ $t('Welcome, thanks for your comment') }}
          </h5>
        </div>
        <div class="modal-body">
          <template v-if="!sending">
            <div>{{ $t("Let's get acquainted :") }}</div>
            <input
              v-model="name"
              class="form-input"
              type="text"
              :placeholder="$t('Your name')"
              :class="{ 'border border-danger': 0 === countName || !validName }"
            >
            <p
              class="d-flex justify-content-end small-text"
              :class="{ 'text-danger': !validName }"
            >
              {{ countName + ' / ' + maxName }}
            </p>
            <div
              v-if="sendError"
              class="mt-1 text-danger"
            >
              {{ $t('Recaptcha error') }}
            </div>
            <div
              v-if="isCaptchaTest"
              class="mt-1 text-danger"
            >
              {{ $t('Recaptcha not active') }}
            </div>
          </template>
          <template v-else>
            <div>{{ $t('Send in progress') }}</div>
          </template>
        </div>
        <div class="modal-footer">
          <button
            class="btn m-1"
            @click="closePopup"
          >
            {{ $t('Close') }}
          </button>
          <button
            v-if="!sending"
            class="btn btn-link m-1"
            :disabled="0 === countName || !validName"
            @click="validateName"
          >
            {{ $t('Validate') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Constants from '../../../../public/config';
import { state } from '../../../store/paramStore';
import api from '@/api/initialize';
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'AddCommentModal',

  props: {},
  emits: ['close','validate'],

  data() {
    return {
      name: '' as string,
      sending: false as boolean,
      needVerify: true as boolean,
      sendError: false as boolean,
      maxName : Constants.MAX_COMMENT_NAME as number
    };
  },

  computed: {
    validName(): boolean{
      return this.countName <= this.maxName;
    },
    countName(): number{
      return this.name.length;
    },
    isCaptchaTest(): boolean {
      return (state.generalParameters.isCaptchaTest as boolean);
    },
  },

  mounted() {
    this.displayCaptcha('block');
    this.initAuthenticatedName();
  },

  unmounted() {
    this.displayCaptcha('none');
  },

  methods: {
    initAuthenticatedName():void{
      if (state.generalParameters.authenticated) {
        this.name = (
          (this.$store.state.profile.firstname || '') +
          ' ' +
          (this.$store.state.profile.lastname || '')
        ).trim();
        this.needVerify = false;
      }
    },
    displayCaptcha(displayStyle: string): void{
      const captcha = document.getElementsByClassName('grecaptcha-badge')[0];
      if (captcha) {
        (captcha as HTMLElement).style.display = displayStyle;
      }
    },
    async validateName(): Promise<void> {
      if (!this.needVerify || this.isCaptchaTest) {
        this.sendComment();
        return;
      }
      try {
        await this.$recaptchaLoaded()
        const token = await this.$recaptcha('login');
        this.sendError = false;
        const ok = await api.checkToken(token);
        if (!ok) {
          this.sendError = true;
          return;
        }
      } catch {
        this.sendError = true;
        return;
      }
      this.sendComment();
    },
    closePopup(): void {
      this.$emit('close');
    },
    sendComment(): void {
      this.sending = true;
      this.$emit('validate', this.name);
    },
  },
})
</script>