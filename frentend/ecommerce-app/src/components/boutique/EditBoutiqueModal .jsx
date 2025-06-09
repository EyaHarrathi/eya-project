import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form } from 'react-bootstrap';

const EditBoutiqueModal = ({ show, onClose, boutique, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: '',
    nom: '',
    description: '',
    type: '',
    numeros: ['']
  });
  
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState('');

  useEffect(() => {
    if (boutique) {
      setFormData({
        id: boutique.id || '',
        nom: boutique.nom || '',
        description: boutique.description || '',
        type: boutique.type || '',
        numeros: boutique.numeros || ['']
      });
      setPreviewLogo(boutique.logoUrl || '');
      setLogoFile(null);
      setDocumentFile(null);
    }
  }, [boutique]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNumeroChange = (index, value) => {
    const newNumeros = [...formData.numeros];
    newNumeros[index] = value;
    setFormData(prev => ({ ...prev, numeros: newNumeros }));
    setErrors(prev => ({ ...prev, [`numero-${index}`]: '' }));
  };

  const addNumeroField = () => {
    setFormData(prev => ({
      ...prev,
      numeros: [...prev.numeros, '']
    }));
  };

  const removeNumeroField = (index) => {
    const newNumeros = formData.numeros.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, numeros: newNumeros }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file?.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^\+216\d{8}$/;

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.type.trim()) newErrors.type = 'Le type est requis';

    formData.numeros.forEach((num, index) => {
      if (!num.match(phoneRegex)) {
        newErrors[`numero-${index}`] = 'Format invalide (+216XXXXXXXX)';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append('nom', formData.nom);
    data.append('description', formData.description);
    data.append('type', formData.type);
    formData.numeros.forEach(num => data.append('numeros', num));

    if (logoFile) data.append('logo', logoFile);
    if (documentFile) data.append('documentJuridique', documentFile);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/boutiques/${formData.id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      
      // Fermer le modal et rafraîchir les données
      onSubmit(); // Rafraîchit les données parentes
      onClose();  // Ferme le modal
      
      // Réinitialiser le formulaire
      setFormData({
        id: '',
        nom: '',
        description: '',
        type: '',
        numeros: ['']
      });
      setPreviewLogo('');
      setLogoFile(null);
      setDocumentFile(null);

    } catch (error) {
      console.error('Erreur mise à jour:', error.response?.data || error.message);
      alert('Échec de la mise à jour: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Modifier la Boutique</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body row">
              {/* Nom */}
              <div className="col-md-6 mb-3">
                <label>Nom</label>
                <input
                  type="text"
                  name="nom"
                  className={`form-control ${errors.nom ? 'is-invalid' : ''}`}
                  value={formData.nom}
                  onChange={handleChange}
                />
                {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
              </div>

              {/* Type */}
              <div className="col-md-6 mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={errors.type ? 'is-invalid' : ''}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="retail">Vente au détail</option>
                  <option value="wholesale">Vente en gros</option>
                  <option value="service">Service</option>
                </Form.Select>
                {errors.type && <div className="invalid-feedback">{errors.type}</div>}
              </div>

              {/* Description */}
              <div className="col-12 mb-3">
                <label>Description</label>
                <textarea
                  name="description"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>

              {/* Numéros de téléphone */}
              <div className="col-12 mb-3">
                <label>Numéros de contact</label>
                {formData.numeros.map((numero, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="text"
                      value={numero}
                      onChange={(e) => handleNumeroChange(index, e.target.value)}
                      className={`form-control ${errors[`numero-${index}`] ? 'is-invalid' : ''}`}
                      placeholder="+216XXXXXXXX"
                    />
                    {formData.numeros.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeNumeroField(index)}
                      >
                        ×
                      </button>
                    )}
                    {errors[`numero-${index}`] && (
                      <div className="invalid-feedback">{errors[`numero-${index}`]}</div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={addNumeroField}
                >
                  Ajouter un numéro
                </button>
              </div>

              {/* Logo */}
              <div className="col-md-6 mb-3">
                <label>Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleLogoChange}
                />
                {previewLogo && (
                  <img
                    src={previewLogo}
                    alt="Preview logo"
                    className="mt-2 img-thumbnail"
                    style={{ maxWidth: '200px' }}
                  />
                )}
              </div>

              {/* Document juridique */}
              <div className="col-md-6 mb-3">
                <label>Document juridique</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="form-control"
                  onChange={handleDocumentChange}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBoutiqueModal;