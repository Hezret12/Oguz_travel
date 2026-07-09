import { useMemo, useState } from 'react';
import { INITIAL_B2B_TICKETS } from './mockData';

export const useB2BTickets = () => {
  const [tickets, setTickets] = useState(INITIAL_B2B_TICKETS);

  const addTicket = (ticket) => {
    const nextTicket = {
      ...ticket,
      id: `b2b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ticketNo: ticket.ticketNo?.trim() || `TB-${String(tickets.length + 1).padStart(3, '0')}`,
      profit: Number(ticket.saleFare || 0) - Number(ticket.netFare || 0),
    };

    setTickets((previous) => [nextTicket, ...previous]);
    return nextTicket;
  };

  const updateTicket = (ticketId, patch) => {
    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              ...patch,
              profit:
                Number(patch.saleFare ?? ticket.saleFare ?? 0) - Number(patch.netFare ?? ticket.netFare ?? 0),
            }
          : ticket,
      ),
    );
  };

  const deleteTicket = (ticketId) => {
    setTickets((previous) => previous.filter((ticket) => ticket.id !== ticketId));
  };

  const totals = useMemo(
    () => ({
      count: tickets.length,
      sales: tickets.filter((ticket) => ticket.status === 'SALE').length,
      reissues: tickets.filter((ticket) => ticket.status === 'REISSUE').length,
      refunds: tickets.filter((ticket) => ticket.status === 'REFUND').length,
      profit: tickets.reduce((sum, ticket) => sum + Number(ticket.profit || 0), 0),
      netFare: tickets.reduce((sum, ticket) => sum + Number(ticket.netFare || 0), 0),
      saleFare: tickets.reduce((sum, ticket) => sum + Number(ticket.saleFare || 0), 0),
    }),
    [tickets],
  );

  return {
    tickets,
    setTickets,
    addTicket,
    updateTicket,
    deleteTicket,
    totals,
  };
};
