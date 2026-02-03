import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit3,
  Trash2,
  Package,
  Grid3x3,
  LayoutGrid,
  Maximize,
  Image as ImageIcon,
  MoreVertical
} from 'lucide-react';
import ProductImage from '../components/ProductImage';

export default function InventoryView({
  inventory,
  categories,
  currentUser,
  inventoryViewMode, // 'grid' | 'list'
  setInventoryViewMode,
  inventorySearch,
  setInventorySearch,
  inventoryCategoryFilter,
  setInventoryCategoryFilter,
  setIsModalOpen,
  setEditingProduct,
  handleDeleteProduct,
  setSelectedImage,
  setIsImageModalOpen,
}) {
  const [gridSize, setGridSize] = useState('normal'); // 'small' | 'normal' | 'large'

  // Filtrado
  const filteredInventory = useMemo(() => {
    return (inventory || []).filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        (item.brand &&
          item.brand.toLowerCase().includes(inventorySearch.toLowerCase()));

      const itemCategories = Array.isArray(item.categories) && item.categories.length > 0
        ? item.categories
        : item.category
        ? [item.category]
        : [];

      const matchesCategory =
        inventoryCategoryFilter === 'Todas' ||
        itemCategories.includes(inventoryCategoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [inventory, inventorySearch, inventoryCategoryFilter]);

  // Lógica de Stock Visual (Badge)
  const renderStockBadge = (stock) => {
    if (stock === 0) {
      return (
        <span className="bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm">
          AGOTADO
        </span>
      );
    }
    if (stock < 5) {
      return (
        <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-bold border border-red-200">
          {stock}
        </span>
      );
    }
    if (stock < 10) {
      return (
        <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-bold border border-amber-200">
          {stock}
        </span>
      );
    }
    return (
      <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold border border-green-200">
        {stock}
      </span>
    );
  };

  // Clases de Grilla Dinámica
  const getGridClasses = () => {
    switch (gridSize) {
      case 'small':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2';
      case 'normal':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';
      case 'large':
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3';
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* --- HEADER DE CONTROLES (COMPACTO) --- */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-2 flex flex-col sm:flex-row gap-2 items-center justify-between shrink-0">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {/* Botón Agregar Compacto */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Nuevo</span>
            <span className="sm:hidden">+</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          {/* Buscador Compacto */}
          <div className="relative flex-1 sm:w-56">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Filtro Categoría Compacto */}
          <div className="relative max-w-[140px] w-full">
            <Filter
              className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={12}
            />
            <select
              className="w-full pl-7 pr-6 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 cursor-pointer appearance-none font-medium text-slate-600 shadow-sm hover:bg-slate-50 truncate"
              value={inventoryCategoryFilter}
              onChange={(e) => setInventoryCategoryFilter(e.target.value)}
            >
              <option value="Todas">Todas</option>
              {(categories || []).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Controles de Vista Compactos */}
          <div className="flex items-center gap-2 shrink-0">
             {/* Switch Grid/List */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                onClick={() => setInventoryViewMode('grid')}
                className={`p-1 rounded-md transition-all ${
                    inventoryViewMode === 'grid'
                    ? 'bg-white shadow-sm text-fuchsia-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grilla"
                >
                <LayoutGrid size={14} />
                </button>
                <button
                onClick={() => setInventoryViewMode('list')}
                className={`p-1 rounded-md transition-all ${
                    inventoryViewMode === 'list'
                    ? 'bg-white shadow-sm text-fuchsia-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Lista"
                >
                <MoreVertical size={14} className="rotate-90" />
                </button>
            </div>

            {/* Tamaño de Grilla */}
            {inventoryViewMode === 'grid' && (
                <div className="hidden md:flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                    onClick={() => setGridSize('small')}
                    className={`p-1 rounded-md transition-all ${
                    gridSize === 'small'
                        ? 'bg-white shadow-sm text-fuchsia-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Chico"
                >
                    <Grid3x3 size={14} />
                </button>
                <button
                    onClick={() => setGridSize('normal')}
                    className={`p-1 rounded-md transition-all ${
                    gridSize === 'normal'
                        ? 'bg-white shadow-sm text-fuchsia-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Normal"
                >
                    <LayoutGrid size={14} />
                </button>
                <button
                    onClick={() => setGridSize('large')}
                    className={`p-1 rounded-md transition-all ${
                    gridSize === 'large'
                        ? 'bg-white shadow-sm text-fuchsia-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Grande"
                >
                    <Maximize size={14} />
                </button>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- LISTADO --- */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredInventory.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-4">
            <Package size={48} className="mb-2 opacity-50" />
            <p className="font-bold">No se encontraron productos</p>
            <p className="text-xs">Intenta con otro término de búsqueda</p>
          </div>
        ) : inventoryViewMode === 'grid' ? (
          /* --- VISTA GRILLA REDISEÑADA Y COMPACTA --- */
          <div className={`grid ${getGridClasses()} pb-20`}>
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative"
              >
                {/* Imagen: CORREGIDO para llenar el espacio */}
                <div className="aspect-square bg-white relative overflow-hidden border-b border-slate-200">
                  <div 
                    onClick={() => {
                        setSelectedImage(item.image || null);
                        if(item.image) setIsImageModalOpen(true);
                    }}
                    className="w-full h-full cursor-zoom-in"
                  >
                    <ProductImage
                      item={item}
                      // CAMBIO CLAVE: object-cover para rellenar, sin padding (p-0)
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${item.stock === 0 ? 'grayscale opacity-60' : ''}`}
                    />
                  </div>
                  
                  {/* Overlay AGOTADO */}
                  {item.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
                      <span className="relative bg-slate-800 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-slate-600 transform -rotate-6">
                        SIN STOCK
                      </span>
                    </div>
                  )}

                  {/* Acciones Flotantes */}
                  <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                     <button
                        onClick={() => setEditingProduct(item)}
                        className="bg-white p-1.5 rounded-full shadow-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-100"
                        title="Editar"
                     >
                        <Edit3 size={12} />
                     </button>
                     <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="bg-white p-1.5 rounded-full shadow-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors border border-slate-100"
                        title="Eliminar"
                     >
                        <Trash2 size={12} />
                     </button>
                  </div>
                </div>

                {/* Contenido Compacto */}
                <div className="p-2 flex flex-col flex-1">
                  {/* Categoría */}
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide truncate mb-0.5">
                    {Array.isArray(item.categories) && item.categories.length > 0
                        ? item.categories[0]
                        : item.category || 'Sin cat.'}
                    {Array.isArray(item.categories) && item.categories.length > 1 && ` +${item.categories.length - 1}`}
                  </p>
                  
                  {/* Título (Más compacto) */}
                  <h3 className="text-[10px] font-bold text-slate-800 leading-tight line-clamp-2 mb-1.5 min-h-[2.4em]">
                    {item.title}
                  </h3>

                  {/* Footer: Precio y Stock */}
                  <div className="mt-auto flex items-end justify-between pt-1.5 border-t border-slate-50">
                     <span className="text-xs font-bold text-fuchsia-600 leading-none">
                        ${item.price.toLocaleString()}
                     </span>
                     <div className="text-right">
                        {renderStockBadge(item.stock)}
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- VISTA LISTA --- */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-20">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b text-[10px]">
                <tr>
                  <th className="p-2 w-12 text-center"><ImageIcon size={12} /></th>
                  <th className="p-2">Producto</th>
                  <th className="p-2 hidden sm:table-cell">Categoría</th>
                  <th className="p-2 text-right">Precio</th>
                  <th className="p-2 text-center">Stock</th>
                  <th className="p-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-2">
                      <div className="w-8 h-8 rounded bg-white border border-slate-200 overflow-hidden mx-auto">
                        <ProductImage item={item} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-2">
                      <p className="font-bold text-slate-800">{item.title}</p>
                      <p className="text-[9px] text-slate-400 sm:hidden">
                        {Array.isArray(item.categories) ? item.categories.join(', ') : item.category}
                      </p>
                    </td>
                    <td className="p-2 hidden sm:table-cell text-slate-600">
                       {Array.isArray(item.categories) ? (
                            <div className="flex flex-wrap gap-1">
                                {item.categories.slice(0, 2).map(c => (
                                    <span key={c} className="bg-slate-100 px-1 py-0.5 rounded text-[9px]">{c}</span>
                                ))}
                                {item.categories.length > 2 && <span className="text-[9px] text-slate-400">+{item.categories.length - 2}</span>}
                            </div>
                       ) : (
                            <span className="bg-slate-100 px-1 py-0.5 rounded text-[9px]">{item.category}</span>
                       )}
                    </td>
                    <td className="p-2 text-right font-bold text-fuchsia-600">
                      ${item.price.toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      {renderStockBadge(item.stock)}
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingProduct(item)}
                          className="p-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 border border-blue-200 transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="p-1 text-red-600 bg-red-50 rounded hover:bg-red-100 border border-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}