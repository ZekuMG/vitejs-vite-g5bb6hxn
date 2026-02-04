import React from 'react';
import { Package } from 'lucide-react';

// Genera un gradiente único basado en el ID del producto
const getGradientForItem = (id, title) => {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
    'from-teal-500 to-green-500',
    'from-red-500 to-orange-500',
    'from-cyan-500 to-blue-500',
  ];
  
  // Usa el ID para seleccionar un gradiente consistente
  const index = (typeof id === 'number' ? id : title.length) % gradients.length;
  return gradients[index];
};

const ProductImage = ({ item, className = '', onClick }) => {
  const hasImage = item.image && item.image.trim() !== '';
  const gradient = getGradientForItem(item.id, item.title);

  if (hasImage) {
    return (
      <div
        className={`${className} overflow-hidden cursor-pointer bg-slate-100`}
        onClick={onClick}
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Placeholder rediseñado con gradiente y patrón visual
  return (
    <div
      className={`${className} cursor-pointer select-none overflow-hidden relative group`}
      onClick={onClick}
    >
      {/* Fondo con gradiente */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      
      {/* Patrón decorativo sutil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-2 w-16 h-16 border-2 border-white rounded-full" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/30 rounded-full" />
      </div>
      
      {/* Contenido central */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-3 text-center">
        {/* Icono decorativo */}
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mb-2 group-hover:scale-110 transition-transform">
          <Package size={20} className="text-white/90" />
        </div>
        
        {/* Nombre del producto */}
        <span className="text-white font-bold text-xs leading-tight line-clamp-3 drop-shadow-sm px-1">
          {item.title}
        </span>
        
        {/* Categoría si existe */}
        {(item.category || (item.categories && item.categories[0])) && (
          <span className="mt-1 text-[9px] text-white/70 font-medium uppercase tracking-wide bg-black/20 px-2 py-0.5 rounded-full">
            {Array.isArray(item.categories) ? item.categories[0] : item.category}
          </span>
        )}
      </div>
      
      {/* Efecto hover */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
    </div>
  );
};

export default ProductImage;