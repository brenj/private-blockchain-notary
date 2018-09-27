Private Blockchain Web Service API
==================================

About
-----

From Udacity:
> Create a backend API web service that is consumable for client applications. This project will emphasize the conversion of your private blockchain to a valuable web service.

Supporting courses:
* Blockchain Web Services

The web framework I chose to use for this project was `express`. I chose `express` because of its minimalist and unopinionated approach which allowed me to quickly build out a couple of HTTP endpoints.

Endpoints
---------

#### Get Block - Returns a block in the blockchain for a specified height.
* __URL__: `/block/:height`
* __Method__: `GET`
* __Required Parameters__
  * `height=[integer]`
* __Success Response__
  * _Code_: `200`
  * _Example Content_
  ```javascript
  {
      "error": false,
      "block": {
          "body": "GENESIS",
          "height": 0,
          "previousBlockHash": "",
          "time": "1537669354",
          "hash": "3af44777457c8cd3c3428f62b9263d92d2c38984a9746d381788796b646a9aee"
      }
  }
  ```
* __Error Response__
  * _Codes_: `400`, `404`, `500`
  * _Example Content_: `{ "error": true, message: "Something bad happened ಥ_ಥ" }`
  
#### Add Block - Adds a new block in the blockchain containing specified data.
* __URL__: `/block`
* __Method__: `POST`
* __Required Parameters__
  * `{ "body:" "My New Block" }`
* __Success Response__
  * _Code_: `201`
  * _Example Content_:
  ```javascript
  {
      "error": false,
      "block": {
          "body": "My New Block",
          "height": 2,
          "previousBlockHash": "ff92b188e8bb64200a21936f850c2bcc6f38908d5b32b2790c931c98e0be1c0a",
          "time": "1537669887",
          "hash": "1432cd7d82c658056261bbe9b75b2722ab15d63732c6ab94a5504bf8d0e6f486"
      }
  }
  ```
* __Error Response__
  * _Codes_: `400`, `500`
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
```console
├── README.md
├── package.json
└── src
    └── app.js

1 directory, 3 files
```

Grading (by Udacity)
--------------------

Criteria             |Highest Grade Possible  |Grade Recieved
---------------------|------------------------|--------------
Setup                |Meets Specifications    |Meets Specifications
functionality        |Meets Specifications    |Meets Specifications
Code Readability     |Meets Specifications    |Meets Specifications
