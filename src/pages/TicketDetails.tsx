import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTicket, addComment, updateTicketStatus } from "../api/tickets";
import { useAuth } from "../context/AuthProvider";

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(id!),
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ ticketId, body }: { ticketId: string; body: string }) =>
      addComment(ticketId, body),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      // Scroll to bottom after comment is added
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "open" | "closed" }) =>
      updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setIsSubmitting(true);
    addCommentMutation.mutate({
      ticketId: id,
      body: newComment.trim(),
    });
    setIsSubmitting(false);
  };

  const handleStatusChange = (status: "open" | "closed") => {
    if (!id) return;
    updateStatusMutation.mutate({ id, status });
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading ticket...</div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Ticket not found</h2>
          <p className="text-gray-600 mb-4">
            The ticket you're looking for doesn't exist.
          </p>
          <Link to="/tickets" className="btn-primary inline-block">
            ← Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = ticket.created_by.role === "admin";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/tickets")} className="btn-ghost">
            ← Back to Tickets
          </button>
          <h1 className="text-2xl font-bold">Ticket Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:inline">
            {user?.email}
          </span>
          <button onClick={handleLogout} className="btn-danger text-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Ticket Info */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{ticket.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Created by {ticket.created_by.display_name}</span>
              <span>•</span>
              <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>
                Updated {new Date(ticket.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`badge ${
                ticket.status === "open"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {ticket.status}
            </span>
            {isAdmin && (
              <button
                onClick={() =>
                  handleStatusChange(
                    ticket.status === "open" ? "closed" : "open"
                  )
                }
                disabled={updateStatusMutation.isPending}
                className={`${
                  ticket.status === "open" ? "btn-danger" : "btn-primary"
                } text-sm disabled:opacity-50`}
              >
                {ticket.status === "open" ? "Close Ticket" : "Reopen Ticket"}
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {ticket.labels.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Labels</h3>
            <div className="flex flex-wrap gap-2">
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
        )}
      </div>

      {/* Comments Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold">
            Comments ({ticket.comments.length})
          </h3>
        </div>

        {/* Comments List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {ticket.comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {ticket.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-l-4 border-brand-200 pl-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.author_id.display_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.body}
                  </p>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="p-6 border-t border-gray-100">
          <form onSubmit={handleAddComment}>
            <div className="mb-4">
              <label htmlFor="comment" className="label">
                Add a comment
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="input"
                placeholder="Write your comment..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Comment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
