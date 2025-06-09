import React, { useState,} from "react";
import { useNavigate } from "react-router-dom";
import { Store, ImagePlus, FileText, Plus, Trash2 } from "lucide-react";
import { Button, Card, Form, Alert } from "react-bootstrap";
const userId = localStorage.getItem("userId");

const CreateShop = ({ onClose }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "retail",
    logo: null,
    legalDocument: null,
    phoneNumbers: [{ number: "" }]
  });

  const handleFileChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.files[0] });
  };

  const handlePhoneChange = (index, value) => {
    const newNumbers = formData.phoneNumbers.map((phone, i) => 
      i === index ? { number: value.replace(/\D/g, '').slice(0, 8) } : phone
    );
    setFormData({ ...formData, phoneNumbers: newNumbers });
  };

  const addPhoneNumber = () => {
    setFormData({
      ...formData,
      phoneNumbers: [...formData.phoneNumbers, { number: "" }]
    });
  };

  const removePhoneNumber = (index) => {
    const newNumbers = formData.phoneNumbers.filter((_, i) => i !== index);
    setFormData({ ...formData, phoneNumbers: newNumbers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation des champs obligatoires
      if (!formData.logo || !formData.legalDocument) {
        throw new Error("Veuillez sélectionner un logo et un document juridique");
      }

      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('idUtilisateur', userId);

      formData.phoneNumbers.forEach(phone => {
        formDataToSend.append('numeros', `+216${phone.number}`);
      });
      
      formDataToSend.append('logo', formData.logo);
      formDataToSend.append('documentJuridique', formData.legalDocument);

      const response = await fetch('http://localhost:8080/api/boutiques',{
        method: 'POST',
        body: formDataToSend,
        headers: {
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      onClose?.();
      navigate('/mesboutiques');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 shadow-sm rounded-4 border-0" style={{ maxWidth: 700, margin: "0 auto" }}>
      <form onSubmit={handleSubmit}>
        <div className="d-flex align-items-center mb-4">
          <Store className="me-2 text-primary" size={28} />
          <h4 className="mb-0 fw-semibold">Créer votre Boutique</h4>
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        <div className="row g-4">
          {/* Nom de la boutique */}
          <div className="col-12">
            <Form.Label className="fw-medium">Nom de la Boutique</Form.Label>
            <Form.Control
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ex: Ma Boutique Élégante"
            />
          </div>

          {/* Description */}
          <div className="col-12">
            <Form.Label className="fw-medium">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre boutique..."
            />
          </div>

          {/* Type de boutique */}
          <div className="col-12">
            <Form.Label className="fw-medium">Type de Boutique</Form.Label>
            <Form.Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="retail">Vente au Détail</option>
              <option value="wholesale">Vente en Gros</option>
              <option value="service">Service</option>
            </Form.Select>
          </div>

          {/* Numéros de téléphone */}
          <div className="col-12">
            <Form.Label className="fw-medium d-block mb-3">
              Numéros de Téléphone
              <Button 
                variant="link" 
                onClick={addPhoneNumber}
                className="p-0 ms-2 align-baseline"
              >
                <Plus size={16} /> Ajouter un numéro
              </Button>
            </Form.Label>

            {formData.phoneNumbers.map((phone, index) => (
              <div key={index} className="mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="tel"
                    value={phone.number}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    placeholder="50123456"
                    pattern="\d{8}"
                    required
                  />
                  {formData.phoneNumbers.length > 1 && (
                    <Button 
                      variant="outline-danger" 
                      onClick={() => removePhoneNumber(index)}
                      className="rounded-3"
                      style={{ width: '40px' }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                <small className="text-muted">Format: 8 chiffres (ex: 50123456)</small>
              </div>
            ))}
          </div>

          {/* Logo */}
          <div className="col-12">
            <Form.Label className="fw-medium">Logo</Form.Label>
            <div className="d-flex align-items-center gap-3">
              {formData.logo && (
                <div className="rounded overflow-hidden border" style={{ width: 64, height: 64 }}>
                  <img
                    src={URL.createObjectURL(formData.logo)}
                    alt="Preview du logo"
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
              )}
              <Button
                variant={formData.logo ? "outline-secondary" : "outline-primary"}
                onClick={() => document.getElementById("logo").click()}
              >
                <ImagePlus className="me-2" size={18} />
                {formData.logo ? "Changer le Logo" : "Ajouter un Logo"}
              </Button>
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange('logo')}
                className="d-none"
              />
            </div>
          </div>

          {/* Document juridique */}
          <div className="col-12">
            <Form.Label className="fw-medium">Document Juridique</Form.Label>
            <div className="d-flex align-items-center gap-3">
              <Button
                variant={formData.legalDocument ? "outline-secondary" : "outline-primary"}
                onClick={() => document.getElementById("document").click()}
              >
                <FileText className="me-2" size={18} />
                {formData.legalDocument ? "Changer le Document" : "Ajouter un Document"}
              </Button>
              <input
                id="document"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange('legalDocument')}
                className="d-none"
              />
            </div>
            {formData.legalDocument && (
              <p className="text-muted mt-2 small">
                Document sélectionné: {formData.legalDocument.name}
              </p>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button variant="outline-secondary" onClick={onClose || (() => navigate(-1))}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            variant="primary"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Création en cours...
              </>
            ) : 'Créer la Boutique'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreateShop;