import mongoose from "mongoose";

 

export const usuarioModelo = mongoose.model(
  "usuarios",
  new mongoose.Schema(
    {
      first_name: String,
      last_name: String,
      age: Number,
      email: {
        type: String,
        unique: true,
      },
      password: String,
      rol: String,
      cart: {
        type: mongoose.Types.ObjectId,
        ref: "carts",
      },
      documents: {
        type: [
         { name: { type: String, required: true }},
          {reference: { type: String, required: true }},
        ],
      },
      last_connection: { type: Date },
    },
    { timestamps: true, strict: false }
  )
);
