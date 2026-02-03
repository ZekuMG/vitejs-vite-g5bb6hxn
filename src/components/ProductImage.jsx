import React from 'react';
import { getColorForItem } from '../data';

const ProductImage = ({ item, className = '', onClick }) => {
  const hasImage = item.image && item.image.trim() !== '';
  const bgColor = getColorForItem(item.id);

  if (hasImage) {
    return (
      <div
        className={`${className} overflow-hidden cursor-pointer bg-slate-100`}
        onClick={onClick}
      >
        <img
          src={item.image}
          alt={item.title}
          // Aseguramos object-cover para que rellene siempre el contenedor
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center p-1 cursor-pointer select-none`}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      {/* MODIFICADO: Texto aumentado a text-xs (aprox 12px) y ajuste de palabras */}
      <span className="text-white font-bold text-center leading-tight text-xs break-words line-clamp-4 px-1">
        {item.title}
      </span>
    </div>
  );
};

export default ProductImage;