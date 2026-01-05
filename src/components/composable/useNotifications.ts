import { ref } from "vue";

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
}

/** The notification currently displayed */
const notification = ref<Notification|null>(null);

/**
 * Composable used to manage notifications
 */
export const useNotifications = () => {
    /**
     * Add & display a notification
     * @param newNotif The data of the new notification
     */
    function addNotification(newNotif: Notification): void {
        notification.value = { ...newNotif };
    }

    /**
     * Remove all notifications
     */
    function clearNotifications(): void {
        notification.value = null;
    }

    return {
        /** The currently active notification */
        notification,
        
        /** Add a new notification to be displayed */
        addNotification,
        /** Remove all active notifications */
        clearNotifications
    }
};
