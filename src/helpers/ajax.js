import utils from './utils';

/**
 * Module for processing ajax requests
 *
 * @param {string} url requested url
 * @param {Function} successCallback success result callback
 */
export function sendRequest(url, successCallback, options = {}) {
  let xhr = new XMLHttpRequest();
  let responseHandler = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && successCallback) {
      successCallback(xhr.responseText);
    }
  };

  xhr.withCredentials = true;

  xhr.open(options.method, url);
  xhr.onreadystatechange = responseHandler;

  utils.each(options.customHeaders, (value, key) => {
    xhr.setRequestHeader(key, value);
  });

  xhr.setRequestHeader('Content-Type', options.contentType || 'text/plain');

  xhr.send(options.data);
}

export function sendGetRequest(url, successCallback, options = {}) {
  options.method = 'GET';

  return sendRequest(url, successCallback, options);
}

export function sendPostRequest(url, successCallback, options = {}) {
  options.method = 'POST';

  return sendRequest(url, successCallback, options);
}
