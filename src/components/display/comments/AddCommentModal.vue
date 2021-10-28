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
          <template
            v-if="!sending"
          >
            <button
              class="btn btn-light m-1"
              @click="closePopup"
            >
              {{ $t('Cancel') }}
            </button>
            <button
              class="btn btn-primary m-1"
              :disabled="name.length <= 2"
              @click="recaptcha"
            >
              {{ $t('Validate') }}
            </button>
          </template>
          <template
            v-else
          >
            <button
              class="btn m-1"
              @click="closePopup"
            >
              {{ $t('Close') }}
            </button>
          </template>
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
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    isCaptchaTest(): boolean {
      return state.generalParameters.isCaptchaTest;
    },
  },

  mounted() {
    const captcha = document.getElementsByClassName('grecaptcha-badge')[0];
    if (captcha) {
      (captcha as HTMLElement).style.display = 'block';
    }
    if (this.authenticated) {
      this.name = (
        (this.$store.state.profile.firstname || '') +
        ' ' +
        (this.$store.state.profile.lastname || '')
      ).trim();
      this.needVerify = false;
    }
  },

  unmounted() {
    const captcha = document.getElementsByClassName('grecaptcha-badge')[0];
    if (captcha) {
      (captcha as HTMLElement).style.display = 'none';
    }
  },

  methods: {
    async recaptcha(): Promise<void> {
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
    closePopup(event: { preventDefault: () => void }): void {
      event.preventDefault();
      this.$emit('close');
    },
    sendComment(): void {
      this.sending = true;
      this.$emit('validate', this.name);
    },
  },
})
</script>

<style lang="scss"></style>