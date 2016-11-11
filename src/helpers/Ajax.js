/**
 * Module for processing ajax requests
 *
 * @param {string} url requested url
 * @param {string} method request method
 * @param {Object} data in the request body
 */

export function sendRequest(url, method, data) {
  return new Promise((resolve) => {
    let xhr = new XMLHttpRequest();

    xhr.open(method, url);

    xhr.onload = () => {
      resolve(url, method, data);
    };

    xhr.send();
  });
}

export function sendGetRequest(url) {
  return sendRequest(url, 'GET');
}
