import mongoose from "mongoose";
import { safeParse } from "zod";
const userSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.String, required: true },
    email: { type: mongoose.Schema.Types.String, required: true, unique: true, safeParse: true },
    age: { type: mongoose.Schema.Types.Number, required: false, default: 21 },
    password: { type: mongoose.Schema.Types.String, required: false, safeParse: true }
});

export const UserSchema = mongoose.model('User', userSchema);