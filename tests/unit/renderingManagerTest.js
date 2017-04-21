import RenderingManager from 'src/renderingManager';

describe('RenderAdManager', () => {
  let getSubject = (bidResponse) => {
    let document = {
      createElement: () => {},
      getElementById: () => {},
      body: {
        appendChild: () => {}
      }
    };
    let renderingManager = new RenderingManager(bidResponse || {});
    renderingManager.document = document;

    return renderingManager;
  };

  describe('createAdFrame()', () => {
    it('should return iframe element with settings', () => {
      let subject = getSubject({
        adContainerId: 'ad-container-id',
        width: 'value-width',
        height: 'value-height'
      });
      let iframeElement = {
        style: {},
        setAttribute: () => {}
      };
      let setAttributeStub = sinon.stub(iframeElement, 'setAttribute');
      let createElementStub = sinon.stub(subject.document, 'createElement').returns(iframeElement);

      subject.createAdFrame();
      expect(createElementStub.withArgs('iframe').calledOnce).to.be.true;
      expect(setAttributeStub.withArgs('allowFullScreen', 'true').calledOnce).to.be.true;
      expect(setAttributeStub.withArgs('mozallowFullScreen', 'true').calledOnce).to.be.true;
      expect(setAttributeStub.withArgs('webkitAllowFullScreen', 'true').calledOnce).to.be.true;
      expect(iframeElement.id).to.equal('aol-pub-frame-ad-container-id');
      expect(iframeElement.width).to.equal('value-width');
      expect(iframeElement.height).to.equal('value-height');
    });
  });

  describe('insertElementInAdContainer()', () => {
    let renderingManager;
    let getElementByIdStub;

    beforeEach(() => {
      renderingManager = getSubject({
        adContainerId: 'ad-container-id'
      });

      getElementByIdStub = sinon.stub(renderingManager.document, 'getElementById');
    });

    afterEach(() => {
      getElementByIdStub.reset();
    });

    it('should not insert element in the container if it is not found', () => {
      renderingManager.insertElementInAdContainer('element-for-insert');
      expect(getElementByIdStub.calledOnce).to.be.true;
    });

    it('should insert element in the container if it is found', () => {
      let element = {
        appendChild: () => {}
      };
      let appendChildSpy = sinon.spy(element, 'appendChild');
      getElementByIdStub.returns(element);

      renderingManager.insertElementInAdContainer('element-for-insert');
      expect(getElementByIdStub.calledOnce).to.be.true;
      expect(appendChildSpy.withArgs('element-for-insert').calledOnce).to.be.true;
    });
  });

  describe('prepareAdForIframe()', () => {
    it('should return undefined for undefined parameter', () => {
      let subject = getSubject();

      expect(subject.prepareAdForIframe()).to.be.undefined;
    });

    it('should return formatted frame content for existing ad', () => {
      let subject = getSubject();
      let adContent = '<some-ad-content/>';
      let expectedIframeContent = '<head><\/head><body><style></style>' + adContent + '<\/body>';

      expect(subject.prepareAdForIframe(adContent)).to.equal(expectedIframeContent);
    });
  });

  describe('renderAd()', () => {
    let renderingManager;
    let createAdFrameStub;
    let insertElementStub;
    let populateIframeContentStub;
    let renderPixelsStub;

    beforeEach(() => {
      renderingManager = getSubject();
      createAdFrameStub = sinon.stub(renderingManager, 'createAdFrame');
      insertElementStub = sinon.stub(renderingManager, 'insertElementInAdContainer');
      populateIframeContentStub = sinon.stub(renderingManager, 'populateIframeContent');
      renderPixelsStub = sinon.stub(renderingManager, 'renderPixels');
    });

    afterEach(() => {
      createAdFrameStub.reset();
      insertElementStub.reset();
      populateIframeContentStub.reset();
      renderPixelsStub.reset();
    });

    it('should not call rendering methods when ad data is not present', () => {
      renderingManager.renderAd();

      expect(insertElementStub.calledOnce).to.be.false;
      expect(populateIframeContentStub.calledOnce).to.be.false;
      expect(renderPixelsStub.calledOnce).to.be.false;
    });

    it('should call rendering methods when ad data is present', () => {
      createAdFrameStub.returns({});
      renderingManager.renderAd();

      expect(insertElementStub.calledOnce).to.be.true;
      expect(populateIframeContentStub.calledOnce).to.be.true;
      expect(renderPixelsStub.calledOnce).to.be.true;
    });
  });

  describe('parsePixelsItems()', () => {
    it('should return empty for empty string parameter', () => {
      let subject = getSubject();

      expect(subject.parsePixelsItems('')).to.be.empty;
    });

    it('should return parsed items when pixels are present', () => {
      let subject = getSubject();
      let pixels = '<script type="text/javascript">' +
        'document.write(\'<img src="url1.com">\');' +
        'document.write(\'' +
        '<iframe src="url2.com"></iframe>\');' +
        'document.write(\'' +
        '<img src="url3.com">\'); ' +
        'document.write(\'<img src=\'url4.com\'>\');' +
        'document.write(\'' +
        '<iframe src=\'url5.com\'></iframe>\');' +
        'document.write(\'' +
        '<img src=\'url6.com\'>\'); ' +
        '<iframe src = \'url7.com\'></iframe>\');' +
        '</script>';

      expect(subject.parsePixelsItems(pixels)).to.deep.equal([
        {tagName: 'IMG', src: 'url1.com'},
        {tagName: 'IFRAME', src: 'url2.com'},
        {tagName: 'IMG', src: 'url3.com'},
        {tagName: 'IMG', src: 'url4.com'},
        {tagName: 'IFRAME', src: 'url5.com'},
        {tagName: 'IMG', src: 'url6.com'},
        {tagName: 'IFRAME', src: 'url7.com'}

      ]);
    });
  });

  describe('renderPixels()', () => {
    let renderingManager;
    let parsePixelsItemsStub;
    let renderPixelsItemsStub;

    beforeEach(() => {
      $$AOLHB_GLOBAL$$.pixelsDropped = false;
      renderingManager = getSubject();

      parsePixelsItemsStub = sinon.stub(renderingManager, 'parsePixelsItems');
      renderPixelsItemsStub = sinon.stub(renderingManager, 'renderPixelsItems');
    });

    it('should not call pixels rendering when pixels are undefined', () => {
      renderingManager.bidResponse = {};

      renderingManager.renderPixels();
      expect(parsePixelsItemsStub.called).to.be.false;
      expect(renderPixelsItemsStub.called).to.be.false;
      expect($$AOLHB_GLOBAL$$.pixelsDropped).to.be.false;
    });

    it('should not call pixels rendering when pixels are already rendered', () => {
      renderingManager.bidResponse = {
        pixels: {}
      };
      $$AOLHB_GLOBAL$$.pixelsDropped = true;

      renderingManager.renderPixels();
      expect(parsePixelsItemsStub.called).to.be.false;
      expect(renderPixelsItemsStub.called).to.be.false;
    });

    it('should call pixels rendering when pixels are not rendered yet', () => {
      renderingManager.bidResponse = {
        pixels: 'pixels-content'
      };
      parsePixelsItemsStub.returns('pixels-elements');

      renderingManager.renderPixels();
      expect(parsePixelsItemsStub.withArgs('pixels-content').calledOnce).to.be.true;
      expect(renderPixelsItemsStub.withArgs('pixels-elements').calledOnce).to.be.true;
      expect($$AOLHB_GLOBAL$$.pixelsDropped).to.be.true;
    });
  });

  describe('renderPixelsIframe()', () => {
    it('should create iframe and render if for pixels item', () => {
      let renderingManager = getSubject();
      let createElementStub = sinon.stub(renderingManager.document, 'createElement').returns({
        name: 'iframe-object'
      });
      let appendChildStub = sinon.stub(renderingManager.document.body, 'appendChild');
      let expectedIframe = {
        name: 'iframe-object',
        width: 1,
        height: 1,
        style: 'display: none',
        src: 'src-url'
      };

      renderingManager.renderPixelsIframe({
        src: 'src-url'
      });
      expect(createElementStub.withArgs('iframe').calledOnce).to.be.true;
      expect(appendChildStub.withArgs(expectedIframe).calledOnce).to.be.true;
    });
  });
});
