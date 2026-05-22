import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RecipeHub from './pages/RecipeHub'
import CategoryView from './pages/CategoryView'
import RecipeDetail from './pages/RecipeDetail'
import RecipeEditor from './pages/RecipeEditor'
import SmokingDiary from './pages/SmokingDiary'
import PrintAll from './pages/PrintAll'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<RecipeHub />} />
          <Route path="/category/:id" element={<CategoryView />} />
          <Route path="/recipe/new" element={<RecipeEditor />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/recipe/:id/edit" element={<RecipeEditor />} />
          <Route path="/denik" element={<SmokingDiary />} />
          <Route path="/print" element={<PrintAll />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
