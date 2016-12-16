/***
 * The class contains logic for rendering ad(based on bid response config).
 */
class RenderingManager {
  constructor(bidResponse) {
    this.bidResponse = bidResponse;
    this.document = document;
  }

  render() {
    let iframe = this.createAdFrame();

    if (iframe) {
      this.renderPixels();
      this.insertElementInAdContainer(iframe);
      this.populateIframeContent(iframe);
    }
  }

  createAdFrame() {
    let iframe = this.document.createElement('iframe');

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

  insertElementInAdContainer(element) {
    let adContainer = this.document.getElementById(this.bidResponse.adContainerId);

    if (adContainer) {
      adContainer.appendChild(element);
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

  renderPixels() {
    if (this.bidResponse && this.bidResponse.pixels && !this.bidResponse.pixelsRendered) {
      let pixelsElements = this.parsePixelsItems(this.bidResponse.pixels);

      this.renderPixelsItems(pixelsElements);
    }
  }

  parsePixelsItems(pixels) {
    let itemsRegExp = /(img|iframe)[\s\S]*?src\s*=\s*("([^"]*)"|'([^']*)')/gi;
    let tagNameRegExp = /\w*(?=\s)/;
    let srcRegExp = /src\s*=\s*("|')([^\1]+)\1/;
    let pixelsItems = [];

    if (pixels) {
      pixels.match(itemsRegExp).forEach((item) => {
        let tagNameMatches = item.match(tagNameRegExp);
        let sourcesPathMatches = item.match(srcRegExp);

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

  renderPixelsItems(pixelsItems) {
    pixelsItems.forEach((item) => {
      switch (item.tagName) {
        case RenderingManager.PIXELS_ITEMS.img :
          this.renderPixelsImage(item);
          break;
        case RenderingManager.PIXELS_ITEMS.iframe :
          this.renderPixelsIframe(item);
          break;
      }
    });
  }

  renderPixelsImage(pixelsItem) {
    let image = new Image();

    image.src = pixelsItem.src;
  }

  renderPixelsIframe(pixelsItem) {
    let iframe = this.document.createElement('iframe');

    iframe.width = 1;
    iframe.height = 1;
    iframe.style = 'display: none';
    iframe.src = pixelsItem.src;
    this.document.body.appendChild(iframe);
  }
}

RenderingManager.PIXELS_ITEMS = {
  iframe: 'IFRAME',
  img: 'IMG'
};

export default RenderingManager;
