// import Joi from "joi";

// export const createOrderSchema = Joi.object({
//   // ================= RECEIVER =================
//   receiverId: Joi.string()
//     .hex()
//     .length(24)
//     .optional()
//     .messages({
//       "string.hex": "receiverId must be a valid ObjectId",
//     }),

//   receiverPhoneNo: Joi.string()
//     .pattern(/^[6-9]\d{9}$/)
//     .optional()
//     .messages({
//       "string.pattern.base": "receiverPhoneNo must be a valid Indian mobile number",
//     }),

//   receiverBankAccount: Joi.string()
//     .hex()
//     .length(24)
//     .optional()
//     .messages({
//       "string.hex": "receiverBankAccount must be a valid ObjectId",
//     }),

//   // ================= PAYMENT =================
//   amount: Joi.number()
//     .positive()
//     .required()
//     .messages({
//       "number.base": "amount must be a number",
//       "number.positive": "amount must be greater than 0",
//       "any.required": "amount is required",
//     }),

//   module: Joi.string()
//     .required()
//     .messages({
//       "any.required": "module is required",
//     }),

//   moduleData: Joi.object().optional(),
// })
//   // ✅ At least one receiver identifier required
//   .or("receiverId", "receiverPhoneNo", "receiverBankAccount")
//   .messages({
//     "object.missing":
//       "One of receiverId, receiverPhoneNo, or receiverBankAccount is required",
//   });


import Joi from "joi";

export const initiatePaymentSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be greater than 0",
      "any.required": "Amount is required",
    }),

  receiverId: Joi.string()
    .hex()
    // .length(24)
    .required()
    .messages({
      "string.length": "Invalid receiver id",
      "any.required": "Receiver id is required",
    }),

  moduleData: Joi.object().default({}),
});


// export const verifyPaymentSchema = Joi.object({
//     orderId: Joi.string()
//         .required()
//         .messages({
//             "any.required": "orderId is required",
//         }),

//     paymentId: Joi.string()
//         .required()
//         .messages({
//             "any.required": "paymentId is required",
//         }),

//     signature: Joi.string()
//         .required()
//         .messages({
//             "any.required": "signature is required",
//         }),
// });
