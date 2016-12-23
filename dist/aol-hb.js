/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	__webpack_require__(1);

	var _bidManager = __webpack_require__(2);

	var _bidManager2 = _interopRequireDefault(_bidManager);

	var _renderingManager = __webpack_require__(5);

	var _renderingManager2 = _interopRequireDefault(_renderingManager);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var globalContext = window.aolhb = {};

	globalContext.init = function (bidRequestConfig, placementsConfigs) {
	  var manager = new _bidManager2.default(bidRequestConfig, placementsConfigs);
	  manager.sendBidRequests();

	  globalContext.renderAd = function (alias) {
	    var bidResponseConfig = manager.getBidResponseByAlias(alias);

	    if (bidResponseConfig) {
	      var renderingManager = new _renderingManager2.default(bidResponseConfig, document);

	      renderingManager.render();
	    }
	  };

	  globalContext.refreshAd = function (alias) {
	    manager.refreshAd(alias);
	  };
	};

	exports.default = globalContext;

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	/*jshint -W121 */
	/*jshint bitwise: false*/
	if (!Array.prototype.find) {
	  Array.prototype.find = function (predicate) {
	    if (this === null) {
	      throw new TypeError('Array.prototype.find called on null or undefined');
	    }
	    if (typeof predicate !== 'function') {
	      throw new TypeError('predicate must be a function');
	    }
	    var list = Object(this);
	    var length = list.length >>> 0;
	    var thisArg = arguments[1];
	    var value;

	    for (var i = 0; i < length; i++) {
	      value = list[i];
	      if (predicate.call(thisArg, value, i, list)) {
	        return value;
	      }
	    }
	    return undefined;
	  };
	}

	Number.isInteger = Number.isInteger || function (value) {
	  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _templateObject = _taggedTemplateLiteral(['', '://', '/pubapi/3.0/', '/\n      ', '/0/-1/ADTECH;cmd=bid;cors=yes;\n      v=2;alias=', ';', ''], ['', '://', '/pubapi/3.0/', '/\n      ', '/0/-1/ADTECH;cmd=bid;cors=yes;\n      v=2;alias=', ';', '']);

	var _ajax = __webpack_require__(3);

	var _utils = __webpack_require__(4);

	var _utils2 = _interopRequireDefault(_utils);

	var _renderingManager = __webpack_require__(5);

	var _renderingManager2 = _interopRequireDefault(_renderingManager);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/***
	 * The class contains logic for processing bid
	 * requests and handling bid responses.
	 */
	var BidManager = function () {
	  function BidManager(bidRequestConfig, placementsConfigs) {
	    _classCallCheck(this, BidManager);

	    this.bidRequestConfig = bidRequestConfig;
	    this.placementsConfigs = placementsConfigs;
	    this.bidderKey = bidRequestConfig.bidderKey || 'aolbid';
	    this.aliasKey = bidRequestConfig.aliasKey || 'mpalias';
	    this.userSyncOn = bidRequestConfig.userSyncOn || BidManager.HEADER_BIDDING_EVENTS.bidResponse;
	    this.bidResponses = [];
	  }

	  /**
	   *  Send bid request for each placement from placementsConfigs.
	   */


	  _createClass(BidManager, [{
	    key: 'sendBidRequests',
	    value: function sendBidRequests() {
	      var _this = this;

	      this.placementsConfigs.forEach(function (config) {
	        (0, _ajax.sendGetRequest)(_this.formatBidRequestUrl(config), function (bidResponse) {
	          _this.handleBidRequestResponse(config, bidResponse);
	          _this.checkBidResponsesState();
	        });
	      });
	    }

	    /***
	     * Refresh specific ad by its alias.
	     */

	  }, {
	    key: 'refreshAd',
	    value: function refreshAd(alias) {
	      var _this2 = this;

	      var placementConfig = this.getPlacementConfigByAlias(alias);

	      if (placementConfig) {
	        (0, _ajax.sendGetRequest)(this.formatBidRequestUrl(placementConfig), function (bidResponse) {
	          _this2.handleBidRequestResponse(placementConfig, bidResponse);
	        });
	      }
	    }
	  }, {
	    key: 'formatBidRequestUrl',
	    value: function formatBidRequestUrl(placementConfig) {
	      var url = _utils2.default.formatTemplateString(_templateObject, 'protocol', 'hostName', 'network', 'placement', 'alias', 'bidFloorPrice');

	      var options = {
	        protocol: _utils2.default.resolveHttpProtocol(document.location.protocol),
	        hostName: this.resolveHostName(),
	        network: this.bidRequestConfig.network,
	        placement: parseInt(placementConfig.placement),
	        alias: placementConfig.alias,
	        bidFloorPrice: this.resolveBidFloorPrice(placementConfig.bidFloorPrice)
	      };

	      return url(options);
	    }
	  }, {
	    key: 'handleBidRequestResponse',
	    value: function handleBidRequestResponse(placementConfig, response) {
	      var externalBidRequestHandler = this.bidRequestConfig.onBidResponse;

	      var responseJson = JSON.parse(response);
	      var bidResponse = this.createBidResponse(responseJson, placementConfig);

	      if (bidResponse) {
	        this.renderPixels(bidResponse);

	        if (externalBidRequestHandler) {
	          externalBidRequestHandler(bidResponse);
	        }
	      }
	    }
	  }, {
	    key: 'checkBidResponsesState',
	    value: function checkBidResponsesState() {
	      var allBidResponsesReturned = this.placementsConfigs.length === this.bidResponses.length;
	      var allBidResponsesHandler = this.bidRequestConfig.onAllBidResponses;

	      if (allBidResponsesReturned && allBidResponsesHandler) {
	        allBidResponsesHandler(this.bidResponses);
	      }
	    }
	  }, {
	    key: 'resolveBidFloorPrice',
	    value: function resolveBidFloorPrice(floorPrice) {
	      return floorPrice ? 'bidfloor=' + floorPrice.toString() + ';' : '';
	    }
	  }, {
	    key: 'resolveHostName',
	    value: function resolveHostName() {
	      return BidManager.SERVER_MAP[this.bidRequestConfig.region] || BidManager.SERVER_MAP.US;
	    }
	  }, {
	    key: 'getBidData',
	    value: function getBidData(bidResponse) {
	      try {
	        return bidResponse.seatbid[0].bid[0];
	      } catch (error) {
	        return;
	      }
	    }
	  }, {
	    key: 'getPixels',
	    value: function getPixels(bidResponse) {
	      try {
	        return bidResponse.ext.pixels;
	      } catch (error) {
	        return;
	      }
	    }
	  }, {
	    key: 'getCPM',
	    value: function getCPM(bidData) {
	      return bidData.ext && bidData.ext.encp ? bidData.ext.encp : bidData.price;
	    }
	  }, {
	    key: 'getBidResponseByAlias',
	    value: function getBidResponseByAlias(alias) {
	      return this.bidResponses.find(function (item) {
	        return item.alias === alias;
	      });
	    }
	  }, {
	    key: 'addNewBidResponse',
	    value: function addNewBidResponse(bidResponse) {
	      if (bidResponse) {
	        var existingBidResponse = this.getBidResponseByAlias(bidResponse.alias);

	        if (existingBidResponse) {
	          var bidResponseIndex = this.bidResponses.indexOf(existingBidResponse);

	          this.bidResponses[bidResponseIndex] = bidResponse;
	        } else {
	          this.bidResponses.push(bidResponse);
	        }
	      }
	    }
	  }, {
	    key: 'createBidResponse',
	    value: function createBidResponse(bidResponseJson, placementConfig) {
	      var bidResponse = this.formatBidResponse(bidResponseJson, placementConfig);

	      if (bidResponse) {
	        this.addNewBidResponse(bidResponse);

	        return bidResponse;
	      }
	    }
	  }, {
	    key: 'formatBidResponse',
	    value: function formatBidResponse(bidResponseJson, placementConfig) {
	      var bidData = this.getBidData(bidResponseJson);

	      if (bidData) {
	        return {
	          cpm: this.getCPM(bidData),
	          ad: bidData.adm,
	          pixels: this.getPixels(bidResponseJson),
	          adContainerId: placementConfig.adContainerId,
	          width: bidData.w,
	          height: bidData.h,
	          creativeId: bidData.crid,
	          bidderCode: this.bidderKey,
	          aliasKey: this.aliasKey,
	          alias: placementConfig.alias
	        };
	      }
	    }
	  }, {
	    key: 'getPlacementConfigByAlias',
	    value: function getPlacementConfigByAlias(alias) {
	      return this.placementsConfigs.find(function (item) {
	        return item.alias === alias;
	      });
	    }
	  }, {
	    key: 'isUserSyncOnBidResponseMode',
	    value: function isUserSyncOnBidResponseMode() {
	      return this.userSyncOn === BidManager.HEADER_BIDDING_EVENTS.bidResponse;
	    }
	  }, {
	    key: 'renderPixels',
	    value: function renderPixels(bidResponse) {
	      if (bidResponse.pixels && this.isUserSyncOnBidResponseMode()) {
	        var renderingManager = new _renderingManager2.default(bidResponse);

	        renderingManager.renderPixels();

	        bidResponse.pixelsRendered = true;
	      }
	    }
	  }]);

	  return BidManager;
	}();

	BidManager.SERVER_MAP = {
	  EU: 'adserver.adtech.de',
	  US: 'adserver.adtechus.com',
	  Asia: 'adserver.adtechjp.com'
	};

	BidManager.HEADER_BIDDING_EVENTS = {
	  bidResponse: 'bidResponse',
	  adRender: 'adRender'
	};

	exports.default = BidManager;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.sendRequest = sendRequest;
	exports.sendGetRequest = sendGetRequest;
	/**
	 * Module for processing ajax requests
	 *
	 * @param {string} url requested url
	 * @param {string} method request method
	 * @param {Function} successCallback success result callback
	 */
	function sendRequest(url, method, successCallback) {
	  var xhr = new XMLHttpRequest();
	  var responseHandler = function responseHandler() {
	    if (xhr.readyState === XMLHttpRequest.DONE && successCallback) {
	      successCallback(xhr.responseText);
	    }
	  };

	  xhr.withCredentials = true;

	  xhr.open(method, url);
	  xhr.onreadystatechange = responseHandler;
	  xhr.send();
	}

	function sendGetRequest(url, successCallback) {
	  return sendRequest(url, 'GET', successCallback);
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var utils = {
	  formatTemplateString: function formatTemplateString(strings) {
	    for (var _len = arguments.length, keys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      keys[_key - 1] = arguments[_key];
	    }

	    return function () {
	      for (var _len2 = arguments.length, values = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        values[_key2] = arguments[_key2];
	      }

	      var dict = values[values.length - 1] || {};
	      var result = [strings[0]];
	      keys.forEach(function (key, i) {
	        var value = Number.isInteger(key) ? values[key] : dict[key];
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
	  trimTemplateStringResult: function trimTemplateStringResult(templateString) {
	    return templateString ? templateString.replace(/(?:\n\s*)/g, '') : null;
	  },

	  /**
	   * Resolve type of http protocol based on input param
	   *
	   * @param {string} documentProtocol document.location.protocol value
	   * @returns {string} protocol type
	   */
	  resolveHttpProtocol: function resolveHttpProtocol(documentProtocol) {
	    return documentProtocol === 'https:' ? 'https' : 'http';
	  }
	};

	exports.default = utils;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/***
	 * The class contains logic for rendering ad(based on bid response config).
	 */
	var RenderingManager = function () {
	  function RenderingManager(bidResponse) {
	    _classCallCheck(this, RenderingManager);

	    this.bidResponse = bidResponse;
	    this.document = document;
	  }

	  _createClass(RenderingManager, [{
	    key: 'render',
	    value: function render() {
	      var iframe = this.createAdFrame();

	      if (iframe) {
	        this.renderPixels();
	        this.insertElementInAdContainer(iframe);
	        this.populateIframeContent(iframe);
	      }
	    }
	  }, {
	    key: 'createAdFrame',
	    value: function createAdFrame() {
	      var iframe = this.document.createElement('iframe');

	      iframe.id = 'aol-pub-frame-' + this.bidResponse.adContainerId;
	      iframe.name = iframe.id;
	      iframe.style.border = '0px';
	      iframe.scrolling = 'no';
	      iframe.frameborder = 0;
	      iframe.width = this.bidResponse.width;
	      iframe.height = this.bidResponse.height;
	      iframe.allowtransparency = true;
	      iframe.setAttribute('allowFullScreen', 'true');
	      iframe.setAttribute('mozallowFullScreen', 'true');
	      iframe.setAttribute('webkitAllowFullScreen', 'true');

	      return iframe;
	    }
	  }, {
	    key: 'insertElementInAdContainer',
	    value: function insertElementInAdContainer(element) {
	      var adContainer = this.document.getElementById(this.bidResponse.adContainerId);

	      if (adContainer) {
	        adContainer.appendChild(element);
	      }
	    }
	  }, {
	    key: 'prepareAdForIframe',
	    value: function prepareAdForIframe(adContent) {
	      if (adContent) {
	        return '<head></head><body><style></style>' + adContent + '</body>';
	      }
	    }
	  }, {
	    key: 'populateIframeContent',
	    value: function populateIframeContent(iframe) {
	      var iframeContent = this.prepareAdForIframe(this.bidResponse.ad);

	      if (iframeContent) {
	        iframe.contentWindow.document.open();
	        iframe.contentWindow.document.write(iframeContent);
	        iframe.contentWindow.document.close();
	      }
	    }
	  }, {
	    key: 'renderPixels',
	    value: function renderPixels() {
	      if (this.bidResponse && this.bidResponse.pixels && !this.bidResponse.pixelsRendered) {
	        var pixelsElements = this.parsePixelsItems(this.bidResponse.pixels);

	        this.renderPixelsItems(pixelsElements);
	      }
	    }
	  }, {
	    key: 'parsePixelsItems',
	    value: function parsePixelsItems(pixels) {
	      var itemsRegExp = /(img|iframe)[\s\S]*?src\s*=\s*("([^"]*)"|'([^"]*)')/gi;
	      var tagNameRegExp = /\w*(?=\s)/;
	      var srcRegExp = /src=(")(.+)"/;
	      var pixelsItems = [];

	      if (pixels) {
	        pixels.match(itemsRegExp).forEach(function (item) {
	          var tagNameMatches = item.match(tagNameRegExp);
	          var sourcesPathMatches = item.match(srcRegExp);

	          if (tagNameMatches && sourcesPathMatches) {
	            pixelsItems.push({
	              tagName: tagNameMatches[0].toUpperCase(),
	              src: sourcesPathMatches[2]
	            });
	          }
	        });
	      }

	      return pixelsItems;
	    }
	  }, {
	    key: 'renderPixelsItems',
	    value: function renderPixelsItems(pixelsItems) {
	      var _this = this;

	      pixelsItems.forEach(function (item) {
	        switch (item.tagName) {
	          case RenderingManager.PIXELS_ITEMS.img:
	            _this.renderPixelsImage(item);
	            break;
	          case RenderingManager.PIXELS_ITEMS.iframe:
	            _this.renderPixelsIframe(item);
	            break;
	        }
	      });
	    }
	  }, {
	    key: 'renderPixelsImage',
	    value: function renderPixelsImage(pixelsItem) {
	      var image = new Image();

	      image.src = pixelsItem.src;
	    }
	  }, {
	    key: 'renderPixelsIframe',
	    value: function renderPixelsIframe(pixelsItem) {
	      var iframe = this.document.createElement('iframe');

	      iframe.width = 1;
	      iframe.height = 1;
	      iframe.style = 'display: none';
	      iframe.src = pixelsItem.src;
	      this.document.body.appendChild(iframe);
	    }
	  }]);

	  return RenderingManager;
	}();

	RenderingManager.PIXELS_ITEMS = {
	  iframe: 'IFRAME',
	  img: 'IMG'
	};

	exports.default = RenderingManager;

/***/ }
/******/ ]);