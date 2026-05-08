import mongoose from 'mongoose';
const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissionIds: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Permission" }
    ],

})

export const Role = mongoose.model("Role", roleSchema)