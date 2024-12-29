import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { useKanbanStore } from "../store/kanbanStore";
import {
    INITIAL_LISTS,
    type ListId,
    type Lists,
    type Task as TaskType,
} from "../types/kanban";
import List from "./List";

export default function KanbanBoard() {
    const { lists, initializeLists, moveTask, reorderTask } = useKanbanStore();
    const [activeTask, setActiveTask] = useState<TaskType | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Add delay to allow double click to be detected
            activationConstraint: {
                delay: 200,
                tolerance: 5,
                distance: 1, // Add minimum distance constraint
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        console.debug("🎯 Sensors configured:", sensors);
    }, [sensors]);

    useEffect(() => {
        // Only initialize if we're starting fresh
        initializeLists();
    }, []); // Remove initializeLists from deps since it's stable

    const findListByTaskId = (allLists: Lists, taskId: string) => {
        return Object.values(allLists).find((list) =>
            list?.tasks.some((task) => task.id === taskId)
        );
    };

    const handleDragStart = (event: DragStartEvent) => {
        console.debug("🎯 Drag Start:", event);
        const { active } = event;
        const activeList = findListByTaskId(lists, active.id as string);
        if (!activeList) return;

        const task = activeList.tasks.find((t) => t.id === active.id);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        console.debug("🎯 Drag Over:", event);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the list containing the dragged item
        const activeList = findListByTaskId(lists, activeId);
        if (!activeList) return;

        // If dropping over a list
        if (INITIAL_LISTS.includes(overId as ListId)) {
            const overList = lists[overId as ListId];
            if (!overList || activeList.id === overList.id) return;
            moveTask(
                activeId,
                activeList.id,
                overList.id,
                overList.tasks.length
            );
            return;
        }

        // If dropping over another task
        const overList = findListByTaskId(lists, overId);
        if (!overList) return;

        if (activeList.id !== overList.id) {
            const overIndex = overList.tasks.findIndex((t) => t.id === overId);
            const finalIndex =
                overIndex === -1 ? overList.tasks.length : overIndex;
            moveTask(activeId, activeList.id, overList.id, finalIndex);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeList = findListByTaskId(lists, activeId);
        if (!activeList) return;

        // If dropping over a list
        if (INITIAL_LISTS.includes(overId as ListId)) {
            const overList = lists[overId as ListId];
            if (!overList || activeList.id === overList.id) return;
            moveTask(
                activeId,
                activeList.id,
                overList.id,
                overList.tasks.length
            );
            return;
        }

        // If dropping over another task
        const overList = findListByTaskId(lists, overId);
        if (!overList) return;

        if (activeList.id === overList.id) {
            const oldIndex = activeList.tasks.findIndex(
                (t) => t.id === activeId
            );
            const newIndex = overList.tasks.findIndex((t) => t.id === overId);
            if (oldIndex !== newIndex) {
                reorderTask(activeList.id, oldIndex, newIndex);
            }
        } else {
            const overIndex = overList.tasks.findIndex((t) => t.id === overId);
            const finalIndex =
                overIndex === -1 ? overList.tasks.length : overIndex;
            moveTask(activeId, activeList.id, overList.id, finalIndex);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="h-[calc(100vh-8rem)] flex flex-col">
                <div className="flex-1 overflow-x-auto">
                    <div className="inline-flex gap-6 p-6">
                        {INITIAL_LISTS.map((listId: ListId) => {
                            const taskIds =
                                lists[listId]?.tasks.map((t) => t.id) || [];
                            return (
                                <div key={listId} className="w-80">
                                    <div className="mb-3">
                                        <h2 className="font-bold text-xl">
                                            {lists[listId]?.title ??
                                                listId.toUpperCase()}
                                        </h2>
                                    </div>
                                    <SortableContext
                                        items={taskIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <List listId={listId} />
                                    </SortableContext>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <DragOverlay>
                {activeTask ? (
                    <div className="p-3 bg-gray-700 rounded-lg border border-gray-500 shadow-lg cursor-grabbing">
                        <p className="text-sm text-gray-200">
                            {activeTask.content}
                        </p>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
