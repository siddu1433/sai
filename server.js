const express = require("express");
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./movieskey.json");
const bodyParser = require("body-parser");
const path = require("path");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/movies", (req, res) => {
  res.sendFile(path.join(__dirname, "movies.html"));
});

app.get("/", (req, res) => {
  res.send("Hi User! WELCOME! <br> Goto movies <a href='/signup'>Clickhere</a>");
});

app.post("/loginSubmit", async (req, res) => {
  const { email, password } = req.body;
  const usersRef = db.collection("users");
  const userSnapshot = await usersRef.where("email", "==", email).get();  
  if (userSnapshot.empty) {
    return res.send("User not found");
  }
  const user = userSnapshot.docs[0].data();
  if (user.password !== password) {
    return res.send("Please Enter Correct Password");
  }
  res.redirect("/movies");
});

app.post("/signupSubmit", async (req, res) => {
  const { email, password } = req.body;
  const usersRef = db.collection("users");
  const existingUserSnapshot = await usersRef.where("email", "==", email).get();
  if (!existingUserSnapshot.empty) {
    return res.send("User with this email already exists");
  }
  try {
    await usersRef.add({ email, password });

    res.redirect("/login");
  } catch (error) {
    console.error("Error saving data to Firestore:", error);
    res.status(500).send("Error saving data to Firestore");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
