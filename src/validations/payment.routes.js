import Joi from "joi";

export const createOrderSchema = Joi.object({
    receiverType: Joi.string()
        .valid("User", "Venture")
        .required()
        .messages({
            "any.only": "receiverType must be User or Venture",
            "any.required": "receiverType is required",
        }),

    receiverId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex": "receiverId must be a valid ObjectId",
            "any.required": "receiverId is required",
        }),

    amount: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "amount must be a number",
            "number.positive": "amount must be greater than 0",
            "any.required": "amount is required",
        }),

    module: Joi.string()
        .required()
        .messages({
            "any.required": "module is required",
        }),

    moduleData: Joi.object().optional(),
});

export const verifyPaymentSchema = Joi.object({
    orderId: Joi.string()
        .required()
        .messages({
            "any.required": "orderId is required",
        }),

    paymentId: Joi.string()
        .required()
        .messages({
            "any.required": "paymentId is required",
        }),

    signature: Joi.string()
        .required()
        .messages({
            "any.required": "signature is required",
        }),
});
