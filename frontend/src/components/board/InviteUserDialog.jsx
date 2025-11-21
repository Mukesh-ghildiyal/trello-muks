import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Mail, X } from 'lucide-react'
import { invitesAPI } from '@/services/api'

const InviteUserDialog = ({ onInviteSent }) => {
  const { boardId } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess(false)
      const response = await invitesAPI.sendInvite(boardId, email.trim())
      if (response.success) {
        setSuccess(true)
        setEmail('')
        // Call callback to refresh board/members
        if (onInviteSent) {
          onInviteSent()
        }
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
        }, 2000)
      } else {
        setError(response.message || 'Failed to send invitation')
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to send invitation'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDialogChange = (open) => {
    setIsOpen(open)
    if (!open) {
      // Reset form when dialog closes
      setEmail('')
      setError('')
      setSuccess(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 font-medium text-white hover:bg-gray-700"
        >
          <Users className="w-4 h-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <DialogHeader>
          <DialogTitle className="text-left text-xl font-semibold">Invite User to Board</DialogTitle>
          <DialogDescription className="text-left text-gray-600 mt-2">
            Share this board with team members via email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              Invitation sent successfully!
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                required
                className="pl-10 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default InviteUserDialog

