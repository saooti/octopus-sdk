/**
 * Library of icons to use in the application
 * Icons should be defined here, then used with their alias.
 * This will allow for better consistency, and easily changing icons.
 */

import LockIcon from 'vue-material-design-icons/Lock.vue';
import SquareEditOutline from 'vue-material-design-icons/SquareEditOutline.vue';
import TrashCan from 'vue-material-design-icons/TrashCan.vue'; 
import TikTokIcon from './icons/TikTokIcon.vue';
import BlueSkyIcon from './icons/BlueSkyIcon.vue';
import ThreadsIcon from './icons/ThreadsIcon.vue';

export default {
    Delete: TrashCan,
    Edit: SquareEditOutline,
    RightsIndicator: LockIcon,

    TikTok: TikTokIcon,
    Bluesky: BlueSkyIcon,
    Threads: ThreadsIcon
}
