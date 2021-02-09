const express = require("express"); // get express 
const fs = require("fs"); // get fs module
const cors = require("cors"); // get cors module
const stringSimilarity = require("string-similarity"); // get string similarity module
const bcrypt = require("bcrypt"); // get hashing module

const userData = require("./data/accounts.json"); // json data for user accounts
const appsData = require("./data/applications.json"); // json data for user applications
const courseData = require("./data/courses.json"); // json data for courses

const userFile = "./data/accounts.json"; // file holding json data for user accounts
const appsFile = "./data/applications.json"; // file holding json data for applications
const courseFile = "./data/courses.json"; // file holding json data for courses

const salt = 12;

const app = express(); // create app constant
const router = express.Router(); // create router object for open routes

const corsOptions = { // options for cors
    origin: "http://localhost:4200",
    optionsSuccessStatus: 200
}

router.use(express.json()); // allows express to parse json objects (middleware)

app.use("/", express.static("static")); // folder where client-side code is stored

app.use(cors(corsOptions)); // middleware to allow CORS

app.use((req, res, next) => { // middleware function to do console logs
    console.log(`${req.method} request for ${req.url}`); // print to console
    next(); // continue processeing
});


// search for a user account GET
router.get("/users/:email", (req, res) => {

    if (sanitizeEmail(req.params.email))
    {
        udata = getData(userData); // get user account data

        const ind = udata.findIndex(u => u.email === req.params.email); // find index of the user's account
    
        if (ind >= 0) // if the user exists
        {
            res.send(udata[ind]);
        }
        else if (ind < 0)
        {
            res.status(400).send(`User with email: ${req.params.email} does not exist`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
});

// create an account POST
router.post("/users/:email", (req, res) => {

    if (sanitizeEmail(req.params.email) && sanitizePass(req.body))
    {
        udata = getData(userData); // get user account data

        const ind = udata.findIndex(u => u.email === req.params.email); // find index of the user

        if (ind >= 0) // if the user exists
        {
            res.status(400).send(`User with email: ${req.params.email} already exists!`); 
        }
        else if (ind < 0) // if the user does not exist
        {
            let newUser = req.body; // empty object for new user
            newUser.email = req.params.email; // set email field for new user

            bcrypt.hash(newUser.password, salt, (err, hash) => { // encrypt password

                newUser.password = hash; // set password to encrypted version
                udata.push(newUser); // add new user to array of users
                res.send(`Created user account with email: ${req.params.email}`);
                setData(udata, userFile); // send updated user data array to JSON file
            });
        }
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
});

// log in to an account POST
router.post("/users/login/:email", (req, res) => {

    if (sanitizeEmail(req.params.email) && sanitizePass(req.body)) 
    {
        udata = getData(userData); // get user account data

        const ind = udata.findIndex(u => u.email === req.params.email); // find index of the exisitng user with the given email
    
        if (ind >= 0) // if the user exists
        {
            bcrypt.compare(req.body.password, udata[ind].password, (err, result) => { // comapre the values of the two hashes

                if (result) // password matches the saved one
                {
                    res.send(true);
                }
                else if (!result) // password does not match the saved one
                {
                    res.status(400).send(`Incorrect password for user with email: ${req.params.email}!`);
                }
            }); 
        }
        else if (ind < 0) // if the user does not exist
        {
            res.status(400).send(`User with email: ${req.params.email} does not exist!`);
        }
    }  
    else
    {
        res.status(400).send("Invalid input!");
    }       
});

// change account password PUT
router.put("/users/:email", (req, res) => {

    // send user object to file
    if (sanitizeEmail(req.params.email) && sanitizePass(req.body)) 
    {
        udata = getData(userData); // get user account data

        const ind = udata.findIndex(u => u.email === req.params.email); // find index of the exisitng user with the given email
    
        if (ind >= 0) // if the user exists
        {
            if (req.body.old_password === req.body.password)
            {
                res.status(400).send(`Cannot change password to your existing password for user with email: ${req.params.email}!`);
            }
            else
            {
                bcrypt.compare(req.body.old_password, udata[ind].password, (err, result) => { // check if the old password matches the accounts current password

                    if (result)
                    {
                        bcrypt.hash(req.body.password, salt, (err, hash) => { // hash new password
    
                            req.body.password = hash; // set new password to hashed value
                            udata[ind].password = req.body.password; // set password to the new password
                            res.send(`Updated password for user with email: ${req.params.email}`);
                            setData(udata, userFile); // send updated user data array to JSON file
                        });  
                    }
                    else if (!result)
                    {
                        res.status(400).send(`Incorrect password for user with email: ${req.params.email}!`);
                    }
                });
            }
        }
        else if (ind < 0) // if the user does not exist
        {
            res.status(400).send(`User with email: ${req.params.email} does not exist!`);
        }
    }  
    else
    {
        res.status(400).send("Invalid input!");
    }
});

// Create a new course for instructors (course code, instructor, hours, questions)
router.route("/courses/:coursename")
    .post((req,res)=>{

        if (sanitizeInput(req.params.coursename) && sanitizeInput(req.body))
        {
        cdata = getData(courseData); // get course data

        const ind = cdata.findIndex(c => c.coursename === req.params.coursename); // find index of the the course if it exists

        if (ind >= 0) // if the course already exists
        {
            res.status(400).send(`The course: ${req.params.coursename} already exists!`); 
        }
        else if (ind < 0) // if the course does not exist
        {
            let newCourse = req.body; // empty object
            newCourse.courseName = req.params.coursename; // set course name
            newCourse.instructor = req.body.instructor; // set instructor
            newCourse.hours = req.body.hours; // set hours
            newCourse.enrolled = req.body.enrolled; // set number of students enrolled
            newCourse.desc = req.body.desc; // set description

            cdata.push(newCourse); // add the new course
            res.send(`Created course: ${req.params.coursename}`); // send message
            setData(cdata, courseFile); // send updated course data to JSON file
            
        }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }        
    })

// get all courses
router.get("/courses", (req, res) => {
    res.send(getData(courseData)); // get all courses data
});


// test hash value
router.get("/test/:password", (req, res) => {
    bcrypt.hash(req.params.password, salt, (err, hash) => {
        res.send(hash); // return the hashed value
    })
})

app.use("/api", router); // install router object path

// get PORT environment variable, or use 3000 if not available
const port = process.env.PORT || 3000;
app.listen(port, () => {console.log(`Listening on port ${port}`)}); // choose which port to listen on

// function to read from referenced JSON file before each usage of the sdata array
function getData(fileRef)
{
    return JSON.parse(JSON.stringify(fileRef)); // parse json object holding the schedules;
};

// function to write to JSON file after each update to sdata array
function setData(array, file)
{
    fs.writeFile(file, JSON.stringify(array), error => {

        if (error) // if an error is thrown when writing
        {
            throw error;
        }

        console.log(`Successfully wrote to file with name: ${file}`);
    })
};

// function for alphanumeric input
function sanitizeInput(input, l) 
{ 
    // variable character limit
    if (String(input).includes("<") || String(input).includes(">") || String(input).includes("^") || String(input).includes(".") || String(input).includes("/") || String(input).includes("(") || String(input).includes(")") || String(input).includes("*") || String(input).includes("'") || String(input).includes("_") || String(input).includes("=") || String(input).includes("$") || String(input).includes("?") || String(input).includes("!") || String(input).includes("%") || String(input).includes("\"") || String(input).includes("`") || String(input).includes("+") || String(input).includes("|") || String(input).includes("&") || String(input).length > l || String(input).length < 1)
    {
        return false;
    }
    else
    {
        return true;
    }
};

// function for email addresses
function sanitizeEmail(add)
{
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(add)) // email must match this pattern
    {
        return true;
    }
    else
    {
        return false;
    }
}

// function for passwords
function sanitizePass(input, l) 
{ 
    // variable character limit
    if (String(input).includes("<") || String(input).includes(">") || String(input).includes("^") || String(input).includes(".") || String(input).includes("/") || String(input).includes("(") || String(input).includes(")") || String(input).includes("*") || String(input).includes("'") || String(input).includes("_") || String(input).includes("=") || String(input).includes("\"") || String(input).includes("`") || String(input).includes("+") || String(input).includes("|") || String(input).length > l || String(input).length < 1)
    {
        return false;
    }
    else
    {
        return true;
    }
};
