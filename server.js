const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const redis = require("redis");

// JSON MIDDLEWARE
app.use(express.json());

// Require the paypal Checkout API SDK
const paypal = require("@paypal/checkout-server-sdk");

// Client ID and secret are needed to access the API
let clientId = "";
let clientSecret = "";

// Need to create an "environment" with these credentails and give them to the Paypal Checkout API SDK
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let paypalClient = new paypal.core.PayPalHttpClient(environment);

// Create redis client with
// Set up database then add password/host and port to access
let client = redis.createClient({
    password: '',
    socket: {
        host: '',
    }
});

// Buffer Time
function wait(milliseconds) {
   return new Promise(resolve => setTimeout(resolve, milliseconds));
}


client.connect();

// Flush DB Command to refresh on server start (Uncomment first)
//client.flushAll();

// Async Function to subscribe to publishing channels (vegetables, fruits, breads)
async function receiver(){

    const subscriber = client.duplicate();

    await subscriber.connect();

    // Initialize ID if it does not exists
    // Increment ID if it does exists
    let exists = await client.exists("record_id");
    let record_id;
    if(exists == 0){
        record_id = 1;
        await client.set("record_id", record_id);
    } else {
        record_id = await client.get("record_id");
    }
    
    // Subscribing to vegetables
    // Emit data
    // Store data in redis db
    await subscriber.subscribe("vegetables", async (message) => {
        record_id = await client.get("record_id");
        
        let data = JSON.parse(message);
        let newItem = {
            id: record_id,
            category: "vegetables",
            type: data.type,
            grams: data.grams,
            calories: data.calories,
            price: data.price
        }

        io.emit("data-vegetable", newItem);
        client.set("item:" + record_id, message);
        client.incr("record_id");
    });

    // Subscribing to fruits
    // Emit data
    // Store data in redis db
    await subscriber.subscribe("fruits", async (message) => {
        record_id = await client.get("record_id");
        
        let data = JSON.parse(message);
        let newItem = {
            id: record_id,
            category: "fruits",
            type: data.type,
            grams: data.grams,
            calories: data.calories,
            price: data.price
        }

        io.emit("data-fruit", newItem);
        client.set("item:" + record_id, message);
        client.incr("record_id");
    });

    // Subscribing to breads
    // Emit data
    // Store data in redis db
    await subscriber.subscribe("breads", async (message) => {
        record_id = await client.get("record_id");
        
        let data = JSON.parse(message);
        let newItem = {
            id: record_id,
            category: "breads",
            type: data.type,
            grams: data.grams,
            calories: data.calories,
            price: data.price
        }

        io.emit("data-bread", newItem);
        client.set("item:" + record_id, message);
        client.incr("record_id");
    });

}

receiver();

// Connect to socket
io.on('connection', async function(socket){

    console.log("A connection is made...");

});

// Get Async data from front end (shopping cart)
async function getData(array){
    let shoppingCartData = [];

    for( const id of array){
        let item = await client.get("item:"+id);
        item = JSON.parse(item);
        let storeItem = {
            name: item.type,
            unit_amount: {
            currency_code: "CAD",
            value: item.price
            },
            quantity: 1
        };
        shoppingCartData.push(storeItem);
    }
    return shoppingCartData;
}

app.get("/", function(req,res) {
res.sendFile(__dirname + "/index.html");
});

// respond to AJAX request to create an order
app.post("/create-order", async (req, res) => {

    // Receive front end data
    // Calculate total
    let total = 0;
    let shoppingCartData = await getData(req.body.idArray);
    for( const item of shoppingCartData){
        total += item.unit_amount.value;
    }

    // create order request body
    const request = new paypal.orders.OrdersCreateRequest();
  
    // populate the body with the required information to carry out the request
    // Populated items with shoppingCartData and total amount with total
    request.prefer("return=representation")
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "CAD",
            value: total,
            breakdown: {
              item_total: {
                currency_code: "CAD",
                value: total,
              },
            },
          },
  
          items: shoppingCartData,
        },
      ],
    })
  
    // execute the request, send back the result id as a response to this 
    // AJAX request
    try {
      const order = await paypalClient.execute(request)
      
      res.json({ id: order.result.id })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

// Sends back the image files when they are requested
app.get(/^(.+)$/, function(req,res){
    res.sendFile(__dirname + req.params[0]);
});

http.listen(3000, function(){
    // Check if server is live
    console.log('listening on *:3000');
});