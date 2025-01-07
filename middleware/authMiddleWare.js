const jwt=require("jsonwebtoken")

class middleWare{

    //authmiddleware
    static authmiddleware=async(req,res,next)=>{
        
        try {
            const user_token=req.session.user_token
            // console.log("middleware",user_token)
            if(!user_token){
                return res.redirect("/login")
            }
            jwt.verify(user_token,process.env.SECURITY_KEY,(err,decode)=>{
                if(err){
                    console.log("login auth err--",err)
                    return res.redirect("/login")
                }
       
                req.session.user=decode
                next()
            })
                
            
        } catch (error) {
            console.log("log auth--",error)
            res.redirect("/login")
        }
    }

    //protect router
    static protectrouter=async(req,res,next)=>{
        try {
            const user_token=req.session.user_token
            if(user_token){
                return res.redirect("/home")
            }
            next()
        } catch (error) {
            res.redirect("/login")
        }
    }
}

module.exports=middleWare