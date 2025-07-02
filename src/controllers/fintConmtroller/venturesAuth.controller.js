import Joi from "joi";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Venture } from "../../models/venture.model.js";
import OtpModel from "../../models/authModel/otpModel.model.js";
import JWTService from "../../../services/JWTService.js";

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim().required(),
  lastName: Joi.string().min(2).max(50).trim().required(),
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

export const signUp_Ventures = asyncHandler(async (req, res) => {
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
  const { firstName ,lastName, email, phoneNumber, bloodGroup, pinCode } = req.body;

  const fintVenture = await Venture.findOne({ phoneNumber })
  if (fintVenture) {
    console.log("fint venture already exist");
    throw new ApiError(400, "Phone no already exist");
  }
  const createVenture = new Venture({
    firstName: firstName,
    lastName:lastName,
    email: email,
    phoneNumber: phoneNumber,
    bloodGroup: bloodGroup,
    pinCode: pinCode
  })
  await createVenture.save();
  console.log("venture signup sucessafully");
  // Respond with success
  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        createVenture,
      }, `Sign up successful`)
    );
})

export const login_Ventures = asyncHandler(async (req, res) => {
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

  const VentureIf = await Venture.findOne({ phoneNumber });
  if (!VentureIf) {
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

export const checkOTP_Ventures = asyncHandler(async (req, res) => {
  const { otp, identifier } = req.body;

  // 🛡️ Validate request
  const { error } = otpSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  // 🔍 Check OTP in DB
  const otpRecord = await OtpModel.findOne({ identifier });
  if (!otpRecord || new Date() > otpRecord.expiresAt) {
    throw new ApiError(400, "OTP expired or not found");
  }

  // 🔐 Verify OTP (support static "1234" for testing)
  const isOtpValid = otpRecord.otp === otp || otp === "1234";
  if (!isOtpValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  // 🧹 Remove OTP from DB
  await OtpModel.deleteOne({ _id: otpRecord._id });

  // 👤 Find ventures
  const ventures = await Venture.findOne({ phoneNumber: identifier });
  if (!ventures) {
    throw new ApiError(404, "Ventures not found");
  }
  // 🔑 Generate Tokens
  const accessToken = JWTService.signAccessToken({ _id: ventures._id }, process.env.ACCESS_TOKEN_EXPIRY);
  const refreshToken = JWTService.signRefreshToken({ _id: ventures._id }, process.env.REFRESH_TOKEN_EXPIRY);

  // 💾 Store refresh token in DB and update venture
  await JWTService.storeVentureRefreshToken(refreshToken, ventures._id);
  ventures.refreshToken = refreshToken;
  await ventures.save();

  // 🍪 Set cookies
  // const isProd = process.env.NODE_ENV === "production";
  // res.cookie("accessToken", accessToken, {
  //   httpOnly: true,
  //   secure: isProd,
  //   sameSite: isProd ? "Strict" : "Lax",
  //   maxAge: 15 * 60 * 1000, // 15 min
  // });

  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: isProd,
  //   sameSite: isProd ? "Strict" : "Lax",
  //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  // });

  // ✅ Send success response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ventures: {
          id: ventures._id,
          firstName: ventures.firstName,
          lastName: ventures.lastName,
          email: ventures.email,
          phoneNumber: ventures.phoneNumber,
          beADonor: ventures.beADonor,
          bloodGroup: ventures.bloodGroup,
          pinCode: ventures.pinCode,
          refreshToken: ventures.refreshToken,
        },
        accessToken,
        refreshToken,
      },
      "OTP verified & login successful"
    )
  );
});
export const profile_Ventures = asyncHandler(async (req, res) => {
  const ventures = req.ventures;

  if (!ventures) {
    throw new ApiError(404, "Ventures not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ventures: {
          id: ventures._id,
          firstName: ventures.firstName,
          lastName: ventures.lastName,
          email: ventures.email,
          phoneNumber: ventures.phoneNumber,
          beADonor: ventures.beADonor,
          bloodGroup: ventures.bloodGroup,
          pinCode: ventures.pinCode,
        },
      },
      "Ventures profile fetched successfully"
    )
  );
});
export const renewAccessToken_Ventures = asyncHandler(async (req, res) => {
  const venture = req.venture;
console.log(process.env.ACCESS_TOKEN_EXPIRY ,"process.env.ACCESS_TOKEN_EXPIRY");

  const newAccessToken = jwt.sign(
    { _id: venture._id, email: venture.email },
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

export const logoutVenture = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.header("x-refresh-token");

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is missing");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const venture = await Venture.findById(decoded._id);
    if (!venture) {
      throw new ApiError(404, "Venture not found");
    }

    // Invalidate refresh token in DB
    venture.refreshToken = null;
    venture.firebaseToken = null;
    await venture.save();

    // Clear cookies
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});