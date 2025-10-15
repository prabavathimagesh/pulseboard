import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLabels, createLabel, updateLabel } from "../api/tickets";
import { useAuth } from "../context/AuthProvider";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [newLabelName, setNewLabelName] = useState("");
  const [editingLabel, setEditingLabel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editLabelName, setEditLabelName] = useState("");
  const queryClient = useQueryClient();

  const { data: labels = [], isLoading } = useQuery({
    queryKey: ["labels"],
    queryFn: getLabels,
  });

  const createLabelMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      setNewLabelName("");
      queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });

  const updateLabelMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateLabel(id, name),
    onSuccess: () => {
      setEditingLabel(null);
      setEditLabelName("");
      queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    createLabelMutation.mutate(newLabelName.trim());
  };

  const handleEditLabel = (label: { id: string; name: string }) => {
    setEditingLabel(label);
    setEditLabelName(label.name);
  };

  const handleUpdateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabel || !editLabelName.trim()) return;

    updateLabelMutation.mutate({
      id: editingLabel.id,
      name: editLabelName.trim(),
    });
  };

  const cancelEdit = () => {
    setEditingLabel(null);
    setEditLabelName("");
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/tickets")}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to Tickets
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Labels Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Manage Labels</h2>

        {/* Create New Label */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Add New Label</h3>
          <form onSubmit={handleCreateLabel} className="flex gap-3">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Enter label name..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={createLabelMutation.isPending}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createLabelMutation.isPending ? "Adding..." : "Add Label"}
            </button>
          </form>
          {createLabelMutation.error && (
            <p className="text-red-500 text-sm mt-2">
              {createLabelMutation.error.message}
            </p>
          )}
        </div>

        {/* Existing Labels */}
        <div>
          <h3 className="text-lg font-medium mb-3">Existing Labels</h3>
          {isLoading ? (
            <p className="text-gray-500">Loading labels...</p>
          ) : labels.length === 0 ? (
            <p className="text-gray-500">No labels found.</p>
          ) : (
            <div className="space-y-3">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  {editingLabel?.id === label.id ? (
                    <form
                      onSubmit={handleUpdateLabel}
                      className="flex items-center gap-3 flex-1"
                    >
                      <input
                        type="text"
                        value={editLabelName}
                        onChange={(e) => setEditLabelName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="submit"
                        disabled={updateLabelMutation.isPending}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        {updateLabelMutation.isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="font-medium">{label.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditLabel(label)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Admin Features</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Create and manage labels</li>
          <li>• Close and reopen tickets</li>
          <li>• Full access to all tickets and comments</li>
        </ul>
      </div>
    </div>
  );
}
