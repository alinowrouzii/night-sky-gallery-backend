const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Types.ObjectId,
        ref:'User'
    },
    color: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        maxLength: 40
    },
    frame: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        //TODO: check required should be true or not
        required: true
    },
    barcode: {
        type: Boolean,
        required:true
    },
    lamp:{
        type:Boolean,
        required:true
    },
    photo:{
        type:String
    },
    music:{
        type:String
    },
    address:{
        type:String,
        required:true
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;