import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AboutPage } from '@pages/about'
import { HomePage } from '@pages/home'
import { QuizPage } from '@pages/quiz'
import { SettingsPage } from '@pages/settings'
import { AppLayout } from '@widgets/app-layout'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="quiz/:stack/:topic/:level" element={<QuizPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
