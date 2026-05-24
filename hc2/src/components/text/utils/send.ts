

export const getByteLength = (text: string) => {
   let byte = 0;
   for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      byte += charCode <= 0x007f ? 1 : 2;
   }
   return byte;
};

export const getByteCutString = (str: string, maxByte: number) => {
   let b = 0;
   for (let i = 0; i < str.length; i++) {
      b += str.charCodeAt(i) > 127 ? 2 : 1;
      if (b > maxByte) return str.substring(0, i);
   }
   return str;
};