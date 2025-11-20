const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');

// Smart recommendations logic
exports.getRecommendations = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check access - allow owner and members
    const userId = String(req.userId);
    const ownerId = String(board.owner);
    const isOwner = ownerId === userId;
    const isMember = board.members && board.members.length > 0 && 
                     board.members.some(m => {
                       const memberId = m._id ? String(m._id) : String(m);
                       return memberId === userId;
                     });
    const hasAccess = isOwner || isMember;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this board',
      });
    }

    const lists = await List.find({ board: boardId })
      .populate({
        path: 'cards',
        populate: {
          path: 'createdBy',
          select: 'name email',
        },
      })
      .sort({ position: 1 });

    const allCards = lists.flatMap(list => 
      list.cards.map(card => ({
        ...card.toObject(),
        listId: list._id.toString(),
        listTitle: list.title,
      }))
    );

    const recommendations = [];

    // 1. Suggested due dates based on card content
    const dueDateSuggestions = analyzeDueDates(allCards, lists);
    recommendations.push(...dueDateSuggestions);

    // 2. Suggested list movements
    const listMovementSuggestions = analyzeListMovements(allCards, lists);
    recommendations.push(...listMovementSuggestions);

    // 3. Related cards suggestions
    const relatedCardsSuggestions = analyzeRelatedCards(allCards);
    recommendations.push(...relatedCardsSuggestions);

    // 4. Overdue cards
    const overdueSuggestions = analyzeOverdueCards(allCards);
    recommendations.push(...overdueSuggestions);

    // 5. Cards without descriptions
    const missingDescriptionSuggestions = analyzeMissingDescriptions(allCards);
    recommendations.push(...missingDescriptionSuggestions);

    // 6. Stale cards (cards that haven't been updated in a while)
    const staleSuggestions = analyzeStaleCards(allCards);
    recommendations.push(...staleSuggestions);

    // Sort recommendations by priority (high -> medium -> low)
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    res.status(200).json({
      success: true,
      data: { recommendations },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recommendations',
    });
  }
};

// Analyze and suggest due dates
function analyzeDueDates(cards, lists) {
  const suggestions = [];
  const keywords = {
    urgent: ['urgent', 'asap', 'as soon as possible', 'immediately', 'critical', 'important', 'priority', 'emergency', 'rush'],
    soon: ['soon', 'quickly', 'this week', 'deadline', 'by friday', 'by end of week', 'needs to be done', 'time sensitive'],
    later: ['later', 'eventually', 'future', 'someday', 'backlog', 'nice to have'],
  };

  cards.forEach(card => {
    if (!card.dueDate) {
      const text = `${card.title} ${card.description || ''}`.toLowerCase();
      let suggestedDays = null;
      let priority = 'medium';
      let reason = '';

      // Check for urgent keywords
      if (keywords.urgent.some(kw => text.includes(kw))) {
        suggestedDays = 1;
        priority = 'high';
        reason = 'Contains urgent keywords (urgent, asap, critical, etc.)';
      } 
      // Check for soon keywords
      else if (keywords.soon.some(kw => text.includes(kw))) {
        suggestedDays = 7;
        priority = 'medium';
        reason = 'Contains time-sensitive keywords (soon, deadline, this week, etc.)';
      } 
      // Check for later keywords
      else if (keywords.later.some(kw => text.includes(kw))) {
        suggestedDays = 30;
        priority = 'low';
        reason = 'Contains keywords suggesting future work';
      }

      // Check for specific date mentions
      const datePatterns = [
        { pattern: /(today|now)/i, days: 0, priority: 'high' },
        { pattern: /(tomorrow|next day)/i, days: 1, priority: 'high' },
        { pattern: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, days: 3, priority: 'medium' },
        { pattern: /(next week|this week)/i, days: 7, priority: 'medium' },
        { pattern: /(next month|this month)/i, days: 30, priority: 'low' },
      ];

      for (const { pattern, days, priority: p } of datePatterns) {
        if (pattern.test(text) && (!suggestedDays || days < suggestedDays)) {
          suggestedDays = days;
          priority = p;
          reason = `Mentions specific time reference`;
          break;
        }
      }

      // Check for numeric days (e.g., "in 3 days", "within 5 days")
      const numericPattern = /(?:in|within|by)\s*(\d+)\s*(?:day|days|week|weeks)/i;
      const numericMatch = text.match(numericPattern);
      if (numericMatch && !suggestedDays) {
        const num = parseInt(numericMatch[1]);
        suggestedDays = text.includes('week') ? num * 7 : num;
        priority = suggestedDays <= 3 ? 'high' : suggestedDays <= 7 ? 'medium' : 'low';
        reason = `Mentions specific timeframe (${num} ${text.includes('week') ? 'week(s)' : 'day(s)'})`;
      }

      if (suggestedDays !== null) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + suggestedDays);
        // Set time to end of day
        dueDate.setHours(23, 59, 59, 999);

        suggestions.push({
          type: 'due_date',
          priority,
          title: 'Suggested Due Date',
          description: `Consider setting a due date for "${card.title}" based on content analysis.`,
          cardId: card._id.toString(),
          cardTitle: card.title,
          suggestedDueDate: dueDate.toISOString(),
          suggestedDays,
          reason,
        });
      }
    }
  });

  return suggestions;
}

// Analyze and suggest list movements
function analyzeListMovements(cards, lists) {
  const suggestions = [];
  
  // Expanded keyword sets for better detection
  const progressKeywords = [
    'started', 'starting', 'working on', 'in progress', 'doing', 'implementing',
    'developing', 'building', 'creating', 'designing', 'coding', 'active',
    'currently', 'now working', 'underway', 'in development', 'wip'
  ];
  
  const doneKeywords = [
    'completed', 'done', 'finished', 'ready', 'deployed', 'released',
    'shipped', 'delivered', 'finalized', 'closed', 'resolved', 'fixed',
    'tested', 'approved', 'accepted', 'merged', 'published', 'live'
  ];

  const todoKeywords = [
    'todo', 'to do', 'pending', 'not started', 'planned', 'scheduled',
    'upcoming', 'future', 'backlog', 'needs work', 'awaiting'
  ];

  cards.forEach(card => {
    const text = `${card.title} ${card.description || ''}`.toLowerCase();
    const currentList = lists.find(l => l._id.toString() === card.listId);
    
    if (!currentList) return;

    const currentListLower = currentList.title.toLowerCase();

    // Check if card should be in "In Progress" or similar
    if (progressKeywords.some(kw => text.includes(kw))) {
      const inProgressList = lists.find(l => {
        const title = l.title.toLowerCase();
        return (title.includes('progress') || title.includes('doing') || 
                title.includes('active') || title.includes('working')) &&
               l._id.toString() !== currentList._id.toString();
      });

      if (inProgressList && !currentListLower.includes('progress') && 
          !currentListLower.includes('done') && !currentListLower.includes('complete')) {
        suggestions.push({
          type: 'list_movement',
          priority: 'high',
          title: 'Move to In Progress',
          description: `"${card.title}" mentions work has started. Consider moving it to "${inProgressList.title}".`,
          cardId: card._id.toString(),
          cardTitle: card.title,
          currentList: currentList.title,
          suggestedList: inProgressList.title,
          suggestedListId: inProgressList._id.toString(),
          reason: 'Content contains keywords indicating work has started (started, working on, implementing, etc.)',
        });
      }
    }

    // Check if card should be in "Done" or similar
    if (doneKeywords.some(kw => text.includes(kw))) {
      const doneList = lists.find(l => {
        const title = l.title.toLowerCase();
        return (title.includes('done') || title.includes('complete') || 
                title.includes('finished')) &&
               l._id.toString() !== currentList._id.toString();
      });

      if (doneList && !currentListLower.includes('done') && 
          !currentListLower.includes('complete')) {
        suggestions.push({
          type: 'list_movement',
          priority: 'high',
          title: 'Move to Done',
          description: `"${card.title}" mentions completion. Consider moving it to "${doneList.title}".`,
          cardId: card._id.toString(),
          cardTitle: card.title,
          currentList: currentList.title,
          suggestedList: doneList.title,
          suggestedListId: doneList._id.toString(),
          reason: 'Content contains keywords indicating completion (completed, done, finished, deployed, etc.)',
        });
      }
    }

    // Check if card in progress/done should be moved back to todo
    if (todoKeywords.some(kw => text.includes(kw)) && 
        (currentListLower.includes('progress') || currentListLower.includes('done'))) {
      const todoList = lists.find(l => {
        const title = l.title.toLowerCase();
        return (title.includes('todo') || title.includes('to do') || 
                title.includes('pending') || title.includes('backlog')) &&
               l._id.toString() !== currentList._id.toString();
      });

      if (todoList) {
        suggestions.push({
          type: 'list_movement',
          priority: 'medium',
          title: 'Move to To Do',
          description: `"${card.title}" mentions it's not started yet. Consider moving it to "${todoList.title}".`,
          cardId: card._id.toString(),
          cardTitle: card.title,
          currentList: currentList.title,
          suggestedList: todoList.title,
          suggestedListId: todoList._id.toString(),
          reason: 'Content contains keywords indicating it should be in todo (todo, pending, not started, etc.)',
        });
      }
    }
  });

  return suggestions;
}

// Analyze related cards
function analyzeRelatedCards(cards) {
  const suggestions = [];
  
  // Stop words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'this', 'that', 'these', 'those', 'is',
    'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might'
  ]);

  // Extract meaningful keywords from cards
  const cardKeywords = {};
  cards.forEach(card => {
    const text = `${card.title} ${card.description || ''}`.toLowerCase();
    // Extract words (3+ characters, not stop words)
    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !stopWords.has(w));
    
    cardKeywords[card._id.toString()] = {
      card,
      keywords: words,
      keywordSet: new Set(words)
    };
  });

  // Find related cards by keyword overlap
  const relatedGroups = [];
  const processed = new Set();

  Object.entries(cardKeywords).forEach(([cardId1, cardData1]) => {
    if (processed.has(cardId1)) return;

    const related = [cardData1.card];
    
    Object.entries(cardKeywords).forEach(([cardId2, cardData2]) => {
      if (cardId1 === cardId2 || processed.has(cardId2)) return;

      // Calculate keyword overlap
      const intersection = new Set(
        [...cardData1.keywordSet].filter(x => cardData2.keywordSet.has(x))
      );
      
      // If significant overlap (at least 2 common keywords or 30% overlap)
      const overlapRatio = intersection.size / Math.min(
        cardData1.keywordSet.size,
        cardData2.keywordSet.size
      );
      
      if (intersection.size >= 2 || (overlapRatio >= 0.3 && intersection.size >= 1)) {
        related.push(cardData2.card);
        processed.add(cardId2);
      }
    });

    if (related.length >= 2) {
      processed.add(cardId1);
      
      // Find most common keyword
      const allKeywords = related.flatMap(c => cardKeywords[c._id.toString()].keywords);
      const keywordFreq = {};
      allKeywords.forEach(kw => {
        keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
      });
      
      const commonKeyword = Object.entries(keywordFreq)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'related topics';

      // Only suggest if cards are in different lists (more useful)
      const uniqueLists = new Set(related.map(c => c.listTitle));
      if (uniqueLists.size > 1 || related.length >= 3) {
        suggestions.push({
          type: 'related_cards',
          priority: 'medium',
          title: 'Related Cards',
          description: `${related.length} card(s) appear to be related based on similar content. Consider grouping them together.`,
          relatedCards: related.map(c => ({
            id: c._id.toString(),
            title: c.title,
            listTitle: c.listTitle,
          })),
          keyword: commonKeyword,
          reason: `Cards share common keywords and themes (e.g., "${commonKeyword}")`,
        });
      }
    }
  });

  return suggestions;
}

// Analyze overdue cards
function analyzeOverdueCards(cards) {
  const suggestions = [];
  const now = new Date();

  cards.forEach(card => {
    if (card.dueDate) {
      const dueDate = new Date(card.dueDate);
      if (dueDate < now) {
        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        suggestions.push({
          type: 'overdue',
          priority: 'high',
          title: 'Overdue Card',
          description: `Card "${card.title}" is ${daysOverdue} day(s) overdue.`,
          cardId: card._id,
          cardTitle: card.title,
          dueDate: card.dueDate,
          daysOverdue,
          reason: `Due date was ${daysOverdue} day(s) ago`,
        });
      }
    }
  });

  return suggestions;
}

// Analyze cards without descriptions
function analyzeMissingDescriptions(cards) {
  const suggestions = [];
  const cardsWithoutDesc = cards.filter(card => !card.description || card.description.trim() === '');

  if (cardsWithoutDesc.length > 0) {
    suggestions.push({
      type: 'missing_description',
      priority: 'low',
      title: 'Cards Without Descriptions',
      description: `${cardsWithoutDesc.length} card(s) don't have descriptions. Adding descriptions can help with better organization and recommendations.`,
      cards: cardsWithoutDesc.map(c => ({
        id: c._id,
        title: c.title,
        listTitle: c.listTitle,
      })),
      count: cardsWithoutDesc.length,
      reason: 'Cards missing descriptions may benefit from additional context',
    });
  }

  return suggestions;
}

// Analyze stale cards (cards that haven't been updated recently)
function analyzeStaleCards(cards) {
  const suggestions = [];
  const now = new Date();
  const staleThreshold = 30; // days
  const veryStaleThreshold = 60; // days

  cards.forEach(card => {
    if (!card.updatedAt) return;
    
    const updatedDate = new Date(card.updatedAt);
    const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
    
    // Only flag cards that are not in "Done" list
    const isInDoneList = card.listTitle && 
      (card.listTitle.toLowerCase().includes('done') || 
       card.listTitle.toLowerCase().includes('complete'));
    
    if (!isInDoneList && daysSinceUpdate >= staleThreshold) {
      const priority = daysSinceUpdate >= veryStaleThreshold ? 'high' : 'medium';
      
      suggestions.push({
        type: 'stale_card',
        priority,
        title: 'Stale Card',
        description: `"${card.title}" hasn't been updated in ${daysSinceUpdate} day(s). Consider reviewing or archiving it.`,
        cardId: card._id.toString(),
        cardTitle: card.title,
        listTitle: card.listTitle,
        daysSinceUpdate,
        reason: `No updates for ${daysSinceUpdate} day(s)`,
      });
    }
  });

  return suggestions;
}

