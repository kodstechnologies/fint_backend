import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { generateXVerify } from "../../utils/phonepe.helper.js";

export const createPayment = async (req, res) => {
  try {
    const transactionId = uuidv4();

    // ✅ Extract from request body
    const { amount, mobileNumber } = req.body;

    if (!amount || !mobileNumber) {
      return res.status(400).json({ error: "amount and mobileNumber are required" });
    }

    const payload = {
      merchantId: process.env.MERCHANT_ID,
      transactionId,
      amount,
      redirectUrl: process.env.REDIRECT_URL,
      redirectMode: "REDIRECT",
      mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    const xVerify = generateXVerify(base64Payload, "/pg/v1/pay");

    const response = await axios.post(
      `${process.env.PHONEPE_BASE_URL}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": process.env.MERCHANT_ID,
        },
      }
    );

    return res.status(200).json({
      success: true,
      redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
      transactionId,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};


export const checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const relativeUrl = `/pg/v1/status/${process.env.MERCHANT_ID}/${transactionId}`;

    const xVerify = generateXVerify("", relativeUrl);

    const response = await axios.get(
      `${process.env.PHONEPE_BASE_URL}${relativeUrl}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": process.env.MERCHANT_ID,
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch status" });
  }
};
