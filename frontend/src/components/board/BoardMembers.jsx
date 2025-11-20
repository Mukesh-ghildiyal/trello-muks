import React, { useState, useEffect } from 'react'
import { Users, User } from 'lucide-react'
import { invitesAPI } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const BoardMembers = ({ boardId, board }) => {
  const [members, setMembers] = useState([])
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (boardId && isOpen) {
      fetchMembers()
    }
  }, [boardId, isOpen])

  // Also update when board prop changes
  useEffect(() => {
    if (board) {
      if (board.owner) {
        setOwner(board.owner)
      }
      if (board.members) {
        setMembers(board.members)
      }
    }
  }, [board])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await invitesAPI.getBoardMembers(boardId)
      if (response.success) {
        setOwner(response.data.owner)
        setMembers(response.data.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalMembers = members.length + (owner ? 1 : 0)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 font-medium text-white hover:bg-gray-700"
          onClick={() => setIsOpen(true)}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">
            {totalMembers > 0 ? `${totalMembers} member${totalMembers !== 1 ? 's' : ''}` : 'Members'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left text-xl font-semibold">Board Members</DialogTitle>
          <DialogDescription className="text-left text-gray-600 mt-2">
            People who have access to this board
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading members...</div>
          ) : (
            <>
              {/* Owner */}
              {owner && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {owner.name ? owner.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{owner.name || 'Owner'}</div>
                    <div className="text-sm text-gray-600">{owner.email}</div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    Owner
                  </span>
                </div>
              )}

              {/* Members */}
              {members.length > 0 ? (
                members.map((member) => (
                  <div
                    key={member._id || member.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{member.name || 'Member'}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                      Member
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No members yet</p>
                  <p className="text-sm mt-1">Invite people to collaborate on this board</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BoardMembers

