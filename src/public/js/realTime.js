const socket = io();

socket.on("nuevaConexion", (data) => {
  Toastify({
    text: `${data} se ha conectado!`,

    duration: 3000,
  }).showToast();
});

const list = document.getElementById("list-group");

socket.on("nuevoProducto", (newProduct) => {
  list.innerHTML += ` 
    <div class="col-sm-3" data-aos="fade-up">
    <div class="card">
    <div class="card-body">
      <h5 class="card-title"> ${newProduct.title}</h5>
      <p class="card-text">Descripcion: ${newProduct.description}</p>
      <p class="card-text">Precio:${newProduct.price}</p>
    </div>
  </div>
</div>`;
});

socket.on("delete", (productos) => {
  list.innerHTML = "";
  productos.map((p) => {
    list.innerHTML += `
        <div class="col-sm-3 " data-aos="fade-up">
        <div class="card">
        <div class="card-body">
          <h5 class="card-title"> ${p.title}</h5>
          <p class="card-text">Descripcion: ${p.description}</p>
          <p class="card-text">Precio:${p.price}</p>
        </div>
      </div>
    </div>`;
  });
});

