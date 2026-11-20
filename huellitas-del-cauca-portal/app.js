// Portal sencillo: JavaScript nativo y manipulación del DOM.
const necesidades = [
  { nombre: "Concentrado para perros y gatos", tipo: "Alimento", detalle: "Alimento para los animales rescatados." },
  { nombre: "Desparasitantes y vitaminas", tipo: "Medicinas", detalle: "Productos veterinarios para su cuidado." },
  { nombre: "Productos de limpieza", tipo: "Aseo", detalle: "Desinfectante, jabón y bolsas resistentes." },
  { nombre: "Cobijas y toallas", tipo: "Mantas", detalle: "Mantas limpias para descanso y recuperación." }
];

const formulario = document.getElementById("form-donacion");
const catalogo = document.getElementById("catalogo");
const lista = document.getElementById("lista-donaciones");
const mensaje = document.getElementById("mensaje");
const fotoInput = document.getElementById("foto");
const vistaFoto = document.getElementById("vista-foto");
const clave = "huellitas_donaciones";
let donaciones = JSON.parse(localStorage.getItem(clave) || "[]");
let fotoSeleccionada = "";

// Muestra u oculta las dos vistas de la SPA.
document.querySelectorAll("[data-vista]").forEach(enlace => {
  enlace.addEventListener("click", evento => {
    const destino = enlace.dataset.vista;
    if (destino === "donaciones") {
      evento.preventDefault();
      document.getElementById("vista-inicio").classList.add("d-none");
      document.getElementById("vista-donaciones").classList.remove("d-none");
      mostrarDonaciones();
      window.scrollTo(0, 0);
    } else if (enlace.getAttribute("href") === "#inicio") {
      evento.preventDefault();
      document.getElementById("vista-donaciones").classList.add("d-none");
      document.getElementById("vista-inicio").classList.remove("d-none");
      document.getElementById("inicio").scrollIntoView();
    } else {
      document.getElementById("vista-donaciones").classList.add("d-none");
      document.getElementById("vista-inicio").classList.remove("d-none");
    }
  });
});

// Catálogo dinámico.
function mostrarCatalogo(categoria = "Todas") {
  catalogo.innerHTML = "";
  necesidades.filter(item => categoria === "Todas" || item.tipo === categoria).forEach(item => {
    const elemento = document.createElement("li");
    elemento.className = "col-md-6 col-lg-3";
    elemento.innerHTML = `<article class="tarjeta h-100"><h3>${item.nombre}</h3><p>${item.detalle}</p><strong>${item.tipo}</strong></article>`;
    catalogo.appendChild(elemento);
  });
}

document.querySelectorAll(".filtro").forEach(boton => {
  boton.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach(item => item.classList.remove("activo"));
    boton.classList.add("activo");
    mostrarCatalogo(boton.dataset.categoria);
  });
});

// Vista previa de la fotografía.
fotoInput.addEventListener("change", () => {
  const archivo = fotoInput.files[0];
  if (!archivo) return;
  if (!archivo.type.startsWith("image/") || archivo.size > 2 * 1024 * 1024) {
    mostrarMensaje("Selecciona una imagen válida de máximo 2 MB.", "danger");
    fotoInput.value = "";
    fotoSeleccionada = "";
    vistaFoto.classList.add("d-none");
    return;
  }
  const lector = new FileReader();
  lector.onload = evento => {
    fotoSeleccionada = evento.target.result;
    vistaFoto.src = fotoSeleccionada;
    vistaFoto.classList.remove("d-none");
  };
  lector.readAsDataURL(archivo);
});

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `alert alert-${tipo}`;
}

function validarFormulario() {
  let valido = true;
  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const descripcion = document.getElementById("descripcion");
  const tipo = document.querySelector('input[name="tipo"]:checked');
  [nombre, correo, descripcion].forEach(campo => campo.classList.remove("is-invalid"));

  if (nombre.value.trim().length < 3) { nombre.classList.add("is-invalid"); valido = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value.trim())) { correo.classList.add("is-invalid"); valido = false; }
  if (descripcion.value.trim().length < 5) { descripcion.classList.add("is-invalid"); valido = false; }
  if (!tipo) { document.getElementById("error-tipo").classList.remove("d-none"); valido = false; }
  else { document.getElementById("error-tipo").classList.add("d-none"); }
  if (!fotoSeleccionada) { fotoInput.classList.add("is-invalid"); valido = false; }
  else { fotoInput.classList.remove("is-invalid"); }
  return valido;
}

// Validación sencilla mientras la persona escribe.
["nombre", "correo", "descripcion"].forEach(id => {
  document.getElementById(id).addEventListener("input", validarFormulario);
});
document.querySelectorAll('input[name="tipo"]').forEach(radio => radio.addEventListener("change", validarFormulario));

formulario.addEventListener("submit", evento => {
  evento.preventDefault();
  if (!validarFormulario()) {
    mostrarMensaje("Revisa los campos. Todos son necesarios para registrar la donación.", "danger");
    return;
  }
  const tipo = document.querySelector('input[name="tipo"]:checked').value;
  donaciones.unshift({
    id: Date.now(),
    nombre: document.getElementById("nombre").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    tipo,
    descripcion: document.getElementById("descripcion").value.trim(),
    foto: fotoSeleccionada,
    recogida: document.getElementById("recogida").checked,
    estado: "Activa"
  });
  guardar();
  formulario.reset();
  fotoSeleccionada = "";
  vistaFoto.src = "";
  vistaFoto.classList.add("d-none");
  mostrarMensaje("La donación se registró correctamente.", "success");
});

function guardar() {
  localStorage.setItem(clave, JSON.stringify(donaciones));
  document.getElementById("contador").textContent = donaciones.length;
}

function mostrarDonaciones() {
  lista.innerHTML = "";
  const tipoFiltro = document.getElementById("filtro-tipo").value;
  const estadoFiltro = document.getElementById("filtro-estado").value;
  const filtradas = donaciones.filter(d =>
    (tipoFiltro === "Todos" || d.tipo === tipoFiltro) &&
    (estadoFiltro === "Todos" || d.estado === estadoFiltro)
  );
  document.getElementById("sin-donaciones").classList.toggle("d-none", filtradas.length > 0);
  document.getElementById("total").textContent = donaciones.length;
  document.getElementById("activas").textContent = donaciones.filter(d => d.estado === "Activa").length;
  document.getElementById("canceladas").textContent = donaciones.filter(d => d.estado === "Cancelada").length;

  filtradas.forEach(d => {
    const elemento = document.createElement("li");
    elemento.className = "col-md-6 col-lg-4";
    elemento.innerHTML = `
      <article class="donacion">
        <img src="${d.foto}" alt="Fotografía de la donación">
        <h3>${d.nombre}</h3>
        <p><strong>Correo:</strong> ${d.correo}</p>
        <p><strong>Tipo:</strong> ${d.tipo}</p>
        <p>${d.descripcion}</p>
        <p><strong>Estado:</strong> ${d.estado}</p>
        <p><strong>Recogida:</strong> ${d.recogida ? "Sí" : "No"}</p>
        <button class="btn btn-outline-warning btn-sm" data-accion="estado" data-id="${d.id}">${d.estado === "Activa" ? "Cancelar" : "Reactivar"}</button>
        <button class="btn btn-outline-danger btn-sm" data-accion="eliminar" data-id="${d.id}">Eliminar</button>
      </article>`;
    lista.appendChild(elemento);
  });
}

lista.addEventListener("click", evento => {
  const boton = evento.target.closest("button");
  if (!boton) return;
  const id = Number(boton.dataset.id);
  const donacion = donaciones.find(d => d.id === id);
  if (boton.dataset.accion === "estado" && donacion) {
    donacion.estado = donacion.estado === "Activa" ? "Cancelada" : "Activa";
  } else if (boton.dataset.accion === "eliminar") {
    donaciones = donaciones.filter(d => d.id !== id);
  }
  guardar();
  mostrarDonaciones();
});

document.getElementById("filtro-tipo").addEventListener("change", mostrarDonaciones);
document.getElementById("filtro-estado").addEventListener("change", mostrarDonaciones);

formulario.addEventListener("reset", () => {
  fotoSeleccionada = "";
  vistaFoto.src = "";
  vistaFoto.classList.add("d-none");
  mensaje.className = "alert d-none";
  document.getElementById("error-tipo").classList.add("d-none");
});

mostrarCatalogo();
guardar();
mostrarDonaciones();
