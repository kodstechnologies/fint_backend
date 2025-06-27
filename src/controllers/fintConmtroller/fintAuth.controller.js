import Joi from "joi";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


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
        }, "Login successful")
      );
})

export const login_Fint = asyncHandler(async (req, res) =>{
     console.log(req.body, "req.body 📥");
      const { error } = registerSchema.validate(req.body, { abortEarly: false});
      if()
})

export const checkOTP_Fint = () =>{

}
export const forgotPassword_Fint = () =>{

}
export const coupons_Fint = () =>{

}
