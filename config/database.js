const mongoose = require("mongoose");

module.exports = {
  connectDB: () => {
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  },
};