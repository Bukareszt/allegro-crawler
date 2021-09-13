import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

function connectionWithMongo(): void {
  const connectionString =
    process.env.DB_TYPE_ENV === "test"
      ? process.env.MONGO_DB_TEST
      : process.env.MONGO_DB_URL;
  console.log(connectionString);
  connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      return console.info("Succesfully conected to mongoDB!");
    })
    .catch((err: Error) => {
      console.error("Error connecting to database: ", err);
    });
}

export default connectionWithMongo;
