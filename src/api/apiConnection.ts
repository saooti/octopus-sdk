import { useApiStore } from "../stores/ApiStore";

enum ModuleApi {
  DEFAULT = 0,
  MEDIA = 1,
  COMMENT = 2,
  KEYCLOAK = 3,
  FRONTOFFICE = 4,
  PLAYER = 6,
  STORAGE = 8,
  STUDIO = 9,
  PROCESSOR = 10,
  SPEECHTOTEXT = 11,
  VIDEOMAKER = 12,
  RECOMMENDATION = 13,
  RADIO = 14,
  IMPORTER = 15,
  TEXTTOSPEECH = 16,
  BILLING = 17,
  OPENAI = 18,
  CHAPTERING = 19,
  KEYCLOAKOPENAI = 20,
}
function getApiUrl(moduleName: ModuleApi) {
  const api = useApiStore();
  switch (moduleName) {
    case 1:
      return api.mediaUrl;
    case 2:
      return api.commentUrl;
    case 3:
      return api.keycloakUrl;
    case 4:
      return "";
    case 6:
      return api.miniplayerUrl;
    case 8:
      return api.storageUrl;
    case 9:
      return api.studioUrl;
    case 10:
      return api.processorUrl;
    case 11:
      return api.speechToTextUrl;
    case 12:
      return api.videoMakerUrl;
    case 13:
      return api.recoUrl;
    case 14:
      return api.radioUrl;
    case 15:
      return api.importerUrl;
    case 16:
      return api.textToSpeechUrl;
    case 17:
      return api.billingUrl;
    case 18:
      return api.openAiUrl;
    case 19:
      return api.chapteringUrl;
    case 20:
      return api.keycloakOpenAiUrl;
    default:
      return api.apiUrl;
  }
}
export {
  ModuleApi,
  getApiUrl
}