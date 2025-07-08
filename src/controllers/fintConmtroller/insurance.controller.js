import Joi from "joi";
import { Insurance } from "../../models/pet/insurance.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import bcrypt from 'bcrypt';

const registerPetInsuranceSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).max(50).trim().required(), // Stronger password validation
  phoneNumber: Joi.string().pattern(/^\d{10}$/).required(), // Indian 10-digit number
  address: Joi.string().min(2).max(100).trim().required(), // Free-form address
  parentAge: Joi.number().min(18).max(110).required(), // Assuming it's an age
  pinCode: Joi.string().pattern(/^\d{6}$/).required(), // Indian 6-digit PIN

  // Pet fields
  petName: Joi.string().min(2).max(50).trim().required(),
  petBreed: Joi.string().min(2).max(50).trim().required(),
  petAge: Joi.number().min(0).max(50).required(),
  petAddress: Joi.string().min(2).max(100).trim().required(),
  petNoseImg: Joi.string().uri().trim().optional().allow(null),

});


export const getInsurancePlanById = (async (req, res) =>{
    

});

export const approveInsuranceApplication = (async (req ,res) =>{

});

export const applyForInsurance = asyncHandler(async (req, res) => {
  console.log('req.body 🫎', req.body);
console.log('req.file 🐶', req.file);

  // Step 1: Joi Validation
  const { error } = registerPetInsuranceSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ApiError(400, 'Validation failed', errors);
  }

  // Step 2: Extract validated data
  const {
    name,
    email,
    password,
    phoneNumber,
    address,
    parentAge,
    pinCode,
    petName,
    petBreed,
    petAge,
    petAddress,
  } = req.body;

  // Step 2.1: Handle file input
  const petNoseImg = req.file?.path || null;

  // Step 3: Check if user already exists
  // const existingUser = await Insurance.findOne({ $or: [{ email }, { phoneNumber }] });
  // if (existingUser) {
  //   throw new ApiError(409, 'User with same email or phone number already exists');
  // }

  // Step 4: Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Step 5: Create user
  const newUser = new Insurance({
    name,
    email,
    password: hashedPassword,
    phoneNumber,
    address,
    parentAge,
    pinCode,
    pets: [
      {
        petName,
        petBreed,
        petAge,
        petAddress,
        petNoseImg,
      },
    ],
  });

  // Step 6: Save to DB
  const savedUser = await newUser.save();

  // Step 7: Return response
  return res.status(200).json(
    new ApiResponse(200, { savedUser }, 'Insurance application submitted successfully')
  );
});

export const renewInsurance = () =>{

}

export const rejectInsuranceApplication = () =>{

}
