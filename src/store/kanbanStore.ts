import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
    INITIAL_LISTS,
    LIST_TITLES,
    type ListId,
    type Lists,
    type Task,
    type TaskId,
} from "../types/kanban";

interface KanbanState {
    version: number;
    lastSynced: string | null;
    lists: Lists;
    initializeLists: () => void;
    addTask: (listId: ListId, content: string) => void;
    updateTask: (taskId: TaskId, content: string) => void;
    deleteTask: (taskId: TaskId) => void;
    moveTask: (
        taskId: TaskId,
        fromListId: ListId,
        toListId: ListId,
        newIndex: number
    ) => void;
    reorderTask: (listId: ListId, oldIndex: number, newIndex: number) => void;
    syncWithRemote?: () => Promise<void>; // Will be implemented later for remote sync
}

const STORE_VERSION = 1;
const STORE_NAME = "kanban-store";

export const useKanbanStore = create<KanbanState>()(
    persist(
        (set) => ({
            version: STORE_VERSION,
            lastSynced: null,
            lists: {},

            initializeLists: () => {
                set((state) => {
                    // If we already have lists, don't reinitialize
                    if (Object.keys(state.lists).length > 0) {
                        return state;
                    }

                    const initialLists: Lists = {};
                    INITIAL_LISTS.forEach((listId) => {
                        initialLists[listId] = {
                            id: listId,
                            title: LIST_TITLES[listId],
                            tasks: [],
                        };
                    });
                    return {
                        lists: initialLists,
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            addTask: (listId, content) => {
                set((state) => {
                    const newTask: Task = {
                        id: crypto.randomUUID(),
                        content,
                        listId,
                        order: state.lists[listId]?.tasks.length ?? 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };

                    return {
                        lists: {
                            ...state.lists,
                            [listId]: {
                                ...state.lists[listId]!,
                                tasks: [
                                    ...(state.lists[listId]?.tasks ?? []),
                                    newTask,
                                ],
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            updateTask: (taskId, content) => {
                set((state) => {
                    const listId = Object.keys(state.lists).find((lid) =>
                        state.lists[lid as ListId]?.tasks.some(
                            (t) => t.id === taskId
                        )
                    ) as ListId;

                    if (!listId || !state.lists[listId]) return state;

                    return {
                        lists: {
                            ...state.lists,
                            [listId]: {
                                ...state.lists[listId]!,
                                tasks: state.lists[listId]!.tasks.map((t) =>
                                    t.id === taskId
                                        ? {
                                              ...t,
                                              content,
                                              updatedAt:
                                                  new Date().toISOString(),
                                          }
                                        : t
                                ),
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            deleteTask: (taskId) => {
                set((state) => {
                    const listId = Object.keys(state.lists).find((lid) =>
                        state.lists[lid as ListId]?.tasks.some(
                            (t) => t.id === taskId
                        )
                    ) as ListId;

                    if (!listId || !state.lists[listId]) return state;

                    return {
                        lists: {
                            ...state.lists,
                            [listId]: {
                                ...state.lists[listId]!,
                                tasks: state.lists[listId]!.tasks.filter(
                                    (t) => t.id !== taskId
                                ),
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            moveTask: (taskId, fromListId, toListId, newIndex) => {
                set((state) => {
                    const fromList = state.lists[fromListId];
                    const toList = state.lists[toListId];
                    if (!fromList || !toList) return state;

                    const taskIndex = fromList.tasks.findIndex(
                        (t) => t.id === taskId
                    );
                    if (taskIndex === -1) return state;

                    const [task] = fromList.tasks.splice(taskIndex, 1) as [
                        Task
                    ];
                    const updatedTask = {
                        ...task,
                        listId: toListId,
                        updatedAt: new Date().toISOString(),
                    };
                    toList.tasks.splice(newIndex, 0, updatedTask);

                    return {
                        lists: {
                            ...state.lists,
                            [fromListId]: {
                                ...fromList,
                                tasks: fromList.tasks.map((t, i) => ({
                                    ...t,
                                    order: i,
                                })),
                            },
                            [toListId]: {
                                ...toList,
                                tasks: toList.tasks.map((t, i) => ({
                                    ...t,
                                    order: i,
                                })),
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },

            reorderTask: (listId, oldIndex, newIndex) => {
                set((state) => {
                    const list = state.lists[listId];
                    if (!list) return state;

                    const tasks = [...list.tasks];
                    const [task] = tasks.splice(oldIndex, 1);
                    if (!task) return state;

                    tasks.splice(newIndex, 0, {
                        ...task,
                        updatedAt: new Date().toISOString(),
                    });

                    return {
                        lists: {
                            ...state.lists,
                            [listId]: {
                                ...list,
                                tasks: tasks.map((t, i) => ({
                                    ...t,
                                    order: i,
                                })),
                            },
                        },
                        lastSynced: new Date().toISOString(),
                    };
                });
            },
        }),
        {
            name: STORE_NAME,
            storage: createJSONStorage(() => localStorage),
            version: STORE_VERSION,
            onRehydrateStorage: () => () => {
                // No-op
            },
            migrate: (persistedState: any, version: number) => {
                if (version < STORE_VERSION) {
                    // Handle future migrations here
                    return {
                        ...persistedState,
                        version: STORE_VERSION,
                    };
                }
                return persistedState;
            },
        }
    )
);
