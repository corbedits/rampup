import { useState, useEffect } from 'react'
import { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from './firebase'
import './App.css'

// Email data structure
const emails = {
  coldProspects: [
    { id: 'cold-1', name: '01 - Pattern Interrupt', file: '01-pattern-interrupt.html', subject: 'Finally, a booking system that knows cars.' },
    { id: 'cold-1b', name: '01B - Reactive Follow-up', file: '01b-reactive-followup.html', subject: 'Are you missing bookings when you\'re closed?' },
    { id: 'cold-2', name: '02 - Service Advisor', file: '02-service-advisor.html', subject: 'Meet your new Service Advisor.' },
    { id: 'cold-3', name: '03 - Authority & Trust', file: '03-authority-trust.html', subject: 'Why we built this from scratch.' },
    { id: 'cold-4', name: '04 - Financials', file: '04-financials.html', subject: 'Keep 100% of what you earn.' },
    { id: 'cold-5', name: '05 - Closer', file: '05-closer.html', subject: 'Don\'t miss your launch offer (50% Off)' },
  ],
  existingClients: [
    { id: 'existing-1', name: '01 - Evolution', file: '01-evolution.html', subject: 'Meet your new Service Advisor.' },
    { id: 'existing-1b', name: '01B - Reactive Follow-up', file: '01b-reactive-followup.html', subject: 'A quick upgrade for {{Garage Name}}...' },
    { id: 'existing-2', name: '02 - Zero Friction', file: '02-zero-friction.html', subject: 'We do the work. You get the bookings.' },
    { id: 'existing-3', name: '03 - Closer', file: '03-closer.html', subject: 'Your 3 months free access.' },
  ]
}

function App() {
  const [selectedEmail, setSelectedEmail] = useState(emails.coldProspects[0])
  const [selectedFunnel, setSelectedFunnel] = useState('coldProspects')
  const [viewMode, setViewMode] = useState('desktop')
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  const [userName, setUserName] = useState(() => localStorage.getItem('gso-reviewer-name') || '')
  const [showNamePrompt, setShowNamePrompt] = useState(!localStorage.getItem('gso-reviewer-name'))

  // Subscribe to comments from Firestore
  useEffect(() => {
    const commentsRef = collection(db, 'comments', selectedEmail.id, 'items')
    const q = query(commentsRef, orderBy('timestamp', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setComments(commentsList)
    }, (error) => {
      console.error("Error fetching comments:", error)
    })

    return () => unsubscribe()
  }, [selectedEmail.id])

  const handleSaveName = () => {
    if (userName.trim()) {
      localStorage.setItem('gso-reviewer-name', userName.trim())
      setShowNamePrompt(false)
    }
  }

  const handleAddComment = async () => {
    if (newComment.trim() && userName) {
      try {
        const commentsRef = collection(db, 'comments', selectedEmail.id, 'items')
        await addDoc(commentsRef, {
          text: newComment.trim(),
          author: userName,
          timestamp: Date.now(),
          resolved: false,
          emailName: selectedEmail.name
        })
        setNewComment('')
        setShowCommentForm(false)
      } catch (error) {
        console.error("Error adding comment:", error)
        alert("Error adding comment. Check console for details.")
      }
    }
  }

  const handleResolveComment = async (commentId, currentStatus) => {
    try {
      const commentRef = doc(db, 'comments', selectedEmail.id, 'items', commentId)
      await updateDoc(commentRef, {
        resolved: !currentStatus,
        resolvedBy: !currentStatus ? userName : null,
        resolvedAt: !currentStatus ? Date.now() : null
      })
    } catch (error) {
      console.error("Error resolving comment:", error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        const commentRef = doc(db, 'comments', selectedEmail.id, 'items', commentId)
        await deleteDoc(commentRef)
      } catch (error) {
        console.error("Error deleting comment:", error)
      }
    }
  }

  const getEmailPath = (email) => {
    const folder = selectedFunnel === 'coldProspects' ? 'COLD PROSPECTS' : 'EXISTING CLIENTS'
    return `${folder}/${email.file}`
  }

  const handlePrevious = () => {
    const currentList = emails[selectedFunnel]
    const currentIndex = currentList.findIndex(e => e.id === selectedEmail.id)
    if (currentIndex > 0) {
      setSelectedEmail(currentList[currentIndex - 1])
    }
  }

  const handleNext = () => {
    const currentList = emails[selectedFunnel]
    const currentIndex = currentList.findIndex(e => e.id === selectedEmail.id)
    if (currentIndex < currentList.length - 1) {
      setSelectedEmail(currentList[currentIndex + 1])
    }
  }

  const currentList = emails[selectedFunnel]
  const currentIndex = currentList.findIndex(e => e.id === selectedEmail.id)
  const activeComments = comments.filter(c => !c.resolved)
  const resolvedComments = comments.filter(c => c.resolved)

  // Name prompt modal
  if (showNamePrompt) {
    return (
      <div className="name-prompt-overlay">
        <div className="name-prompt-modal">
          <h2>👋 Welcome to the Email Reviewer</h2>
          <p>Please enter your name to leave comments:</p>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name..."
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            autoFocus
          />
          <button onClick={handleSaveName} disabled={!userName.trim()}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img
            src="https://garage-services-online.co.uk/wp-content/uploads/2018/09/Logo_RGB_reverse.png"
            alt="GSO"
            className="logo"
          />
          <h1>RampUp Email Campaign</h1>
        </div>
        <div className="header-right">
          <span className="user-badge">👤 {userName}</span>
          <div className="view-toggle">
            <button
              className={viewMode === 'desktop' ? 'active' : ''}
              onClick={() => setViewMode('desktop')}
            >
              🖥️ Desktop
            </button>
            <button
              className={viewMode === 'mobile' ? 'active' : ''}
              onClick={() => setViewMode('mobile')}
            >
              📱 Mobile
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="funnel-tabs">
            <button
              className={selectedFunnel === 'coldProspects' ? 'active' : ''}
              onClick={() => {
                setSelectedFunnel('coldProspects')
                setSelectedEmail(emails.coldProspects[0])
              }}
            >
              Cold Prospects
              <span className="badge">50% Off</span>
            </button>
            <button
              className={selectedFunnel === 'existingClients' ? 'active' : ''}
              onClick={() => {
                setSelectedFunnel('existingClients')
                setSelectedEmail(emails.existingClients[0])
              }}
            >
              Existing Clients
              <span className="badge green">3 Mo Free</span>
            </button>
          </div>

          <div className="email-list">
            {emails[selectedFunnel].map((email, index) => (
              <div
                key={email.id}
                className={`email-item ${selectedEmail.id === email.id ? 'active' : ''}`}
                onClick={() => setSelectedEmail(email)}
              >
                <div className="email-number">{index + 1}</div>
                <div className="email-info">
                  <div className="email-name">{email.name}</div>
                  <div className="email-subject">{email.subject}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Preview Area */}
        <main className="preview-area">
          <div className="preview-header">
            <div className="preview-info">
              <h2>{selectedEmail.name}</h2>
              <p className="subject-line">Subject: {selectedEmail.subject}</p>
            </div>
            <div className="preview-nav">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="nav-btn"
              >
                ← Previous
              </button>
              <span className="email-counter">
                {currentIndex + 1} of {currentList.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === currentList.length - 1}
                className="nav-btn"
              >
                Next →
              </button>
            </div>
          </div>

          <div className={`preview-frame-container ${viewMode}`}>
            <iframe
              key={selectedEmail.id + viewMode}
              src={getEmailPath(selectedEmail)}
              className="preview-frame"
              title="Email Preview"
            />
          </div>
        </main>

        {/* Comments Panel */}
        <aside className="comments-panel">
          <div className="comments-header">
            <h3>💬 Comments</h3>
            <span className="comment-count">{activeComments.length} active</span>
          </div>

          <button
            className="add-comment-btn"
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            {showCommentForm ? '✕ Cancel' : '+ Add Comment'}
          </button>

          {showCommentForm && (
            <div className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your feedback here..."
                rows={3}
                autoFocus
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="submit-comment-btn"
              >
                Submit Comment
              </button>
            </div>
          )}

          <div className="comments-list">
            {activeComments.length === 0 && !showCommentForm && (
              <p className="no-comments">No comments yet for this email.</p>
            )}

            {activeComments.map(comment => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-time">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-actions">
                  <button
                    className="resolve-btn"
                    onClick={() => handleResolveComment(comment.id, comment.resolved)}
                  >
                    ✓ Resolve
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {resolvedComments.length > 0 && (
            <div className="resolved-section">
              <button
                className="toggle-resolved"
                onClick={() => setShowResolved(!showResolved)}
              >
                {showResolved ? '▼' : '▶'} Resolved ({resolvedComments.length})
              </button>

              {showResolved && (
                <div className="resolved-list">
                  {resolvedComments.map(comment => (
                    <div key={comment.id} className="comment-card resolved">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="resolved-badge">✓ Resolved by {comment.resolvedBy}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-actions">
                        <button
                          className="unresolve-btn"
                          onClick={() => handleResolveComment(comment.id, comment.resolved)}
                        >
                          ↩ Reopen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
