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
   * @param {string} documentProtocol document.location.protocol value
   * @returns {string} protocol type
   */

  resolveHttpProtocol: (documentProtocol) => {
    return (documentProtocol === 'https:') ? 'https' : 'http';
  }
};

export default utils;
