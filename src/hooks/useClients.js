import { useState, useEffect } from 'react';
import { INITIAL_MEMBERS, getInitialState } from '../data';

export const useClients = () => {
  // Inicializar estado desde localStorage o usar INITIAL_MEMBERS
  const [members, setMembers] = useState(() =>
    getInitialState('pos_members', INITIAL_MEMBERS)
  );

  // Persistir en cada cambio automáticamente
  useEffect(() => {
    window.localStorage.setItem('pos_members', JSON.stringify(members));
  }, [members]);

  // --- ACCIONES ---

  // Crear nuevo socio (Sustituye addClient)
  const addMember = (memberData) => {
    // Validación: Solo el nombre es obligatorio estricto
    if (!memberData.name || !memberData.name.trim()) {
      alert('El nombre del socio es obligatorio.');
      return null;
    }

    // Generar Número de Socio Procedural (Auto-incremental)
    // Busca el número más alto existente y le suma 1. Si no hay, empieza en 1.
    const maxNumber = members.length > 0 
      ? Math.max(...members.map(m => m.memberNumber || 0)) 
      : 0;
    const nextMemberNumber = maxNumber + 1;

    const newMember = {
      id: crypto.randomUUID(), // ID interno del sistema
      memberNumber: nextMemberNumber, // ID visual para el usuario (N° Socio)
      name: memberData.name,
      dni: memberData.dni || '',
      phone: memberData.phone || '',
      email: memberData.email || '',
      extraInfo: memberData.extraInfo || '',
      points: 0,
      history: [],
    };

    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  // Editar Socio
  const updateMember = (id, updates) => {
    setMembers((prev) => 
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  // Eliminar Socio
  const deleteMember = (id) => {
    // Retorna true si se eliminó, false si se canceló (aunque la confirmación idealmente va en la UI)
    setMembers((prev) => prev.filter((m) => m.id !== id));
    return true;
  };

  // Buscar socio (Helper para lógica interna o POS rápido)
  // Busca coincidencia exacta o parcial en varios campos
  const searchMember = (query) => {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    
    return members.find(m => 
      String(m.memberNumber) === q ||
      (m.dni && m.dni.includes(q)) ||
      (m.phone && m.phone.includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q))
    );
  };

  // Sumar puntos tras una venta
  const addPoints = (memberId, totalSaleAmount, orderId) => {
    const pointsEarned = Math.floor(totalSaleAmount / 100);
    
    // Si la venta es menor a $100 (0 puntos), igual registramos la visita/compra en el historial? 
    // Asumiremos que sí para que quede constancia del "Número de Pedido".
    
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        const currentPoints = m.points || 0;

        const newHistoryEntry = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          type: 'earned',
          points: pointsEarned,
          totalSale: totalSaleAmount,
          orderId: orderId || '---', // Guardamos el N° de Pedido
          prevPoints: currentPoints, // Guardamos estado previo para UI detallada
          newPoints: currentPoints + pointsEarned
        };

        return {
          ...m,
          points: currentPoints + pointsEarned,
          history: [newHistoryEntry, ...m.history],
        };
      })
    );
    return pointsEarned;
  };

  // Canjear puntos
  const redeemPoints = (memberId, pointsToRedeem, concept) => {
    let success = false;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        if (m.points < pointsToRedeem) {
          return m;
        }

        success = true;
        const currentPoints = m.points;

        const newHistoryEntry = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          type: 'redeemed',
          points: pointsToRedeem,
          concept,
          prevPoints: currentPoints,
          newPoints: currentPoints - pointsToRedeem
        };

        return {
          ...m,
          points: currentPoints - pointsToRedeem,
          history: [newHistoryEntry, ...m.history],
        };
      })
    );

    return success;
  };

  return {
    members, // Renombrado de 'clients' a 'members'
    addMember,
    updateMember,
    deleteMember,
    searchMember,
    addPoints,
    redeemPoints,
  };
};