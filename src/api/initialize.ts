import { defineComponent } from 'vue'
export default defineComponent({
  checkToken(token: any): boolean {
    console.log(token);
    return true;
  },
};
