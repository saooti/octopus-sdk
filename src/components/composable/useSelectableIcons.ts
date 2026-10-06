import { Rubrique } from "@/stores/class/rubrique/rubrique";
import { type Component } from "vue";

import Account from "vue-material-design-icons/Account.vue";
import AccountGroup from "vue-material-design-icons/AccountGroup.vue";
import Airplane from "vue-material-design-icons/Airplane.vue";
import Basketball from "vue-material-design-icons/Basketball.vue";
import Beaker from "vue-material-design-icons/Beaker.vue";
import Bell from "vue-material-design-icons/Bell.vue";
import Bike from "vue-material-design-icons/Bike.vue";
import BookOpenVariant from "vue-material-design-icons/BookOpenVariant.vue";
import Briefcase from "vue-material-design-icons/Briefcase.vue";
import Broadcast from "vue-material-design-icons/Broadcast.vue";
import Camera from "vue-material-design-icons/Camera.vue";
import ChartLine from "vue-material-design-icons/ChartLine.vue";
import Chat from "vue-material-design-icons/Chat.vue";
import Clock from "vue-material-design-icons/Clock.vue";
import Earth from "vue-material-design-icons/Earth.vue";
import Factory from "vue-material-design-icons/Factory.vue";
import File from "vue-material-design-icons/File.vue";
import Laptop from "vue-material-design-icons/Laptop.vue";
import MapMarker from "vue-material-design-icons/MapMarker.vue";
import Microphone from "vue-material-design-icons/Microphone.vue";
import Music from "vue-material-design-icons/Music.vue";
import Palette from "vue-material-design-icons/Palette.vue";
import PlusThick from "vue-material-design-icons/PlusThick.vue";
import Radio from "vue-material-design-icons/Radio.vue";
import Rocket from "vue-material-design-icons/Rocket.vue";
import Sprout from "vue-material-design-icons/Sprout.vue";
import Star from "vue-material-design-icons/Star.vue";
import ThoughtBubble from "vue-material-design-icons/ThoughtBubble.vue";
import Tools from "vue-material-design-icons/Tools.vue";
import Train from "vue-material-design-icons/Train.vue";
import Trophy from "vue-material-design-icons/Trophy.vue";
import Web from "vue-material-design-icons/Web.vue";
import WindPower from "vue-material-design-icons/WindPower.vue";

const Icons = {
    Account,
    AccountGroup,
    Airplane,
    Basketball,
    Beaker,
    Bell,
    Bike,
    BookOpenVariant,
    Briefcase,
    Broadcast,
    Camera,
    ChartLine,
    Chat,
    Clock,
    Earth,
    Factory,
    File,
    Laptop,
    MapMarker,
    Microphone,
    Music,
    Palette,
    PlusThick,
    Radio,
    Rocket,
    Sprout,
    Star,
    ThoughtBubble,
    Tools,
    Train,
    Trophy,
    Web,
    WindPower
};

export type IconName = keyof typeof Icons;

export const useSelectableIcons = () => {

    function getIcon(name: IconName): Component {
        return Icons[name];
    }

    function getRubricIcon(rubric: Rubrique): Component|undefined {
        return getIcon(rubric.annotations?.rubricIcon as IconName|undefined);
    }
    
    return {
        Icons,
        getIcon,
        getRubricIcon
    };
}
