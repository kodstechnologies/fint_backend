import Joi from "joi";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import OtpModel from "../../models/authModel/otpModel.model.js";
import dotenv from 'dotenv';
import JWTService from "../../../services/JWTService.js";
dotenv.config({ path: './.env' });
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  phoneNumber: Joi.string().pattern(/^\d{10}$/).required(), // Indian 10-digit
  bloodGroup: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").required(),
  email: Joi.string().email().trim().required(),
  pinCode: Joi.string().pattern(/^\d{6}$/).required(), // Indian 6-digit PIN
});

const loginSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).required(), // Indian 10-digit
});

const otpSchema = Joi.object({
  identifier: Joi.string()
    .pattern(/^[6-9]\d{9}$/) // Validates 10-digit Indian mobile number
    .required(),

  otp: Joi.string()
    .pattern(/^\d{4}$/) // Validates a 6-digit numeric OTP
    .required(),
});


export const signUp_Fint = asyncHandler(async (req, res) => {
  // Validate input
  console.log(req.body, "req.body 📥");

  const { error } = registerSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }
  const { name, email, phoneNumber, bloodGroup, pinCode } = req.body;

  const fintUser = await User.findOne({ phoneNumber })
  if (fintUser) {
    console.log("fint user already exist");
    throw new ApiError(400, "Phone no already exist");
  }
  const createUser = new User({
    name: name,
    email: email,
    phoneNumber: phoneNumber,
    bloodGroup: bloodGroup,
    pinCode: pinCode
  })
  await createUser.save();
  console.log("user signin sucessafully");
  // Respond with success
  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        createUser,
      }, `Sign up successful`)
    );
})

export const login_Fint = asyncHandler(async (req, res) => {
  console.log(req.body, "req.body 📥");
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const { phoneNumber } = req.body;

  const userIf = await User.findOne({ phoneNumber });
  if (!userIf) {
    throw new ApiError(404, "Phone not exists");
  }

  // const generateOTP = () => {
  //   return Math.floor(100000 + Math.random() * 900000).toString();
  // };
  const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

  const otp = generateOTP(); // ✅ call the function here

  // console.log(otp,"otp");

  const sendOtp = new OtpModel({
    identifier: phoneNumber,
    otp
  })

  await sendOtp.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        phoneNumber,
      }, "sent otp successful")
    );

})

// export const checkOTP_Fint = asyncHandler(async (req, res) => {
//   console.log(req.body, "req.body 📥");

//   const { error } = otpSchema.validate(req.body, { abortEarly: false })
//   if (error) {
//     const errors = error.details.map((err) => ({
//       field: err.path.join('.'),
//       message: err.message,
//     }));
//     throw new ApiError(400, "Validation failed", errors);
//   }

//   const { otp, identifier } = req.body;
//   const checkOtp = await OtpModel.findOne({ identifier });
//   console.log("OTP Record from DB:", checkOtp); // should not be null

//   if (!checkOtp) {
//     console.log("Identifier used:", identifier); // help debug
//     throw new ApiError(400, "OTP expired or not found");
//   }


//   // ✅ Allow "123456" as test OTP
//   const isValidOtp = checkOtp.otp === otp || otp === "1234";

//   if (!isValidOtp) {
//     throw new ApiError(400, "Invalid OTP");
//   }

//   // ✅ Delete OTP after successful verification
//   await OtpModel.deleteOne({ _id: checkOtp._id });

//   const user = await User.findOne({ phoneNumber: identifier });
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }
//   console.log("tocken related work started");

// const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";
//   // Generate JWT token
//   const token = jwt.sign(
//     { id: user._id },
//     process.env.JWT_SECRET,
//     { expiresIn: "1d" }
//   );


//   // Set cookie
//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
//     maxAge: 24 * 60 * 60 * 1000, // 1 day
//   });


//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, {
//         user,token
//       }, "Login successful")
//     );
// })

export const checkOTP_Fint = asyncHandler(async (req, res) => {
  console.log("Request Body:", req.body);

  // Validate request body
  const { error } = otpSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const { otp, identifier } = req.body;

  // Find OTP record
  const checkOtp = await OtpModel.findOne({ identifier });
  console.log("OTP Record from DB:", checkOtp);

  if (!checkOtp) {
    console.log("Identifier used:", identifier);
    throw new ApiError(400, "OTP expired or not found");
  }

  // Verify OTP (allow "1234" for testing)
  const isValidOtp = checkOtp.otp === otp || otp === "1234";
  if (!isValidOtp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // Delete OTP after verification
  await OtpModel.deleteOne({ _id: checkOtp._id });

  // Find user
  const user = await User.findOne({ phoneNumber: identifier });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  console.log("Token generation started");

  // Generate tokens using JWTService
  const accessToken = JWTService.signAccessToken({ _id: user._id }, "15m");
  const refreshToken = JWTService.signRefreshToken({ _id: user._id }, "7d");

  // Store refresh token in DB
  await JWTService.storeRefreshToken(refreshToken, user._id);

  // Update user's refreshToken field (if needed, based on your setup)
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "Strict" : "Lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "Strict" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: user.toJSON(), accessToken, refreshToken },
        "Login successful"
      )
    );
});

export const profile_Fint = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  console.log(userId,"userId");
  
  const user = await User.findById(userId);
  console.log(user ,"user");
  
  if (!user) {
    throw new ApiError(404, "User not found")
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, {
user
      }, "user details display sucessafully")
    )
})