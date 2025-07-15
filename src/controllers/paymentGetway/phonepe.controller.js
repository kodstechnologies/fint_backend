// import axios from "axios";
// import { asyncHandler } from "../../utils/asyncHandler.js";
// import Payment from "../../models/payment/payment.model.js";
// import { ApiResponse } from "../../utils/ApiResponse.js";
// import { ApiError } from "../../utils/ApiError.js";
// // import { generateXVerify } from "../../utils/phonepe.helper.js";



// export const checkPaymentStatus = async (req, res) => {
//   try {
//     const { transactionId } = req.params;

//     const relativeUrl = `/pg/v1/status/${process.env.MERCHANT_ID}/${transactionId}`;

//     const xVerify = generateXVerify("", relativeUrl);

//     const response = await axios.get(
//       `${process.env.PHONEPE_BASE_URL}${relativeUrl}`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "X-VERIFY": xVerify,
//           "X-MERCHANT-ID": process.env.MERCHANT_ID,
//         },
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       data: response.data,
//     });
//   } catch (error) {
//     console.error(error.response?.data || error.message);
//     res.status(500).json({ error: "Failed to fetch status" });
//   }
// };
