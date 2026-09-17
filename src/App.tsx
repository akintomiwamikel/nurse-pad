import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import Documents from './pages/Documents'
import NewDocument from './pages/NewDocument'
import AssignmentWorkspace from './pages/AssignmentWorkspace'
import Billing from './pages/Billing'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ResearchLibrary from './pages/ResearchLibrary'
import Notifications from './pages/Notifications'
import CitationManager from './pages/CitationManager'
import ExportCenter from './pages/ExportCenter'
import AIAssistant from './pages/AIAssistant'
import AIHistory from './pages/AIHistory'
import Team from './pages/Team'
import AdminPanel from './pages/AdminPanel'
import AppLayout from './components/AppLayout'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <AppLayout>
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Navigate from the sidebar to explore this section.</p>
      </div>
    </AppLayout>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/editor" element={<RequireAuth><Editor /></RequireAuth>} />
            <Route path="/assignment/:id/editor" element={<RequireAuth><Editor /></RequireAuth>} />
            <Route path="/assignment/:id" element={<RequireAuth><AssignmentWorkspace /></RequireAuth>} />
            <Route path="/documents" element={<RequireAuth><Documents /></RequireAuth>} />
            <Route path="/new-document" element={<RequireAuth><NewDocument /></RequireAuth>} />
            <Route path="/billing" element={<RequireAuth><Billing /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/research" element={<RequireAuth><ResearchLibrary /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
            <Route path="/citations" element={<RequireAuth><CitationManager /></RequireAuth>} />
            <Route path="/export" element={<RequireAuth><ExportCenter /></RequireAuth>} />
            <Route path="/ai-assistant" element={<RequireAuth><AIAssistant /></RequireAuth>} />
            <Route path="/ai-history" element={<RequireAuth><AIHistory /></RequireAuth>} />
            <Route path="/team" element={<RequireAuth><Team /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
            <Route path="/references" element={<RequireAuth><PlaceholderPage title="References" /></RequireAuth>} />
            <Route path="/shared" element={<RequireAuth><PlaceholderPage title="Shared Documents" /></RequireAuth>} />
            <Route path="/templates" element={<RequireAuth><PlaceholderPage title="Templates" /></RequireAuth>} />
            <Route path="/help" element={<RequireAuth><PlaceholderPage title="Help Center" /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
