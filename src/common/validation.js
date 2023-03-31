const commonRegexes = {
  IndiaMobileNumber: "^[6789]\\d{9}$",
  // PositiveDecimal: "^([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$",
  PositiveDecimal: "^\\s*$|^([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$",
  AnyDecimal: "^\\s*$|^[-+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$",
  AnyNumber: "^-?[1-9]\\d*$",
  PositiveNumber: "^[1-9]\\d*$",
}

const generateErrorMessage = (validationRegexReference, value) => {
  let errorMessage = ''
  switch (validationRegexReference) {
    case 'IndiaMobileNumber': {
      if (value.length === 10) {
        errorMessage = 'Is not a valid mobile number'
      } else if (value.length === 0) {
      } else if (value.length > 0 && value.length !== 10) {
        errorMessage = 'A mobile number should be 10 digits'
      }
    }
  }
  return errorMessage
}

module.exports = {commonRegexes, generateErrorMessage}
