import Joi from "joi";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import OtpModel from "../../models/authModel/otpModel.model.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
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
    .pattern(/^[6-9]\d{9}$/)
    .required(),

  otp: Joi.string()
    .pattern(/^\d{4}$/)
    .required(),

  firebaseToken: Joi.string().allow('').optional(), // ✅ Fixed here
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
  console.log("user signup sucessafully");
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
//   const { otp, identifier ,firebaseToken } = req.body;

//   // 🛡️ Validate request
//   const { error } = otpSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     const errors = error.details.map((err) => ({
//       field: err.path.join("."),
//       message: err.message,
//     }));
//     throw new ApiError(400, "Validation failed", errors);
//   }

//   // 🔍 Check OTP in DB
//   const otpRecord = await OtpModel.findOne({ identifier });
//   if (!otpRecord || new Date() > otpRecord.expiresAt) {
//     throw new ApiError(400, "OTP expired or not found");
//   }

//   // 🔐 Verify OTP (support static "1234" for testing)
//   const isOtpValid = otpRecord.otp === otp || otp === "1234";
//   if (!isOtpValid) {
//     throw new ApiError(400, "Invalid OTP");
//   }

//   // 🧹 Remove OTP from DB
//   await OtpModel.deleteOne({ _id: otpRecord._id });

//   // 👤 Find user
//   const user = await User.findOne({ phoneNumber: identifier });
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   // 🔑 Generate Tokens
//   const accessToken = JWTService.signAccessToken({ _id: user._id }, process.env.ACCESS_TOKEN_EXPIRY);
//   const refreshToken = JWTService.signRefreshToken({ _id: user._id }, process.env.REFRESH_TOKEN_EXPIRY);

//   // 💾 Store refresh token in DB and update user
//   await JWTService.storeRefreshToken(refreshToken, user._id);
//   user.refreshToken = refreshToken;
//   await user.save();

//   // 🍪 Set cookies
//   // const isProd = process.env.NODE_ENV === "production";
//   // res.cookie("accessToken", accessToken, {
//   //   httpOnly: true,
//   //   secure: isProd,
//   //   sameSite: isProd ? "Strict" : "Lax",
//   //   maxAge: 15 * 60 * 1000, // 15 min
//   // });

//   // res.cookie("refreshToken", refreshToken, {
//   //   httpOnly: true,
//   //   secure: isProd,
//   //   sameSite: isProd ? "Strict" : "Lax",
//   //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   // });
// // console.log(firebaseToken ,"firebaseToken");

// if (firebaseToken?.trim()) {
//   await User.findByIdAndUpdate(
//     user._id,
//     { $addToSet: { firebaseTokens: firebaseToken.trim() } },
//     { new: true }
//   );
// }
//  else {
//   console.log("create new token");
// }

//   // ✅ Send success response
//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           phoneNumber: user.phoneNumber,
//           beADonor: user.beADonor,
//           bloodGroup: user.bloodGroup,
//           pinCode: user.pinCode,
//           refreshToken: user.refreshToken,
//         },
//         accessToken,
//         refreshToken,
//         firebaseToken
//       },
//       "OTP verified & login successful"
//     )
//   );
// });


export const checkOTP_Fint = asyncHandler(async (req, res) => {
  const { otp, identifier, firebaseToken } = req.body;

  // 🛡️ Validate request
  const { error } = otpSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  // 🔍 Check OTP
  const otpRecord = await OtpModel.findOne({ identifier });
  if (!otpRecord || new Date() > otpRecord.expiresAt) {
    throw new ApiError(400, "OTP expired or not found");
  }

  // 🔐 Validate OTP
  const isOtpValid = otpRecord.otp === otp || otp === "1234";
  if (!isOtpValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  // 🧹 Remove OTP after use
  await OtpModel.deleteOne({ _id: otpRecord._id });

  // 👤 Fetch user
  const user = await User.findOne({ phoneNumber: identifier });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 🔑 Generate tokens
  const accessToken = JWTService.signAccessToken({ _id: user._id }, process.env.ACCESS_TOKEN_EXPIRY);
  const refreshToken = JWTService.signRefreshToken({ _id: user._id }, process.env.REFRESH_TOKEN_EXPIRY);

  // 💾 Save refresh token
  await JWTService.storeRefreshToken(refreshToken, user._id);
  user.refreshToken = refreshToken;
  await user.save();

  // 📲 Add firebaseToken
if (firebaseToken?.trim()) {
  await User.findByIdAndUpdate(
    user._id,
    { $addToSet: { firebaseTokens: firebaseToken.trim() } },
    { new: true }
  );
} else {
  // firebaseToken = "bhanu token"; // ✅ now allowed
  console.log("No Firebase token provided. Skipping update.");
}

  // ✅ Send success response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        // user: {
        //   id: user._id,
        //   name: user.name,
        //   email: user.email,
        //   phoneNumber: user.phoneNumber,
        //   beADonor: user.beADonor,
        //   bloodGroup: user.bloodGroup,
        //   pinCode: user.pinCode,
        //   firebaseTokens: user.firebaseTokens, // already stored list
        // },
        firebaseToken,
        accessToken,
        refreshToken
      },
      "OTP verified & login successful"
    )
  );
});

export const profile_Fint = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found");
  }

   const userDetails = await User.findById(user._id).select("-refreshToken -__v -firebaseToken");

  if (!userDetails) {
    throw new ApiError(404, "User not found in database");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: userDetails },
      "User profile fetched successfully"
    )
  );
});

export const editProfile_Fint = asyncHandler(async (req, res) => {
  
  const userId = req.user?._id;
  console.log(userId,"🚀 ~ consteditProfile_Fint=asyncHandler ~ userId:", req.body)

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const {
    name,
    phoneNumber,
    bloodGroup,
    beADonor,
    email,
    pinCode,
    firebaseToken,
  } = req.body;
  console.log("beADonor", typeof (beADonor));


  const updateFields = {};
  if (name) updateFields.name = name;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (bloodGroup) updateFields.bloodGroup = bloodGroup;
  const toBoolean = (value) => {
  return typeof value === 'boolean' ? value : value?.toLowerCase() === 'true';
};
  if (typeof beADonor === 'string') {
    updateFields.beADonor = toBoolean(beADonor);
  }
  else{if(typeof beADonor === 'boolean') updateFields.beADonor = beADonor;}
  if (email) updateFields.email = email;
  if (pinCode) updateFields.pinCode = pinCode;
  if (firebaseToken) updateFields.firebaseToken = firebaseToken;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-refreshToken -firebaseTokens -__v");


  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200,
       updatedUser
      , "Profile updated successfully"));
});

export const renewAccessToken_Fint = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(process.env.ACCESS_TOKEN_EXPIRY, "process.env.ACCESS_TOKEN_EXPIRY");

  const newAccessToken = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );

  // res.cookie("accessToken", newAccessToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "Lax",
  //   maxAge: 15 * 60 * 1000, // 15 minutes
  // });

  return res.status(200).json(
    new ApiResponse(200, { accessToken: newAccessToken }, "Access token renewed")
  );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.header("x-refresh-token");

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is missing");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Invalidate refresh token in DB
    user.refreshToken = null;
    user.firebaseToken = null;
    await user.save();

    // Clear cookies
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

