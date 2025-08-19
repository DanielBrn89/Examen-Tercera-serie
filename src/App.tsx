import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';

// Definición de tipos TypeScript
interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormDefinition {
  id: string;
  title: string;
  fields: FormField[];
}

interface FormData {
  [key: string]: any;
}

interface FormSubmission {
  id: string;
  timestamp: string;
  data: FormData;
}

const FormBuilder: React.FC = () => {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [activeForm, setActiveForm] = useState<FormDefinition | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formData, setFormData] = useState<FormData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldType, setFieldType] = useState('text');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [activeTab, setActiveTab] = useState<'build' | 'fill' | 'data'>('build');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  // Cargar formularios y datos guardados al iniciar
  useEffect(() => {
    const savedForms = localStorage.getItem('customForms');
    if (savedForms) {
      setForms(JSON.parse(savedForms));
    }

    const savedSubmissions = localStorage.getItem('formSubmissions');
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
  }, []);

  // Guardar formularios cuando cambien
  useEffect(() => {
    localStorage.setItem('customForms', JSON.stringify(forms));
  }, [forms]);

  // Guardar respuestas cuando cambien
  useEffect(() => {
    localStorage.setItem('formSubmissions', JSON.stringify(submissions));
  }, [submissions]);

  // Crear un nuevo formulario
  const createNewForm = () => {
    const newForm: FormDefinition = {
      id: Date.now().toString(),
      title: formTitle || 'Nuevo Formulario',
      fields: []
    };
    setForms([...forms, newForm]);
    setActiveForm(newForm);
    setFormTitle('');
    setActiveTab('build');
  };

  // Seleccionar un formulario existente
  const selectForm = (form: FormDefinition) => {
    setActiveForm(form);
    setIsEditing(false);
    setEditingField(null);
    setFormData({});
    setActiveTab('build');
  };

  // Iniciar la edición de un campo
  const startEditingField = (field?: FormField) => {
    if (field) {
      setEditingField(field);
      setFieldType(field.type);
      setFieldLabel(field.label);
      setFieldRequired(field.required);
      setFieldOptions(field.options?.join(', ') || '');
      setFieldPlaceholder(field.placeholder || '');
    } else {
      setEditingField(null);
      setFieldType('text');
      setFieldLabel('');
      setFieldRequired(false);
      setFieldOptions('');
      setFieldPlaceholder('');
    }
    setIsEditing(true);
  };

  // Guardar un campo (nuevo o editado)
  const saveField = () => {
    if (!activeForm) return;

    const optionsArray = fieldOptions.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
    
    const fieldData: FormField = {
      id: editingField?.id || Date.now().toString(),
      type: fieldType,
      label: fieldLabel,
      required: fieldRequired,
      placeholder: fieldPlaceholder || undefined,
      options: optionsArray.length > 0 ? optionsArray : undefined
    };

    const updatedForm = { ...activeForm };
    
    if (editingField) {
      // Editar campo existente
      updatedForm.fields = updatedForm.fields.map(f => 
        f.id === editingField.id ? fieldData : f
      );
    } else {
      // Añadir nuevo campo
      updatedForm.fields = [...updatedForm.fields, fieldData];
    }

    setActiveForm(updatedForm);
    setForms(forms.map(f => f.id === updatedForm.id ? updatedForm : f));
    setIsEditing(false);
    setEditingField(null);
  };

  // Eliminar un campo
  const deleteField = (fieldId: string) => {
    if (!activeForm) return;
    
    const updatedForm = { 
      ...activeForm, 
      fields: activeForm.fields.filter(f => f.id !== fieldId) 
    };
    
    setActiveForm(updatedForm);
    setForms(forms.map(f => f.id === updatedForm.id ? updatedForm : f));
  };

  // Eliminar un formulario
  const deleteForm = (formId: string) => {
    const updatedForms = forms.filter(f => f.id !== formId);
    setForms(updatedForms);
    
    if (activeForm?.id === formId) {
      setActiveForm(updatedForms.length > 0 ? updatedForms[0] : null);
    }

    // También eliminar las respuestas asociadas
    const updatedSubmissions = submissions.filter(s => s.id !== formId);
    setSubmissions(updatedSubmissions);
  };

  // Manejar cambios en los datos del formulario
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData({
      ...formData,
      [fieldId]: value
    });
  };

  // Enviar formulario (guardar respuestas)
  const submitForm = () => {
    if (!activeForm) return;

    const newSubmission: FormSubmission = {
      id: activeForm.id,
      timestamp: new Date().toISOString(),
      data: { ...formData }
    };

    // Filtrar submissions existentes para este formulario y añadir el nuevo
    const updatedSubmissions = [
      ...submissions.filter(s => s.id !== activeForm.id),
      newSubmission
    ];

    setSubmissions(updatedSubmissions);
    setFormData({});
    
    alert('Datos guardados correctamente');
  };

  // Obtener datos guardados para el formulario activo
  const getFormSubmissions = () => {
    if (!activeForm) return [];
    return submissions.filter(s => s.id === activeForm.id);
  };

  // Exportar datos a Excel
  const exportToExcel = () => {
    if (!activeForm) return;

    const formSubmissions = getFormSubmissions();
    if (formSubmissions.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel
    const data = [
      // Encabezados
      ['Timestamp', ...activeForm.fields.map(field => field.label)]
    ];

    // Datos
    formSubmissions.forEach(submission => {
      const row = [new Date(submission.timestamp).toLocaleString()];
      activeForm.fields.forEach(field => {
        row.push(submission.data[field.id] || '');
      });
      data.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    XLSX.writeFile(workbook, `${activeForm.title}_datos.xlsx`);
  };

  // Renderizar campo según su tipo (para vista de llenado)
  const renderField = (field: FormField) => {
    const commonProps = {
      className: 'form-control',
      placeholder: field.placeholder,
      required: field.required,
      value: formData[field.id] || '',
      onChange: (e: React.ChangeEvent<any>) => handleInputChange(field.id, e.target.value)
    };

    switch (field.type) {
      case 'text':
        return <input type="text" {...commonProps} />;
      case 'number':
        return <input type="number" {...commonProps} />;
      case 'email':
        return <input type="email" {...commonProps} />;
      case 'date':
        return <input type="date" {...commonProps} />;
      case 'textarea':
        return <textarea {...commonProps} rows={3} />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Seleccione una opción</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input 
            type="checkbox" 
            checked={!!formData[field.id]} 
            onChange={(e) => handleInputChange(field.id, e.target.checked)} 
          />
        );
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="text-center mb-4">Creador de Formularios Personalizados</h1>
      
      <div className="row">
        {/* Panel de formularios existentes */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Mis Formularios</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Nombre del nuevo formulario"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
                <button 
                  className="btn btn-success w-100"
                  onClick={createNewForm}
                  disabled={!formTitle.trim()}
                >
                  Crear Nuevo Formulario
                </button>
              </div>
              
              <div className="list-group mt-3">
                {forms.map(form => (
                  <div key={form.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <span 
                        className="flex-grow-1 cursor-pointer"
                        onClick={() => selectForm(form)}
                      >
                        {form.title}
                      </span>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteForm(form.id)}
                      >
                        &times;
                      </button>
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        {form.fields.length} campo{form.fields.length !== 1 ? 's' : ''}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel principal */}
        <div className="col-md-9">
          {activeForm ? (
            <div className="card">
              <div className="card-header bg-secondary text-white">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'build' ? 'active' : ''}`}
                      onClick={() => setActiveTab('build')}
                    >
                      Construir
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'fill' ? 'active' : ''}`}
                      onClick={() => setActiveTab('fill')}
                      disabled={activeForm.fields.length === 0}
                    >
                      Llenar Formulario
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'data' ? 'active' : ''}`}
                      onClick={() => setActiveTab('data')}
                    >
                      Ver Datos
                    </button>
                  </li>
                </ul>
              </div>
              
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">{activeForm.title}</h5>
                  <div>
                    {activeTab === 'data' && (
                      <button 
                        className="btn btn-sm btn-success me-2"
                        onClick={exportToExcel}
                        disabled={getFormSubmissions().length === 0}
                      >
                        Exportar a Excel
                      </button>
                    )}
                    {activeTab === 'build' && (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => startEditingField()}
                      >
                        + Añadir Campo
                      </button>
                    )}
                  </div>
                </div>

                {/* Pestaña de construcción */}
                {activeTab === 'build' && (
                  <>
                    {isEditing ? (
                      <div className="border p-3 rounded mb-4">
                        <h6>{editingField ? 'Editar Campo' : 'Nuevo Campo'}</h6>
                        
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label">Tipo de Campo</label>
                            <select
                              className="form-select"
                              value={fieldType}
                              onChange={(e) => setFieldType(e.target.value)}
                            >
                              <option value="text">Texto</option>
                              <option value="number">Número</option>
                              <option value="email">Email</option>
                              <option value="date">Fecha</option>
                              <option value="textarea">Área de Texto</option>
                              <option value="select">Selección</option>
                              <option value="checkbox">Casilla de Verificación</option>
                            </select>
                          </div>
                          
                          <div className="col-md-6">
                            <label className="form-label">Etiqueta</label>
                            <input
                              type="text"
                              className="form-control"
                              value={fieldLabel}
                              onChange={(e) => setFieldLabel(e.target.value)}
                              placeholder="Ej: Nombre Completo"
                            />
                          </div>
                        </div>
                        
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label">Placeholder</label>
                            <input
                              type="text"
                              className="form-control"
                              value={fieldPlaceholder}
                              onChange={(e) => setFieldPlaceholder(e.target.value)}
                              placeholder="Texto de ejemplo"
                            />
                          </div>
                          
                          <div className="col-md-6">
                            <div className="form-check mt-4">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={fieldRequired}
                                onChange={(e) => setFieldRequired(e.target.checked)}
                              />
                              <label className="form-check-label">Campo obligatorio</label>
                            </div>
                          </div>
                        </div>
                        
                        {fieldType === 'select' && (
                          <div className="mb-3">
                            <label className="form-label">Opciones (separadas por comas)</label>
                            <textarea
                              className="form-control"
                              rows={3}
                              value={fieldOptions}
                              onChange={(e) => setFieldOptions(e.target.value)}
                              placeholder="Opción 1, Opción 2, Opción 3"
                            />
                          </div>
                        )}
                        
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-primary"
                            onClick={saveField}
                            disabled={!fieldLabel.trim()}
                          >
                            {editingField ? 'Actualizar' : 'Añadir'} Campo
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : null}
                    
                    {/* Vista de campos del formulario */}
                    {activeForm.fields.length > 0 ? (
                      <div className="border p-3 rounded">
                        <h6>Campos del Formulario</h6>
                        
                        {activeForm.fields.map(field => (
                          <div key={field.id} className="mb-3 border-bottom pb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <label className="form-label fw-bold">
                                {field.label}
                                {field.required && <span className="text-danger">*</span>}
                                <small className="text-muted d-block">{field.type}</small>
                              </label>
                              <div>
                                <button 
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => startEditingField(field)}
                                >
                                  Editar
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => deleteField(field.id)}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <p>No hay campos en este formulario.</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => startEditingField()}
                        >
                          Añadir tu primer campo
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Pestaña de llenado de formulario */}
                {activeTab === 'fill' && (
                  <div className="border p-3 rounded">
                    <h6>Llenar Formulario: {activeForm.title}</h6>
                    
                    {activeForm.fields.map(field => (
                      <div key={field.id} className="mb-3">
                        <label className="form-label">
                          {field.label}
                          {field.required && <span className="text-danger">*</span>}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                    
                    <div className="mt-3">
                      <button 
                        className="btn btn-success"
                        onClick={submitForm}
                      >
                        Guardar Datos
                      </button>
                    </div>
                  </div>
                )}

                {/* Pestaña de visualización de datos */}
                {activeTab === 'data' && (
                  <div>
                    <h6>Datos Guardados para: {activeForm.title}</h6>
                    
                    {getFormSubmissions().length > 0 ? (
                      <div className="table-responsive mt-3">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Fecha y Hora</th>
                              {activeForm.fields.map(field => (
                                <th key={field.id}>{field.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {getFormSubmissions().map((submission, index) => (
                              <tr key={index}>
                                <td>{new Date(submission.timestamp).toLocaleString()}</td>
                                {activeForm.fields.map(field => (
                                  <td key={field.id}>
                                    {submission.data[field.id]?.toString() || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <p>No hay datos guardados para este formulario.</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => setActiveTab('fill')}
                        >
                          Ir a Llenar Formulario
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <h4>No hay formularios activos</h4>
              <p>Crea un nuevo formulario o selecciona uno existente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;