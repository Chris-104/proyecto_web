// ==========================================================================
// usuario.js
// Este archivo guarda los datos de los usuarios usando ARRAYS de JavaScript.
// El array se guarda en localStorage para que los datos no se pierdan al
// cambiar de página. Cada acción está comentada paso a paso.
// ==========================================================================

// --------------------------------------------------------------------------
// 1. CLAVES PARA LOCALSTORAGE (dónde se guardan los datos)
// --------------------------------------------------------------------------
const CLAVE_USUARIOS = 'focusClassUsuarios';  // Guarda el ARRAY de usuarios
const CLAVE_SESION   = 'focusClassSesion';    // Guarda al usuario en sesión

// --------------------------------------------------------------------------
// 2. ARRAY DE USUARIOS
//    - Se cargan los datos guardados en localStorage (si existen).
//    - Si no existen, se crea el array con un usuario inicial.
// --------------------------------------------------------------------------
const usuarios = cargarUsuarios();

// --------------------------------------------------------------------------
// 3. VARIABLE DE SESIÓN: guarda al usuario que inició sesión actualmente.
//    - Se carga desde localStorage para conservar la sesión entre páginas.
// --------------------------------------------------------------------------
let usuarioActual = cargarSesion();

// ==========================================================================
// FUNCIÓN PARA CARGAR EL ARRAY DE USUARIOS DESDE localStorage
// ==========================================================================
function cargarUsuarios() {
    // Se lee el texto guardado en localStorage.
    const datosGuardados = localStorage.getItem(CLAVE_USUARIOS);

    if (datosGuardados) {
        // JSON.parse convierte el texto guardado de vuelta a un array.
        return JSON.parse(datosGuardados);
    }

    // Si no hay nada guardado, se crea el array inicial con datos de prueba.
    return [
        { nombreUsuario: 'User01927456', contrasena: '123456' }
    ];
}

// ==========================================================================
// FUNCIÓN PARA GUARDAR EL ARRAY EN localStorage
//    - JSON.stringify convierte el array a texto para poder guardarlo.
// ==========================================================================
function guardarUsuarios() {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

// ==========================================================================
// FUNCIÓN PARA CARGAR LA SESIÓN DESDE localStorage
// ==========================================================================
function cargarSesion() {
    const sesionGuardada = localStorage.getItem(CLAVE_SESION);

    if (sesionGuardada) {
        return JSON.parse(sesionGuardada);
    }

    return null;
}

// ==========================================================================
// FUNCIÓN PARA GUARDAR LA SESIÓN EN localStorage
// ==========================================================================
function guardarSesion() {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuarioActual));
}

// ==========================================================================
// 4. FUNCIÓN PARA GUARDAR UN USUARIO EN EL ARRAY
//    - Recibe el nombre y la contraseña.
//    - Crea un objeto y lo agrega al array con .push().
//    - Guarda el array actualizado en localStorage.
// ==========================================================================
function guardarUsuario(nombre, contrasena) {
    // 4.1 Se crea el objeto con los datos del formulario.
    const nuevoUsuario = { nombreUsuario: nombre, contrasena: contrasena };

    // 4.2 .push() agrega el nuevo usuario al final del array.
    usuarios.push(nuevoUsuario);

    // 4.3 Se guarda el array actualizado en localStorage.
    guardarUsuarios();

    // 4.4 El nuevo usuario queda como el que inició sesión.
    usuarioActual = nuevoUsuario;
    guardarSesion();

    return true;
}

// ==========================================================================
// 5. FUNCIÓN PARA INICIAR SESIÓN
//    - Busca el usuario en el array con .find().
//    - Si existe, inicia sesión con los datos del array.
//    - Si no existe, lo guarda en el array (usuario nuevo) y entra.
// ==========================================================================
function iniciarSesion(nombre, contrasena) {
    // 5.1 .find() recorre el array buscando el nombre exacto.
    const encontrado = usuarios.find(function (u) {
        return u.nombreUsuario === nombre;
    });

    if (encontrado) {
        // 5.2 El usuario ya existe: se usa el que está en el array.
        usuarioActual = encontrado;
        guardarSesion();
        return true;
    }

    // 5.3 No existe: se guarda el usuario nuevo y entra automáticamente.
    guardarUsuario(nombre, contrasena);
    return true;
}

// ==========================================================================
// 6. FUNCIÓN PARA CERRAR SESIÓN
//    - Limpia la variable de sesión y borra la sesión de localStorage.
// ==========================================================================
function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem(CLAVE_SESION);
}

// ==========================================================================
// 7. FUNCIÓN PARA MOSTRAR EL PERFIL EN LA PÁGINA DEL PERFIL
//    - Toma los datos del usuario en sesión (guardados en el array) y los
//      coloca en los campos del HTML.
// ==========================================================================
function mostrarPerfil() {
    if (!usuarioActual) {
        return;
    }

    // 7.1 Elementos del HTML donde se mostrarán los datos.
    const perfilNombre = document.getElementById('perfilNombre');
    const perfilUsuarioInput = document.getElementById('perfilUsuarioInput');
    const perfilContrasenaInput = document.getElementById('perfilContrasenaInput');

    // 7.2 Se coloca el nombre guardado en la tarjeta del perfil.
    if (perfilNombre) {
        perfilNombre.textContent = usuarioActual.nombreUsuario;
    }

    // 7.3 Se coloca el usuario y la contraseña guardados en los campos.
    if (perfilUsuarioInput) {
        perfilUsuarioInput.value = usuarioActual.nombreUsuario;
    }
    if (perfilContrasenaInput) {
        perfilContrasenaInput.value = usuarioActual.contrasena;
    }
}

// ==========================================================================
// 8. FUNCIÓN PARA MOSTRAR EL NOMBRE DEL USUARIO EN LOS ENCABEZADOS
//    - Busca todos los textos "Usuario" de los encabezados (clases
//      .user-name y .header__user-name) y los reemplaza por el nombre
//      del usuario que inició sesión.
// ==========================================================================
function actualizarEncabezados() {
    // 8.1 Se seleccionan todos los elementos del encabezado.
    const nombresEncabezado = document.querySelectorAll('.user-name, .header__user-name');

    // 8.2 Nombre a mostrar: el guardado en sesión, o "Usuario" si no hay.
    const nombreMostrar = usuarioActual ? usuarioActual.nombreUsuario : 'Usuario';

    // 8.3 Se recorre cada elemento y se cambia su texto.
    nombresEncabezado.forEach(function (elemento) {
        elemento.textContent = nombreMostrar;
    });
}

// ==========================================================================
// 9. MANEJADOR DEL FORMULARIO DE LOGIN (index.html)
//    - Lee los datos escritos, los guarda en el array y redirige al menú.
//    - return false evita que el formulario recargue la página.
// ==========================================================================
function manejarLogin(event) {
    // 9.1 Se evita el envío normal del formulario.
    event.preventDefault();

    // 9.2 Se leen los datos que escribió el usuario.
    const nombre = document.getElementById('loginUsuario').value.trim();
    const contrasena = document.getElementById('loginContrasena').value.trim();

    // 9.3 Mensaje donde se muestran los errores.
    const mensaje = document.getElementById('loginMensaje');

    // 9.4 Validación: ambos campos deben estar llenos.
    if (!nombre || !contrasena) {
        mensaje.textContent = '✖ Completa tu usuario y contraseña.';
        mensaje.className = 'login-message error';
        return false;
    }

    // 9.5 Se guarda el usuario en el array y se inicia sesión.
    iniciarSesion(nombre, contrasena);

    // 9.6 Se redirige a la vista del menú (encabezado mostrará el nombre).
    window.location.href = '/html/menu.html';
    return false;
}

// ==========================================================================
// 10. AL CARGAR LA PÁGINA
//     - Se actualiza el encabezado con el nombre del usuario.
//     - Se muestra el perfil si hay un usuario en sesión.
//     - Se conecta el botón "Cerrar sesión" si existe.
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
    // 10.1 Se muestra el nombre guardado en los encabezados.
    actualizarEncabezados();

    // 10.2 Se muestra el perfil del usuario en sesión.
    mostrarPerfil();

    // 10.3 Se conecta el botón "Cerrar sesión".
    const botonCerrar = document.getElementById('btnCerrarSesion');
    if (botonCerrar) {
        botonCerrar.addEventListener('click', function (event) {
            event.preventDefault();
            cerrarSesion();
            // Tras cerrar sesión se regresa a la página de inicio.
            window.location.href = '../index.html';
        });
    }

    // 10.4 Botones "ojo" para mostrar/ocultar la contraseña.
    //     - Funcionan en el login (index.html) y en el perfil (perfil.html).
    //     - Al hacer clic cambian el tipo del input entre "password" y "text".
    const botonesOjo = document.querySelectorAll('.password-toggle');

    botonesOjo.forEach(function (boton) {
        // 10.4.1 Se busca el input de contraseña dentro del mismo contenedor.
        const contenedor = boton.closest('.input-group, .password-wrapper');
        if (!contenedor) return;

        const campoContrasena = contenedor.querySelector('input[type="password"]');
        if (!campoContrasena) return;

        boton.addEventListener('click', function () {
            // Si el campo es tipo password, se cambia a text para verla.
            const esVisible = campoContrasena.type === 'text';

            campoContrasena.type = esVisible ? 'password' : 'text';

            // Se cambia el icono: ojo abierto (visible) u ojo tachado (oculto).
            boton.innerHTML = esVisible
                ? '<i class="fa-regular fa-eye"></i>'
                : '<i class="fa-regular fa-eye-slash"></i>';

            boton.setAttribute('aria-label', esVisible ? 'Mostrar contraseña' : 'Ocultar contraseña');
        });
    });
});
