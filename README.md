# AOL Header Bidding JavaScript API

![](https://dl.dropboxusercontent.com/u/71280/AOLBlueMonster.png "Blue Monster")

## Description
  An open source library for publishers and third party container solution providers to integrate with AOL's demand side platform for header bidding.

## Install

    $ git clone git@github.com:aol/aol-hb.js.git
    $ cd aol-hb.js
    $ npm install
    
## Build

To build the project type in the terminal:
    
      $ gulp build
         
build results will be placed in /build directory

## Examples

Library initialization example:

```html
<script src="aol-hb.min.js"></script>
<script>
  var bidRequestConfig = {
    region: 'US',
    network: '9599.1',
    onBidResponse: function(response) {
      console.log('CPM: ' + response.cpm);
      console.log('Ad code: ' + response.ad);
    },
    bidderKey: 'aolbid',
    aliasKey: 'mpalias',
    onAllBidResponses: function () {
      console.log('onAllBidResponses handler');
    },
    userSyncOn: 'bidResponse'
  };

  var placementsConfigs = [{
    placement: 3675022,
    alias: '728x90atf',
    adContainerId: 'div-gpt-ad-1438955597722-1',
    bidfloor: '0.1'
  }, {
    placement: 3675026,
    alias: '300x250atf',
    adContainerId: 'div-gpt-ad-1438955597722-0',
  }];

  window.aolhb.init(bidRequestConfig, placementsConfigs);
</script>
```       

## Run unit tests

To run unit tests type in the terminal:
    
      $ gulp test-unit
               
## Run e2e tests

Preconditions: 
- Selenium server with chrome driver should be started

To run e2e tests type in the terminal:
    
      $ gulp test-e2e
