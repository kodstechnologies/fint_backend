import Joi from "joi";

// ================= INITIATE PAYMENT =================
export const initiatePaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  receiverId: Joi.string().required(),
  module: Joi.string().optional(),
  moduleData: Joi.object().optional(),
});

// ================= ELECTRONIC CHANGE (VENTURE) =================
export const electronicChangesSchema = Joi.object({
  amount: Joi.number().positive().required(),
  // receiverId: Joi.string().required(),
  // module: Joi.string().optional(),
  // moduleData: Joi.object().optional(),
});
