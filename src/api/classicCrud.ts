import axios from "axios";
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
}
/* eslint-disable */
export default {
    async fetchData<Type>(moduleName: ModuleApi,wsPath:string, forceRefresh?:boolean): Promise<Type>{
        console.log(moduleName,wsPath,forceRefresh);
        const response = await axios.get('/mock');
        return response.data;
    },
    async postData<Type>(moduleName: ModuleApi,wsPath:string, elementToCreate: unknown): Promise<Type>{
        console.log(moduleName,wsPath);
        const response = await axios.post('/mock', elementToCreate, {
        headers: {'Content-Type': 'application/json; charset=utf-8' },
        });
        return response.data;
    },
    async deleteData(moduleName: ModuleApi,wsPath:string): Promise<void>{
        console.log(moduleName,wsPath);
        await axios.delete('/mock');
    },
};
/* eslint-enable */
