let utils = {
  formatTemplateString: (strings, ...keys) => {
    return function(...values) {
      let dict = values[values.length - 1] || {};
      let result = [strings[0]];
      keys.forEach(function(key, i) {
        let value = Number.isInteger(key) ? values[key] : dict[key];
        result.push(value, strings[i + 1]);
      });

      return utils.trimTemplateStringResult(result.join(''));
    };
  },

  /***
   * Remove line breaks and indents after template strings formatting
   * The method allow create multi-lines template strings
   *
   * @param {string} templateString string after template strings formatting
   * @returns {string} trimmed string
   */
  trimTemplateStringResult: (templateString) => {
    return templateString ? templateString.replace(/(?:\n\s*)/g, '') : null;
  },

  /**
   * Resolve type of http protocol based on input param
   *
   * @returns {string} protocol type
   */
  resolveHttpProtocol: () => {
    return (document.location.protocol === 'https:') ? 'https' : 'http';
  },

  /***
   * Iterate through object properties or array elements
   * @param {object|array} obj
   * @param {function} callback
   */
  each: (obj, callback) => {
    if (!obj) {
      return;
    }

    if (typeof obj.forEach === 'function') {
      return obj.forEach(callback, this);
    }

    if (obj.length > 0) {
      for (let i = 0; i < obj.length; i++) {
        callback(obj[i], i, obj);
      }
    } else {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          callback(obj[key], key);
        }
      }
    }
  }
};

export default utils;
