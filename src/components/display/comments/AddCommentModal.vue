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
              :class="{ 'border border-danger': name.length < 2 }"
            >
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
            class="btn btn-primary m-1"
            :disabled="name.length <= 2"
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
import { IReCaptchaComposition, useReCaptcha } from 'vue-recaptcha-v3';
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
    };
  },

  computed: {
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
      const iRecaptcha: IReCaptchaComposition|undefined = useReCaptcha();
      if(!iRecaptcha){return;}
      await iRecaptcha.recaptchaLoaded();
      const token = await iRecaptcha.executeRecaptcha('login');
      try {
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