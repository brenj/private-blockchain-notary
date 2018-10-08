Private Blockchain Notary Service
=================================

About
-----

From Udacity:
> Data stored on a blockchain can vary from digital assets (e.g. documents, media) to copyrights and patent ownership. These pieces of data need to be reliably secured, and we require a way to prove they exist — this is where signing and validation are key. In this project you will build a private blockchain notary service to validate and provide proof of existence for your favorite star in the universe.

Supporting courses:
* Blockchain Web Services

Endpoints
---------

## Request Validation - initiates a request for validation.
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

## Validate Signature - validates a signed message within a validation window.
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

## Register Star - registers a new star in the blockchain containing specified data.
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
    "error": false,
    "block": {
        "body": {
            "address": "19AAjaTUbRjQCMuVczepkoPswiZRhjtg31",
            "star": {
                "dec": "-26° 29' 24.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
            }
        },
        "height": 1,
        "previousBlockHash": "cf0d39b631ecfde41feb7599ef06fbbffe47197eaff949547698d8ef04af9b6d",
        "time": "1539024653",
        "hash": "93b81914d53bf079c31923851b17108506c19160f208f9d0a463420a37ce8acf"
    }
  }
  ```
* __Error Response__
  * _Codes_: `400`, `403`, `500`
  * _Example Content_: `{ "error:" true, message: "Something bad happened ಥ_ಥ" }`

Requirements
------------
* Node
* Node Package Manager (npm)

Install & Run
-------------
1. `npm install`
2. `node src/app.js`

Code Quality
------------
This codebase adheres to the [Airbnb JavaScript/React/JSX Style Guide](https://github.com/airbnb/javascript)

Code Organization
-----------------

Grading (by Udacity)
--------------------

Criteria                             |Highest Grade Possible  |Grade Recieved
-------------------------------------|------------------------|--------------
Blockchain ID Validation Routine     |Meets Specifications    |
Star Registration Endpoint           |Meets Specifications    |
Star Lookup                          |Meets Specifications    |
