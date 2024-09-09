import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcrypt";
import fs from 'fs';

import passport from "passport";
const __filename = fileURLToPath(import.meta.url);
 export const __dirname = dirname(__filename);
import multer from "multer";
import path from "path";

export const generateHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const validaPassword = (password, passwordHash) =>
  bcrypt.compareSync(password, passwordHash);

export const passportCall = (estrategia) => {
  return function (req, res, next) {
    passport.authenticate(estrategia, function (err, user, info, status) {
      if (err) {
        return next(err);
      }

      if (!user) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(401)
          .json({ error: info.message ? info.message : info.toString() });
      }
      console.log(user.cart);
      req.session.user = user;
      return next();
    })(req, res, next);
  };
};

export const idInvalido = (id, description) => {
  if (!isValidObjectId(id)) {
    errorName = "ObjectId no valido";
    return CustomError.createError(
      errorName,
      errorCause(
        "addProductToCart",
        errorName,
        `${description} isValidObjectId: ${isValidObjectId(id)} - value: ${id}`
      ),
      "Favor de corrigir el argumento",
      TIPOS_ERROR.ARGUMENTOS_INVALIDOS
    );
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './src/uploads')
  },
  filename: function (req, file, cb) {
  
      let tipo=file.mimetype.split("/")[0]
      if(tipo!=="image"){
          return cb(new Error("Solo se admiten imagenes...!"))
      }

      cb(null, Date.now() +"-"+file.originalname )

  }
})

export const upload = multer({ storage: storage })