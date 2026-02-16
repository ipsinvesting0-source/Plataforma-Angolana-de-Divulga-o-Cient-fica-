import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/ui/Toast';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { PublicationDetails } from './pages/PublicationDetails';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Contact } from './pages/Contact';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pesquisas" element={<Search />} />
            <Route path="/publicacao/:id" element={<PublicationDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/gestao-padc" element={<Login isAdminRoute={true} />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;