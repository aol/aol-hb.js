import GlobalContext from 'src/aol-hb.js';

describe('GlobalContext', () => {

  it('should have the global variable aolhb and its properties', () => {
    expect(GlobalContext).to.be.a('object');
    expect(GlobalContext).to.have.property('queue').that.is.a('array');
    expect(GlobalContext).to.have.property('init').that.is.a('function');
  });

  it('Should initiate the library and set a public API', () => {
    GlobalContext.init({}, []);
    expect(GlobalContext).to.have.property('renderAd').that.is.a('function');
    expect(GlobalContext).to.have.property('getBidResponse').that.is.a('function');
    expect(GlobalContext).to.have.property('refreshAd').that.is.a('function');
    expect(GlobalContext).to.have.property('addNewAd').that.is.a('function');
  });

});
