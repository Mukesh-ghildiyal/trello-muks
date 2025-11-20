import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

const RecommendationsPanel = ({ lists }) => {
  // Calculate some basic recommendations
  const totalCards = lists.reduce((sum, list) => sum + list.cards.length, 0)
  const inProgressCards = lists.find(list => list.title.toLowerCase().includes('progress'))?.cards.length || 0
  const doneCards = lists.find(list => list.title.toLowerCase().includes('done'))?.cards.length || 0

  const recommendations = [
    {
      title: 'Progress Update',
      description: `You have ${inProgressCards} tasks in progress. Consider focusing on completing these before starting new ones.`,
      type: 'info',
    },
    {
      title: 'Productivity Tip',
      description: `You've completed ${doneCards} tasks. Great progress! Keep up the momentum.`,
      type: 'success',
    },
    {
      title: 'Workload Balance',
      description: `Total of ${totalCards} cards across all lists. Consider breaking down larger tasks into smaller, manageable cards.`,
      type: 'suggestion',
    },
  ]

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">AI Insights</h2>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <Card key={index} className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{rec.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">{rec.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
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

