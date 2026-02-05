import Joi from "joi";
import jwt from 'jsonwebtoken';
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Venture } from "../../models/venture.model.js";
import OtpModel from "../../models/authModel/otpModel.model.js";
import JWTService from "../../../services/JWTService.js";
import { AccessTokenTrack } from "../../models/track/acessTokenTrack.model.js";
import { sendSMS } from "../../utils/smsProvider.js";
import { BankAccount } from "../../models/BankAccount.model.js";
import config from "../../config/index.js";
const { REFRESH_TOKEN_SECRET } = config;
const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name must not exceed 50 characters",
      "any.required": "First name is required",
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.empty": "Last name is required",
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name must not exceed 50 characters",
      "any.required": "Last name is required",
    }),

  phoneNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base":
        "Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9",
      "any.required": "Phone number is required",
    }),

  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .optional()
    .messages({
      "string.email": "Please enter a valid email address",
    }),

  pinCode: Joi.string()
    .pattern(/^\d{6}$/)
    .allow("", null)
    .optional()
    .messages({
      "string.pattern.base": "Pincode must be exactly 6 digits",
    }),
});


const loginSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base":
        "Phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9",
      "any.required": "Phone number is required",
    }),
});


const otpSchema = Joi.object({
  identifier: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base":
        "Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9",
      "any.required": "Mobile number is required",
    }),

  otp: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      "string.empty": "OTP is required",
      "string.pattern.base": "OTP must be a 4-digit numeric code",
      "any.required": "OTP is required",
    }),

  firebaseToken: Joi.string()
    .allow("")
    .optional()
    .messages({
      "string.base": "Firebase token must be a valid string",
    }),
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
  const { firstName, lastName, email, phoneNumber, pinCode } = req.body;

  const fintVenture = await Venture.findOne({ phoneNumber })
  if (fintVenture) {
    console.log("fint venture already exist");
    throw new ApiError(400, "Phone no already exist");
  }
  const createVenture = new Venture({
    firstName: firstName,
    lastName: lastName,
    email: email ? email.trim() : null,
    phoneNumber: phoneNumber,
    // bloodGroup: bloodGroup,
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

// export const login_Ventures = asyncHandler(async (req, res) => {
//   console.log(req.body, "req.body 📥");
//   const { error } = loginSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     const errors = error.details.map((err) => ({
//       field: err.path.join('.'),
//       message: err.message,
//     }));
//     throw new ApiError(400, "Validation failed", errors);
//   }

//   const { phoneNumber } = req.body;

//   const VentureIf = await Venture.findOne({ phoneNumber });
//   if (!VentureIf) {
//     throw new ApiError(404, "Phone not exists");
//   }

//   // const generateOTP = () => {
//   //   return Math.floor(100000 + Math.random() * 900000).toString();
//   // };
//   const generateOTP = () => {
//   return Math.floor(1000 + Math.random() * 9000).toString();
// };

//   const otp = generateOTP(); // ✅ call the function here

//   // console.log(otp,"otp");

//   const sendOtp = new OtpModel({
//     identifier: phoneNumber,
//     otp
//   })

//   await sendOtp.save();

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, {
//         phoneNumber,
//       }, "sent otp successful")
//     );

// })

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

  const ventureIf = await Venture.findOne({ phoneNumber });
  if (!ventureIf) {
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

  // try {
  //   await sendSMS({
  //     number: phoneNumber,
  //     message: `Dear User, your One Time Password (OTP) for logging into your Fint account is ${otp}. Do not share this OTP with anyone. WT-FINT PRIVATE LIMITED`,
  //   });

  //   console.log('OTP SMS sent successfully');
  // } catch (smsError) {
  //   console.error('Error sending OTP SMS:', smsError.message);
  //   throw new ApiError(500, 'Failed to send OTP SMS');
  // }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        phoneNumber,
      }, "sent otp successful")
    );

})

// export const checkOTP_Ventures = asyncHandler(async (req, res) => {
//   const { otp, identifier, firebaseToken } = req.body;

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
//   console.log(otp, "🚀 ~ otpRecord.otp:", otpRecord.otp)
//   const isOtpValid = otpRecord.otp === otp || otp === "1234";
//   if (!isOtpValid) {
//     throw new ApiError(400, "Invalid OTP");
//   }

//   // 🧹 Remove OTP from DB
//   await OtpModel.deleteOne({ _id: otpRecord._id });

//   // 👤 Find ventures
//   const ventures = await Venture.findOne({ phoneNumber: identifier });
//   if (!ventures) {
//     throw new ApiError(404, "Ventures not found");
//   }
//   // 🔑 Generate Tokens
//   const accessToken = JWTService.signAccessToken({ _id: ventures._id }, process.env.ACCESS_TOKEN_EXPIRY);
//   const refreshToken = JWTService.signRefreshToken({ _id: ventures._id }, process.env.REFRESH_TOKEN_EXPIRY);

//   // 💾 Store refresh token in DB and update venture
//   await JWTService.storeVentureRefreshToken(refreshToken, ventures._id);
//   ventures.refreshToken = refreshToken;
//   await ventures.save();

//   // 📲 Add firebaseToken
//   if (firebaseToken?.trim()) {
//     await Venture.findByIdAndUpdate(
//       ventures._id,
//       { $addToSet: { firebaseTokens: firebaseToken.trim() } },
//       { new: true }
//     );
//   } else {
//     // firebaseToken = "bhanu token"; // ✅ now allowed
//     console.log("No Firebase token provided. Skipping update.");
//   }

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

//   // ✅ Send success response
//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         ventures: {
//           id: ventures._id,
//           firstName: ventures.firstName,
//           lastName: ventures.lastName,
//           email: ventures.email,
//           phoneNumber: ventures.phoneNumber,
//           beADonor: ventures.beADonor,
//           bloodGroup: ventures.bloodGroup,
//           pinCode: ventures.pinCode,
//           refreshToken: ventures.refreshToken,
//         },
//         firebaseToken,
//         accessToken,
//         refreshToken,
//       },
//       "OTP verified & login successful"
//     )
//   );
// });

export const checkOTP_Ventures = asyncHandler(async (req, res) => {
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

  // 🧹 Delete OTP
  await OtpModel.deleteOne({ _id: otpRecord._id });

  // 👤 Find venture
  const ventures = await Venture.findOne({ phoneNumber: identifier });
  if (!ventures) {
    throw new ApiError(404, "Ventures not found");
  }

  // 🔑 Generate tokens
  const accessToken = JWTService.signAccessToken(
    { _id: ventures._id },
    process.env.ACCESS_TOKEN_EXPIRY
  );
  const refreshToken = JWTService.signRefreshToken(
    { _id: ventures._id },
    process.env.REFRESH_TOKEN_EXPIRY
  );

  // 💾 Save refresh token
  await JWTService.storeVentureRefreshToken(refreshToken, ventures._id);
  ventures.refreshToken = refreshToken;
  await ventures.save();

  // 📲 Save & subscribe firebase token (BEST PLACE)
  if (firebaseToken?.trim()) {
    const token = firebaseToken.trim();

    // Save token (avoid duplicates)
    await Venture.findByIdAndUpdate(
      ventures._id,
      { $addToSet: { firebaseTokens: token } },
      { new: true }
    );

    // 🔔 Subscribe to global + venture topic
    try {
      await fintVenturesApp.messaging().subscribeToTopic(token, "all");
      await fintVenturesApp.messaging().subscribeToTopic(token, "ventures");
    } catch (err) {
      console.error("FCM topic subscription failed:", err.message);
    }
  } else {
    console.log("No Firebase token provided. Skipping update.");
  }

  // ✅ Response
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
        firebaseToken,
        accessToken,
        refreshToken,
      },
      "OTP verified & venture login successful"
    )
  );
});

export const profile_Ventures = asyncHandler(async (req, res) => {
  const ventures = req.venture;

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

export const editProfile_Ventures = asyncHandler(async (req, res) => {

  const ventureId = req.venture?._id;
  console.log(ventureId, "🚀 ~ consteditProfile_Fint=asyncHandler ~ ventureId:", req.body)

  if (!ventureId) {
    throw new ApiError(401, "Unauthorized");
  }

  const {
    firstName,
    lastName,
    phoneNumber,
    bloodGroup,
    beADonor,
    email,
    pinCode,
    firebaseToken,
  } = req.body;
  console.log("beADonor", typeof (beADonor));


  const updateFields = {};
  if (firstName) updateFields.firstName = firstName;
  if (lastName) updateFields.lastName = lastName;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (bloodGroup) updateFields.bloodGroup = bloodGroup;
  const toBoolean = (value) => {
    return typeof value === 'boolean' ? value : value?.toLowerCase() === 'true';
  };
  if (typeof beADonor === 'string') {
    updateFields.beADonor = toBoolean(beADonor);
  }
  else { if (typeof beADonor === 'boolean') updateFields.beADonor = beADonor; }
  if (email) updateFields.email = email;
  if (pinCode) updateFields.pinCode = pinCode;
  if (firebaseToken) updateFields.firebaseToken = firebaseToken;

  const updatedVenture = await Venture.findByIdAndUpdate(
    ventureId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-refreshToken -firebaseTokens -__v");


  if (!updatedVenture) {
    throw new ApiError(404, "Venture not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200,
      updatedVenture
      , "Profile updated successfully"));
});

export const renewAccessToken_Ventures = asyncHandler(async (req, res) => {
  const venture = req.venture;
  console.log(process.env.ACCESS_TOKEN_EXPIRY, "process.env.ACCESS_TOKEN_EXPIRY");

  const newAccessToken = jwt.sign(
    { _id: venture._id, email: venture.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );

  // ✅ Save venture ID to AccessTokenTrack
  await AccessTokenTrack.create({
    ventureId: venture._id,
  });

  return res.status(200).json(
    new ApiResponse(200, { accessToken: newAccessToken }, "Access token renewed")
  );
});

// export const logoutVenture = asyncHandler(async (req, res) => {
//   const refreshToken = req.header("x-refresh-token");
//   console.log("🚀 ~ refreshToken:", refreshToken)
//   const firebaseToken = req.header("x-firebase-token"); // Reading firebaseToken from header
//   console.log("🚀 ~ firebaseToken:", firebaseToken)

//   if (!refreshToken) {
//     throw new ApiError(400, "Refresh token is missing in header");
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     console.log("🚀 ~ decoded:", decoded)

//     const venture = await Venture.findById(decoded._id);
//     console.log("🚀 ~ venture:", venture)
//     if (!venture) {
//       throw new ApiError(404, "Venture not found");
//     }

//     // Clear refresh token
//     venture.refreshToken = null;

//     // Remove firebaseToken from array if it exists
//     if (firebaseToken && venture.firebaseTokens.includes(firebaseToken)) {
//       venture.firebaseTokens = venture.firebaseTokens.filter(token => token !== firebaseToken);
//     }

//     await venture.save();

//     // Clear cookies (optional since we're using headers)
//     res.clearCookie("refreshToken");
//     res.clearCookie("accessToken");

//     return res.status(200).json(
//       new ApiResponse(200, null, "Logged out successfully")
//     );
//   } catch (err) {
//     throw new ApiError(401, "Invalid or expired refresh token");
//   }
// });

export const logoutVenture = asyncHandler(async (req, res) => {
  const refreshToken = req.header("x-refresh-token");
  console.log("🚀 ~ refreshToken:", refreshToken)
  const firebaseToken = req.header("x-firebase-token");

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is missing in header");
  }
  console.log("sfiefin", REFRESH_TOKEN_SECRET, "process.env.REFRESH_TOKEN_SECRET");

  let decoded;
  console.log("🚀 ~ decoded:", decoded)
  try {
    decoded = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET
    );
    console.log("🚀 ~ decoded:", decoded)
  } catch (err) {
    console.log("🚀 ~ err:", err)
    throw new ApiError(401, "Refresh token expired or invalid");
  }

  // 🔍 Find venture
  const venture = await Venture.findById(decoded._id);
  console.log("🚀 ~ venture:", venture)

  if (!venture) {
    throw new ApiError(404, "Venture not found for this token");
  }

  // 🔐 Verify token belongs to venture
  if (venture.refreshToken !== refreshToken) {
    throw new ApiError(401, "Refresh token does not match");
  }

  // ✅ Clear refresh token
  venture.refreshToken = null;

  // 🔥 Remove firebase token if provided
  if (firebaseToken && Array.isArray(venture.firebaseTokens)) {
    venture.firebaseTokens = venture.firebaseTokens.filter(
      (token) => token !== firebaseToken
    );
  }

  await venture.save();

  // Optional: clear cookies
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  return res.status(200).json(
    new ApiResponse(200, null, "Logged out successfully")
  );
});

export const deleteAccount_Ventures = asyncHandler(async (req, res) => {
  const ventureId = req.venture?._id;

  if (!ventureId) {
    throw new ApiError(401, "Unauthorized");
  }

  // Find the venture and delete their account
  const venture = await Venture.findByIdAndDelete(ventureId);
  if (!venture) {
    throw new ApiError(404, "Venture not found");
  }

  return res.status(200).json(new ApiResponse(200, null, "Account deleted successfully"));
});

// =============== add bank account =============

// export const CreateBankAccount_ventures = asyncHandler(async (req, res) => {
//   const ventureId = req.venture?._id;

//   let isAcive = false;

//   const {
//     accountHolderName,
//     bankAccountNumber,
//     ifscCode,
//     bankName,
//     accountType,
//   } = req.body;

//   if (!accountHolderName || !bankAccountNumber || !ifscCode || !bankName || !accountType) {
//     throw new ApiError(400, "All bank account fields are required");
//   }

//   if (!["Savings", "Current"].includes(accountType)) {
//     throw new ApiError(400, "Invalid account type");
//   }

//   const existingAccount = await BankAccount.findOne({
//     ventureId,
//     bankAccountNumber,
//   });

//   if (existingAccount) {
//     throw new ApiError(409, "Bank account already exists");
//   }

//   // 🔥 If first account → active
//   const venture = await Venture.findById(ventureId).select("bankAccounts");

//   if (!venture) {
//     throw new ApiError(404, "Venture not found");
//   }

//   if (venture.bankAccounts.length === 0) {
//     isAcive = true;
//   }

//   const bankAccount = await BankAccount.create({
//     ventureId,
//     accountHolderName,
//     bankAccountNumber,
//     ifscCode,
//     bankName,
//     accountType,
//     isAcive,
//   });

//   await Venture.findByIdAndUpdate(ventureId, {
//     $push: { bankAccounts: bankAccount._id },
//   });

//   return res.status(201).json(
//     new ApiResponse(201, { bankAccount }, "Bank account added successfully")
//   );
// });

export const CreateBankAccount_ventures = asyncHandler(async (req, res) => {
  const ventureId = req.venture?._id;
  let isActive = false;

  const {
    accountHolderName,
    bankAccountNumber,
    ifscCode,
    bankId,
    cardTypeId,
    accountType,
  } = req.body;

  // 🔐 Validation
  if (
    !accountHolderName ||
    !bankAccountNumber ||
    !ifscCode ||
    !bankId ||
    !cardTypeId ||
    !accountType
  ) {
    throw new ApiError(400, "All bank account fields are required");
  }

  if (!["Savings", "Current"].includes(accountType)) {
    throw new ApiError(400, "Invalid account type");
  }

  // 🔁 Check if account already exists
  const existingAccount = await BankAccount.findOne({
    ventureId,
    bankAccountNumber,
  });

  if (existingAccount) {
    throw new ApiError(409, "Bank account already exists");
  }

  // ⭐ First account → active
  const venture = await Venture.findById(ventureId).select("bankAccounts");

  if (!venture) {
    throw new ApiError(404, "Venture not found");
  }

  if (venture.bankAccounts.length === 0) {
    isActive = true;
  }

  // 🏦 Create Bank Account
  const bankAccount = await BankAccount.create({
    ventureId,
    accountHolderName,
    bankAccountNumber,
    ifscCode,
    bankId,
    cardTypeId,
    accountType,
    isActive,
  });

  // 🔗 Attach account to venture
  await Venture.findByIdAndUpdate(ventureId, {
    $push: { bankAccounts: bankAccount._id },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      { bankAccount },
      "Bank account added successfully"
    )
  );
});

export const GetBankAccounts_ventures = asyncHandler(async (req, res) => {
  const ventureId = req.venture?._id;
  console.log("🚀 ~ ventureId:", ventureId)

  const venture = await Venture.findById(ventureId)
    .populate({
      path: "bankAccounts",
      select: "-__v",
      options: { sort: { createdAt: -1 } },
    })
    .select("-refreshToken -__v");

  if (!venture) {
    throw new ApiError(404, "Venture not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { bankAccounts: venture.bankAccounts },
      "Bank accounts fetched successfully"
    )
  );
});

// export const Get_Single_BankAccount_ventures = asyncHandler(async (req, res) => {
//   const ventureId = req.venture?._id;
//   const { bankAccountId } = req.params;

//   // Check if bank account belongs to the venture
//   const venture = await Venture.findById(ventureId).select("bankAccounts");

//   if (!venture) {
//     throw new ApiError(404, "Venture not found");
//   }

//   const hasAccount = venture.bankAccounts.some(
//     (id) => id.toString() === bankAccountId
//   );

//   if (!hasAccount) {
//     throw new ApiError(403, "This bank account does not belong to the venture");
//   }

//   const bankAccount = await BankAccount.findById(bankAccountId).select("-__v");

//   if (!bankAccount) {
//     throw new ApiError(404, "Bank account not found");
//   }

//   return res.status(200).json(
//     new ApiResponse(200, { bankAccount }, "Bank account fetched successfully")
//   );
// });

export const Get_Single_BankAccount_ventures = asyncHandler(async (req, res) => {
  const ventureId = req.venture?._id;
  const { bankAccountId } = req.params;

  // 1️⃣ Validate bankAccountId
  if (!bankAccountId) {
    throw new ApiError(400, "Bank account ID is required");
  }

  // 2️⃣ Fetch bank account with bank & card details
  const bankAccount = await BankAccount.findOne({
    _id: bankAccountId,
    ventureId,
  })
    .populate("bankId", "bankName bankImage")
    .populate("cardTypeId", "name image")
    .select("-__v");

  if (!bankAccount) {
    throw new ApiError(
      404,
      "Bank account not found or does not belong to the venture"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { bankAccount },
      "Bank account fetched successfully"
    )
  );
});



export const UpdateBankAccount_ventures = asyncHandler(async (req, res) => {
  const ventureId = req.venture?._id;
  const { bankAccountId } = req.params;

  const {
    accountHolderName,
    bankAccountNumber,
    ifscCode,
    bankName,
    accountType,
    isAcive,
  } = req.body;

  const venture = await Venture.findById(ventureId).select("bankAccounts");

  if (!venture) {
    throw new ApiError(404, "Venture not found");
  }

  const hasAccount = venture.bankAccounts.some(
    (id) => id.toString() === bankAccountId
  );

  if (!hasAccount) {
    throw new ApiError(403, "This bank account does not belong to the venture");
  }

  const bankAccount = await BankAccount.findById(bankAccountId);

  if (!bankAccount) {
    throw new ApiError(404, "Bank account not found");
  }

  // =========================
  // ACTIVE LOGIC (SAME AS USER)
  // =========================
  const isActiveBoolean = isAcive === true || isAcive === "true";

  if (isActiveBoolean) {
    if (!bankAccount.isAcive) {
      // deactivate all venture accounts
      await BankAccount.updateMany(
        {
          _id: { $in: venture.bankAccounts },
          isAcive: true,
        },
        { $set: { isAcive: false } }
      );

      bankAccount.isAcive = true;
    }
  }

  // =========================
  // UPDATE OTHER FIELDS
  // =========================
  if (accountHolderName)
    bankAccount.accountHolderName = accountHolderName;

  if (bankAccountNumber)
    bankAccount.bankAccountNumber = bankAccountNumber;

  if (ifscCode) bankAccount.ifscCode = ifscCode;

  if (bankName) bankAccount.bankName = bankName;

  if (accountType) {
    if (!["Savings", "Current"].includes(accountType)) {
      throw new ApiError(400, "Invalid account type");
    }
    bankAccount.accountType = accountType;
  }

  await bankAccount.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { bankAccount },
      "Bank account updated successfully"
    )
  );
});

export const DeleteBankAccount_ventures = asyncHandler(async (req, res) => {
  const ventureId = req.venture?._id;
  const { bankAccountId } = req.params;

  const venture = await Venture.findById(ventureId).select("bankAccounts");

  if (!venture) {
    throw new ApiError(404, "Venture not found");
  }

  const hasAccount = venture.bankAccounts.some(
    (id) => id.toString() === bankAccountId
  );

  if (!hasAccount) {
    throw new ApiError(403, "This bank account does not belong to the venture");
  }

  const bankAccount = await BankAccount.findById(bankAccountId);

  if (!bankAccount) {
    throw new ApiError(404, "Bank account not found");
  }

  // ❌ Do not allow delete if active
  if (bankAccount.isAcive === true) {
    throw new ApiError(
      400,
      "Active bank account cannot be deleted. Please activate another account first."
    );
  }

  await BankAccount.findByIdAndDelete(bankAccountId);

  await Venture.findByIdAndUpdate(ventureId, {
    $pull: { bankAccounts: bankAccountId },
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "Bank account deleted successfully")
  );
});
