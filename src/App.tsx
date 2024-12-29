import KanbanBoard from "./components/KanbanBoard";

const App = () => {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <header className="sticky top-0 z-10 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Kanban Board
                        </h1>
                        <div className="flex items-center gap-4">
                            <button className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors">
                                New Task
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="w-full h-[calc(100vh-4rem)] overflow-hidden">
                <KanbanBoard />
            </main>
        </div>
    );
};

export default App;
