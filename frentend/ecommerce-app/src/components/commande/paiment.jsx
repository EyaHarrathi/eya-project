"use client";
import React, { useState, useEffect } from 'react';
import { X, Truck, CreditCard, CheckCircle2, Wallet, Loader, Calendar } from 'lucide-react';

const Pai = ({ cart, show, onClose, total }) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRentProducts, setHasRentProducts] = useState(false);
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [dateErrors, setDateErrors] = useState({});
  const [rentalDates, setRentalDates] = useState({});
  const [productTypes, setProductTypes] = useState({});
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: ''
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    address: '',
    phone: '',
    city: '',
    postalCode: '',
    homeDelivery: true,
  });

  const userId = localStorage.getItem("userId");
  const finalTotal = total || 0;

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const types = await Promise.all(
          cart.map(async (product) => {
            const response = await fetch(`http://localhost:8080/api/products/${product.id}/type`);
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Erreur de récupération du type pour le produit ${product.id}: ${errorText}`);
            }
            let data;
            try {
              data = await response.json();
            } catch (jsonError) {
              const errorText = await response.text();
              throw new Error(`Réponse non-JSON pour le produit ${product.id}: ${errorText}`);
            }
            return {
              id: product.id,
              type: data.type ? data.type.toUpperCase() : 'VENTE'
            };
          })
        );
        
        const typesMap = types.reduce((acc, curr) => ({
          ...acc,
          [curr.id]: curr.type
        }), {});

        setProductTypes(typesMap);
        setHasRentProducts(Object.values(typesMap).some(t => t === 'LOCATION'));
      } catch (error) {
        console.error('Erreur:', error);
        alert(`Impossible de charger les types de produits: ${error.message}`);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    if (cart.length > 0) fetchProductTypes();
  }, [cart]);

  const validateRentalDates = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    cart.forEach(product => {
      if (productTypes[product.id] === 'LOCATION') {
        const dates = rentalDates[product.id] || {};
        const startDate = dates.startDate ? new Date(dates.startDate) : null;
        const endDate = dates.endDate ? new Date(dates.endDate) : null;
        
        if (!dates.startDate || !dates.endDate) {
          errors[product.id] = 'Les dates sont obligatoires';
        } else if (startDate < today) {
          errors[product.id] = 'La date de début doit être dans le futur';
        } else if (endDate < startDate) {
          errors[product.id] = 'La date de fin doit être après la date de début';
        }
      }
    });
    
    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep = () => {
    if (step === 1) {
      const { fullName, address, phone, city, postalCode } = deliveryInfo;
      const baseValidation = fullName.trim() && 
                            address.trim() && 
                            phone.trim() && 
                            city.trim() && 
                            postalCode.trim();
      
      return hasRentProducts ? (baseValidation && validateRentalDates()) : baseValidation;
    }
    return true;
  };

  async function checkStockAvailability(productId, quantity) {
    try {
      const url = `http://localhost:8080/api/products/${productId}/check-stock?quantityToCheck=${quantity}`;
      console.log('URL appelée:', url);
      const response = await fetch(url);
      console.log('Réponse HTTP:', response.status);
      const responseText = await response.text();
      console.log('Contenu brut de la réponse:', responseText);
      
      if (!response.ok) {
        console.error(`Erreur ${response.status}: ${response.statusText}`);
        return false;
      }
      
      return responseText.trim().toLowerCase() === "true";
    } catch (error) {
      console.error(`Erreur complète:`, error);
      return false;
    }
  }

  const checkAvailability = async () => {
    const errors = {};
    for (const product of cart) {
      const type = productTypes[product.id];
      try {
        if (type === 'LOCATION') {
          const dates = rentalDates[product.id];
          if (!dates || !dates.startDate || !dates.endDate) {
            errors[product.id] = 'Dates non sélectionnées pour la location';
            alert(`Erreur pour ${product.name} : Dates non sélectionnées`);
            continue;
          }
          
          const params = new URLSearchParams({
            startDate: dates.startDate,
            endDate: dates.endDate,
          });
          
          const response = await fetch(
            `http://localhost:8080/api/products/check-availability/${product.id}?${params}`
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            errors[product.id] = errorText || 'Erreur serveur';
            alert(`Échec pour ${product.name} : ${errorText || 'Erreur serveur'}`);
            continue;
          }

          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            const errorText = await response.text();
            errors[product.id] = `Réponse non-JSON: ${errorText}`;
            alert(`Échec pour ${product.name} : Réponse non-JSON: ${errorText}`);
            continue;
          }
          
          if (!data.available) {
            const message = data.message || 'Dates non disponibles';
            errors[product.id] = message;
            alert(`Échec pour ${product.name} : ${message}`);
            continue;
          }
        }
        
        if (type === 'VENTE' || type === 'LOCATION') {
          console.log(`Vérification du stock pour ${product.name} (ID: ${product.id}, quantité: ${product.quantity})`);
          const isStockAvailable = await checkStockAvailability(product.id, product.quantity);
          
          if (!isStockAvailable) {
            errors[product.id] = 'Stock insuffisant';
            alert(`Échec pour ${product.name} : Stock insuffisant`);
          }
        }
      } catch (error) {
        console.error(`Erreur générale pour ${product.name}`, error.message);
        errors[product.id] = error.message || 'Erreur inconnue';
        alert(`Erreur pour ${product.name} : ${error.message}`);
      }
    }
    
    setAvailabilityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateProducts = async () => {
    try {
      await Promise.all(
        cart.map(async (product) => {
          try {
            const type = productTypes[product.id];
            
            if (type === 'LOCATION') {
              const dates = rentalDates[product.id];
              if (!dates || !dates.startDate || !dates.endDate) {
                throw new Error(`Dates manquantes pour le produit ${product.id}`);
              }
              
              console.log(`Mise à jour location du produit ${product.id} avec les dates :`, dates);
              
              const rentalResponse = await fetch(
                `http://localhost:8080/api/products/${product.id}/rental?startDate=${dates.startDate}&endDate=${dates.endDate}`,
                {
                  method: 'PUT',
                }
              );
              
              if (!rentalResponse.ok) {
                let errorData;
                try {
                  errorData = await rentalResponse.json();
                } catch (jsonError) {
                  const errorText = await rentalResponse.text();
                  throw new Error(`Réponse non-JSON pour location du produit ${product.id}: ${errorText}`);
                }
                throw new Error(`Location: ${errorData.message || 'Erreur inconnue'}`);
              }
            }
            
            if (type === 'LOCATION' || type === 'VENTE') {
              const stockResponse = await fetch(
                `http://localhost:8080/api/products/${product.id}/stock`,
                {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    operation: 'decrement',
                    value: product.quantity
                  })
                }
              );
              
              if (!stockResponse.ok) {
                let errorData;
                try {
                  errorData = await stockResponse.json();
                } catch (jsonError) {
                  const errorText = await stockResponse.text();
                  throw new Error(`Réponse non-JSON pour stock du produit ${product.id}: ${errorText}`);
                }
                throw new Error(`Stock: ${errorData.message || 'Erreur inconnue'}`);
              }
            }
          } catch (error) {
            console.error(`Échec mise à jour produit ${product.id}:`, error);
            throw new Error(`Échec pour ${product.name}: ${error.message}`);
          }
        })
      );
    } catch (error) {
      console.error('Échec global de mise à jour:', error);
      throw new Error(`La mise à jour des produits a échoué : ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      alert('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    if (step === 3) {
      const isAvailable = await checkAvailability();
      if (!isAvailable) {
        setStep(1);
        return;
      }
    }
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const produitsAvecVendeur = await Promise.all(
        cart.map(async (item) => {
          const response = await fetch(`http://localhost:8080/api/products/${item.id}/user`);
          const idVendeur = await response.text();
          return {
            idProduit: item.id,
            quantite: item.quantity,
            idVendeur,
            prix: item.price,
            ...(productTypes[item.id] === 'LOCATION' && {
              startDate: rentalDates[item.id]?.startDate,
              endDate: rentalDates[item.id]?.endDate
            })
          };
        })
      );

      const produitsParVendeur = produitsAvecVendeur.reduce((acc, produit) => {
        acc[produit.idVendeur] = [...(acc[produit.idVendeur] || []), {
          idProduit: produit.idProduit,
          quantite: produit.quantite,
          idVendeur: produit.idVendeur,
          prix: produit.prix,
          ...(produit.startDate && { startDate: produit.startDate }),
          ...(produit.endDate && { endDate: produit.endDate })
        }];
        return acc;
      }, {});

      const commandesCreees = [];
      for (const idVendeur in produitsParVendeur) {
        const produits = produitsParVendeur[idVendeur];
        const commandeResponse = await fetch('http://localhost:8080/api/commandes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idUtilisateur: userId,
            produits,
            livraison: {
              nomComplet: deliveryInfo.fullName.trim(),
              adresse: deliveryInfo.address.trim(),
              telephone: deliveryInfo.phone.trim(),
              ville: deliveryInfo.city.trim(),
              codePostal: deliveryInfo.postalCode.trim(),
              livraisonADomicile: paymentMethod === 'cash' ? true : false,
            },
            statut: paymentMethod === 'cash' ? 'NON_PAYEE' : 'PAYEE',
          }),
        });

        if (!commandeResponse.ok) {
          const errorText = await commandeResponse.text();
          throw new Error(`Erreur lors de la création de la commande: ${errorText}`);
        }

        let commande;
        try {
          commande = await commandeResponse.json();
        } catch (jsonError) {
          const errorText = await commandeResponse.text();
          throw new Error(`Réponse non-JSON pour la création de la commande: ${errorText}`);
        }
        commandesCreees.push(commande);
        
        await fetch('http://localhost:8080/api/notifications/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: idVendeur,
            type: 'NOUVELLE_COMMANDE',
            message: `Nouvelle commande pour vos produits`,
            userPhotoUrl: `/icon/commandez-maintenant.png`,
            iconUrl: '/icons/new-order.png',
            relatedUserId: userId
          })
        });
      }

      await updateProducts();

      await fetch('http://localhost:8080/api/notifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          type: 'CONFIRMATION_COMMANDE',
          message: `Votre commande a été confirmée (${commandesCreees.length} sous-commandes)`,
          userPhotoUrl: `/icon/confirmation.png`,
          iconUrl: '/icons/order-confirm.png',
          relatedUserId: null
        })
      });

      await fetch(`http://localhost:8080/api/cart/${userId}/clear`, { method: 'DELETE' });
      onClose();
      alert(paymentMethod === 'cash' 
        ? 'Commandes confirmées ! Paiement à la livraison' 
        : 'Paiement accepté ! Merci pour votre achat');
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert(`Erreur lors de la création de la commande : ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (productId, field, value) => {
    setRentalDates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
    
    setDateErrors(prev => ({ ...prev, [productId]: undefined }));
    setAvailabilityErrors(prev => ({ ...prev, [productId]: undefined }));
  };

  const renderRentalDateFields = () => {
    if (isLoadingTypes) {
      return <div className="text-center py-3">Chargement des types de produits...</div>;
    }

    return cart.map(product => {
      if (productTypes[product.id] !== 'LOCATION') return null;
      
      const dates = rentalDates[product.id] || {};
      const error = dateErrors[product.id] || availabilityErrors[product.id];

      return (
        <div key={product.id} className="mb-4 p-3 border rounded bg-light">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Calendar size={20} className="text-primary" />
            <h5 className="mb-0">{product.name}</h5>
          </div>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Date de début</label>
              <input
                type="date"
                required
                className={`form-control ${error ? 'is-invalid' : ''}`}
                value={dates.startDate || ''}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(product.id, 'startDate', e.target.value)}
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Date de fin</label>
              <input
                type="date"
                required
                className={`form-control ${error ? 'is-invalid' : ''}`}
                value={dates.endDate || ''}
                min={dates.startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(product.id, 'endDate', e.target.value)}
              />
            </div>

            {error && (
              <div className="col-12">
                <div className="alert alert-danger mt-2 p-2 small">
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Finaliser votre commande</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
            />
          </div>
          <div className="modal-body">
            <div className="d-flex justify-content-center mb-4">
              {['Livraison', 'Récapitulatif', 'Paiement'].map((label, index) => {
                const current = index + 1;
                return (
                  <React.Fragment key={label}>
                    {index !== 0 && (
                      <div
                        className="mx-3"
                        style={{
                          width: '4rem',
                          borderTop: `2px solid ${step >= current ? '#0d6efd' : '#dee2e6'}`,
                        }}
                      />
                    )}
                    <div className={`d-flex align-items-center ${step >= current ? 'text-primary' : 'text-muted'}`}>
                      <div className="rounded-circle border border-2 d-flex align-items-center justify-content-center"
                        style={{ width: '2rem', height: '2rem' }}>
                        {current}
                      </div>
                      <span className="ms-2 fw-medium">{label}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="bg-light p-4 rounded mb-4">
                  <h3 className="h5 d-flex align-items-center gap-2 mb-4">
                    <Truck size={20} />
                    Informations de livraison
                  </h3>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nom complet <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={deliveryInfo.fullName}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, fullName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Téléphone <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        required
                        className="form-control"
                        value={deliveryInfo.phone}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Adresse <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={deliveryInfo.address}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Ville <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={deliveryInfo.city}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, city: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Code postal <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={deliveryInfo.postalCode}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, postalCode: e.target.value })}
                      />
                    </div>
                  </div>

                  {hasRentProducts && (
                    <div className="mt-4">
                      <h4 className="h5 mb-3 text-primary">
                        <Calendar size={20} className="me-2" />
                        Périodes de location
                      </h4>
                      {renderRentalDateFields()}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="bg-light p-4 rounded mb-4">
                  <h3 className="h5 mb-4">Récapitulatif de la commande</h3>
                  <div className="list-group">
                    {cart.map((product) => (
                      <div key={product.id} className="list-group-item d-flex align-items-center">
                        <img
                          src={`http://localhost:8080/api/products/images/${product.imageName}`}
                          alt={product.name}
                          className="img-thumbnail me-3"
                          style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-medium">{product.name}</div>
                          <small className="text-muted">
                            Quantité: {product.quantity}
                            {productTypes[product.id] === 'LOCATION' && rentalDates[product.id] && (
                              <div className="text-muted">
                                Du {rentalDates[product.id].startDate} au {rentalDates[product.id].endDate}
                              </div>
                            )}
                          </small>
                        </div>
                        <div className="fw-medium">DT{(product.price * product.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                    <div className="list-group-item d-flex justify-content-between align-items-center pt-3">
                      <span className="fw-bold fs-5">Total</span>
                      <span className="fw-bold fs-5">DT{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-light p-4 rounded mb-4">
                  <h3 className="h5 d-flex align-items-center gap-2 mb-4">
                    <Wallet size={20} />
                    Mode de paiement
                  </h3>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`w-100 btn btn-outline-primary ${paymentMethod === 'card' ? 'active' : ''}`}
                        disabled={isSubmitting}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <CreditCard size={20} />
                          <div className="text-start">
                            <div className="fw-medium">Paiement en ligne</div>
                            <small className="text-muted">Carte bancaire</small>
                          </div>
                        </div>
                      </button>
                    </div>
                    <div className="col-md-6">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`w-100 btn btn-outline-primary ${paymentMethod === 'cash' ? 'active' : ''}`}
                        disabled={isSubmitting}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <Truck size={20} />
                          <div className="text-start">
                            <div className="fw-medium">Paiement à la livraison</div>
                            <small className="text-muted">En espèces</small>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="mt-4">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Numéro de carte</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Date d'expiration</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            placeholder="MM/AA"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Code de sécurité</label>
                          <input
                            type="text"
                            required
                            className="form-control"
                            placeholder="123"
                            value={cardDetails.cvc}
                            onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                  >
                    Retour
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader className="me-2 animate-spin" size={20} />
                  ) : step === 3 ? (
                    <>
                      <CheckCircle2 className="me-2" size={20} />
                      {paymentMethod === 'cash' ? 'Confirmer' : 'Payer maintenant'}
                    </>
                  ) : (
                    'Continuer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pai;