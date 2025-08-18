import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Persona {
  saludo: string;
  nombre: string;
  apellido: string;
  genero: string;
  fechaNacimiento: string;
  email: string;
  direccion: string;
}

function App() {
  const [form, setForm] = useState<Persona>({
    saludo: 'Sra.',
    nombre: '',
    apellido: '',
    genero: '',
    fechaNacimiento: '',
    email: '',
    direccion: ''
  });

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Actualizar ancho de ventana al cambiar tamaño
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar datos guardados al inicio
  useEffect(() => {
    const datosGuardados = localStorage.getItem('personas');
    if (datosGuardados) {
      setPersonas(JSON.parse(datosGuardados));
    }
  }, []);

  // Guardar datos cuando cambia la lista de personas
  useEffect(() => {
    localStorage.setItem('personas', JSON.stringify(personas));
  }, [personas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editIndex !== null) {
      // Editar persona existente
      const nuevasPersonas = [...personas];
      nuevasPersonas[editIndex] = form;
      setPersonas(nuevasPersonas);
      setEditIndex(null);
    } else {
      // Agregar nueva persona
      setPersonas([...personas, form]);
    }
    
    // Limpiar formulario
    setForm({
      saludo: 'Sra.',
      nombre: '',
      apellido: '',
      genero: '',
      fechaNacimiento: '',
      email: '',
      direccion: ''
    });
  };

  const eliminarPersona = (index: number) => {
    const nuevasPersonas = [...personas];
    nuevasPersonas.splice(index, 1);
    setPersonas(nuevasPersonas);
  };

  const editarPersona = (index: number) => {
    setForm(personas[index]);
    setEditIndex(index);
  };

  const exportarAExcel = () => {
    if (personas.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Formatear datos para Excel
    const datosExcel = personas.map(persona => ({
      'Saludo': persona.saludo,
      'Nombre': persona.nombre,
      'Apellido': persona.apellido,
      'Género': persona.genero,
      'Fecha de nacimiento': persona.fechaNacimiento,
      'Email': persona.email,
      'Dirección': persona.direccion
    }));

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Personas");
    
    // Descargar archivo
    XLSX.writeFile(wb, "detalles_personales.xlsx");
  };

  // Función para formatear fecha a dd/mm/aaaa
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Determinar el diseño según el ancho de la ventana
  const isMobile = windowWidth < 601;
  const isTablet = windowWidth >= 601 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Detalles Personales</h1>
      
      {/* Diseño para escritorio (2 columnas) */}
      {isDesktop && (
        <div className="row">
          {/* Formulario */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h2 className="card-title mb-0">Formulario</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Saludo:</label>
                    <select className="form-select" name="saludo" value={form.saludo} onChange={handleChange} required>
                      <option value="Sr.">Sr.</option>
                      <option value="Sra.">Sra.</option>
                      <option value="Srta.">Srta.</option>
                    </select>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre:</label>
                      <input type="text" className="form-control" name="nombre" value={form.nombre} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellido:</label>
                      <input type="text" className="form-control" name="apellido" value={form.apellido} onChange={handleChange} required />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Género:</label>
                    <select className="form-select" name="genero" value={form.genero} onChange={handleChange} required>
                      <option value="">Seleccione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Fecha de nacimiento:</label>
                    <input type="date" className="form-control" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Dirección:</label>
                    <input type="text" className="form-control" name="direccion" value={form.direccion} onChange={handleChange} required />
                  </div>
                  
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">
                      {editIndex !== null ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Lista de Personas */}
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h2 className="card-title mb-0">Personas Registradas</h2>
                <button 
                  className="btn btn-sm btn-light"
                  onClick={exportarAExcel}
                  disabled={personas.length === 0}
                >
                  <i className="bi bi-file-earmark-excel me-1"></i> Exportar Excel
                </button>
              </div>
              <div className="card-body">
                {personas.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-people fs-1 text-muted"></i>
                    <p className="mt-2">No hay personas registradas</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personas.map((persona, index) => (
                          <tr key={index}>
                            <td>
                              <div className="fw-bold">{persona.nombre} {persona.apellido}</div>
                              <div className="text-muted small">{persona.saludo}</div>
                            </td>
                            <td>{persona.email}</td>
                            <td>
                              <div className="d-flex">
                                <button 
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => editarPersona(index)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => eliminarPersona(index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Diseño para móvil y tablet (1 columna) */}
      {(isMobile || isTablet) && (
        <div>
          {/* Formulario */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white">
              <h2 className="card-title mb-0">Formulario</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label">Saludo:</label>
                    <select className="form-select" name="saludo" value={form.saludo} onChange={handleChange} required>
                      <option value="Sr.">Sr.</option>
                      <option value="Sra.">Sra.</option>
                      <option value="Srta.">Srta.</option>
                    </select>
                  </div>
                  
                  <div className="col-6 mb-3">
                    <label className="form-label">Género:</label>
                    <select className="form-select" name="genero" value={form.genero} onChange={handleChange} required>
                      <option value="">Seleccione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre:</label>
                    <input type="text" className="form-control" name="nombre" value={form.nombre} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellido:</label>
                    <input type="text" className="form-control" name="apellido" value={form.apellido} onChange={handleChange} required />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Fecha de nacimiento:</label>
                  <input type="date" className="form-control" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Email:</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Dirección:</label>
                  <input type="text" className="form-control" name="direccion" value={form.direccion} onChange={handleChange} required />
                </div>
                
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    {editIndex !== null ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Lista de Personas */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h2 className="card-title mb-0">Personas Registradas</h2>
              <button 
                className="btn btn-sm btn-light"
                onClick={exportarAExcel}
                disabled={personas.length === 0}
              >
                <i className="bi bi-file-earmark-excel me-1"></i> Exportar
              </button>
            </div>
            <div className="card-body">
              {personas.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-people fs-1 text-muted"></i>
                  <p className="mt-2">No hay personas registradas</p>
                </div>
              ) : (
                <div>
                  {personas.map((persona, index) => (
                    <div key={index} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1">{persona.saludo} {persona.nombre} {persona.apellido}</h5>
                          <div className="text-muted small mb-1">
                            <i className="bi bi-gender-ambiguous me-1"></i> {persona.genero}
                          </div>
                          <div className="text-muted small mb-1">
                            <i className="bi bi-calendar me-1"></i> {formatDate(persona.fechaNacimiento)}
                          </div>
                          <div className="text-muted small mb-1">
                            <i className="bi bi-envelope me-1"></i> {persona.email}
                          </div>
                          <div className="text-muted small">
                            <i className="bi bi-geo-alt me-1"></i> {persona.direccion}
                          </div>
                        </div>
                        <div className="d-flex">
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => editarPersona(index)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminarPersona(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;