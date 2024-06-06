const app = require('express')();
const server = require('http').createServer(app);
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const technicienRoutes = require("./routes/technicien.route");
const taskRoutes = require("./routes/task.route");
const reportRoutes = require("./routes/report.route");
const Authentication = require("./Middleware/authentication");
const cors = require('cors');

const io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });

dotenv.config({ path: ".env" });

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionSuccessStatus: 200
}

io.on('connection', (socket) => { 
    console.log(`connection ${socket.id}`)
});


app.use((req, res, next)=>{
    req.io = io
    return next()
})

app.use(cors(corsOptions));


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, Content-type, Accept, autharization"
    );
    res.setHeader(
        "Access-Control-Allow-Methodes",
        "GET, POST, PUT, DELETE"
    );
    
    // any methods except login
    if( !(req.url=="/login") ){
        if(req.headers["x-auth-token"] != undefined){
            Authentication.VerifyToken(req.headers["x-auth-token"])
        }else{
            res.status(500).json({success:false, message:"Authentication failed, Please send your API token(X-Auth-Token in header)"})
            return;
        }
    }
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

connectDB();

app.use(technicienRoutes); 
app.use(taskRoutes);
app.use(reportRoutes);


server.listen(process.env.PORT, ()=> {
    console.log('connected to server')
});
