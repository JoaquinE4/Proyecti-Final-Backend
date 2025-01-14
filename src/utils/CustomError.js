import { TIPOS_ERROR } from "./Error.js"

export class CustomError {
    static createError(name="Error", cause, message, code = TIPOS_ERROR.INTERNAL_SERVER_ERROR) {     
          
        const error = new Error(message, {cause : cause})
        error.name = name
        error.code = code

        throw error
    }
}