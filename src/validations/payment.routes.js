import Joi from "joi";

// ================= INITIATE PAYMENT =================
export const initiatePaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  receiverId: Joi.string().required(),
  module: Joi.string().optional(),
  moduleData: Joi.object().optional(),
});
// ================= INITIATE PAYMENT (PHONE) =================
export const initiatePaymentSchemaByPhone = Joi.object({
  phoneNumber: Joi.string().length(10).required(),
  amount: Joi.number().positive().required(),
  module: Joi.string().required(),
  moduleData: Joi.object().optional()
});
// ================= INITIATE PAYMENT (BANKACCOUNT) =================
export const initiatePaymentSchemaByBankAccount = Joi.object({
  amount: Joi.number().positive().required(),
  senderAccountHolderName: Joi.string().trim().required(),
  senderBankAccountNumber: Joi.string().trim().required(),
  senderIfscCode: Joi.string().trim().uppercase().required(),
  senderAccountType: Joi.string()
    .valid("Savings", "Current")
    .required(),
  module: Joi.string().required(),
  moduleData: Joi.object().optional(),
});
// ================= ELECTRONIC CHANGE (VENTURE) =================
export const electronicChangesSchema = Joi.object({
  amount: Joi.number().positive().required(),
  // receiverId: Joi.string().required(),
  // module: Joi.string().optional(),
  // moduleData: Joi.object().optional(),
});
