const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");
const app = express();
const mysql = require("mysql2");
const dbConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "54321",
  database: "greatrift",
});

app.use(session({
  secret: "VHSAWBYCJGFVSJGHCGEHDHGHVCGHQWXS",
  resave: false,
  saveUninitialized: false
  cookie: { secure: false } // set to true if using HTTPS
}));

app.use(express.static("public")); // direct server to redirect any statci files(js,css,images) requests to the public folder
app.use(express.urlencoded({ extended: true })); // middleware to parse form data

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/about", (req, res) => {
  res.render("about.ejs");
});
app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});
app.get("/admin", (req, res) => {
  res.render("admindashboard.ejs");
});
app.get("/driver", (req, res) => {
  res.render("driverdashboard.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.post("/login", (req, res) => {
  // recievedlogin data - username,password,remember me
  const { username, password, remember } = req.body;
  dbConn.query(
    `SELECT * FROM admin_users WHERE username = "${username}"`,
    (err, results) => {
      // check for mysql connection of sql statements errors
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Internal Server Error");
      }
      // if there are no errors - then check if the username exists in the database - data matching the username provided in the login form
      console.log(results);
      if (results.length === 0) {
        return res.status(401).send("Invalid username or password");
      }
      // if the username exists - then check if the password provided in the login form matches the password hash stored in the database for that user
      const user = results[0];
      if (bcrypt.compareSync(password, user.password_hash)) {
        // use hashed passwords and a secure comparison method - bcrypt
        req.session.userId = user.admin_id;
        req.session.username = user.username;
        res.send("Login successful");

      } else {
        res.status(401).send("Invalid username or password");
      }
    },
  );
});
app.get("/register/admin", (req, res) => {
  res.render("registeradmin.ejs");
});
app.get("/register/driver", (req, res) => {
  res.render("registerdriver.ejs");
});
// get routes are for loading pages

//start the app
app.listen(3000, () => console.log("Server running on PORT 3000"));
