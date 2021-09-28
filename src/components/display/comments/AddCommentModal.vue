<template>
  <div>
    <b-modal
      id="add-comment-modal"
      @close="closePopup"
      @hide="closePopup"
      @cancel="closePopup"
      :title="$t('Welcome, thanks for your comment')"
      :show="true"
    >
      <template v-slot:default v-if="!sending">
        <div>{{ $t("Let's get acquainted :") }}</div>
        <input
          class="form-input"
          type="text"
          v-model="name"
          :placeholder="$t('Your name')"
        />
        <div class="mt-1 text-danger" v-if="sendError">
          {{ $t('Recaptcha error') }}
        </div>
        <div class="mt-1 text-danger" v-if="isCaptchaTest">
          {{ $t('Recaptcha not active') }}
        </div>
      </template>
      <template v-slot:default v-else>
        <div>{{ $t('Send in progress') }}</div>
      </template>
      <template v-slot:modal-footer v-if="!sending">
        <button class="btn btn-light m-1" @click="closePopup">
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
      <template v-slot:modal-footer v-else>
        <button class="btn m-1" @click="closePopup">
          {{ $t('Close') }}
        </button>
      </template>
    </b-modal>
  </div>
</template>

<style lang="scss"></style>
<script lang="ts">
import { VueReCaptcha } from 'vue-recaptcha-v3';
import { state } from '../../../store/paramStore';
import api from '@/api/initialize';
//TODO
/* import Vue from 'vue';
Vue.use(VueReCaptcha, { siteKey: '6LfyP_4ZAAAAAPODj8nov2LvosIwcX0GYeBSungh' }); */
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

  destroyed() {
    const captcha: any = document.getElementsByClassName('grecaptcha-badge')[0];
    if (captcha) {
      captcha.style.display = 'none';
    }
  },

  computed: {
    authenticated(): boolean {
      return state.generalParameters.authenticated;
    },
    isCaptchaTest(): boolean {
      return state.generalParameters.isCaptchaTest;
    },
  },

  methods: {
    async recaptcha(): Promise<void> {
      //TODO
      /* if (!this.needVerify || this.isCaptchaTest) {
        this.sendComment();
        return;
      }
      await this.$recaptchaLoaded();
      const token = await this.$recaptcha('login');
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
      this.sendComment(); */
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
