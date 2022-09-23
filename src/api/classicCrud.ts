import { StoreState } from "@/store/typeAppStore";
import axios from "axios";
enum ModuleApi {
    DEFAULT = 0,
    MEDIA = 1,
    COMMENT = 2,
    KEYCLOAK = 3,
    FRONTOFFICE = 4,
    FTP = 5,
    PLAYER = 6,
    RSS=7,
    STORAGE = 8,
    STUDIO = 9,
    PROCESSOR= 10,
    SPEECHTOTEXT=11
  }
/* eslint-disable */
export default {
    async fetchData<Type>(state: StoreState,moduleName: ModuleApi,wsPath:string): Promise<Type>{
        console.log(state,moduleName,wsPath);
        const response = await axios.get('/mock');
        return response.data;
    },
    async postData<Type>(state: StoreState,moduleName: ModuleApi,wsPath:string, elementToCreate: unknown): Promise<Type>{
        console.log(state,moduleName,wsPath);
        const response = await axios.post('/mock', elementToCreate, {
        headers: {'Content-Type': 'application/json; charset=utf-8' },
        });
        return response.data;
    },
    async deleteData(state: StoreState,moduleName: ModuleApi,wsPath:string): Promise<void>{
        console.log(state,moduleName,wsPath);
        await axios.delete('/mock');
    },
};
/* eslint-enable */ 