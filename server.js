const mongoose = require("mongoose");
const dotnev = require("dotenv");
dotnev.config({ path: "./config.env" });
const app = require("./app");

console.log(process.env.NODE_ENV);
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    //console.log(con.connection);
    console.log("DB connection successful");
  });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App runing on port ${port}...`);
});
