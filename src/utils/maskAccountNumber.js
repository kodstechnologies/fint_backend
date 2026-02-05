export const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return "";

    const visibleDigits = 4;
    const totalLength = accountNumber.length;

    if (totalLength <= visibleDigits) {
        return accountNumber;
    }

    const maskedPart = "X".repeat(totalLength - visibleDigits);
    const lastFour = accountNumber.slice(-visibleDigits);

    return maskedPart + lastFour;
};
