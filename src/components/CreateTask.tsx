import { useState } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId } from "../types/kanban";

interface CreateTaskProps {
    listId: ListId;
}

const CreateTask = ({ listId }: CreateTaskProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState("");
    const addTask = useKanbanStore((state) => state.addTask);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            addTask(listId, content.trim());
            setContent("");
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (!isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="w-full text-left text-gray-400 hover:text-gray-300 p-2 rounded hover:bg-gray-700/50 transition-colors"
            >
                + Add a task
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-2">
            <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter task content..."
                className="w-full p-2 bg-gray-700/50 text-gray-200 placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
            />
            <div className="flex gap-2 mt-2">
                <button
                    type="submit"
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Add
                </button>
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default CreateTask;
