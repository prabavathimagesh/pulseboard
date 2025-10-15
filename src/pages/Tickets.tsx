import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { getTickets, getLabels } from "../api/tickets";
import type { Ticket } from "../types";

export default function Tickets() {
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all"
  );
  const [labelFilter, setLabelFilter] = useState("");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets", { search, statusFilter, labelFilter }],
    queryFn: () =>
      getTickets({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        label: labelFilter || undefined,
      }),
  });

  console.log("Tickets", tickets);

  const { data: labels = [] } = useQuery({
    queryKey: ["labels"],
    queryFn: getLabels,
  });

  const displayedTickets = (tickets as Ticket[]).filter((t) =>
    labelFilter ? t.labels?.some((l) => l.name === labelFilter) : true
  );

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">PulseBoard</h1>
        <div className="flex items-center gap-3">
          <Link to="/settings" className="btn-ghost text-sm">
            Settings
          </Link>
          <span className="text-sm text-gray-600 hidden sm:inline">
            {user?.email}
          </span>
          <button onClick={handleLogout} className="btn-danger text-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "open" | "closed")
              }
              className="input"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="label">Label</label>
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="input"
            >
              <option value="">All Labels</option>
              {labels.map((label) => (
                <option key={label.id} value={label.name}>
                  {label.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create Ticket Button */}
      <div className="mb-4">
        <Link to="/tickets/new" className="btn-primary inline-block">
          Create New Ticket
        </Link>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Loading tickets...
        </div>
      ) : displayedTickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-base mb-2">No tickets found</p>
          <p className="text-sm">
            Try adjusting your filters or create a new ticket
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedTickets.map((ticket: Ticket) => (
            <div
              key={ticket.id}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="text-lg font-semibold text-brand-700 hover:text-brand-800"
                >
                  {ticket.title}
                </Link>
                <span
                  className={`badge ${
                    ticket.status === "open"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              <p className="text-gray-600 mb-3 line-clamp-2">
                {ticket.description}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex flex-wrap items-center gap-4">
                  <span>By {ticket.created_by.display_name}</span>
                  <span>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  <span>{ticket.comments.length} comments</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {ticket.labels.map((label) => (
                    <span
                      key={label.id}
                      className="badge bg-brand-50 text-brand-800"
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
