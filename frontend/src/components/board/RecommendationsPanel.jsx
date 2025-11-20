import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, ArrowRight, Link as LinkIcon, AlertCircle, FileText } from 'lucide-react'

const RecommendationsPanel = ({ lists, recommendations = [], onApplyRecommendation }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'due_date':
        return <Calendar className="w-4 h-4" />;
      case 'list_movement':
        return <ArrowRight className="w-4 h-4" />;
      case 'related_cards':
        return <LinkIcon className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      case 'missing_description':
        return <FileText className="w-4 h-4" />;
      case 'stale_card':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">AI Insights</h2>
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="pt-6">
              <CardDescription className="text-center text-sm text-gray-500">
                No recommendations available at the moment. Keep working on your tasks!
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec, index) => (
            <Card key={index} className={`bg-card border ${getPriorityColor(rec.priority)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {getIcon(rec.type)}
                  <CardTitle className="text-base">{rec.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-3">{rec.description}</CardDescription>
                {rec.reason && (
                  <p className="text-xs text-gray-500 mb-3 italic">Reason: {rec.reason}</p>
                )}
                {(rec.type === 'list_movement' || rec.type === 'due_date') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => onApplyRecommendation?.(rec.type, rec)}
                  >
                    Apply Recommendation
                  </Button>
                )}
                {rec.type === 'related_cards' && rec.relatedCards && (
                  <div className="mt-2 space-y-1">
                    {rec.relatedCards.map((card, idx) => (
                      <div key={idx} className="text-xs text-gray-600 bg-white p-2 rounded">
                        • {card.title} ({card.listTitle})
                      </div>
                    ))}
                  </div>
                )}
                {rec.type === 'missing_description' && rec.cards && (
                  <div className="mt-2 space-y-1">
                    {rec.cards.slice(0, 3).map((card, idx) => (
                      <div key={idx} className="text-xs text-gray-600 bg-white p-2 rounded">
                        • {card.title}
                      </div>
                    ))}
                    {rec.count > 3 && (
                      <div className="text-xs text-gray-500 mt-1">
                        +{rec.count - 3} more
                      </div>
                    )}
                  </div>
                )}
                {rec.type === 'stale_card' && (
                  <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded">
                    <div className="font-medium">Location: {rec.listTitle}</div>
                    <div className="text-gray-500">Last updated: {rec.daysSinceUpdate} days ago</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-accent rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          💡 AI insights are generated based on your board activity
        </p>
      </div>
    </div>
  )
}

export default RecommendationsPanel

