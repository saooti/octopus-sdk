import { Participant } from "@/stores/class/general/participant";
import classicApi from "./classicApi";
import { ModuleApi } from "./apiConnection";
import { mapFromGetAll } from "./apiUtils";

/**
 * Retrieve a participant by ID
 * @param participantId The ID of the participant
 * @return A participant
 */
async function get(participantId: number): Promise<Participant> {
    return classicApi.fetchData<Participant>({
        api: ModuleApi.DEFAULT,
        path: 'participant/' + participantId
    });
}

/**
 * Retrieve all participants specified by their IDs
 * @param participantIds A list of participant IDs. For better result, they
                         should be unique.
 * @return The matching participants
 */
async function getAllById(participantIds: Array<number>): Promise<Record<string, Participant>> {
    return mapFromGetAll(participantIds, get, 'participantId');
}

export const participantApi = {
    get,
    getAllById
}
