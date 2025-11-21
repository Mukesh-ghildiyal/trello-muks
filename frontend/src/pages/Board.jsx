import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { boardsAPI, listsAPI, cardsAPI, recommendationsAPI } from "@/services/api";

import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Users, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/board/ThemeToggle";

import BoardList from "@/components/board/BoardList";
import CardItem from "@/components/board/CardItem";
import RecommendationsPanel from "@/components/board/RecommendationsPanel";
import AddListDialog from "@/components/board/AddListDialog";
import InviteUserDialog from "@/components/board/InviteUserDialog";
import BoardMembers from "@/components/board/BoardMembers";

const Board = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
      fetchRecommendations();
    }
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const response = await boardsAPI.getBoard(boardId);
      if (response.success) {
        setBoard(response.data.board);
        // Transform lists data to match frontend format
        const transformedLists = (response.data.lists || []).map(list => ({
          id: list._id || list.id,
          title: list.title,
          cards: (list.cards || []).map(card => ({
            id: card._id || card.id,
            title: card.title,
            description: card.description || '',
            listId: list._id || list.id,
            dueDate: card.dueDate,
            createdBy: card.createdBy,
          })),
        }));
        setLists(transformedLists);
      }
    } catch (error) {
      console.error('Error fetching board:', error);
      // Show error message before redirecting
      alert(error.message || 'Failed to load board. Redirecting to dashboard...');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await recommendationsAPI.getRecommendations(boardId);
      if (response.success) {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // When drag starts — store active card
  const handleDragStart = (event) => {
    const { active } = event;
    const card = lists
      .flatMap((list) => list.cards)
      .find((card) => card.id === active.id);

    setActiveCard(card || null);
  };

  // When drag ends — move card
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveCard(null);
    if (!over) return;

    const activeCard = lists
      .flatMap((list) => list.cards)
      .find((card) => card.id === active.id);

    const overList =
      lists.find((list) => list.id === over.id) ||
      lists.find((list) =>
        list.cards.some((card) => card.id === over.id)
      );

    if (!activeCard || !overList) return;

    const overCardIndex = overList.cards.findIndex(
      (card) => card.id === over.id
    );

    // Optimistically update UI
    setLists((prevLists) => {
      const newLists = prevLists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== activeCard.id),
      }));

      const targetListIndex = newLists.findIndex(
        (list) => list.id === overList.id
      );

      // If dropped on empty space
      if (overCardIndex === -1) {
        newLists[targetListIndex].cards.push({
          ...activeCard,
          listId: overList.id,
        });
      } else {
        newLists[targetListIndex].cards.splice(
          overCardIndex,
          0,
          { ...activeCard, listId: overList.id }
        );
      }

      return newLists;
    });

    // Update card position in backend
    try {
      await cardsAPI.updateCard(activeCard.id, {
        listId: overList.id,
        position: overCardIndex === -1 ? overList.cards.length : overCardIndex,
      });
      fetchRecommendations(); // Refresh recommendations after move
    } catch (error) {
      console.error('Error updating card:', error);
      // Revert on error
      fetchBoard();
    }
  };

  const handleAddList = async (title) => {
    try {
      const response = await listsAPI.createList(boardId, title);
      if (response.success) {
        const newList = {
          id: response.data.list._id,
          title: response.data.list.title,
          cards: [],
        };
        setLists([...lists, newList]);
        fetchRecommendations(); // Refresh recommendations
      }
    } catch (error) {
      console.error('Error creating list:', error);
      alert(error.message || 'Failed to create list');
    }
  };

  const handleAddCard = async (listId, title, description) => {
    try {
      const response = await cardsAPI.createCard(listId, title, description);
      if (response.success) {
        const newCard = {
          id: response.data.card._id,
          title: response.data.card.title,
          description: response.data.card.description || '',
          listId: listId,
          dueDate: response.data.card.dueDate,
          createdBy: response.data.card.createdBy,
        };
        setLists(
          lists.map((list) =>
            list.id === listId
              ? { ...list, cards: [...list.cards, newCard] }
              : list
          )
        );
        fetchRecommendations(); // Refresh recommendations
      }
    } catch (error) {
      console.error('Error creating card:', error);
      alert(error.message || 'Failed to create card');
    }
  };

  const handleUpdateCard = async (updatedCard) => {
    try {
      setLists((prevLists) =>
        prevLists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === updatedCard._id || card.id === updatedCard.id
              ? {
                  ...card,
                  title: updatedCard.title,
                  description: updatedCard.description || '',
                  dueDate: updatedCard.dueDate,
                }
              : card
          ),
        }))
      );
      fetchRecommendations(); // Refresh recommendations
    } catch (error) {
      console.error('Error updating card:', error);
      fetchBoard(); // Refresh on error
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      setLists((prevLists) =>
        prevLists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== cardId),
        }))
      );
      fetchRecommendations(); // Refresh recommendations
    } catch (error) {
      console.error('Error deleting card:', error);
      fetchBoard(); // Refresh on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col">
      <header className="bg-gray-800 dark:bg-slate-800 text-white sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2 text-white hover:bg-gray-700 dark:hover:bg-yellow-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-white">
              {board?.name || 'Loading...'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <BoardMembers boardId={boardId} board={board} />
            
            <Button
              variant={showRecommendations ? "default" : "ghost"}
              size="sm"
              onClick={() =>
                setShowRecommendations(!showRecommendations)
              }
              className={`gap-2 font-medium transition-colors ${
                showRecommendations
                  ? 'bg-gray-600 dark:bg-yellow-500 text-white hover:bg-gray-700 dark:hover:bg-yellow-600'
                  : 'text-white hover:bg-blue-500/20 dark:hover:bg-yellow-500/20 hover:text-blue-200 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Insights
            </Button>

            <InviteUserDialog onInviteSent={fetchBoard} />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading board...</div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-x-auto p-4 bg-gray-100 dark:bg-slate-900">
            <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full min-w-max">
              {lists.map((list) => (
                <BoardList
                  key={list.id}
                  list={list}
                  onAddCard={handleAddCard}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                />
              ))}

              <AddListDialog onAddList={handleAddList} />
            </div>

            <DragOverlay>
              {activeCard ? (
                <CardItem card={activeCard} isOverlay />
              ) : null}
            </DragOverlay>
          </DndContext>
          </main>

          {showRecommendations && (
            <aside className="w-80 border-l border-border bg-card flex-shrink-0">
              <RecommendationsPanel 
                lists={lists} 
                recommendations={recommendations}
                onApplyRecommendation={async (type, data) => {
                  // Handle applying recommendations
                  if (type === 'list_movement') {
                    try {
                      await cardsAPI.updateCard(data.cardId, { listId: data.suggestedListId });
                      fetchBoard();
                      fetchRecommendations();
                    } catch (error) {
                      console.error('Error applying recommendation:', error);
                    }
                  } else if (type === 'due_date') {
                    try {
                      await cardsAPI.updateCard(data.cardId, { dueDate: data.suggestedDueDate });
                      fetchBoard();
                      fetchRecommendations();
                    } catch (error) {
                      console.error('Error applying recommendation:', error);
                    }
                  }
                }}
              />
            </aside>
          )}
        </div>
      )}
    </div>
  );
};

export default Board;
