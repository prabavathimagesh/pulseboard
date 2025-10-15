import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTicket, getLabels } from "../api/tickets";

export default function CreateTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: labels = [] } = useQuery({
    queryKey: ["labels"],
    queryFn: getLabels,
  });

  const createTicketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      // ensure tickets list is fresh when we navigate back
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      navigate("/tickets");
    },
    onError: (error: any) => {
      setErrors({ submit: error.message });
    },
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    createTicketMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      labelIds: selectedLabels,
    });
  };

  const handleLabelToggle = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create New Ticket</h1>
        <button
          onClick={() => navigate("/tickets")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Tickets
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter ticket title..."
            maxLength={200}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {title.length}/200 characters
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Describe the issue or request..."
            maxLength={2000}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {description.length}/2000 characters
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Labels (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => handleLabelToggle(label.id)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedLabels.includes(label.id)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {label.name}
              </button>
            ))}
          </div>
          {selectedLabels.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {selectedLabels.length} label(s)
            </p>
          )}
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createTicketMutation.isPending}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/tickets")}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
