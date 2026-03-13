class ApiError extends Error{
    constructor(statuscode,messsage = "somthing went wrong",errors=[],stack=" "){
      super(messsage)
      this.statuscode  = statuscode;
      this.data  =null;
      this.errors = errors;
      this.statuscode  = statuscode;
      this.success = false

       if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}
export default ApiError