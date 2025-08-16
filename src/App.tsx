
import React, { useState } from 'react';


function App() {
  const [form, setForm] = useState({
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
    <div className="App">
      <header className="App-header">
       <title>Formulario de Registro</title>
    
    
        <h2>Detalles personales</h2>
       
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', textAlign: 'left' }}>
          <div>
            <label>Nombre: </label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div>
            <label>Apellido: </label>
            <input type="text" name="apellido" value={form.apellido} onChange={handleChange} required />
          </div>
          <div>
            <label>Género: </label>
            <select name="genero" value={form.genero} onChange={handleChange} required>
              <option value="">Seleccione</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label>Fecha de nacimiento: </label>
            <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
          </div>
          <div>
            <label>Email: </label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label>Dirección: </label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required />
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>Enviar</button>
        </form>
      </header>
    </div>
  );
}
export default App;