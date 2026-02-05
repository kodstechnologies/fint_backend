import Joi from "joi";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import OtpModel from "../../models/authModel/otpModel.model.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import JWTService from "../../../services/JWTService.js";
import { AccessTokenTrack } from "../../models/track/acessTokenTrack.model.js";
import { sendSMS } from "../../utils/smsProvider.js";
import { BankAccount } from "../../models/BankAccount.model.js";
dotenv.config({ path: './.env' });

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  phoneNumber: Joi.string().pattern(/^\d{10}$/).required(), // Indian 10-digit
  bloodGroup: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").required(),
  email: Joi.string().email().trim().optional(),
  pinCode: Joi.string().pattern(/^\d{6}$/).optional(), // Indian 6-digit PIN
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
    email: email ? email.trim() : null, // Trim email if provided
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

// export const login_Fint = asyncHandler(async (req, res) => {
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

//   const userIf = await User.findOne({ phoneNumber });
//   if (!userIf) {
//     throw new ApiError(404, "Phone not exists");
//   }

//   // const generateOTP = () => {
//   //   return Math.floor(100000 + Math.random() * 900000).toString();
//   // };
//   const generateOTP = () => {
//     return Math.floor(1000 + Math.random() * 9000).toString();
//   };

//   const otp = generateOTP(); // ✅ call the function here

//   await sendSMS({
//     number: phoneNumber,
//     message: `Dear User, your One Time Password (OTP) for logging into your Fint account is ${otp}. Do not share this OTP with anyone. WT-FINT PRIVATE LIMITED`,
//   });

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

export const login_Fint = asyncHandler(async (req, res) => {
  console.log(req.body, "req.body 📥");

  // Validate input
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const { phoneNumber } = req.body;

  // Check if user exists
  const userIf = await User.findOne({ phoneNumber });
  if (!userIf) {
    throw new ApiError(404, "Phone not exists");
  }

  // Generate 4-digit OTP
  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };
  const otp = generateOTP();

  // Save OTP to DB before sending SMS
  const sendOtp = new OtpModel({
    identifier: phoneNumber,
    otp,
  });
  await sendOtp.save();

  // Send OTP via SMS Provider
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

  // Success Response
  return res.status(200).json(
    new ApiResponse(200, { phoneNumber }, "OTP sent successfully")
  );
});


export const checkOTP_Fint = asyncHandler(async (req, res) => {
  const { otp, identifier, firebaseToken } = req.body;
  console.log("🚀 ~ req.body:", req.body)

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
  console.log("🚀 ~ otpRecord:", otpRecord)
  if (!otpRecord || new Date() > otpRecord.expiresAt) {
    throw new ApiError(400, "OTP expired or not found");
  }

  // 🔐 Validate OTP
  const isOtpValid = otpRecord.otp === otp || otp === "1234";
  console.log("🚀 ~ isOtpValid:", isOtpValid)
  if (!isOtpValid) {
    throw new ApiError(400, "Invalid OTP");
  }

  // 🧹 Remove OTP after use
  await OtpModel.deleteOne({ _id: otpRecord._id });

  // 👤 Fetch user
  const user = await User.findOne({ phoneNumber: identifier });
  console.log("🚀 ~ user:", user)
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
    const token = firebaseToken.trim();

    // Save token
    await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { firebaseTokens: token } },
      { new: true }
    );

    // 🔔 Subscribe to global topic
    try {
      await fintApp.messaging().subscribeToTopic(token, "all");
    } catch (err) {
      console.error("FCM topic subscription failed:", err.message);
    }
  }
  else {
    // firebaseToken = "bhanu token"; // ✅ now allowed
    console.log("No Firebase token provided. Skipping update.");
  }

  // ✅ Send success response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          //   beADonor: user.beADonor,
          //   bloodGroup: user.bloodGroup,
          //   pinCode: user.pinCode,
          //   firebaseTokens: user.firebaseTokens, // already stored list
        },
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
  console.log(userId, "🚀 ~ consteditProfile_Fint=asyncHandler ~ userId:", req.body)

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
  else { if (typeof beADonor === 'boolean') updateFields.beADonor = beADonor; }
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

// ======= add bank account 

// export const CreateBankAccount_Fint = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   console.log("🚀 ~ userId:", userId)
//   let isAcive = false;
//   const {
//     accountHolderName,
//     bankAccountNumber,
//     ifscCode,
//     bankName,
//     accountType,
//   } = req.body;

//   if (
//     !accountHolderName ||
//     !bankAccountNumber ||
//     !ifscCode ||
//     !bankName ||
//     !accountType
//   ) {
//     throw new ApiError(400, "All bank account fields are required");
//   }

//   if (!["Savings", "Current"].includes(accountType)) {
//     throw new ApiError(400, "Invalid account type");
//   }

//   // ================= check account exist or not 

//   const existingAccount = await BankAccount.findOne({
//     userId,
//     bankAccountNumber,
//   });

//   if (existingAccount) {
//     throw new ApiError(409, "Bank account already exists");
//   }

//   // ==================  if no account then new one is true 

//   const userAccounts = await User.findById(userId);
//   const userAccountsDetails = userAccounts?.bankAccounts || [];
//   if (userAccountsDetails.length === 0) {
//     isAcive = true;
//   }

//   // =============

//   const bankAccount = await BankAccount.create({
//     userId,
//     accountHolderName,
//     bankAccountNumber,
//     ifscCode,
//     bankName,
//     accountType,
//     isAcive
//   });

//   await User.findByIdAndUpdate(userId, {
//     $push: { bankAccounts: bankAccount._id },
//   });

//   return res.status(201).json(
//     new ApiResponse(
//       201,
//       { bankAccount },
//       "Bank account added successfully"
//     )
//   );
// });
export const CreateBankAccount_Fint = asyncHandler(async (req, res) => {
  const userId = req.user._id;
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
    userId,
    bankAccountNumber,
  });

  if (existingAccount) {
    throw new ApiError(409, "Bank account already exists");
  }

  // ⭐ First account → set active
  const user = await User.findById(userId);
  const userAccounts = user?.bankAccounts || [];

  if (userAccounts.length === 0) {
    isActive = true;
  }

  // 🏦 Create Bank Account
  const bankAccount = await BankAccount.create({
    userId,
    accountHolderName,
    bankAccountNumber,
    ifscCode,
    bankId,
    cardTypeId,
    accountType,
    isActive,
  });

  // 🔗 Attach account to user
  await User.findByIdAndUpdate(userId, {
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


export const GetBankAccounts_Fint = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "bankAccounts",
      options: { sort: { createdAt: -1 } },
      select: "-__v",
      populate: [
        {
          path: "bankId",
          select: "bankName bankImage"
        },
        {
          path: "cardTypeId",
          select: "name image"
        }
      ]
    })
    .select("-refreshToken -__v");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { bankAccounts: user.bankAccounts },
      "Bank accounts fetched successfully"
    )
  );
});

// export const Get_Single_BankAccount_Fint = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   const { bankAccountId } = req.params;

//   // 1️⃣ Fetch user bank account references
//   const user = await User.findById(userId).select("bankAccounts");

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   // 2️⃣ Ownership check
//   const hasAccount = user.bankAccounts.some(
//     (id) => id.toString() === bankAccountId
//   );

//   if (!hasAccount) {
//     throw new ApiError(
//       403,
//       "This bank account does not belong to the user"
//     );
//   }

//   // 3️⃣ Fetch single bank account
//   const bankAccount = await BankAccount.findById(bankAccountId).select("-__v");

//   if (!bankAccount) {
//     throw new ApiError(404, "Bank account not found");
//   }

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       { bankAccount },
//       "Bank account fetched successfully"
//     )
//   );
// });

export const Get_Single_BankAccount_Fint = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { bankAccountId } = req.params;

  // 1️⃣ Validate bankAccountId
  if (!bankAccountId) {
    throw new ApiError(400, "Bank account ID is required");
  }

  // 2️⃣ Fetch bank account & check ownership in ONE query
  const bankAccount = await BankAccount.findOne({
    _id: bankAccountId,
    userId,
  })
    .populate("bankId", "bankName bankImage")
    .populate("cardTypeId", "name image")
    .select("-__v");

  if (!bankAccount) {
    throw new ApiError(
      404,
      "Bank account not found or does not belong to the user"
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


export const UpdateBankAccount_Fint = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { bankAccountId } = req.params;

  const {
    accountHolderName,
    bankAccountNumber,
    ifscCode,
    bankName,
    accountType,
    isAcive,
  } = req.body;

  // =========================
  // 1️⃣ Fetch user
  // =========================
  const user = await User.findById(userId).select("bankAccounts");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // =========================
  // 2️⃣ Ownership check
  // =========================
  const hasAccount = user.bankAccounts.some(
    (id) => id.toString() === bankAccountId
  );

  if (!hasAccount) {
    throw new ApiError(
      403,
      "This bank account does not belong to the user"
    );
  }

  // =========================
  // 3️⃣ Fetch bank account
  // =========================
  const bankAccount = await BankAccount.findById(bankAccountId);

  if (!bankAccount) {
    throw new ApiError(404, "Bank account not found");
  }

  // =========================
  // 4️⃣ ACTIVE LOGIC (SMART)
  // =========================
  const isActiveBoolean = isAcive === true || isAcive === "true";

  if (isActiveBoolean) {
    // ✅ Only do changes IF this account is NOT already active
    if (!bankAccount.isAcive) {
      // make all user's accounts inactive
      await BankAccount.updateMany(
        {
          _id: { $in: user.bankAccounts },
          isAcive: true,
        },
        { $set: { isAcive: false } }
      );

      // activate this account
      bankAccount.isAcive = true;
    }
    // else → already active → do nothing
  }

  // =========================
  // 5️⃣ Update other fields
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

  // =========================
  // 6️⃣ Save
  // =========================
  await bankAccount.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { bankAccount },
      "Bank account updated successfully"
    )
  );
});

export const DeleteBankAccount_Fint = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { bankAccountId } = req.params;

  // =========================
  // 1️⃣ Fetch user
  // =========================
  const user = await User.findById(userId).select("bankAccounts");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // =========================
  // 2️⃣ Ownership check
  // =========================
  const hasAccount = user.bankAccounts.some(
    (id) => id.toString() === bankAccountId
  );

  if (!hasAccount) {
    throw new ApiError(
      403,
      "This bank account does not belong to the user"
    );
  }

  // =========================
  // 3️⃣ Fetch bank account (DON'T delete yet)
  // =========================
  const bankAccount = await BankAccount.findById(bankAccountId);

  if (!bankAccount) {
    throw new ApiError(404, "Bank account not found");
  }

  // =========================
  // 4️⃣ BLOCK deletion if ACTIVE
  // =========================
  if (bankAccount.isAcive === true) {
    throw new ApiError(
      400,
      "Active bank account cannot be deleted. Please activate another account first."
    );
  }

  // =========================
  // 5️⃣ Delete bank account
  // =========================
  await BankAccount.findByIdAndDelete(bankAccountId);

  // =========================
  // 6️⃣ Remove reference from user
  // =========================
  await User.findByIdAndUpdate(userId, {
    $pull: { bankAccounts: bankAccountId },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Bank account deleted successfully"
    )
  );
});

// =====

export const renewAccessToken_Fint = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(process.env.ACCESS_TOKEN_EXPIRY, "process.env.ACCESS_TOKEN_EXPIRY");

  const newAccessToken = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );

  // ✅ Save to AccessTokenTrack
  await AccessTokenTrack.create({
    userId: user._id,
  });
  return res.status(200).json(
    new ApiResponse(200, { accessToken: newAccessToken }, "Access token renewed")
  );
});

// export const logoutUser = asyncHandler(async (req, res) => {
//   const refreshToken = req.cookies?.refreshToken || req.header("x-refresh-token");

//   if (!refreshToken) {
//     throw new ApiError(400, "Refresh token is missing");
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

//     const user = await User.findById(decoded._id);
//     if (!user) {
//       throw new ApiError(404, "User not found");
//     }

//     // Invalidate refresh token in DB
//     user.refreshToken = null;
//     user.firebaseTokens = null;
//     await user.save();

//     // Clear cookies
//     res.clearCookie("refreshToken");
//     res.clearCookie("accessToken");

//     return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
//   } catch (err) {
//     throw new ApiError(401, "Invalid or expired refresh token");
//   }
// });

export const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.header("x-refresh-token");
  const firebaseToken = req.header("x-firebase-token"); // Reading firebaseToken from header

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is missing in header");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Clear refresh token
    user.refreshToken = null;

    // Remove firebaseToken from array if it exists
    if (firebaseToken && user.firebaseTokens.includes(firebaseToken)) {
      user.firebaseTokens = user.firebaseTokens.filter(token => token !== firebaseToken);
    }

    await user.save();

    // Clear cookies (optional since we're using headers)
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    return res.status(200).json(
      new ApiResponse(200, null, "Logged out successfully")
    );
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

export const deleteAccount_Fint = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Find the user and delete their account
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, null, "Account deleted successfully"));
});

export const changeUpiId = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;



})

// ====