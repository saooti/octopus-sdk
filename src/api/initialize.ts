import { InitState } from "@/stores/class/general/initState";
import axios from "axios";

export default {
  async fetchInitState(): Promise<InitState> {
    const data = await axios.get("/api/init");
    if (200 === data.status) {
      return data.data;
    }
    console.log(
      "Error while fetching authentication, wrong status code " +
        data.status +
        " : " +
        data.data,
    );
    throw new Error();
  },
};
