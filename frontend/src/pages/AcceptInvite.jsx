import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { invitesAPI } from '@/services/api';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, checking, success, error, needs-login
  const [message, setMessage] = useState('');
  const [boardId, setBoardId] = useState(null);

  const acceptInvitation = useCallback(async (inviteToken) => {
    if (!inviteToken) {
      setStatus('error');
      setMessage('Invalid invitation token');
      return;
    }

    try {
      setStatus('checking');
      // Clear pending token from localStorage
      localStorage.removeItem('pendingInviteToken');
      
      const response = await invitesAPI.acceptInvite(inviteToken);
      
      if (response.success) {
        setStatus('success');
        setMessage('Invitation accepted successfully!');
        setBoardId(response.data.board._id);
        
        // Redirect to board after 2 seconds
        setTimeout(() => {
          navigate(`/board/${response.data.board._id}`);
        }, 2000);
      } else {
        setStatus('error');
        setMessage(response.message || 'Failed to accept invitation');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to accept invitation. Please try again.');
    }
  }, [navigate]);

  useEffect(() => {
    if (authLoading) return;

    // Get token from URL params or localStorage
    const inviteToken = token || localStorage.getItem('pendingInviteToken');
    
    if (!inviteToken) {
      setStatus('error');
      setMessage('Invalid invitation token');
      return;
    }

    if (!isAuthenticated) {
      // Store token in localStorage to use after login
      if (token) {
        localStorage.setItem('pendingInviteToken', token);
      }
      setStatus('needs-login');
      return;
    }

    // User is authenticated, accept the invite
    // Use token from URL if available, otherwise from localStorage
    const tokenToUse = token || inviteToken;
    acceptInvitation(tokenToUse);
  }, [isAuthenticated, authLoading, token, acceptInvitation]);


  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'needs-login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to accept this board invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Go to Login
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/signup')}
                className="w-full"
              >
                Create Account
              </Button>
            </div>
            <p className="text-sm text-gray-500 text-center">
              After logging in, you'll be automatically redirected to accept the invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-gray-600">Accepting invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <h2 className="text-2xl font-semibold text-gray-800">Success!</h2>
              <p className="text-gray-600 text-center">{message}</p>
              <p className="text-sm text-gray-500 text-center">
                Redirecting to the board...
              </p>
              {boardId && (
                <Button
                  onClick={() => navigate(`/board/${boardId}`)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Go to Board
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <XCircle className="w-16 h-16 text-red-500" />
              <h2 className="text-2xl font-semibold text-gray-800">Error</h2>
              <p className="text-gray-600 text-center">{message}</p>
              <div className="flex flex-col space-y-2 w-full">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AcceptInvite;

