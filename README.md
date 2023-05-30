RedisPayPalAS7
==============
 
Sandbox Testing with PayPal Credit Card Generator using a live generating grocery store with absurdly inflated prices.

# Requirements
Make sure you have [Node.js](https://nodejs.org/en/download) installed.

This project requires a Redis database and PayPal Credentials.

<br />
<br />
<br />
<br />

[![Redis](https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Redis_Logo.svg/300px-Redis_Logo.svg.png)](https://redis.com/redis-enterprise/redis-insight/)

### Redis
1. Begin with the [Redis Database](https://redis.com/redis-enterprise/redis-insight/), Create an account or Log in.
1. Create a database. The public endpoint up until the colon (:) is your hostname. The port number is after the colon (:).
1. After database creation you may also use the hostname/port number/password and add it to [Redis Insight](https://redis.com/redis-enterprise/redis-insight/#insight-form) to use its GUI.

> Use Hostname/Port number and password in the application where it's required.

<br />
<br />
<br />
<br />

[![PayPal](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/300px-PayPal.svg.png)](https://developer.paypal.com/api/rest/)

### PayPal
1. Now head over to [PayPal Developer](https://developer.paypal.com/api/rest/), Create an account or Login.
1. Go to App & Credentials and Create an App to receive Client Id and Secret.
1. Access credit card generator under the 'Tools' tab.

After running application and using the credit card generator to make a purchase, check for your purchases under Event Logs -> API Calls on your PayPal Developer Dashboard.

> Use these credentials in the application where it's required.

<br />
<br />
<br />
<br />

# Installation

Install dependencies.
```
npm install
```
Run the server.
```
node server.js
```
Populate the database/server.
```
node datagen.js
```
