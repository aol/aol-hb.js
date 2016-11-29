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
         
build results will be placed in /build directory. It contains:
- aol-hb.js - source file
- aol-hb.min.js - minified source file.

## Installation

- Load source file.
- Define bid request configuration and an array of placement configurations.
- Pass defined objects in the method aolhb.init.

Example:

```html
<script src="aol-hb.min.js"></script>
<script>
  var bidRequestConfig = {
    region: 'US',
    network: '9599.1',
    bidderKey: 'aolbid',
    aliasKey: 'mpalias',
    userSyncOn: 'adRender',
    onBidResponse: function(response) {
      console.log('CPM: ' + response.cpm);
      console.log('Ad code: ' + response.ad);
      console.log('Alias: '+ response.alias);
    },
    onAllBidResponses: function (bidResponses) {
      console.log('Bid responses array: ', bidResponses);
    }
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


## API description

### Methods

- `aolhb.init()`  
   Library initialization method. It sends bid request for each placement based on configs passed as params.  
   Params: `bidRequestConfig`, `placementsConfigs`

- `aolhb.refreshAd()`  
   Resend bid request for particular placement by its alias.  
   Params: `placementAlias`

- `aolhb.renderAd()`  
   Render an ad by placement alias.  
   Params: `placementAlias`

### Bid request configuration options

- `region`  
  *Optional* String (defaults to `US`). The region for resolving host server.  
  Supported values: `US`, `EU`, `Asia`
  
- `onBidResponse`  
  *Optional*. Function. Сalls for each bid response.
  
- `onAllBidResponses`  
  *Optional*. Function. Сalls when we've got responses for each bid request.
  
- `bidderKey`  
  *Optional*. String (defaults to `aolbid`). Bidder key. 
  
- `aliasKey`  
  *Optional*. String (defaults to `mpalias`). Alias key.
  
- `userSyncOn`  
  *Optional*. String (defaults to `bidResponse`).  
  Supported values: `bidResponse`, `adRender` 
    
- `network`  
  **Required** String. Network identifier.
  Format: 'networkId.subNetworkId'  
  Sub network part can be missed  
  Examples: `9544.99`, `9568`
  
### Placement configuration options

- `bidfloor`  
  *Optional* String. Floor proice for the placement. 

- `placement`  
  **Required** String. Placement identifier.

- `alias`  
  **Required** String. Placement alias.
  
- `adContainerId`  
  **Required** String. Id of element in the DOM where an ad will be rendered.
  
## Run unit tests

For running unit tests type in the terminal:
    
      $ gulp test-unit
               
## Run e2e tests

Preconditions: 
- Selenium server with chrome driver should be started

For running e2e tests type in the terminal:
    
      $ gulp test-e2e

For opening e2e test pages in browsers type in the terminal:

      $ gulp test-e2e-manual        
