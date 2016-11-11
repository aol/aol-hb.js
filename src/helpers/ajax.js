/**
 * Module for processing ajax requests
 *
 * @param {string} url requested url
 * @param {string} method request method
 * @param {Object} data in the request body
 * @param {Function} onSuccess success result callback
 */

export function sendRequest(url, method, data, onSuccess) {
  let xhr = new XMLHttpRequest();

  xhr.open(method, url);

  xhr.onload = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  xhr.send();
}

export function sendGetRequest(url) {
  return sendRequest(url, 'GET');
}
