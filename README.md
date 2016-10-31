[![Build Status](https://travis-ci.org/vzhukovsky/pub-api.svg?branch=master)](https://travis-ci.org/vzhukovsky/pub-api)


# Pub api wrapper


**Table of Contents**

- [Install](#Install)
- [Build](#Build)
- [Run unit tests](#RunUnitTests)
- [Run e2e tests](#RunE2eTests)

<a name="Install"></a>

## Install

    $ clone the repository
    $ cd pub-api
    $ npm install
    
<a name="Build"></a>

## Build

  To build the project type in the terminal:
    
      $ gulp build
         
  After that build results will be placed in /build directory
    
<a name="RunUnitTests"></a>    
## Run unit tests

  To run unit tests type in the terminal:
    
      $ gulp tests-unit
            
<a name="RunE2eTests"></a>    
## Run e2e tests
   Preconditions: 
   - Selenium server with chrome driver should be started;

   To run e2e tests type in the terminal:
    
      $ gulp tests-e2e
