import fetchHelper from "./fetchHelper";
export default {
  async onDownload(
    urlToDownload: string,
    nameOfDownload: string,
    auth = true,
  ): Promise<void> {
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
        const imageUrl = urlCreator.createObjectURL(this.response);
        const tag = document.createElement("a");
        tag.href = imageUrl;
        tag.target = "_blank";
        tag.download = nameOfDownload.replace(/ /g, "_");
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
        resolve();
      };
      xhr.onerror = function () {
        reject(new Error("Download failed"));
      };
      xhr.send();
    });
  },
};
