<template>
  <div class="d-flex flex-column align-items-start">
    <ContractPreviewModal
      v-if="contractToDisplay"
      :selected-contract="contractToDisplay"
      @download="downloadContract"
      @close="contractToDisplay = undefined"
    />
    <button
      v-for="contract in contracts"
      :key="contract.id"
      class="btn-transparent link-hover my-1 special-select-align-magic-trick p-0"
      @click="contractToDisplay = contract"
    >
      {{ contract.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import downloadHelper from "../../helper/downloadHelper";
import classicApi from "../../api/classicApi";
import { Contract } from "../../stores/class/contract/contract";
import { defineAsyncComponent, onMounted, ref, Ref } from "vue";
import { useApiStore } from "../../stores/ApiStore";
const ContractPreviewModal = defineAsyncComponent(
  () => import("./modal/ContractPreviewModal.vue"),
);

//Props 
const props = defineProps({
  authOrgaId: { default: undefined, type: String },
})


//Data 
const contractToDisplay: Ref<Contract | undefined> = ref(undefined);
const contracts: Ref<Array<Contract>> = ref([]);

//Composables
const apiStore = useApiStore();

onMounted(()=>fetchContracts())

//Methods
async function fetchContracts() {
  if (!props.authOrgaId) {
    return;
  }
  contracts.value = await classicApi.fetchData({
    api: 3,
    path: `contract/query/organisation/${props.authOrgaId}?signedStatus=SIGNED`,
  });
}
function downloadContract(contract: Contract) {
  if (contract) {
    const url = apiStore.keycloakUrl + "contract/" + contract.id;
    downloadHelper.onDownload(url, "download" + contract.name + ".pdf");
  }
}
</script>
