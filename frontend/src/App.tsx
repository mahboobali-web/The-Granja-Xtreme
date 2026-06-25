import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { GlobalLoader } from './components/Skeletons';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Agentation } from 'agentation';
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Fleet = lazy(() => import('./pages/Fleet').then(module => ({ default: module.Fleet })));
const VehicleDetails = lazy(() => import('./pages/VehicleDetails').then(module => ({ default: module.VehicleDetails })));
const BookingSummary = lazy(() => import('./pages/BookingSummary').then(module => ({ default: module.BookingSummary })));
const CheckoutConfirm = lazy(() => import('./pages/CheckoutConfirm').then(module => ({ default: module.CheckoutConfirm })));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess').then(module => ({ default: module.CheckoutSuccess })));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard').then(module => ({ default: module.CustomerDashboard })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(module => ({ default: module.ResetPassword })));
const Story = lazy(() => import('./pages/Story').then(module => ({ default: module.Story })));
const Contact = lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
import { AdminLayout } from './components/AdminLayout';
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const FleetManager = lazy(() => import('./pages/FleetManager').then(module => ({ default: module.FleetManager })));
const CustomersList = lazy(() => import('./pages/CustomersList').then(module => ({ default: module.CustomersList })));
const CustomerDetails = lazy(() => import('./pages/CustomerDetails').then(module => ({ default: module.CustomerDetails })));
const CmsManager = lazy(() => import('./pages/CmsManager').then(module => ({ default: module.CmsManager })));
const InspectionForm = lazy(() => import('./pages/InspectionForm').then(module => ({ default: module.InspectionForm })));
const AdminBookings = lazy(() => import('./pages/AdminBookings').then(module => ({ default: module.AdminBookings })));
const AdminUpcomingBookings = lazy(() => import('./pages/AdminUpcomingBookings').then(module => ({ default: module.AdminUpcomingBookings })));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics').then(module => ({ default: module.AdminAnalytics })));
const AdminEmployees = lazy(() => import('./pages/AdminEmployees').then(module => ({ default: module.AdminEmployees })));
const AdminSettings = lazy(() => import('./pages/AdminSettings').then(module => ({ default: module.AdminSettings })));
const AdminLogs = lazy(() => import('./pages/AdminLogs').then(module => ({ default: module.AdminLogs })));
const AdminMessages = lazy(() => import('./pages/AdminMessages').then(module => ({ default: module.AdminMessages })));
const AdminPayments = lazy(() => import('./pages/AdminPayments').then(module => ({ default: module.AdminPayments })));
import { fetchAPI } from './utils/api';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
}

function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Do not scroll to top when using back/forward buttons
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}

function Layout({ children, user, handleLogout }: { children: React.ReactNode, user: User | null, handleLogout: () => void }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Header user={user} onLogout={handleLogout} />
      <main style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {children}
      </main>

      <Footer />
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserSession = async () => {
    // If auth state changes to null, clear user
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const data = await fetchAPI('/auth/sync', { method: 'POST' });
          if (data && data.user) {
            setUser(data.user);
          }
        } catch (e) {
          console.error('Failed to sync user', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = checkUserSession();
    return () => {
      unsubscribe.then(unsub => unsub());
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout failed', e);
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-headline)',
        color: 'var(--secondary)',
        fontSize: '24px'
      }}>
        Loading The Granja Xtreme...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout user={user} handleLogout={handleLogout}>
        <Suspense fallback={<GlobalLoader />}><Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/atv/:id" element={<VehicleDetails user={user} />} />
          <Route path="/story" element={<Story />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
          <Route path="/register" element={<Register onLoginSuccess={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Customer Protected routes */}
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/checkout/:bookingId"
            element={user ? <BookingSummary user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/checkout-confirm/:bookingId"
            element={user ? <CheckoutConfirm /> : <Navigate to="/login" />}
          />
          <Route
            path="/checkout-success/:bookingId"
            element={user ? <CheckoutSuccess /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={user ? <CustomerDashboard user={user} /> : <Navigate to="/login" />}
          />

          {/* Admin/Staff Protected routes */}
          <Route
            path="/admin"
            element={
              user && (user.role === 'admin' || user.role === 'staff') ? (
                <AdminLayout user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="fleet" element={<FleetManager />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="upcoming-bookings" element={<AdminUpcomingBookings />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="cms" element={user?.role === 'admin' ? <CmsManager /> : <Navigate to="/admin" />} />
            <Route path="payments" element={user?.role === 'admin' || user?.role === 'staff' ? <AdminPayments /> : <Navigate to="/admin" />} />
            <Route path="employees" element={user?.role === 'admin' ? <AdminEmployees /> : <Navigate to="/admin" />} />
            <Route path="settings" element={user?.role === 'admin' ? <AdminSettings /> : <Navigate to="/admin" />} />
            <Route path="logs" element={user?.role === 'admin' ? <AdminLogs /> : <Navigate to="/admin" />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="inspection/:bookingId" element={<InspectionForm />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes></Suspense>
        {import.meta.env.DEV && <Agentation />}
      </Layout>
    </BrowserRouter>
  );
}

export default App;
