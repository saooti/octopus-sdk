import { StoreState } from "@/store/typeAppStore";

export default{
    deleteConference(store?: StoreState,fetchConference?: string): any{
        console.log(store, fetchConference);
        return;
    },
    getConference(store?: StoreState,fetchConference?: string): any{
        console.log(store, fetchConference);
        return {};
    },
};
