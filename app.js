var express = require("express");
var app = express();
var path = require('path');
var aes256 = require('aes256');

var mysql = require('mysql');
var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'qwerty1234',
    database:'passwordManager'
 });
module.exports = connection;

connection.connect((err)=>{
    if(!err) {
        console.log("The database is connected!");
    } else {
        console.log("Database error:"+err);
    }
});
global.connection = connection;


const bodyParser = require('body-parser');
// const {admin} = require('./firebaseConfig.js');
// const db = admin.firestore();
// const { auth } = admin.auth();
var session = require('express-session');
const { nextTick } = require("process");
app.use(session({
	secret: 'somthing',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var aes = require('./routes/aes');
var addCred = require('./routes/addCred');


function checkLog(req,res,next){
    if(req.session.loggedin)
        return next();
    else
        return res.redirect("/login");
}


app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    if(req.session.loggedin)
        res.redirect('/dashboard');
    else
        res.render("login",{msg:"please login!"});
    });


app.get('/login',async function(req,res){
    res.render('login',{msg:null});
})

app.post('/login',async function(req,res){
    var sess = req.session;
    
    var username = req.body.username;
    var password = req.body.password;
    console.log("user-input /login : ",username,",",password);
    var sql = "select password from users where username = ?";

    connection.query(sql,[username],async (err,results)=>{
        try {
            console.log(results[0]);
            if(results.length==0) {
                res.render("login",{msg:'incorrect credentials or user not found!'});
            }
            else if(aes256.decrypt(password ,results[0].password) == password) {
                req.session.loggedin = true;
                sess.username = username;
                sess.password = password;
                console.log("loggedin username:",username);
                res.redirect("/");
            }
            else {
                res.render("login",{msg:'incorrect credentials or user not found!'});
            }
        }
        catch(err) {
            console.log(err);
            res.render("login",{msg:"incorrect credentials!"});
        }
    });
});

//signup
app.get('/signup',async function(req,res){
    res.render('signup',{msg:null});
})

app.post('/signup',async function(req,res){
    var details = {
        username : req.body.username,
        password : await aes.encrypting(req.body.password,req.body.password)
    };

    var sql = "select * from users where username = ?";

    connection.query(sql,[details.username],async (err,results)=>{
        try {
            console.log(results[0]);
            if(results.length>0)
                res.render("signup",{msg:"user already exists!"});
            else {
                connection.query("insert into users set ?",[details], (err,results)=>{   
                    try { 
                        console.log("acc created successfully!");
                        res.redirect("/login");
                    }
                    catch(err) {
                        console.log("err while creating account!",err);
                        res.render("signup",{msg:"check credentials!"});
                    }
                });
            }
        }
        catch(err) {
            console.log(err);
            res.render("signup",{msg:"credentials wrongly formatted!"});
        }
    });
});

app.use(checkLog);
app.get('/dashboard', addCred.showCred);

app.post("/dashboard", addCred.addCred);

//------------------------------------logout functionality----------------------------------------------
app.get("/logout",async function(req,res){
    req.session.destroy(function(err) {
        console.log("user logged out!");
       res.redirect("/login");
    });
});

const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log("server started at port:4000");
})

