export function formatPhoneNumber(phoneNumber: string) {
  const regex = /^(\(?\d{2}\)?\s)?(9\s?)?(\d{4,5}-?\d{4})$/;
  return regex.test(phoneNumber);
}
