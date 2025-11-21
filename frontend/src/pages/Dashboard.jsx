import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Layers, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { boardsAPI } from "@/services/api";
import PendingInvites from "@/components/PendingInvites";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await boardsAPI.getBoards();
      if (response.success) {
        setBoards(response.data.boards);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      try {
        setCreating(true);
        const colors = [
          "from-blue-500 to-indigo-600",
          "from-purple-500 to-pink-600",
          "from-green-500 to-teal-600",
          "from-orange-500 to-red-600",
          "from-cyan-500 to-blue-600",
          "from-pink-500 to-rose-600",
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];
        const response = await boardsAPI.createBoard(newBoardName, newBoardDescription, color);
        
        if (response.success) {
          setBoards([...boards, response.data.board]);
          setNewBoardName("");
          setNewBoardDescription("");
          setIsDialogOpen(false);
        }
      } catch (error) {
        console.error('Error creating board:', error);
        alert(error.message || 'Failed to create board');
      } finally {
        setCreating(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-board-bg">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">TaskBoard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <PendingInvites />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">My Boards</h2>
            <p className="text-muted-foreground">Manage your projects and tasks</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
                <DialogDescription>Add a new board to organize your tasks</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="board-name">Board Name</Label>
                  <Input
                    id="board-name"
                    placeholder="e.g., Product Roadmap"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateBoard();
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="board-description">Description (Optional)</Label>
                  <Input
                    id="board-description"
                    placeholder="e.g., Q1 2024 Features"
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateBoard();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleCreateBoard} className="w-full" variant="hero" disabled={creating}>
                  {creating ? "Creating..." : "Create Board"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-muted-foreground">Loading boards...</div>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No boards yet</h3>
            <p className="text-muted-foreground mb-6">Create your first board to get started</p>
            <Button variant="hero" size="lg" onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              Create Board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boards.map((board) => (
              <Card
                key={board.id}
                className="group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-border overflow-hidden"
                onClick={() => navigate(`/board/${board._id}`)}
              >
                <div className={`h-32 bg-gradient-to-br ${board.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {board.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {board.description || "No description"}
                  </CardDescription>
                  <div className="text-xs text-muted-foreground mt-2">
                    {board.members?.length > 0 && `${board.members.length} member(s)`}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
