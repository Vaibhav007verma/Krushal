const trimPhoneNumberToRight10Numbers = (phoneNumber) => {
  let trimmedPhoneNumber = phoneNumber
  const trimmedPhoneNumberLength = trimmedPhoneNumber.length
  if (trimmedPhoneNumberLength > 10) {
    trimmedPhoneNumber = trimmedPhoneNumber.substr(trimmedPhoneNumberLength - 10, 10)
  }
  return trimmedPhoneNumber
}


module.exports = {trimPhoneNumberToRight10Numbers}