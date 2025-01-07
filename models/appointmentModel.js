const mongoose=require("mongoose")

const appointmentschema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    username:String,
    date:String,
    status:{
        type:String,
        default:"pending"
    },
    timing:{
        start_time:String,
        end_time:String,
    }
})

module.exports=mongoose.model("appointment",appointmentschema)