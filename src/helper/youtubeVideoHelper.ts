export default {
    getYoutubeId(tags: Array<string>){
        let youtubeId = undefined;
        for(const tag of tags){
        const regexExec = /^\[\[https:\/\/(?:www.)?youtube.com\/(?:watch\?v=|live\/)(?<id>\S+)\]\]$/.exec(tag);
        if(regexExec?.groups?.id){
            youtubeId = regexExec.groups.id;
            break;
        }
        }
        return youtubeId;
    }
}
