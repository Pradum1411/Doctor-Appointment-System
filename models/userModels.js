const mongoose=require("mongoose")

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is require"]
    },
    email:{
        type:String,
        required:[true,"email is require"]
    },
    password:{
        type:String,
        required:[true,"password is require"]
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isDoctor:{
        type:Boolean,
        default:false
    },
    notification:[{
        type:mongoose.Schema.Types.ObjectId,
        // default:[],
        ref:"applydoctor",       
    }
],
    seennotification:[{
        type:mongoose.Schema.Types.ObjectId,
        // default:[],
        ref:"applydoctor"
    }],
    message:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"appointment"
    }],
    seenmessage:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"appointment"
    }],
    doctorList:Array
})

module.exports=mongoose.model("user",userSchema)