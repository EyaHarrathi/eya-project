import React from 'react';
import { 
  Clock,
  Package2,
  Truck,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const StatusBadge = ({ status, className }) => {
  const statusConfig = {
    en_attente: {
      color: "bg-warning text-dark",
      label: "En attente",
      icon: Clock
    },
    en_preparation: {
      color: "bg-primary text-white",
      label: "En préparation",
      icon: Package2
    },
    en_livraison: {
      color: "bg-info text-white",
      label: "En livraison",
      icon: Truck
    },
    livree: {
      color: "bg-success text-white",
      label: "Livrée",
      icon: CheckCircle2
    },
    annulee: {
      color: "bg-danger text-white",
      label: "Annulée",
      icon: XCircle
    }
  };

  const config = statusConfig[status] || statusConfig.en_attente;
  const Icon = config.icon;

  return (
    <span className={`badge ${config.color} ${className || ''} d-flex align-items-center gap-1`}>
      <Icon size={16} />
      {config.label}
    </span>
  );
};

export default StatusBadge;