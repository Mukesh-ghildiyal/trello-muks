import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle2, X, Loader2 } from 'lucide-react'
import { invitesAPI } from '@/services/api'

const PendingInvites = () => {
  const navigate = useNavigate()
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)

  useEffect(() => {
    fetchInvites()
  }, [])

  const fetchInvites = async () => {
    try {
      setLoading(true)
      const response = await invitesAPI.getMyPendingInvites()
      if (response.success) {
        setInvites(response.data.invites || [])
      }
    } catch (error) {
      console.error('Error fetching invites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (token) => {
    try {
      setAccepting(token)
      const response = await invitesAPI.acceptInvite(token)
      if (response.success) {
        // Remove accepted invite from list
        setInvites(prev => prev.filter(inv => inv.token !== token))
        // Navigate to the board
        if (response.data?.board?._id) {
          navigate(`/board/${response.data.board._id}`)
        } else {
          // Refresh the list
          fetchInvites()
        }
      }
    } catch (error) {
      console.error('Error accepting invite:', error)
      alert(error.message || 'Failed to accept invitation')
    } finally {
      setAccepting(null)
    }
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading invitations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (invites.length === 0) {
    return null
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">Pending Invitations</CardTitle>
        </div>
        <CardDescription>
          You have {invites.length} pending invitation{invites.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invites.map((invite) => (
            <div
              key={invite._id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {invite.board?.name || 'Unknown Board'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Invited by {invite.invitedBy?.name || 'Someone'}
                  {invite.board?.description && (
                    <span className="text-gray-500"> • {invite.board.description}</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleAccept(invite.token)}
                disabled={accepting === invite.token}
                className="ml-4 bg-blue-600 hover:bg-blue-700"
              >
                {accepting === invite.token ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PendingInvites

