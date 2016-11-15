/***
 * The class contains logic for rendering ad(based on bid response config).
 */
export default class RenderAdManager {
  constructor(bidResponse, document) {
    this.bidResponse = bidResponse;
    this.document = document;
  }

  render() {
    var iframe = this.createAdFrame();

    if (iframe) {
      this.insertElement(iframe);
      this.populateIframeContent(iframe);
    }
  }

  createAdFrame() {
    var iframe = this.document.createElement('iframe');

    iframe.seamless = 'seamless';
    iframe.id = 'adtpub-frame-' + this.bidResponse.adContainerId;
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

  insertElement(iframe) {
    var element = this.document.getElementById(this.bidResponse.adContainerId);

    element.appendChild(iframe);
  }

  populateIframeContent(iframe) {
    var html = '<head><\/head><body><style>body,html{margin:0;padding:0;}</style>' +
      this.bidResponse.ad + '<\/body>';

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();
  }
}
