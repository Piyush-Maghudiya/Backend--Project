const asyncHandler = (fn) =>{
     return  async (req,res,next) =>{
        try{
          await fn(req,res,next)
        }
        catch(error){
            if(typeof next === 'function'){
                next(error)
            } else {
                res.status(error.statuscode || 500).json({
                  success:false,
                  message : error.message
                })
            }
        }
       }
}
export default asyncHandler