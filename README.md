Private Blockchain Notary Service
=================================

About
-----

From Udacity:
> Data stored on a blockchain can vary from digital assets (e.g. documents, media) to copyrights and patent ownership. These pieces of data need to be reliably secured, and we require a way to prove they exist — this is where signing and validation are key. In this project you will build a private blockchain notary service to validate and provide proof of existence for your favorite star in the universe.

Supporting courses:
* Blockchain Web Services

Notes
-----

This project uses express to provide an API to register stars in the universe. To register a star, a user must first prove ownership of a wallet address by going through a timed handshake with the server using:

1. The `/requestValidation` endpoint to initiate validation. This endpoint provides the user with a message to sign and a validation window to complete the validation process within (default: 5 minutes).
2. The `/message-signature/validate` endpoint to complete validation by providing the signed message within the 5 minute window. See [test/generate-signature.js](https://github.com/brenj/private-blockchain-notary/blob/master/test/generate-signature.js) to sign a message manually for testing purposes.

Once validated, a user can then register a star using the `/block` endpoint. The API also contains endpoints for searching by block hash (`/hash:[HASH]`), block address (`/address:[ADDRESS]`), and block height (`/[HEIGHT]`). See the endpoints section below for more details.

Please note that because this project is for learning purposes only, there is no attempt made to validate star data. In the event this was a public facing API, a custom or third-party library would be needed to validate star data before registration. Also, the endpoint names were provided (and required) by Udacity.

Endpoints
---------

## Request Validation - initiates a request for validation
* __URL__: `/requestValidation`
* __Method__: `POST`
* __Required Parameters__
  * `{ "address:" "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31" }`
* __Success Response__
  * _Code_: `200`
  * _Example Content_:
  ```javascript
  {
    "address": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31",
    "requestTimestamp": "1539024605",
    "message": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31:1539024605:starRegistry",
    "validationWindow": 300
  }
  ```
* __Error Response__
  * _Codes_: `500`
  * _Example Content_: `{ "error:" true, message: "Something bad happened ಥ_ಥ" }`

## Validate Signature - validates a signed message within a validation window
* __URL__: `/message-signature/validate`
* __Method__: `POST`
* __Required Parameters__
  ```javascript
  {
    "address": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31",
    "signature": "IKZesuHUGrFWq6btamgHz4Si/2SUIGGRcvtSMVQd42lrIjaHQog4bFI5JuHetYZflWW5BzHCnJNSVzFU5mXmS5Q="
  }
  ```
* __Success Response__
  * _Code_: `200`
  * _Example Content_:
  ```
  {
    "registerStar": false,
    "status": {
        "address": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31",
        "requestTimestamp": 1539023844,
        "message": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31:1539023844:starRegistry",
        "validationWindow": 291,
        "messageSignature": "invalid"
    }
  }
  ```
* __Error Response__
  * _Codes_: `400`, `403`, `500`
  * _Example Content_: `{ "error:" true, message: "Something bad happened ಥ_ಥ" }`

## Register Star - registers a new star in the blockchain containing specified data
* __URL__: `/block`
* __Method__: `POST`
* __Required Parameters__
  ```javascript
  {
    "address": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31",
    "star": {
      "dec": "-26° 29' 24.9",
      "ra": "16h 29m 1.0s",
      "story": "Found star using https://www.google.com/sky/"
    }
  }
  ```
* __Success Response__
  * _Code_: `201`
  * _Example Content_:
  ```javascript
  {
    "body": {
        "address": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31",
        "star": 
        "dec": "-26° 29' 24.9"
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    }
    "height": 1,
    "previousBlockHash": "cf0d39b631ecfde41feb7599ef06fbbffe47197eaff949547698d8ef04af9b6d",
    "time": "1539024653"
    "hash": "93b81914d53bf079c31923851b17108506c19160f208f9d0a463420a37ce8acf"
  }
  ```
* __Error Response__
  * _Codes_: `400`, `403`, `500`
  * _Example Content_: `{ "error:" true, message: "Something bad happened ಥ_ಥ" }`

## Lookup Star (Address) - lookup star by wallet address
* __URL__: `stars/address:[ADDRESS]`
* __Method__: `GET`
* __Required Parameters__
  * `ADDRESS=[string]`
* __Success Response__
  * _Code_: `200`
  * _Example Content_
  ```javascript
  [
    {
        "body": {
            "address": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31",
            "star": {
                "dec": "-26 29 24.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
        },
        "height": 1,
        "previousBlockHash": "2736058a41afbb4c36ed579ec80ba52399a348603cd1d01f4cf26db03ff7186c",
        "time": "1538942458",
        "hash": "40c5a1115dcd6e7733271a50d9a167d80ea541af4cf349e9dcfcec1518d5cad7"
    },
    ...
  ]
  ```
* __Error Response__
  * _Codes_: `500`
  * _Example Content_: `{ "error": true, message: "Something bad happened ಥ_ಥ" }`
  
## Lookup Star (Hash) - lookup a star by its block hash
* __URL__: `stars/hash:[HASH]`
* __Method__: `GET`
* __Required Parameters__
  * `HASH=[string]`
* __Success Response__
  * _Code_: `200`
  * _Example Content_
  ```javascript
  {
    "body": {
        "address": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31",
        "star": {
            "dec": "-26° 29' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "Genesis Block"
        }
    },
    "height": 0,
    "previousBlockHash": "",
    "time": "1539023948",
    "hash": "cf0d39b631ecfde41feb7599ef06fbbffe47197eaff949547698d8ef04af9b6d"
  }
  ```
* __Error Response__
  * _Codes_: `500`
  * _Example Content_: `{ "error": true, message: "Something bad happened ಥ_ಥ" }`
  
## Lookup Star (Height) - look up a star in the blockchain for a specified height
* __URL__: `/block/[HEIGHT]`
* __Method__: `GET`
* __Required Parameters__
  * `HEIGHT=[integer]`
* __Success Response__
  * _Code_: `200`
  * _Example Content_
  ```javascript
  {
    "body": {
        "address": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31",
        "star": {
            "dec": "-26° 29' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "Genesis Block"
        }
    },
    "height": 0,
    "previousBlockHash": "",
    "time": "1539023948",
    "hash": "cf0d39b631ecfde41feb7599ef06fbbffe47197eaff949547698d8ef04af9b6d"
  }
  ```
* __Error Response__
  * _Codes_: `400`, `500`
  * _Example Content_: `{ "error": true, message: "Something bad happened ಥ_ಥ" }`

Requirements
------------
* Node
* Node Package Manager (npm)

Install & Run
-------------
1. `npm install`
2. `npm start`

Code Quality
------------
This codebase adheres to the [Airbnb JavaScript/React/JSX Style Guide](https://github.com/airbnb/javascript)

Code Organization (src)
-----------------------
```console
├── app.js
├── controllers
│   ├── index.js
│   ├── routes.js
│   └── stars.js
├── helpers
│   └── index.js
├── middlewares
│   └── index.js
└── models
    ├── block.js
    ├── blockchain.js
    ├── blockchainData.js
    └── starRequestData.js

4 directories, 10 files
```

Grading (by Udacity)
--------------------

Criteria                             |Highest Grade Possible  |Grade Recieved
-------------------------------------|------------------------|--------------
Blockchain ID Validation Routine     |Meets Specifications    |
Star Registration Endpoint           |Meets Specifications    |
Star Lookup                          |Meets Specifications    |
