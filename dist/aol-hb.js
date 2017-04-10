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

	var _renderingManager = __webpack_require__(3);

	var _renderingManager2 = _interopRequireDefault(_renderingManager);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var globalContext = window.aolhb = window.aolhb || {};
	globalContext.queue = globalContext.queue || [];

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

	  globalContext.getBidResponse = function (alias) {
	    return manager.getBidResponseByAlias(alias);
	  };

	  globalContext.refreshAd = function (alias) {
	    manager.refreshAd(alias);
	  };

	  globalContext.addNewAd = function (placementConfig) {
	    manager.addNewAd(placementConfig);
	  };
	};

	globalContext.queue.push = function (cmd) {
	  if (typeof cmd === 'function') {
	    try {
	      cmd.call();
	    } catch (e) {
	      console.warn('Error processing command', 'aol-hb.js', e);
	    }
	  } else {
	    console.warn('Commands written into aolhb.que.push must be wrapped in a function', 'aol-hb.js');
	  }
	};

	for (var i = 0; i < globalContext.queue.length; i++) {
	  if (typeof globalContext.queue[i].called === 'undefined') {
	    try {
	      globalContext.queue[i].call();
	      globalContext.queue[i].called = true;
	    } catch (e) {
	      console.warn('Error processing command', 'aol-hb.js', e);
	    }
	  }
	}

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

	var _renderingManager = __webpack_require__(3);

	var _renderingManager2 = _interopRequireDefault(_renderingManager);

	var _marketplace = __webpack_require__(4);

	var _marketplace2 = _interopRequireDefault(_marketplace);

	var _nexageGet = __webpack_require__(8);

	var _nexageGet2 = _interopRequireDefault(_nexageGet);

	var _nexagePost = __webpack_require__(9);

	var _nexagePost2 = _interopRequireDefault(_nexagePost);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/***
	 * The class contains logic for processing bid
	 * requests and handling bid responses.
	 */
	var BidManager = function () {
	  function BidManager(bidRequestConfig, placementsConfigs) {
	    _classCallCheck(this, BidManager);

	    this.bidRequestConfig = bidRequestConfig;
	    this.placementsConfigs = placementsConfigs || [];
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
	        _this.sendBidRequest(config, function (bidResponse) {
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
	      var placementConfig = this.getPlacementConfigByAlias(alias);

	      if (placementConfig) {
	        this.sendBidRequest(placementConfig);
	      }
	    }

	    /**
	     * Add new ad in runtime.
	     * @param {Object} placementConfig placement configuration.
	     */

	  }, {
	    key: 'addNewAd',
	    value: function addNewAd(placementConfig) {
	      if (placementConfig) {
	        this.addNewPlacementConfig(placementConfig);
	        this.sendBidRequest(placementConfig);
	      }
	    }

	    /**
	     * Send bid request for particular placement.
	     */

	  }, {
	    key: 'sendBidRequest',
	    value: function sendBidRequest(placementConfig, bidResponseHandler) {
	      var _this2 = this;

	      var defaultBidResponseHandler = function defaultBidResponseHandler(bidResponse) {
	        _this2.handleBidRequestResponse(placementConfig, bidResponse);
	      };
	      bidResponseHandler = bidResponseHandler || defaultBidResponseHandler;

	      var bidRequest = this.resolveBidRequest(this.bidRequestConfig, placementConfig);

	      if (bidRequest) {
	        bidRequest.send(bidResponseHandler);
	      }
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
	    key: 'addNewPlacementConfig',
	    value: function addNewPlacementConfig(placementsConfigs) {
	      this.placementsConfigs.push(placementsConfigs);
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
	  }, {
	    key: 'resolveBidRequest',
	    value: function resolveBidRequest(bidRequestConfig, placementConfig) {
	      if (bidRequestConfig.dcn && placementConfig.pos) {
	        return new _nexageGet2.default(bidRequestConfig, placementConfig);
	      } else if (bidRequestConfig.network && placementConfig.placement) {
	        return new _marketplace2.default(bidRequestConfig, placementConfig);
	      } else if (this.isNexagePostRequest(placementConfig.openRtbParams)) {
	        return new _nexagePost2.default(bidRequestConfig, placementConfig);
	      }
	    }
	  }, {
	    key: 'isNexagePostRequest',
	    value: function isNexagePostRequest(openRtbParams) {
	      if (openRtbParams && openRtbParams.id && openRtbParams.imp[0]) {
	        var imp = openRtbParams.imp[0];

	        return this.isImpressionValid(imp);
	      }
	    }
	  }, {
	    key: 'isImpressionValid',
	    value: function isImpressionValid(imp) {
	      return imp.id && imp.tagid && (this.isBannerPresent(imp) || this.isVideoPresent(imp));
	    }
	  }, {
	    key: 'isBannerPresent',
	    value: function isBannerPresent(imp) {
	      return imp.banner && imp.banner.w && imp.banner.h;
	    }
	  }, {
	    key: 'isVideoPresent',
	    value: function isVideoPresent(imp) {
	      return imp.video && imp.video.mimes && imp.video.minduration && imp.video.maxduration;
	    }
	  }]);

	  return BidManager;
	}();

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
	      var itemsRegExp = /(img|iframe)[\s\S]*?src\s*=\s*("([^"]*)"|'([^']*)')/gi;
	      var tagNameRegExp = /\w*(?=\s)/;
	      var srcRegExp = /src\s*=\s*("|')([^\1]+)\1/i;
	      var pixelsItems = [];
	      var pixelsMatch = pixels.match(itemsRegExp);

	      if (pixelsMatch) {
	        pixelsMatch.forEach(function (item) {
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

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _templateObject = _taggedTemplateLiteral(['', '://', '/pubapi/3.0/', '/\n      ', '/0/-1/ADTECH;cmd=bid;cors=yes;\n      v=2;alias=', ';', ''], ['', '://', '/pubapi/3.0/', '/\n      ', '/0/-1/ADTECH;cmd=bid;cors=yes;\n      v=2;alias=', ';', '']);

	var _utils = __webpack_require__(5);

	var _utils2 = _interopRequireDefault(_utils);

	var _baseBidRequest = __webpack_require__(6);

	var _baseBidRequest2 = _interopRequireDefault(_baseBidRequest);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/***
	 * The class contains logic sending bid request to Adtech server
	 */
	var MarketplaceBidRequest = function (_BaseBidRequest) {
	  _inherits(MarketplaceBidRequest, _BaseBidRequest);

	  function MarketplaceBidRequest() {
	    _classCallCheck(this, MarketplaceBidRequest);

	    return _possibleConstructorReturn(this, (MarketplaceBidRequest.__proto__ || Object.getPrototypeOf(MarketplaceBidRequest)).apply(this, arguments));
	  }

	  _createClass(MarketplaceBidRequest, [{
	    key: 'formatUrl',
	    value: function formatUrl() {
	      var url = _utils2.default.formatTemplateString(_templateObject, 'protocol', 'hostName', 'network', 'placement', 'alias', 'bidFloorPrice');

	      var options = {
	        protocol: _utils2.default.resolveHttpProtocol(),
	        hostName: this.resolveHostName(),
	        network: this.bidRequestConfig.network,
	        placement: parseInt(this.placementConfig.placement),
	        alias: this.placementConfig.alias,
	        bidFloorPrice: this.resolveBidFloorPrice(this.placementConfig.bidFloorPrice)
	      };

	      return url(options);
	    }
	  }, {
	    key: 'resolveHostName',
	    value: function resolveHostName() {
	      var serverMap = MarketplaceBidRequest.SERVER_MAP;

	      return serverMap[this.bidRequestConfig.region] || serverMap.US;
	    }
	  }, {
	    key: 'resolveBidFloorPrice',
	    value: function resolveBidFloorPrice(floorPrice) {
	      return floorPrice ? 'bidfloor=' + floorPrice.toString() + ';' : '';
	    }
	  }]);

	  return MarketplaceBidRequest;
	}(_baseBidRequest2.default);

	MarketplaceBidRequest.SERVER_MAP = {
	  EU: 'adserver.adtech.de',
	  US: 'adserver.adtechus.com',
	  Asia: 'adserver.adtechjp.com'
	};

	exports.default = MarketplaceBidRequest;

/***/ },
/* 5 */
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
	   * @returns {string} protocol type
	   */
	  resolveHttpProtocol: function resolveHttpProtocol() {
	    return document.location.protocol === 'https:' ? 'https' : 'http';
	  },

	  /***
	   * Iterate through object properties or array elements
	   * @param {object|array} obj
	   * @param {function} callback
	   */
	  each: function each(obj, callback) {
	    if (!obj) {
	      return;
	    }

	    if (typeof obj.forEach === 'function') {
	      return obj.forEach(callback, undefined);
	    }

	    if (obj.length > 0) {
	      for (var i = 0; i < obj.length; i++) {
	        callback(obj[i], i, obj);
	      }
	    } else {
	      for (var key in obj) {
	        if (obj.hasOwnProperty(key)) {
	          callback(obj[key], key);
	        }
	      }
	    }
	  }
	};

	exports.default = utils;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _ajax = __webpack_require__(7);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/***
	 * Base class for all bid request objects
	 */
	var BaseBidRequest = function () {
	  function BaseBidRequest(bidRequestConfig, placementConfig) {
	    _classCallCheck(this, BaseBidRequest);

	    this.bidRequestConfig = bidRequestConfig;
	    this.placementConfig = placementConfig;
	  }

	  _createClass(BaseBidRequest, [{
	    key: 'send',
	    value: function send(bidRequestHandler) {
	      var bidRequestUrl = this.formatUrl(this.placementConfig);

	      (0, _ajax.sendGetRequest)(bidRequestUrl, bidRequestHandler);
	    }
	  }]);

	  return BaseBidRequest;
	}();

	exports.default = BaseBidRequest;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.sendRequest = sendRequest;
	exports.sendGetRequest = sendGetRequest;
	exports.sendPostRequest = sendPostRequest;

	var _utils = __webpack_require__(5);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Module for processing ajax requests
	 *
	 * @param {string} url requested url
	 * @param {Function} successCallback success result callback
	 */
	function sendRequest(url, successCallback) {
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	  var xhr = new XMLHttpRequest();
	  var responseHandler = function responseHandler() {
	    if (xhr.readyState === XMLHttpRequest.DONE && successCallback) {
	      successCallback(xhr.responseText);
	    }
	  };

	  xhr.withCredentials = true;

	  xhr.open(options.method, url);
	  xhr.onreadystatechange = responseHandler;

	  _utils2.default.each(options.customHeaders, function (value, key) {
	    xhr.setRequestHeader(key, value);
	  });

	  xhr.setRequestHeader('Content-Type', options.contentType || 'text/plain');

	  xhr.send(options.data);
	}

	function sendGetRequest(url, successCallback) {
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	  options.method = 'GET';

	  return sendRequest(url, successCallback, options);
	}

	function sendPostRequest(url, successCallback) {
	  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	  options.method = 'POST';

	  return sendRequest(url, successCallback, options);
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _templateObject = _taggedTemplateLiteral(['', '://', '/bidRequest?\n      dcn=', '&pos=', '&cmd=bid', ''], ['', '://', '/bidRequest?\n      dcn=', '&pos=', '&cmd=bid', '']);

	var _utils = __webpack_require__(5);

	var _utils2 = _interopRequireDefault(_utils);

	var _baseBidRequest = __webpack_require__(6);

	var _baseBidRequest2 = _interopRequireDefault(_baseBidRequest);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var NexageGetBidRequest = function (_BaseBidRequest) {
	  _inherits(NexageGetBidRequest, _BaseBidRequest);

	  function NexageGetBidRequest() {
	    _classCallCheck(this, NexageGetBidRequest);

	    return _possibleConstructorReturn(this, (NexageGetBidRequest.__proto__ || Object.getPrototypeOf(NexageGetBidRequest)).apply(this, arguments));
	  }

	  _createClass(NexageGetBidRequest, [{
	    key: 'formatUrl',
	    value: function formatUrl() {
	      var url = _utils2.default.formatTemplateString(_templateObject, 'protocol', 'hostName', 'dcn', 'pos', 'ext');
	      var options = {
	        protocol: _utils2.default.resolveHttpProtocol(),
	        hostName: this.bidRequestConfig.host || 'hb.nexage.com',
	        dcn: this.bidRequestConfig.dcn,
	        pos: this.placementConfig.pos,
	        ext: this.formatDynamicParams()
	      };

	      return url(options);
	    }
	  }, {
	    key: 'formatDynamicParams',
	    value: function formatDynamicParams() {
	      var params = '';
	      var ext = this.placementConfig.ext;

	      _utils2.default.each(ext, function (value, key) {
	        params += encodeURIComponent('&' + key + '=' + value);
	      });

	      return params;
	    }
	  }]);

	  return NexageGetBidRequest;
	}(_baseBidRequest2.default);

	exports.default = NexageGetBidRequest;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _templateObject = _taggedTemplateLiteral(['', '://', '/bidRequest?'], ['', '://', '/bidRequest?']);

	var _utils = __webpack_require__(5);

	var _utils2 = _interopRequireDefault(_utils);

	var _ajax = __webpack_require__(7);

	var _baseBidRequest = __webpack_require__(6);

	var _baseBidRequest2 = _interopRequireDefault(_baseBidRequest);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var NexagePostBidRequest = function (_BaseBidRequest) {
	  _inherits(NexagePostBidRequest, _BaseBidRequest);

	  function NexagePostBidRequest() {
	    _classCallCheck(this, NexagePostBidRequest);

	    return _possibleConstructorReturn(this, (NexagePostBidRequest.__proto__ || Object.getPrototypeOf(NexagePostBidRequest)).apply(this, arguments));
	  }

	  _createClass(NexagePostBidRequest, [{
	    key: 'formatUrl',
	    value: function formatUrl() {
	      var url = _utils2.default.formatTemplateString(_templateObject, 'protocol', 'hostName');
	      var options = {
	        protocol: _utils2.default.resolveHttpProtocol(),
	        hostName: this.bidRequestConfig.host || 'hb.nexage.com'
	      };

	      return url(options);
	    }
	  }, {
	    key: 'send',
	    value: function send(bidRequestHandler) {
	      var bidRequestUrl = this.formatUrl(this.placementConfig);
	      var options = {
	        contentType: 'application/json',
	        data: this.placementConfig.openRtbParams,
	        customHeaders: {
	          'x-openrtb-version': '2.2'
	        }
	      };

	      (0, _ajax.sendPostRequest)(bidRequestUrl, bidRequestHandler, options);
	    }
	  }]);

	  return NexagePostBidRequest;
	}(_baseBidRequest2.default);

	exports.default = NexagePostBidRequest;

/***/ }
/******/ ]);