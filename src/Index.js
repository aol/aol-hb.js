const utils = require('./Utils');

window.addEventListener('load', () => {
  document.getElementById('test').textContent = utils.getAppName();
});
