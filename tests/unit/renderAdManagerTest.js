import RenderAdManager from 'src/renderAdManager';

describe('Render ad module tests', () => {
  let getSubject = (bidResponse) => {
    var document = {
      createElement: () => {},
      getElementById: () => {}
    };

    return new RenderAdManager(bidResponse || {}, document);
  };
  let getIframe = () => {
    return {
      style: {},
      setAttribute: () => {}
    };
  };

  it('Create ad frame method test', () => {
    let subject = getSubject({
      adContainerId: 'ad-container-id',
      width: 'value-width',
      height: 'value-height'
    });
    let iframeElement = getIframe('frame-id');
    let setAttributeStub = sinon.stub(iframeElement, 'setAttribute');
    let createElementStub = sinon.stub(subject.document, 'createElement').returns(iframeElement);

    subject.createAdFrame();
    expect(createElementStub.withArgs('iframe').calledOnce).to.be.true;
    expect(setAttributeStub.withArgs('allowFullScreen', 'true').calledOnce).to.be.true;
    expect(setAttributeStub.withArgs('mozallowFullScreen', 'true').calledOnce).to.be.true;
    expect(setAttributeStub.withArgs('webkitAllowFullScreen', 'true').calledOnce).to.be.true;
    expect(iframeElement.id).to.equal('adtpub-frame-ad-container-id');
    expect(iframeElement.width).to.equal('value-width');
    expect(iframeElement.height).to.equal('value-height');

    setAttributeStub.reset();
    createElementStub.reset();
  });

  it('Insert element method test', () => {
    let subject = getSubject({
      adContainerId: 'ad-container-id'
    });
    let element = {
      appendChild: () => {}
    };
    let appendChildSpy = sinon.spy(element, 'appendChild');
    let getElementByIdStub = sinon.stub(subject.document, 'getElementById').returns(undefined);

    subject.insertElement('element-for-insert');
    // If element is not found do not not call insert
    expect(appendChildSpy.calledOnce).to.be.false;

    getElementByIdStub.returns(element);
    subject.insertElement('element-for-insert');
    // If element is found call insert
    expect(appendChildSpy.withArgs('element-for-insert').calledOnce).to.be.true;
  });
});
