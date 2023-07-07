
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 30000;

app.use("/assests", express.static("assests"));

// Create a new SQLite database object
const db = new sqlite3.Database("database2.db");

// Connect to the database
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL, email TEXT NOT NULL)"
  );

  console.log("Connected to SQLite database.");
});

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/signup", (req, res) => {
  const { username, password, email } = req.body;
  console.log("Received form data:", username, password, email);
  const insertQuery = "INSERT INTO users (username,password,email) VALUES ($username, $password,$email)";
  db.run(insertQuery, { $username: username,$password:password,$email: email }, function(err) {
    if (err) {
      return console.error("Error inserting data:", err.message);
    }
    console.log("Data inserted successfully. Row ID:", this.lastID);
    res.redirect("/login");
  });
  
});

app.post("/login", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.all("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], function(err, rows) {
    if (err) {
      console.error("Error executing query:", err);
      res.redirect("/");
    } else {
      if (rows.length > 0) {
        res.redirect("/flight_search");
      } else {
        res.send('<script>alert("Invalid username or password."); window.location.href = "/login";</script>');
      }
    }
  });
});

app.post("/admin", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  db.all("SELECT * FROM admin WHERE username = ? AND password = ?", [username, password], function(err, rows) {
    if (err) {
      console.error("Error executing query:", err);
      res.redirect("/");
    } else {
      if (rows.length > 0) {
        res.redirect("/viewall");
      } else {
        res.send('<script>alert("Invalid username or password."); window.location.href = "/admin";</script>');
      }
    }
  });
});


app.post("/add", (req, res) => {
  const { fnumber, ftime, from, to,fdate } = req.body;
  console.log("Received form data:", fnumber, ftime, from, to,fdate);
  const insertQuery = "INSERT INTO `add` (fnumber, ftime, `from`, `to`,`fdate`) VALUES (?, ?, ?, ?,?)";
  db.run(insertQuery, [fnumber, ftime, from, to,fdate], function(err) {
    if (err) {
      return console.error("Error inserting data:", err.message);
    }
    console.log("Data inserted successfully. Row ID:", this.lastID);
    res.redirect("/adminpannel_add_flight");
  });
});
var fd
var ft
app.post("/search_flight", (req, res) => {
  const {from,to,fdate,ftime } = req.body;
  fd=fdate
  ft=ftime
  console.log(fdate,ftime)
  db.all("SELECT * FROM `add` WHERE fdate = ? AND ftime = ?", [fdate, ftime], function(err, rows) {
    if (err) {
      console.error("Error executing query:", err);
      res.redirect("/");
    } else {
      const tableRows = rows.map(row => {
        return `
          <tr>
            <td>${row.fnumber}</td>
            <td>${row.from}</td>
            <td>${row.to}</td>
            <td>${row.ftime}</td>
            <td>${row.fdate}</td>
            <td><a href="seats">book</a></td>
          </tr>
        `;
      }).join("");
      
      // Render the HTML with the table rows
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Flight Management System</title>
          <link rel="stylesheet" href="/assests/viewallbooking.css">
          <style>
            .search-bar {
              display: inline-block;
              margin-right: 10px;
              padding: 5px;
              border: 1px solid #ccc;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
         <div class="content-container">
            <h2>View All Bookings</h2>
            <table>
              <tr style="color: #1b1e36;">
                <th>Flight Number</th>
                <th>From</th>
                <th>To</th>
                <th>Flight Time</th>
                <th>Date</th>
              </tr>
              ${tableRows}
            </table>
          </div>
          <script>
            var addFlightsLink = document.querySelector('a[href="adminpannel_add_flight.html"]');
            var removeFlightsLink = document.querySelector('a[href="remove_flight.html"]');
            var viewAllBookingsLink = document.querySelector('a[href="viewallbooking.html"]');
        
            addFlightsLink.addEventListener('click', function() {
              viewAllBookingsLink.classList.remove('active');
              addFlightsLink.classList.add('active');
              removeFlightsLink.classList.remove('active');
              // Code to display add flight section
            });
        
            removeFlightsLink.addEventListener('click', function() {
              viewAllBookingsLink.classList.remove('active');
              addFlightsLink.classList.remove('active');
              removeFlightsLink.classList.add('active');
              // Code to display remove flight section
            });
        
            viewAllBookingsLink.addEventListener('click', function() {
              viewAllBookingsLink.classList.add('active');
              addFlightsLink.classList.remove('active');
              removeFlightsLink.classList.remove('active');
              // Code to display view all bookings section
            });
          </script>
        </body>
        </html>
      `;
      
      res.send(html);
    }
  });
});

  


app.post("/remove", (req, res) => {
  const { fnumber } = req.body;
  console.log("Received fnumber to remove:", fnumber);
  const deleteQuery = "DELETE FROM `add` WHERE fnumber = ?";
  db.run(deleteQuery, [fnumber], function(err) {
    if (err) {
      return console.error("Error deleting data:", err.message);
    }
    console.log("Data deleted successfully. Rows affected:", this.changes);
    res.redirect("/viewall");
  });
});
app.post("/search", (req, res) => {
  var fdate = req.body.fdate;
  var ftime = req.body.ftime;
  console.log(fdate,ftime)
  db.all("SELECT * FROM `add` WHERE fdate = ? AND ftime = ?", [fdate, ftime], function(err, rows) {
    if (err) {
      console.error("Error executing query:", err);
      res.redirect("/");
    } else {
      const tableRows = rows.map(row => {
        return `
          <tr>
            <td>${row.fnumber}</td>
            <td>${row.from}</td>
            <td>${row.to}</td>
            <td>${row.ftime}</td>
            <td>${row.fdate}</td>
          </tr>
        `;
      }).join("");
      
      // Render the HTML with the table rows
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Flight Management System</title>
          <link rel="stylesheet" href="/assests/viewallbooking.css">
          <style>
            .search-bar {
              display: inline-block;
              margin-right: 10px;
              padding: 5px;
              border: 1px solid #ccc;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div id="navbar">
            <a href="adminpannel_add_flight">Add Flights</a>
            <a href="remove_flight">Remove Flights</a>
            <a href="search">Search Flights</a>
            <a href="viewall" class="active">View All Bookings</a>
            <a href="/" class="logout">Logout</a>
          </div>
          
          <div class="content-container">
            <h2>View All Bookings</h2>
            <table>
              <tr style="color: #1b1e36;">
                <th>Flight Number</th>
                <th>From</th>
                <th>To</th>
                <th>Flight Time</th>
                <th>Date</th>
              </tr>
              ${tableRows}
            </table>
          </div>
          <script>
            var addFlightsLink = document.querySelector('a[href="adminpannel_add_flight.html"]');
            var removeFlightsLink = document.querySelector('a[href="remove_flight.html"]');
            var viewAllBookingsLink = document.querySelector('a[href="viewallbooking.html"]');
        
            addFlightsLink.addEventListener('click', function() {
              viewAllBookingsLink.classList.remove('active');
              addFlightsLink.classList.add('active');
              removeFlightsLink.classList.remove('active');
              // Code to display add flight section
            });
        
            removeFlightsLink.addEventListener('click', function() {
              viewAllBookingsLink.classList.remove('active');
              addFlightsLink.classList.remove('active');
              removeFlightsLink.classList.add('active');
              // Code to display remove flight section
            });
        
            viewAllBookingsLink.addEventListener('click', function() {
              viewAllBookingsLink.classList.add('active');
              addFlightsLink.classList.remove('active');
              removeFlightsLink.classList.remove('active');
              // Code to display view all bookings section
            });
          </script>
        </body>
        </html>
      `;
      
      res.send(html);
    }
  });
});

app.get("/viewall", (req, res) => {
  const selectQuery = "SELECT * FROM `add`";
  db.all(selectQuery, [], (err, rows) => {
    if (err) {
      return console.error("Error retrieving data:", err.message);
    }
    
    // Generate table rows dynamically
    const tableRows = rows.map(row => {
      return `
        <tr>
          <td>${row.fnumber}</td>
          <td>${row.from}</td>
          <td>${row.to}</td>
          <td>${row.ftime}</td>
          <td>${row.fdate}</td>
        </tr>
      `;
    }).join("");
    
    // Render the HTML with the table rows
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Flight Management System</title>
        <link rel="stylesheet" href="/assests/viewallbooking.css">
        <style>
          .search-bar {
            display: inline-block;
            margin-right: 10px;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div id="navbar">
          <a href="adminpannel_add_flight">Add Flights</a>
          <a href="remove_flight">Remove Flights</a>
          <a href="search">Search Flights</a>
          <a href="viewall" class="active">View All Bookings</a>
          <a href="/" class="logout">Logout</a>
        </div>
        
        <div class="content-container">
          <h2>View All Bookings</h2>
          <table>
            <tr style="color: #1b1e36;">
              <th>Flight Number</th>
              <th>From</th>
              <th>To</th>
              <th>Flight Time</th>
              <th>Date</th>
            </tr>
            ${tableRows}
          </table>
        </div>
        <script>
          var addFlightsLink = document.querySelector('a[href="adminpannel_add_flight.html"]');
          var removeFlightsLink = document.querySelector('a[href="remove_flight.html"]');
          var viewAllBookingsLink = document.querySelector('a[href="viewallbooking.html"]');
      
          addFlightsLink.addEventListener('click', function() {
            viewAllBookingsLink.classList.remove('active');
            addFlightsLink.classList.add('active');
            removeFlightsLink.classList.remove('active');
            // Code to display add flight section
          });
      
          removeFlightsLink.addEventListener('click', function() {
            viewAllBookingsLink.classList.remove('active');
            addFlightsLink.classList.remove('active');
            removeFlightsLink.classList.add('active');
            // Code to display remove flight section
          });
      
          viewAllBookingsLink.addEventListener('click', function() {
            viewAllBookingsLink.classList.add('active');
            addFlightsLink.classList.remove('active');
            removeFlightsLink.classList.remove('active');
            // Code to display view all bookings section
          });
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  });
});


app.get("/viewall", function(req, res) {
  res.sendFile(__dirname + "/viewallbooking.html");
});

app.get("/payment", function(req, res) {
  res.sendFile(__dirname + "/payment.html");
});
app.get("/seats", function(req, res) {
  res.sendFile(__dirname + "/seat_availibility.html");
});
app.get("/flight_search", function(req, res) {
  res.sendFile(__dirname + "/flight_Search.html");
});
app.get("/remove_flight", function(req, res) {
  res.sendFile(__dirname + "/remove_flight.html");
});

app.get("/adminpannel_add_flight", function(req, res) {
  res.sendFile(__dirname + "/adminpannel_add_flight.html");
});
app.get("/tecket", function(req, res) {
  res.sendFile(__dirname + "/tecket_details.html");
});

app.get("/search", function(req, res) {
  res.sendFile(__dirname + "/search.html");
});


app.get("/signup", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/home.html");
});
app.get("/admin", function(req, res) {
  res.sendFile(__dirname + "/admin.html");
});

const server = app.listen(port, function() {
  console.log("Server started on port", port);
});

app.get("/login", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/mybookings", function(req, res) {
  db.all("SELECT * FROM `add` WHERE fdate = ? AND ftime = ?", [fd, ft], function(err, rows) {
    if (err) {
      console.error("Error executing query:", err);
      res.redirect("/");
    } else {
      const tableRows = rows.map(row => {
        return `
          <tr>
            <td>${row.fnumber}</td>
            <td>${row.from}</td>
            <td>${row.to}</td>
            <td>${row.ftime}</td>
            <td>${row.fdate}</td>
          </tr>
        `;
      }).join("");
      
      // Render the HTML with the table rows
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>My Booking</title>
          <link rel="stylesheet" href="/assests/viewallbooking.css">
          <style>
            .search-bar {
              display: inline-block;
              margin-right: 10px;
              padding: 5px;
              border: 1px solid #ccc;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>

         <div class="content-container">
            <h2>View All Bookings</h2>
            <table>
              <tr style="color: #1b1e36;">
                <th>Flight Number</th>
                <th>From</th>
                <th>To</th>
                <th>Flight Time</th>
                <th>Date</th>
              </tr>
              ${tableRows}
            </table>
          </div>
          <script>
            var addFlightsLink = document.querySelector('a[href="adminpannel_add_flight.html"]');
            var removeFlightsLink = document.querySelector('a[href="remove_flight.html"]');
            var viewAllBookingsLink = document.querySelector('a[href="viewallbooking.html"]');
        
            addFlightsLink.addEventListener('click', function() {
              viewAllBookingsLink.classList.remove('active');
              addFlightsLink.classList.add('active');
              removeFlightsLink.classList.remove('active');
              // Code to display add flight section
            });
        
            removeFlightsLink.addEventListener('click', function() {
              viewAllBookingsLink.classList.remove('active');
              addFlightsLink.classList.remove('active');
              removeFlightsLink.classList.add('active');
              // Code to display remove flight section
            });
        
            viewAllBookingsLink.addEventListener('click', function() {
              viewAllBookingsLink.classList.add('active');
              addFlightsLink.classList.remove('active');
              removeFlightsLink.classList.remove('active');
              // Code to display view all bookings section
            });
          </script>
        </body>
        </html>
      `;
      
      res.send(html);
    }
  });
});


server.on("close", function() {
  db.close(function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log("Database connection closed.");
  });
});


