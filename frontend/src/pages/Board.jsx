import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

import BoardList from "@/components/board/BoardList";
import CardItem from "@/components/board/CardItem";
import RecommendationsPanel from "@/components/board/RecommendationsPanel";
import AddListDialog from "@/components/board/AddListDialog";
import InviteUserDialog from "@/components/board/InviteUserDialog";

const Board = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const [lists, setLists] = useState([
    {
      id: "1",
      title: "To Do",
      cards: [
        {
          id: "c1",
          title: "Design landing page",
          description:
            "Create wireframes and mockups - urgent deadline by Friday",
          listId: "1",
        },
        {
          id: "c2",
          title: "Setup database schema",
          description: "Configure PostgreSQL for user authentication",
          listId: "1",
        },
        {
          id: "c5",
          title: "Write API documentation",
          description:
            "Document all authentication endpoints - started working on this",
          listId: "1",
        },
      ],
    },
    {
      id: "2",
      title: "In Progress",
      cards: [
        {
          id: "c3",
          title: "Implement authentication",
          description:
            "JWT based authentication system - almost completed and ready for review",
          listId: "2",
        },
        {
          id: "c6",
          title: "User profile page",
          description:
            "Building user profile with authentication integration",
          listId: "2",
        },
      ],
    },
    {
      id: "3",
      title: "Done",
      cards: [
        {
          id: "c4",
          title: "Project setup",
          description:
            "Initial setup completed with React and TypeScript",
          listId: "3",
        },
      ],
    },
  ]);

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
  const handleDragEnd = (event) => {
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

    setLists((prevLists) => {
      const newLists = prevLists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== activeCard.id),
      }));

      const targetListIndex = newLists.findIndex(
        (list) => list.id === overList.id
      );

      const overCardIndex = overList.cards.findIndex(
        (card) => card.id === over.id
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
  };

  const handleAddList = (title) => {
    const newList = {
      id: Date.now().toString(),
      title,
      cards: [],
    };

    setLists([...lists, newList]);
  };

  const handleAddCard = (listId, title, description) => {
    const newCard = {
      id: Date.now().toString(),
      title,
      description,
      listId,
    };

    setLists(
      lists.map((list) =>
        list.id === listId
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      )
    );
  };

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Product Roadmap
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showRecommendations ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                setShowRecommendations(!showRecommendations)
              }
              className="gap-2 font-medium"
            >
              <Sparkles className="w-4 h-4" />
              AI Insights
            </Button>

            <InviteUserDialog />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-x-auto p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 h-full min-w-max">
              {lists.map((list) => (
                <BoardList
                  key={list.id}
                  list={list}
                  onAddCard={handleAddCard}
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
            <RecommendationsPanel lists={lists} />
          </aside>
        )}
      </div>
    </div>
  );
};

export default Board;
