/***
 * The class contains logic for rendering ad(based on bid response config).
 */
export default class RenderAdManager {
  constructor(bidResponse) {
    this.bidResponse = bidResponse;
    this.document = document;
  }

  render() {
    let iframe = this.createAdFrame();

    if (iframe) {
      this.insertElement(iframe);
      this.populateIframeContent(iframe);
    }
  }

  createAdFrame() {
    let iframe = this.document.createElement('iframe');

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
    let element = this.document.getElementById(this.bidResponse.adContainerId);

    if (element) {
      element.appendChild(iframe);
    }
  }

  prepareAdForIframe(adContent) {
    if (adContent) {
      return `<head><\/head><body><style></style>${adContent}<\/body>`;
    }
  }

  populateIframeContent(iframe) {
    let iframeContent = this.prepareAdForIframe(this.bidResponse.ad);

    if (iframeContent) {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(iframeContent);
      iframe.contentWindow.document.close();
    }
  }

  renderPixels(bidResponse) {
    alert('1234' + bidResponse);
  }
}
