import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';

function App() {
  const [form, setForm] = useState({
    saludo: '',
    nombre: '',
    apellido: '',
    genero: '',
    fechaNacimiento: '',
    email: '',
    direccion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Formulario enviado:\n' + JSON.stringify(form, null, 2));
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="bg-white p-4 rounded shadow" style={{ minWidth: '350px' }}>
        <h2 className="text-center mb-4">Detalles personales</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Saludo:</label>
            <select className="form-select" name="saludo" value={form.saludo} onChange={handleChange} required>
              <option value="">--NINGUNO--</option>
              <option value="Sr.">Sr.</option>
              <option value="Sra.">Sra.</option>
              <option value="Srta.">Srta.</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Nombre:</label>
            <input type="text" className="form-control" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Apellido:</label>
            <input type="text" className="form-control" name="apellido" value={form.apellido} onChange={handleChange} required />
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
          <button type="submit" className="btn btn-primary">Enviar</button>
        </form>
      </div>
    </div>
  );
}
export default App;