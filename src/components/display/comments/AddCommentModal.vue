<template>
  <div>
    <b-modal
      id="add-comment-modal"
      :title="$t('Welcome, thanks for your comment')"
      :show="true"
      @close="closePopup"
      @hide="closePopup"
      @cancel="closePopup"
    >
      <template
        v-if="!sending"
        #default
      >
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
      <template
        v-else
        #default
      >
        <div>{{ $t('Send in progress') }}</div>
      </template>
      <template
        v-if="!sending"
        #modal-footer
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
        #modal-footer
      >
        <button
          class="btn m-1"
          @click="closePopup"
        >
          {{ $t('Close') }}
        </button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { useReCaptcha } from 'vue-recaptcha-v3';
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
    const captcha: any = document.getElementsByClassName('grecaptcha-badge')[0];
    if (captcha) {
      captcha.style.display = 'block';
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
    const captcha: any = document.getElementsByClassName('grecaptcha-badge')[0];
    if (captcha) {
      captcha.style.display = 'none';
    }
  },

  methods: {
    async recaptcha(): Promise<void> {
      if (!this.needVerify || this.isCaptchaTest) {
        this.sendComment();
        return;
      }
      const { executeRecaptcha, recaptchaLoaded }: any = useReCaptcha()
      await recaptchaLoaded();
      const token = await executeRecaptcha('login');
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