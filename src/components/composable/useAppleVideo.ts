/** Apple video statuses that don't trigger an error */
export const NO_ERROR_APPLE_VIDEO_STATUS = ['CREATED', 'UPDATED', 'HLS_NOT_READY', 'NO_APPLE_KEYS'];
/** Prefix for apple video status to use as generic error code */
const ERROR_PREFIX = 'APPLE_VIDEO-';

export const useAppleVideo = () => {
    function isErrorStatus(status: string|undefined): boolean {
        return status !== undefined && !NO_ERROR_APPLE_VIDEO_STATUS.includes(status);
    }

    function toGenericErrorCode(status: string): string {
        return `${ERROR_PREFIX}${status}`;
    }

    function isAppleVideoError(code: string): boolean {
        return code.startsWith(ERROR_PREFIX);
    }

    return {
        isAppleVideoError,
        isErrorStatus,
        toGenericErrorCode
    }
};
