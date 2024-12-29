import { useDroppable } from "@dnd-kit/core";
import { useKanbanStore } from "../store/kanbanStore";
import { type ListId } from "../types/kanban";
import CreateTask from "./CreateTask";
import Task from "./Task";

interface ListProps {
    listId: ListId;
}

const List = ({ listId }: ListProps) => {
    const list = useKanbanStore((state) => state.lists[listId]);
    const { setNodeRef, isOver } = useDroppable({ id: listId });

    if (!list) return null;

    return (
        <div
            ref={setNodeRef}
            className={`bg-gray-800/30 backdrop-blur-sm rounded-lg transition-colors ${
                isOver ? "bg-gray-700/50" : ""
            }`}
        >
            <div className="space-y-2">
                {list.tasks.map((task) => (
                    <Task key={task.id} task={task} />
                ))}
            </div>
            <div className="mt-2 pt-2 border-gray-700">
                <CreateTask listId={listId} />
            </div>
        </div>
    );
};

export default List;
