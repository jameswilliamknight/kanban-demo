import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import { type Task as TaskType } from "../types/kanban";

interface TaskProps {
    task: TaskType;
}

const Task = ({ task }: TaskProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(task.content);
    const updateTask = useKanbanStore((state) => state.updateTask);
    const deleteTask = useKanbanStore((state) => state.deleteTask);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        disabled: isEditing,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleSave = () => {
        if (editContent.trim() !== task.content) {
            updateTask(task.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(task.content);
        setIsEditing(false);
    };

    const handleDelete = () => {
        deleteTask(task.id);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="p-3 rounded-lg border-2 border-dashed border-gray-700/30 bg-transparent h-[40px]"
            />
        );
    }

    if (isEditing) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 shadow-sm"
            >
                <textarea
                    autoFocus
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-sm text-gray-200 resize-none focus:outline-none"
                    rows={2}
                />
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={handleSave}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-2 py-1 text-xs border border-gray-600 text-gray-300 rounded hover:bg-gray-700/50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors ml-auto"
                    >
                        Delete
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="p-3 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg cursor-grab border border-gray-600 shadow-sm select-none"
            {...attributes}
            {...listeners}
            onDoubleClick={(e) => {
                console.debug("🖱️ Double Click", {
                    type: e.type,
                    detail: e.detail,
                });
                e.stopPropagation();
                e.preventDefault();
                setIsEditing(true);
            }}
        >
            <p className="text-sm text-gray-200">{task.content}</p>
        </div>
    );
};

export default Task;
