import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css';

const Card = ({ image, title, date, category, description, link }) => {
  return (
    <div className="card">
      <Link to={link}>
        <img src={image} alt={title} className="card-image" />
      </Link>
      <div className="card-content">
        <p className="card-date">{date} | {category}</p>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
};

export default Card;
