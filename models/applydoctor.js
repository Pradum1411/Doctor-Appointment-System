const mongoose=require("mongoose")

const doctorsschema=mongoose.Schema({
    userId:mongoose.Schema.Types.ObjectId,
    Status:{
        type:String,
        default:"pending"
    },
    First_Name:{
        type:String,
        required:[true, "first name is required"]
    },
    Last_Name:{
        type:String,
        required:[true, "last name is required"]
    },
    Phone:{
        type:String,
        required:[true, "phone number is required"]
    },
    Email:{
        type:String,
        required:[true, "email is required"]
    },
    Website:{
        type:String,
    },
    Address:{
        type:String,
    },
    Specialization:{
        type:String,
    },
    Expirience:{
        type:String,
        default:0,
    },
    Fees_Per_Cunsaltation:{
        type:Number,
    },
    Timings:{
        type:Object,
    }
})

module.exports=mongoose.model("applydoctor",doctorsschema)