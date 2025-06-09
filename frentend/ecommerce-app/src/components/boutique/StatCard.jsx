import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, trend, icon, color }) => {
  const getColorClass = () => {
    switch(color) {
      case 'primary': return 'stat-card-primary';
      case 'secondary': return 'stat-card-secondary';
      case 'accent': return 'stat-card-accent';
      case 'success': return 'stat-card-success';
      case 'warning': return 'stat-card-warning';
      case 'error': return 'stat-card-error';
      default: return 'stat-card-primary';
    }
  };
  
  const isTrendPositive = trend >= 0;
  
  return (
    <div className={`card-dashboard stat-card ${getColorClass()}`}>
      <div className="stat-card-content">
        <div className="stat-info">
          <div className="stat-label">{title}</div>
          <div className="stat-value">{value}</div>
          <div className={`stat-trend ${isTrendPositive ? 'trend-up' : 'trend-down'}`}>
            {isTrendPositive ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            <span>{Math.abs(trend)}% vs last period</span>
          </div>
        </div>
        <div className="stat-icon">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;