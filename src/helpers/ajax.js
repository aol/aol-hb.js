/**
 * Module for processing ajax requests
 *
 * @param {string} url requested url
 * @param {string} method request method
 * @param {Function} successCallback success result callback
 */
export function sendRequest(url, method, successCallback) {
  let xhr = new XMLHttpRequest();
  let responseHandler = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && successCallback) {
      successCallback(xhr.responseText);
    }
  };

  xhr.withCredentials = true;

  xhr.open(method, url);
  xhr.onreadystatechange = responseHandler;
  xhr.send();
}

export function sendGetRequest(url, successCallback) {
  return sendRequest(url, 'GET', successCallback);
}

export function sendPostRequest(url, successCallback) {
  return sendRequest(url, 'POST', successCallback);
}
