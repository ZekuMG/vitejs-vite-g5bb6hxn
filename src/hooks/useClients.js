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

  // --- HELPER INTERNO ---
  // Generador de ID robusto que no falla en entornos sin HTTPS (red local)
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // --- ACCIONES ---

  // Crear nuevo socio
  const addMember = (memberData) => {
    // Validación: Solo el nombre es obligatorio estricto
    if (!memberData.name || !memberData.name.trim()) {
      alert('El nombre del socio es obligatorio.');
      return null;
    }

    // Generar Número de Socio Procedural (Auto-incremental)
    const maxNumber = members.length > 0 
      ? Math.max(...members.map(m => m.memberNumber || 0)) 
      : 0;
    const nextMemberNumber = maxNumber + 1;

    const newMember = {
      id: generateUUID(),
      memberNumber: nextMemberNumber,
      name: memberData.name,
      dni: memberData.dni || '',
      phone: memberData.phone || '',
      email: memberData.email || '',
      extraInfo: memberData.extraInfo || '',
      points: Number(memberData.points) || 0, // Permite inicializar con puntos si viene del form
      history: [],
    };

    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  // Editar Socio (Con registro de historial si cambian los puntos)
  const updateMember = (id, updates) => {
    setMembers((prev) => 
      prev.map((m) => {
        if (m.id !== id) return m;

        let newHistory = m.history;
        let newPoints = m.points;

        // Detectar cambio manual de puntos para registrarlo
        if (updates.points !== undefined) {
          const manualPoints = Number(updates.points);
          if (manualPoints !== m.points) {
            const diff = manualPoints - m.points;
            newPoints = manualPoints;

            // Crear registro de auditoría
            const adjustmentEntry = {
              id: generateUUID(),
              date: new Date().toISOString(),
              type: diff > 0 ? 'earned' : 'redeemed', // 'earned' para suma, 'redeemed' para resta
              points: Math.abs(diff),
              concept: 'Ajuste Manual de Inventario/Administrador',
              prevPoints: m.points,
              newPoints: manualPoints,
              totalSale: 0,
              orderId: '---'
            };
            newHistory = [adjustmentEntry, ...m.history];
          }
        }

        return { 
          ...m, 
          ...updates, 
          points: newPoints, // Aseguramos que se guarde el numérico
          history: newHistory 
        };
      })
    );
  };

  // Eliminar Socio
  const deleteMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    return true;
  };

    // Buscar socio
    const searchMember = (query) => {
        if (!query) return null;
        const q = query.toLowerCase().trim();
        
        return members.find(m => 
        String(m.memberNumber).includes(q) ||
        (m.dni && m.dni.includes(q)) ||
        (m.phone && m.phone.includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
        );
    };

  // Sumar puntos tras una venta
  const addPoints = (memberId, totalSaleAmount, orderId) => {
    const pointsEarned = Math.floor(totalSaleAmount / 100);
    
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        const currentPoints = m.points || 0;

        const newHistoryEntry = {
          id: generateUUID(),
          date: new Date().toISOString(),
          type: 'earned',
          points: pointsEarned,
          totalSale: totalSaleAmount,
          orderId: orderId || '---',
          prevPoints: currentPoints,
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
          id: generateUUID(),
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
    members,
    addMember,
    updateMember,
    deleteMember,
    searchMember,
    addPoints,
    redeemPoints,
  };
};