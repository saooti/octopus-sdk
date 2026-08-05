import { defineStore } from "pinia";
import { computed, ref } from "vue";

type NotificationType = 'success'|'info'|'warning'|'error';

/**
 * Type for notifications
 */
interface Notification {
    /** Optional title of the notification */
    title?: string;
    /** Message displayed by the notification */
    message: string;
    /** Type of notification, may affect display */
    type: NotificationType;
    /** When set to false, disallow manual closing of modal notification (default: true) */
    closeable?: boolean;
    /** Callback called when the notification is closed */
    closeCallback?: () => void;
}

export const useNotificationStore = defineStore('notifications', () => {
    const notificationQueue = ref<Array<Notification>>([]);

    /**
     * Add a notification to the queue
     * @param notification The notification to add
     */
    function addNotification(notification: Notification): void {
        notificationQueue.value.push(notification);
    }

    /** Remove the current notification from the queue */
    function clearNotification(): void {
        const notif = currentNotification.value;
        if (notif !== null) {
            const idx = notificationQueue.value.indexOf(notif);
            notificationQueue.value.splice(idx, 1);

            if (notif.closeCallback) {
                notif.closeCallback();
            }
        }
    }

    /** The currently active notification */
    const currentNotification = computed((): Notification|undefined => {
        if (notificationQueue.value.length > 0) {
            return notificationQueue.value[0];
        }
        return undefined;
    });


    return {
        addNotification,
        currentNotification,
        clearNotification
    }
});
