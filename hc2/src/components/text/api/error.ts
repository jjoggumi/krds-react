export class ApiError extends Error {
   status: number;
   errorMessage: string; 
   errorCode: string;

   constructor(status: number, errorCode: string, message?: string) {
      super(`Error status ${status} / errorCode ${errorCode} / message ${message}`);
      this.status = status;
      this.errorCode = errorCode;
      this.errorMessage = message;
   }
}