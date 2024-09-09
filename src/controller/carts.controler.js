import { UsuariosManagerMongo as UsuarioManager } from "../dao/UsuariosManagerMongo.js";
import { cartsService } from "../repository/Carts.service.js";
import { productosService } from "../repository/Products.service.js";
import { ticketService } from "../repository/Ticket.service.js";
 import { isValidObjectId } from "mongoose";
import { CustomError } from "../utils/CustomError.js";
import { TIPOS_ERROR } from "../utils/Error.js";
import { transporter } from "../utils/Mailin.js";

const usuarioService = new UsuarioManager();

export class CartsControler {
  static postCart = async (req, res, next) => {
    const id = Date.now().toString();

    try {
      let newCart = await cartsService.addCart({ id });
      req.logger.debug("Exito al crear carrito de productos");

      res.json(newCart);
    } catch (error) {
      req.logger.error(error);
      next(error);
    }
  };

  static getAllCarts = async (req, res, next) => {
    try {
      let tomar = await cartsService.getAll();
      req.logger.debug("Exito al buscar todos los carritos");

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ tomar });
    } catch (error) {
      req.logger.error(error);

      next(error);
    }
  };

  static getCartId = async (req, res, next) => {
    try {
      const { cid } = req.params;

      if (!isValidObjectId(cid)) {
        CustomError.createError(
          "Error ID invalido",
          "Error ID invalido",
          "Error ID invalido",
          TIPOS_ERROR.ARGUMENTOS_INVALIDOS
        );
      }

      const carrito = await cartsService.getCartByIdPopulate({ _id: cid });

      if (!carrito) {
        CustomError.createError(
          "Error No se encontro Carrito",
          "Error No se encontro Carrito",
          "Error No se encontro Carrito",
          TIPOS_ERROR.ARGUMENTOS_INVALIDOS
        );
      }

      req.logger.debug("Exito albuscar carrito por id");

      return res.status(200).json({ carrito });
    } catch (error) {
      req.logger.error(error);

      next(error);
    }
  };

  static deleteCartId = async (req, res, next) => {
    try {
      const { cid } = req.params;

      if (!isValidObjectId(cid)) {
        CustomError.createError(
          "Error ID invalido",
          "Error ID invalido",
          "Error ID invalido",
          TIPOS_ERROR.ARGUMENTOS_INVALIDOS
        );
      }

      const carrito = await cartsService.getCartByIdPopulate({ _id: cid });

      if (!carrito) {
        CustomError.createError(
          "Error No se encontro Carrito",
          "Error No se encontro Carrito",
          "Error No se encontro Carrito",
          TIPOS_ERROR.ARGUMENTOS_INVALIDOS
        );
      }

      let product = [];

      let eliminarCart = await cartsService.deleteCart(cid);
      req.logger.debug("Exito al vaciar carrito");

      return res
        .status(200)
        .json({ message: "Se eliminaron todos los productos" });
    } catch (error) {
      req.logger.error(error);

      next(error);
    }
  };

  static putCart = async (req, res, next) => {
    let { cid } = req.params;
    if (!isValidObjectId(cid)) {
      CustomError.createError(
        "Error ID invalido",
        "Error ID invalido",
        "Error ID invalido",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    }

    let products = [];

    try {
      const updatedCart = await cartsService.update(cid, products);

      if (updatedCart) {
        req.logger.debug("Exito al editar carrito");

        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ message: "Carrito actualizado correctamente" });
      } else {
        res.setHeader("Content-Type", "application/json");
        CustomError.createError(
          "No se encontro el carrito",
          "No se encontro el carrito",
          "No se encontro el carrito",
          TIPOS_ERROR.ARGUMENTOS_INVALIDOS
        )
      }
    } catch (error) {
      req.logger.error(error);

      next(error);
    }
  };

  static postProdCart = async (req, res, next) => {
    let { cid, pid } = req.params;
    
    try {
      
      if (!isValidObjectId(cid) || !cid || !isValidObjectId(pid) || !pid) {
          CustomError.createError(
          "Error ID invalido",
          "Error ID invalido",
          "Error ID invalido",
          TIPOS_ERROR.ARGUMENTOS_INVALIDOS
        )
      }
  
      let usuario = await usuarioService.getBy({ cart: cid });
  
      if (!usuario) {
        CustomError.createError(
          "Error No se encontro Usuario",
          "Error No se encontro Usuario",
          "Error No se encontro Usuario",
          TIPOS_ERROR.ARGUMENTOS_INVALIDOS
        );
      }

     let carrito = await cartsService.getCartById(usuario.cart)
     if (!carrito) {
      CustomError.createError(
        "Error No se encontro Carrito",
        "Error No se encontro Carrito",
        "Error No se encontro Carrito",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    }

  
      let producto = await productosService.getProductByCode({ _id: pid });
      if (!producto) {
         CustomError.createError(
          "Error No se encontro Producto",
          "Error No se encontro Producto",
          "Error No se encontro Producto",
          TIPOS_ERROR.ARGUMENTOS_INVALIDOS
        );
      } 
      let uid = usuario._id;
      let ownerId = producto.owner;
  
  
      if (uid = ownerId) {
        req.logger.warning("El usuario no puede generar acciones sobre este producto");
        return;
      }
  
      let indiceProducto = carrito.products.findIndex((p) => p.product == pid);
      if (indiceProducto === -1) {
        carrito.products.push({
          product: pid,
          quantity: 1,
        });
  
        carrito.total += producto.price;
      } else {
        carrito.products[indiceProducto].quantity++;
        carrito.total = await calculateTotal(carrito.products);
      }
  
      async function calculateTotal(products) {
        let total = 0;
        for (const item of products) {
          try {
            const product = await productosService.getProductByCode(
              item.product._id
            );
            if (product) {
              total += product.price * item.quantity;
            }
          } catch (error) {
            console.error("Error fetching product:", error);
          }
        }
        return total;
      }
      let resultado = await cartsService.update(cid, carrito);
      if (resultado.modifiedCount > 0) {
        req.logger.debug("Exito al agregar producto al carrito");

        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ message: "Carrito actualizado" });
      }
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ message: "Carrito actualizado" });
    } catch (error) {
      req.logger.error(error);

      next(error);
    }
  };

  static putProdCart = async (req, res, next) => {
    let { cid, pid } = req.params;
    let cantidad = req.body.cantidad;

    cantidad = Number(cantidad);

    if (isNaN(cantidad)) {
      res
        .status(400)
        .json({ Error: "La cantidad proporcionada no es un número válido" });
    }
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      CustomError.createError(
        "Error ID invalido",
        "Error ID invalido",
        "Error ID invalido",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    }

    let carrito = await cartsService.getCartById({ _id: cid });
    if (!carrito) {
      CustomError.createError(
        "Error No se encontro Carrito",
        "Error No se encontro Carrito",
        "Error No se encontro Carrito",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    }

    let producto = await productosService.getProductByCode({ _id: pid });
    if (!producto) {
      CustomError.createError(
        "Error No se encontro Producto",
        "Error No se encontro Producto",
        "Error No se encontro Producto",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    }

    let indiceProducto = carrito.products.findIndex((p) => p.product == pid);
    if (indiceProducto === -1) {
      res.status(401).json({ Error: "No existe producto en el carrito" });
    } else {
      carrito.products[indiceProducto].quantity += cantidad;
    }

    let total = 0;
    for (const item of carrito.products) {
      try {
        const product = await productosService.getProductByCode(item.product);
        if (product) {
          total += product.price * item.quantity;
        }
      } catch (error) {
        req.logger.error("Error fetching product:", error);
      }
    }
    total;

    carrito.total = total;
    try {
      let resultado = await cartsService.update(cid, carrito);
      if (resultado.modifiedCount > 0) {
        req.logger.debug({message:"Exito al acualizar lista de productos del carrito"});

        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ message: "Cantidad actualizada" });
      }
    } catch (error) {
      req.logger.error(error);

      next(error);
    }
  };

  static deleteProdCart = async (req, res, next) => {
    let { cid, pid } = req.params;
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      CustomError.createError(
        "Error ID invalido",
        "Error ID invalido",
        "Error ID invalido",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    }

    let carrito = await cartsService.getCartById({ _id: cid });
    if (!carrito) {
      CustomError.createError(
        "Error No se encontro Carrito",
        "Error No se encontro Carrito",
        "Error No se encontro Carrito",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    }

    let producto = await productosService.getProductByCode({ _id: pid });
    if (!producto) {
      CustomError.createError(
        "Error No se encontro Producto",
        "Error No se encontro Producto",
        "Error No se encontro Producto",
        TIPOS_ERROR.ARGUMENTOS_INVALIDOS
      );
    }

    let indiceProducto = carrito.products.findIndex((p) => p.product == pid);
    if (indiceProducto === -1) {
      res.status(401).json({ Error: "No existe producto en el carrito" });
    } else {
      carrito.products.splice(indiceProducto, 1);
    }

    let total = 0;
    for (const item of carrito.products) {
      try {
        const product = await productosService.getProductByCode(item.product);
        if (product) {
          total += product.price * item.quantity;
        }
      } catch (error) {
        req.logger.error("Error fetching product:", error);
      }
    }
    total;

    carrito.total = total;

    try {
      let resultado = await cartsService.update(cid, carrito);
      if (resultado.modifiedCount > 0) {
        req.logger.debug("Exito al eliminar producto del carrito");

        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({ message: "Producto eliminado" });
      }
    } catch (error) {
      req.logger.error(error);

      next(error);
    }
  };

  static validarCompra = async (req, res, next) => {
    try {
      let { cid } = req.params;
      
      let carrito = await cartsService.getCartById({ _id: cid });
      if (!carrito) {
        throw new CustomError("Error No se encontro Carrito", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
      }
  
      let usuario = await usuarioService.getBy({ cart: cid });
  
      let productosAComprar = [];
      let productosAGuardar = [];
      
      for (let item of carrito.products) {
        let product = await productosService.getProductByCode(item.product);
        if (!product) {
          throw new CustomError("Error No se encontro Producto", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
        }
  
        if (product.stock >= item.quantity) {
          product.stock -= item.quantity;
          await productosService.updateProduct(product._id, product);
  
          productosAComprar.push({
            product: product._id,
            quantity: item.quantity,
          });
        } else {
          productosAGuardar.push({
            product: product._id,
            quantity: item.quantity,
          });
        }
      }
  
      carrito.products = productosAGuardar;
      
      let total = 0;
      for (const item of carrito.products) {
        const product = await productosService.getProductByCode(item.product);
        if (product) {
          total += product.price * item.quantity;
        } else {
          throw new CustomError("Error No se encontro Producto", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
        }
      }
      carrito.total = total;
  
      await cartsService.update(cid, carrito);
  
      let totalCrado = 0;
      for (const item of productosAComprar) {
        const product = await productosService.getProductByCode(item.product);
        if (product) {
          totalCrado += product.price * item.quantity;
        } else {
          throw new CustomError("Error No se encontro Producto", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
        }
      }
  
      let email = usuario.email;
      let ticket = await ticketService.create(totalCrado, email);
  
      if (!usuario.tickets) {
        let id = usuario._id;
        await usuarioService.update(id, ticket);
  
        req.logger.debug("Exito al crear ticket y agregar al Usuario");
  
        let emailContent = `
          <div class="container mt-4">
            <h3 class="mb-4">Detalles del Ticket</h3>
            <div class="border w-75 bg-white border-dark rounded p-4">
              <p><strong>Código de ticket:</strong> ${ticket.code}</p>
              <p><strong>Email de comprador:</strong> ${ticket.purchaser}</p>
              <p><strong>Fecha de compra:</strong> ${ticket.purchase_datetime}</p>
              <p><strong>Monto total:</strong> $${ticket.amount}</p>
            </div>
          </div>
        `;
  
        let info = await transporter.sendMail({
          to: email,
          subject: "Detalles de tu compra",
          html: emailContent,
        });
  
        req.logger.debug(`Correo enviado: ${info.response}`);
      }
  
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        message: "Compra validada correctamente",
        ticket: ticket,
        productosNoComprados: productosAGuardar,
      });
  
    } catch (error) {
      req.logger.error(`Error en la validación de compra: ${error.message}`);
      next(error);
    }
  };
  
}
