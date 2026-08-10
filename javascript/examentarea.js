document.addEventListener('DOMContentLoaded', () => {
  // Referencias a las ventanas modales
  const modalTareas = document.getElementById('modalTareas');
  const modalExamenes = document.getElementById('modalExamenes');

  // Elementos para Tareas
  const btnVerTodasTareas = document.getElementById('btnVerTodasTareas');
  const linkVerTodasTareas = document.getElementById('linkVerTodasTareas');
  const closeTareasBtn = document.getElementById('closeTareasBtn');

  // Elementos para Exámenes
  const btnVerTodosExamenes = document.getElementById('btnVerTodosExamenes');
  const linkVerTodosExamenes = document.getElementById('linkVerTodosExamenes');
  const closeExamenesBtn = document.getElementById('closeExamenesBtn');

  // Funciones para abrir y cerrar
  function openModal(modal) {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Eventos para Tareas
  if (btnVerTodasTareas) {
    btnVerTodasTareas.addEventListener('click', () => openModal(modalTareas));
  }
  if (linkVerTodasTareas) {
    linkVerTodasTareas.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalTareas);
    });
  }
  if (closeTareasBtn) {
    closeTareasBtn.addEventListener('click', () => closeModal(modalTareas));
  }

  // Eventos para Exámenes
  if (btnVerTodosExamenes) {
    btnVerTodosExamenes.addEventListener('click', () => openModal(modalExamenes));
  }
  if (linkVerTodosExamenes) {
    linkVerTodosExamenes.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalExamenes);
    });
  }
  if (closeExamenesBtn) {
    closeExamenesBtn.addEventListener('click', () => closeModal(modalExamenes));
  }

  // Cerrar al hacer clic en la zona oscura fuera de la tarjeta
  window.addEventListener('click', (e) => {
    if (e.target === modalTareas) closeModal(modalTareas);
    if (e.target === modalExamenes) closeModal(modalExamenes);
  });

  // Funcionalidad para borrar tarea/examen con el botón de papelera
  document.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      const taskItem = deleteBtn.closest('.task-item');
      if (taskItem) {
        taskItem.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        taskItem.style.opacity = '0';
        taskItem.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          taskItem.remove();
        }, 200);
      }
    }
  });
});