
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

 /* app.use('/', require('./routes/index.js'));*/
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
const air = new queue();
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
air.enqueue('4.26');
// waiting for message from topic
client.on('message', (topic, payload) => {
  //console.log('Received Message:', topic, payload.toString())
  var obj = JSON.parse(payload.toString());
  var arr=[obj.CO,obj.CO2,obj.NH4,obj.Tolueno,obj.Alcohol,obj.Acetona]
  // console.log(arr)
  air.enqueue(obj.NH4);
  if(air.getSize() > 5){
    air.dequeue();
  }
  console.log(air);
  /*
  app.get('/dashboard', function(req, res) {
    var num=air.dequeue(); 
    res.render('dashboard',{value1:num});
  }); */
  io.on("connection", function(socket)
	{
		socket.on("disconnect", function()
		{});
				var data=air;
        socket.emit("Server-sent-data", data);
	});

// create route, display view

app.get("/dashboard", function(req, res)
	{
		res.render("dashboard");
	});

})
////////////////////////////////////////////////


// tạo kết nối giữa client và server
// io.on("connection", function(socket)
// 	{
// 		socket.on("disconnect", function()
// 			{
// 			});
//          //server lắng nghe dữ liệu từ client
// 		// socket.on("Client-sent-data", function(data)
// 			// {
// 				//sau khi lắng nghe dữ liệu, server phát lại dữ liệu này đến các client khác
//                 socket.emit("Server-sent-data", data);
// 	// 		 });
// 	});

// // create route, display view

// app.get("/dashboard", function(req, res)
// 	{
// 		res.render("dashboard");
// 	});





