
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

// Passport Config
require('./config/passport')(passport);
require('events').EventEmitter.prototype._maxListeners = 100;



// DB Config
//const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    'mongodb://localhost:27017/prj3',
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views','./views');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js')); 

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, console.log(`Server running on  ${PORT}`));

// import mqtt lib
const mqtt = require('mqtt')
const mqtt_server = '192.168.1.231' // xem ip trong cmd
const port_mqtt = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const connectUrl = `mqtt://${mqtt_server}:${port_mqtt}`

// connect to mqtt broker
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
})
//subscribe topic
const topic = '/ktmt/out'
client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
})
// subscribe topic 2
const topic2 = '/ktmt/out/2'
client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic2], () => {
    console.log(`Subscribe to topic '${topic2}'`)
  })
})
// insert data to queue
 class queue {
  constructor() {
      this.items=[];
  }
  enqueue(item) {
      this.items.push(item);
  }
  dequeue() {
      return this.items.shift();
  }
  peek(){
      return this.items[0];
  }
  getSize(){
      return this.items.length;
  }
  isEmpty(){
      return this.getSize()===0;
  }
}
const airNH4 = new queue();
airNH4.enqueue('4.26');
airNH4.enqueue('4.26');
const airCO = new queue();
airCO.enqueue('4.26');
airCO.enqueue('4.26');
const airCO2 = new queue();
airCO2.enqueue('4.26');
airCO2.enqueue('4.26');
const airTolueno = new queue();
airTolueno.enqueue('4.26');
airTolueno.enqueue('4.26');
// waiting for message from topic
client.on('message', (topic, payload) => {
  //console.log('Received Message:', topic, payload.toString())
  var obj = JSON.parse(payload.toString());
  var arr=[obj.CO,obj.CO2,obj.NH4,obj.Tolueno]
  // console.log(arr)
  airNH4.enqueue(obj.NH4);
  airCO.enqueue(obj.CO);
  airCO2.enqueue(obj.CO2);
  airTolueno.enqueue(obj.Tolueno);
  if(airNH4.getSize() > 2){
    airNH4.dequeue();
  }
  if(airCO.getSize() > 2){
    airCO.dequeue();
  }
  if(airCO2.getSize() > 2){
    airCO2.dequeue();
  }
  if(airTolueno.getSize() > 2){
    airTolueno.dequeue();
  }
  // connect socketio
  io.on("connection", function(socket)
	{
		socket.on("disconnect", function()
		{});
				var dataNH4=airNH4;
        var dataCO=airCO;
        var dataCO2=airCO2;
        var dataTolueno=airTolueno;
        socket.emit("Server-sent-dataNH4", dataNH4); // truyền data nh4 sang client
        socket.emit("Server-sent-dataCO", dataCO);  // truyền data co sang client
        socket.emit("Server-sent-dataCO2", dataCO2);  // truyền data co2 sang client
        socket.emit("Server-sent-dataTolueno", dataTolueno);  // truyền data tolueno sang client
	});
  

// create route, display view

  // app.get("/dashboard", function(req, res)
	// {
	// 	res.render("dashboard");
	// });
});




