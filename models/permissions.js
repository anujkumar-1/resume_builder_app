import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    }
})

export const Permission = mongoose.model("Permission", permissionSchema);