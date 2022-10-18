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
              v-if="''!==errorText"
              class="mt-1 text-danger"
            >
              {{ errorText }}
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
          <vue-recaptcha 
            v-if="!isVerify"
            ref="invisibleRecaptcha"
            :load-recaptcha-script="true"
            @verify="handleSuccess"
            @expired="handleError"
            size="invisible"
            sitekey="6LfyP_4ZAAAAAPODj8nov2LvosIwcX0GYeBSungh"
          >
          </vue-recaptcha>
          <button
            v-if="!sending"
            class="btn btn-primary m-1"
            :disabled="0 === countName || !validName"
            @click="submit"
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
import { VueRecaptcha } from 'vue-recaptcha';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'AddCommentModal',
  components:{
    VueRecaptcha
  },

  props: {},
  emits: ['close','validate'],

  data() {
    return {
      name: '' as string,
      sending: false as boolean,
      sendError: false as boolean,
      isVerify: false as boolean,
      maxName : Constants.MAX_COMMENT_NAME as number
    };
  },
  computed: {
    errorText():string {
      if(this.isCaptchaTest){
        return this.$t('Recaptcha not active');
      }
      return this.sendError? this.$t('Recaptcha error') : '';
    },
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

  created() {
    this.initAuthenticatedName();
  },
  methods: {
    initAuthenticatedName():void{
      if (!state.generalParameters.authenticated) { return; }
      this.name = (`${this.$store.state.profile.firstname||''} ${this.$store.state.profile.lastname||''}`).trim();
      this.isVerify = true;
    },
    async handleSuccess(token: string) {
      this.isVerify = await api.checkToken(token);
      this.sendComment();
    },
    handleError() {
      this.isVerify = false;
      this.sendError = true;
    },
    async submit(): Promise<void> {
      if (!this.isVerify && !this.isCaptchaTest) {
        return (this.$refs.invisibleRecaptcha as InstanceType<typeof VueRecaptcha>).execute();
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