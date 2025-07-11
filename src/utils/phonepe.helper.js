import crypto from "crypto";

export const generateXVerify = (payload, url) => {
  const saltKey = process.env.SALT_KEY;
  const saltIndex = process.env.SALT_INDEX;

  const baseString = payload + url + saltKey;

  const xVerify = crypto
    .createHash("sha256")
    .update(baseString)
    .digest("hex");

  return `${xVerify}###${saltIndex}`;
};
