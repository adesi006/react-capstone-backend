const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// initialize the user schema

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  highestRound: { type: Number, default: 0 }
});

userSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
  }
});

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

/*this serialize method is important, we use it when creating JWT's to
remove the password from the payload and thus avoid compromising our users.*/
userSchema.methods.serialize = function() {
  return {
    username: this.username || "",
    highestRound: this.highestRound || 0
  };
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model("User", userSchema);
