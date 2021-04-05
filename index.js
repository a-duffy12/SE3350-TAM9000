const express = require("express"); // get express 
const fs = require("fs"); // get fs module
const cors = require("cors"); // get cors module
const stringSimilarity = require("string-similarity"); // get string similarity module
const bcrypt = require("bcrypt"); // get hashing module
const fileUpload = require('express-fileupload');

const userData = require("./data/accounts.json"); // json data for user accounts
const appsData = require("./data/applications.json"); // json data for user applications
const courseData = require("./data/courses.json"); // json data for courses
const questionsData = require("./data/questions.json"); // json data for course questions
const matchesData = require("./data/matches.json"); // json data for TA-course matches

const userFile = "./data/accounts.json"; // file holding json data for user accounts
const appsFile = "./data/applications.json"; // file holding json data for applications
const courseFile = "./data/courses.json"; // file holding json data for courses
const questionsFile = "./data/questions.json"; // file holding json data for course questions
const matchFile = "./data/matches.json"; // file holding json data for TA-course matches

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
router.route("/courses/:courseName")
    .post((req,res)=>{

        if (sanitizeInput(req.params.courseName) && sanitizeInput(req.body))
        {
            cdata = getData(courseData); // get course data

            const ind = cdata.findIndex(c => c.courseName === req.params.courseName); // find index of the the course if it exists

            if (ind >= 0) // if the course already exists
            {
                res.status(400).send(`The course: ${req.params.courseName} already exists!`); 
            }
            else if (ind < 0) // if the course does not exist
            {
                let newCourse = {}; // empty object
                newCourse.courseName = req.params.courseName; // set course name
                newCourse.instructor = req.body.instructor; // set instructor
                newCourse.instructorEmail = req.body.instructorEmail; // set instructor email
                newCourse.enrolledLast = req.body.enrolledLast; // set number of students enrolled last year
                newCourse.enrolled = req.body.enrolled; // set number of students enrolled
                newCourse.hoursLast = req.body.hours; // set number of hours from last year
                newCourse.hours = Math.round(newCourse.hoursLast * (newCourse.enrolled / newCourse.enrolledLast)); // set number of house
                newCourse.requireTA = req.body.reqTA; // set if the course needs a TA
                newCourse.desc = req.body.desc; // set description

                cdata.push(newCourse); // add the new course
                res.send(`Created course: ${req.params.courseName}`); // send message
                setData(cdata, courseFile); // send updated course data to JSON file
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }        
    })
    .get((req, res) => { // search by course name
        if (sanitizeInput(req.params.courseName))
        {
            cdata = getData(courseData); // get up to date course data

            const ind = cdata.findIndex(c => c.courseName === req.params.courseName); // find index of course

            if (ind >= 0) // if the course exists
            {
                res.send(cdata[ind]); // send the course
            }
            else if (ind < 0) // if the course does not exist
            {
                res.status(404).send(`No course found with course name: ${req.params.courseName}`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    })
    .put((req, res) => { // overwrite number of TA hours available

        if (sanitizeInput(req.params.courseName) && sanitizeInput(req.body))
        {
            cdata = getData(courseData); // get course data

            const ind = cdata.findIndex(c => c.courseName === req.params.courseName); // find index of the the course if it exists

            if (ind >= 0) // if the course already exists
            {
                cdata[ind].hours = req.body.hours;
                res.send(`Updated hours for course: ${req.params.courseName}`); // send message
                setData(cdata, courseFile); // send updated course data to JSON file
            }
            else if (ind < 0) // course does not exist
            {
                res.status(404).send(`The course: ${req.params.courseName} does not exist!`);
            }
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
    })

router.put("/courses/:courseName/:reqTA", (req, res) => {
    if (sanitizeInput(req.params.courseName))
    {
        cdata = getData(courseData); // get up to date course data

        const ind = cdata.findIndex(c => c.courseName === req.params.courseName); // find index of course
        if (ind >= 0) // if the course exists
        {

            cdata[ind].requireTA = req.params.reqTA;
            res.send("Updated TA requirement for course");
            setData(cdata, courseFile); // send updated course data to JSON file
        }
        else if (ind < 0) // if the course does not exist
        {
            res.status(404).send(`No course found with course name: ${req.params.courseName}`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
})

// search course descriptions GET
router.get("/courses/key/:keyword", (req, res) => {

    let courses = []; // empty array to hold results
        const key = new RegExp(req.params.keyword, 'g');

    if (sanitizeInput(req.params.keyword, 50) && req.params.keyword.length >= 4)
    {
        cdata = getData(courseData); // get current course data

        for (c in cdata)
        {
            if (String(cdata[c].desc).match(key) || stringSimilarity.compareTwoStrings(req.params.keyword, String(cdata[c].desc)) > 0.5) // if the keyword matches a course description
            {
                courses.push(cdata[c]); // add course to array
            }
        }
    }
    else
    {
        res.status(400).send("Invalid input!");
    }

    if (courses.length > 0) // if there were results found
    {
        res.send(courses); // send results
    }
    else if (courses.length <= 0) // if no results were found
    {
        res.status(404).send(`No courses found with descriptions similar to: ${req.params.keyword}`);
    }
})

// submit TA application PUT
router.post("/application/:course/:email", (req, res) => {
    if(!sanitizeEmail(req.params.email) && !sanitizeInput(req.params.course) && !sanitizeInput(req.body)) return res.status(404).send('Invalid Email'); // if the email does not exist

    const appsJSON = JSON.parse(JSON.stringify(appsData));
    const courseJSON = JSON.parse(JSON.stringify(courseData));
    const courseExists = courseJSON.findIndex(c => c.courseName == req.params.course);

    if(!(courseExists > 0)) return res.status(400).send("Course does not exist"); // if the course does not exist

    let TAapplication = {
        email: req.params.email,
        name: req.body.name,
        courseCode: req.params.course,
        status: req.body.status,
        hours: req.body.hours,
        courseRank: req.body.courseRank,
        instructorRank: null,
        questions: []
    };

    appsJSON.push(TAapplication);
    setData(appsJSON,appsFile);
    res.send("Application submitted");
})

// Delete all TA applications DELETE
router.delete("/application/delete/:email", (req, res) => {
    if (sanitizeInput(req.params.email, 100))
        {
            adata = getData(appsData);
            const appIndex = adata.findIndex(a => a.email === req.params.email); 
    
            if (appIndex >= 0)
            {               
                adata = adata.filter(a => a.email != req.params.email); 
                res.send(`Deleted applicantion for student: ${req.params.email}`)               
            }
            else if (appIndex < 0) 
            {
                res.status(404).send(`No applicantion found for student: ${req.params.email}`);
            }
    
            setData(adata, appsFile); 
        }
        else
        {
            res.status(400).send("Invalid input!");
        }
})
 
// Rank applicant POST
router.post("/rank/:user", (req, res) => {

    const appsJSON = JSON.parse(JSON.stringify(appsData));

    const rank = Number(req.body.rank);
    const course = req.body.courseCode.toUpperCase();
    const email = req.body.email;
    const applicant = appsJSON.find(e => e.email === email & e.courseCode === course);

    // check if the rank is a number and if the course exists
    if (!Number.isInteger(rank)) return res.status(404).send('Please enter a number for the rank');
    if (!applicant) return res.status(404).send('Email and course combination does not exist');

    cdata = getData(courseData); // get course data

    const ind = cdata.findIndex(c => c.courseName === course); // find index of the the course if it exists

    if (ind >= 0) // if the course already exists
    {
        udata = getData(userData); // get user data

        const ind2 = udata.findIndex(u => u.email === req.params.user); // find index of the user if it exists

        if (ind2 >= 0) // account exists
        {
            if (cdata[ind].instructorEmail == req.params.user || udata[ind2].type == "admin") 
            {
                applicant.instructorRank = rank;

                setData(appsJSON, appsFile);
                res.send(`Successfully updated ranking for applicant: ${email} for ${course}`);
            }
            else // not allowed to get a ranking
            {
                res.status(400).send(`The user: ${req.params.user} is not authorized to edit this ranking!`);
            }
        }
        else if (ind2 < 0) // account does not exists
        {
            res.status(404).send(`The user: ${req.params.user} does not exist!`); 
        }
    }
    else if (ind < 0) // if the course does not exist
    {
        res.status(404).send(`The course: ${course} does not exist!`); 
    }
});

// get all applicants for a course GET
router.get("/rank/:course/:user", (req, res) => {

    if (sanitizeInput(req.params.course) && sanitizeEmail(req.params.user))
    {
        cdata = getData(courseData); // get course data

        const ind = cdata.findIndex(c => c.courseName === req.params.course); // find index of the the course if it exists

        if (ind >= 0) // if the course already exists
        {
            udata = getData(userData); // get user data

            const ind2 = udata.findIndex(u => u.email === req.params.user); // find index of the user if it exists

            if (ind2 >= 0) // account exists
            {
                if (cdata[ind].instructorEmail == req.params.user || udata[ind2].type == "admin") // creates a ranking
                {
                    let apps = [];

                    const adata = getData(appsData); // get application data

                    for (let a in adata) // get all relevant applicants
                    {
                        if (adata[a].courseCode == req.params.course)
                        {
                            apps.push(adata[a]);
                        }
                    }

                    setData(adata, appsFile); // set application data
                    res.send(apps); // send rank
                }
                else // not allowed to get a ranking
                {
                    res.status(400).send(`The user: ${req.params.user} is not authorized to view this ranking!`);
                }
            }
            else if (ind2 < 0) // account does not exists
            {
                res.status(404).send(`The user: ${req.params.user} does not exist!`); 
            }
        }
        else if (ind < 0) // if the course does not exist
        {
            res.status(404).send(`The course: ${req.params.course} does not exist!`); 
        }
    }
})

// get all courses GET
router.get("/courses", (req, res) => {
    res.send(getData(courseData)); // get all courses data
});

//submit course questions POST
router.post("/questions/:courseID",(req, res) => {
    
    if (sanitizeInput(req.params.courseID) && sanitizeInput(req.body))
    {
        const courseName = req.params.courseID;
        const questions = req.body;
        const qJSON = getData(questionsData);
        let obj = {
            courseID: courseName,
            courseQuestions: questions
        }
        qJSON.push(obj);
        setData(qJSON,questionsFile);
        res.send(qJSON);
    }
    else 
    {
        res.status(400).send("Invalid input!");
    }
})

// algorithm to match TAs to courses GET
router.get("/algorithm/:course/:user/:priority", (req, res) => {

    if (sanitizeInput(req.params.course) && sanitizeInput(req.params.priority))
    {
        cdata = getData(courseData);
        udata = getData(userData);
        adata = getData(appsData);
        mdata = getData(matchesData);

        const ind1 = cdata.findIndex(c => c.courseName === req.params.course); // find index of the the course if it exists
        const ind2 = udata.findIndex(u => u.email == req.params.user); // find user if they exist

        if (ind1 >= 0 && ind2 >= 0)
        {

            if (udata[ind2].type == "admin")
            {
                let mats = [];
                let apps = [];

                for (let a in adata) // get all relevant applicants
                {
                    if (adata[a].courseCode == req.params.course)
                    {
                        apps.push(adata[a]);
                    }
                }

                if (req.params.priority == "instructor")
                {
                    apps = apps.sort((a, b) => a.courseRank - b.courseRank); // sort by applicant preference
                    apps = apps.sort((a, b) => a.instructorRank - b.instructorRank); // sort by instructor preference
                }
                else if (req.params.priority == "applicant")
                {
                    apps = apps.sort((a, b) => a.instructorRank - b.instructorRank); // sort by instructor preference
                    apps = apps.sort((a, b) => a.courseRank - b.courseRank); // sort by applicant preference
                }
                else
                {
                    res.status(400).send(`Invalid input for priority field!`);
                }

                apps.sort((a, b) => a.status - b.status); // sort by status

                let cap = 0; // track hours
                let acount = 0; // track applicants

                mdata = mdata.filter(match => match.courseName != req.params.course); // remove existing matches for this course

                while (cap < cdata[ind1].hours) // so long as there are unallocated TA hours
                {
                    if (apps[acount])
                    {
                        ind3 = mdata.findIndex(m => m.email === apps[acount].email); // check to see if TA is already assigned

                        if (ind3 >= 0) // ta is already assigned
                        {
                            acount++; // increment tracker
                        }
                        else if (ind3 < 0)
                        {
                            cap += apps[acount].hours; // add allocated hours
                            mats.push(apps[acount]); // assign candidate to course
                            acount++; // increment tracker
                        }
                    }
                    else
                    {
                        console.log("No more applicants\n\n");
                        break;
                    }
                }

                if (cap > cdata[ind1].hours) // if there are more hours allocated than available
                {
                    let reduct = mats.pop(); // get last match
                    reduct.hours -= (cap-cdata[ind1].hours); // reduce allocated hours
                    mats.push(reduct); // add back to matches
                }   

                for (let m in mats) // add to matches json 
                {
                    temp = {}; // temporary object
                    temp.courseName = mats[m].courseCode;
                    temp.name = mats[m].name;
                    temp.email = mats[m].email;
                    temp.hours = mats[m].hours;

                    mdata.push(temp);
                }

                setData(mdata, matchFile);
                res.send(`Matched TAs for course: ${req.params.course}`);
            }
            else
            {
                res.status(400).send(`The user: ${req.params.user} is not authorized to view these matches!`);
            }
        }
        else
        {
            res.status(400).send(`Error retrieving course: ${req.params.course} for user: ${req.params.user}`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
})

// get TA matches for a course GET
router.get("/matches/:course/:user", (req, res) => {

    if (sanitizeInput(req.params.course) && sanitizeInput(req.params.priority))
    {
        cdata = getData(courseData);
        udata = getData(userData);
        mdata = getData(matchesData);

        const ind1 = cdata.findIndex(c => c.courseName === req.params.course); // find index of the the course if it exists
        const ind2 = udata.findIndex(u => u.email == req.params.user); // find user if they exist

        if (ind1 >= 0 && ind2 >= 0)
        {
            if (cdata[ind1].instructorEmail == req.params.user || udata[ind2].type == "admin")
            {
                let matches = [];

                for (let m in mdata)
                {
                    if (mdata[m].courseName == req.params.course) // get TA assignments for the requested course
                    {
                        matches.push(mdata[m]);
                    }
                }

                res.send(matches);
            }
            else
            {
                res.status(400).send(`The user: ${req.params.user} is not authorized to view these matches!`);
            }
        }
        else
        {
            res.status(400).send(`Error retrieving course: ${req.params.course} for user: ${req.params.user}`);
        }
    }
    else
    {
        res.status(400).send("Invalid input!");
    }
})

// test hash value
router.get("/test/:password", (req, res) => {
    bcrypt.hash(req.params.password, salt, (err, hash) => {
        res.send(hash); // return the hashed value
    })
})

// set up file to export course questions
router.get("/download", (req, res) => {
    const qData = getData(questionsData);
    let numQuestions = qData.map(x => x.courseQuestions.length).reduce((x,y) => {
        return (x > y) ? x : y;
    });
    let header = "courseName,";
    for(let i=0;i<numQuestions;i++){
        header += "Question " + (i+1);
        if(i != numQuestions -1) header += ",";
    }
    fs.writeFileSync(__dirname + '/exportQuestions.csv' , header + "\n");
    for(let i=0; i<qData.length;i++){
        let line = qData[i].courseID+",";
        for(let j=0; j<qData[i].courseQuestions.length;j++){
            line += qData[i].courseQuestions[j];
            if(j != (qData[i].courseQuestions.length-1)) line += ","
        }
        fs.appendFileSync(__dirname + '/exportQuestions.csv', line + "\n");
    }
    let file=fs.createReadStream(__dirname + '/exportQuestions.csv');
    var stat = fs.statSync(__dirname +'/exportQuestions.csv');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=exportQuestions.csv');
    file.pipe(res);
})

router.post('/upload', (req, res) => {
    console.log("File uploaded: ");
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
    fs.writeFile(file, JSON.stringify(array, undefined, 4), error => {

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
    if (String(input).includes("<") || String(input).includes(">") || String(input).includes("^") || String(input).includes("/") || String(input).includes("(") || String(input).includes(")") || String(input).includes("*") || String(input).includes("'") || String(input).includes("_") || String(input).includes("=") || String(input).includes("$") || String(input).includes("?") || String(input).includes("!") || String(input).includes("%") || String(input).includes("\"") || String(input).includes("`") || String(input).includes("+") || String(input).includes("|") || String(input).includes("&") || String(input).length > l || String(input).length < 1)
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
