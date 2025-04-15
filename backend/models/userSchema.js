import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Username is required."],
    minLength: [3, "Username must contain at least 3 characters."],
    maxLength: [40, "Username cannot exceed 40 characters."],
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    select: false,
    minLength: [8, "Password must contain at least 8 characters."],
    maxLength: [32, "Password cannot exceed 32 characters."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
  },
  address: String,
  phone: {
    type: String,
    required: [true, "Phone number is required."],
    match: [/^\d{10}$/, "Phone number must contain exactly 10 digits."],
  },
  profileImage: {
    public_Id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  paymentMethods: {
    bankTransfer: {
      bankAccountNumber: String,
      bankAccountName: String,
      bankName: String,
    },
    stripe: {
      customerId: String, // Stripe customer ID
      cardLast4: String,  // For storing last 4 digits of card
    },
    razorpay: {
      customerId: String,     // Razorpay customer ID
      paymentId: String,      // Last successful payment ID
    },
  },
  transactions: [
    {
      paymentId: String,
      amount: Number,
      currency: String,
      method: String, // e.g., 'stripe', 'razorpay'
      status: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  role: {
    type: String,
    enum: ["Auctioneer", "Bidder", "Super Admin"],
  },
  unpaidCommission: {
    type: Number,
    default: 0
  },
  moneySpent: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  
});
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT token method
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};


const User = mongoose.model("User", userSchema);
export default User;
