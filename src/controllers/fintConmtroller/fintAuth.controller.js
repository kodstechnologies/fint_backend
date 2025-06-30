import Joi from "joi";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import OtpModel from "../../models/authModel/otpModel.model.js";
import jwt from 'jsonwebtoken';



const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).required(), // Indian 10-digit
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
    .pattern(/^\d{6}$/) // Validates a 6-digit numeric OTP
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
 const { name , email, phoneNumber , bloodGroup ,pinCode } = req.body;

const fintUser = await User.findOne({email,phoneNumber})
if(fintUser){
    console.log("fint user already exist");
     throw new ApiError(400, "fint user already exist");
}
const createUser = new User ({
name: name,
email: email,
phoneNumber : phoneNumber ,
bloodGroup : bloodGroup ,
pinCode : pinCode
})
await createUser.save();
console.log("user signin sucessafully");
    // Respond with success
    return res
      .status(200)
      .json(
        new ApiResponse(200, {
        createUser,
        }, "Sign up successful")
      );
})

export const login_Fint = asyncHandler(async (req, res) =>{
     console.log(req.body, "req.body 📥");
      const { error } = loginSchema.validate(req.body, { abortEarly: false});
       if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const {phoneNumber} = req.body;

  const userIf = await User.findOne({phoneNumber});
  if(!userIf){
    throw new ApiError(404, "user not found");
  }

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const otp = generateOTP(); // ✅ call the function here

// console.log(otp,"otp");

  const sendOtp = new OtpModel ({
    identifier : phoneNumber ,
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

export const checkOTP_Fint = asyncHandler(async (req, res) =>{
console.log(req.body, "req.body 📥");

const {error} = otpSchema.validate(req.body , {abortEarly : false})
     if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  const {otp , identifier } = req.body;
const checkOtp = await OtpModel.findOne({ identifier });
console.log("OTP Record from DB:", checkOtp); // should not be null

if (!checkOtp) {
  console.log("Identifier used:", identifier); // help debug
  throw new ApiError(400, "OTP expired or not found");
}


  // ✅ Allow "123456" as test OTP
  const isValidOtp = checkOtp.otp === otp || otp === "123456";

   if (!isValidOtp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // ✅ Delete OTP after successful verification
  await OtpModel.deleteOne({ _id: checkOtp._id });

    const user = await User.findOne({ phoneNumber: identifier });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // // Generate JWT token
  // const token = jwt.sign(
  //   { id: user._id , role: "fint user"},
  //   process.env.JWT_SECRET,
  //   { expiresIn: "1d" }
  // );

  // // Set cookie
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
  //   maxAge: 24 * 60 * 60 * 1000, // 1 day
  // });

  return res
      .status(200)
      .json(
        new ApiResponse(200, {
        // token,
        }, "Login successful")
      );
})

export const forgotPassword_Fint = () =>{

}
export const coupons_Fint = () =>{

}
