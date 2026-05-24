export const isEmpty = (text: string | number | null) => {
  if (typeof text === 'string') {
    return text.trim() === '';
  }
  return text === null || text === undefined;
}

export const isErrorPhoneNumber = (text: string) => {
  const regex = new RegExp('^[0-9]{10,11}$');
  const allowedPhoneNumber = ['010', '011', '016', '017', '018', '019'];
  return !regex.test(text) || !allowedPhoneNumber.includes(text.substring(0, 3)) ;
}