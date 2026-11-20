import fetchHelper from "./fetchHelper";

/** Same-origin backend proxy used when a host doesn't allow CORS (frontoffice only, audio/video) */
const PROXY_DOWNLOAD_PATH = "/download/url";

/**
 * Clicks a temporary `<a download>` link, then removes it
 * @param href URL of the link
 * @param name Name of the downloaded file
 */
function clickDownloadLink(href: string, name: string): void {
    const tag = document.createElement("a");
    tag.href = href;
    tag.download = name;
    document.body.appendChild(tag);
    tag.click();
    document.body.removeChild(tag);
}

export default {
    /**
   * Downloads a file through an XHR, so it can be saved with a chosen name.
   * @param urlToDownload URL of the file
   * @param nameOfDownload Name of the saved file (spaces replaced by `_`)
   * @param auth Sends the `Authorization` header of the logged-in user
   * @param proxyFallback When the XHR fails at network level (e.g. a host
   * without CORS headers), hands the download to the browser through the
   * same-origin `/download/url` backend proxy instead of rejecting. Only for
   * audio/video files (the proxy refuses other types), and only in apps whose
   * backend serves that proxy (frontoffice).
   * @returns Resolves once the file is saved or handed to the browser; rejects
   * on a non-200 status, or a network error without `proxyFallback`
   */
    async onDownload(
        urlToDownload: string,
        nameOfDownload: string,
        auth = true,
        proxyFallback = false,
    ): Promise<void> {
        const fileName = nameOfDownload.replace(/ /g, "_");
        const xhr = new XMLHttpRequest();
        xhr.open("GET", urlToDownload, true);
        if (auth) {
            const header = await fetchHelper.createAuthenticatedFetchHeader();
            if (header) {
                xhr.setRequestHeader("Authorization", header.Authorization);
            }
        }
        xhr.responseType = "blob";

        return new Promise<void>((resolve, reject) => {
            xhr.onload = function () {
                if (xhr.status !== 200) {
                    reject(new Error(`Download failed with status ${xhr.status}`));
                    return;
                }
                const urlCreator = window.URL || window.webkitURL;
                const objectUrl = urlCreator.createObjectURL(this.response);
                clickDownloadLink(objectUrl, fileName);
                // Released later: revoking right after the click can cancel the save in some browsers
                setTimeout(() => urlCreator.revokeObjectURL(objectUrl), 40_000);
                resolve();
            };
            xhr.onerror = function () {
                if (proxyFallback) {
                    const params = new URLSearchParams({ param: urlToDownload, name: fileName });
                    clickDownloadLink(`${PROXY_DOWNLOAD_PATH}?${params.toString()}`, fileName);
                    resolve();
                    return;
                }
                reject(new Error("Download failed"));
            };
            xhr.send();
        });
    },
};
