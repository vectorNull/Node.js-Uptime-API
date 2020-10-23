# Node.js Uptime API

This is a RESTful Node.js-based uptime monitoring API that can be used by any number of front-ends.

The following folders will need to be added when the repo is cloned to your localhost for testing

* .data/checks
* .data/tokens
* .data/users
* .data/https
* .logs

The https folder must container your cert.pem and key.pem

Example API requests sent via Postman

To create a user include the following requred fields:

    {
        "firstName": "<firstName>",
        "lastName": "<lastName>",
        "phone": "<10 digit number>",
        "password": "<password>",
        "tosAgreement": true
    }

To create a check for a particular site:

    {
        "protocol": "https",
        "url": "yahoo.com",
        "method": "get",
        "successCodes": [200, 201, 301, 302],
        "timeoutSeconds": 3
    }
Be sure to include the token that's created by making a request like this:

    GET HTTP://localhost:3000/tokens

Include the following required fields in the body of the request:

    {
        "phone": "<phone>",
        "password": "<password>"
    }

This API include logging, logging compression, and log truncation. It was also tested using Postman. 
Let me know if you have any questions.

