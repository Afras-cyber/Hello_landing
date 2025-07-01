
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminServices from '@/pages/admin/AdminServices';
import AdminServiceDetail from '@/pages/admin/AdminServiceDetail';
import AdminSpecialists from '@/pages/admin/AdminSpecialists';
import AdminSpecialistDetail from '@/pages/admin/AdminSpecialistDetail';
import AdminSalons from '@/pages/admin/AdminSalons';
import AdminShades from '@/pages/admin/AdminShades';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminBlogEditor from '@/pages/admin/AdminBlogEditor';
import AdminFAQ from '@/pages/admin/AdminFAQ';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminPages from '@/pages/admin/AdminPages';
import AdminBookingAnalytics from '@/pages/admin/AdminBookingAnalytics';
import AdminCampaigns from '@/pages/admin/AdminCampaigns';
import AdminCampaignDetail from '@/pages/admin/AdminCampaignDetail';
import AdminNewsletterSettings from '@/pages/admin/AdminNewsletterSettings';
import AdminCareers from '@/pages/admin/AdminCareers';
import AdminPortfolio from '@/pages/admin/AdminPortfolio';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="services" element={<AdminServices />} />
      <Route path="services/:id" element={<AdminServiceDetail />} />
      <Route path="specialists" element={<AdminSpecialists />} />
      <Route path="specialists/:id" element={<AdminSpecialistDetail />} />
      <Route path="salons" element={<AdminSalons />} />
      <Route path="shades" element={<AdminShades />} />
      <Route path="blog" element={<AdminBlog />} />
      <Route path="blog/new" element={<AdminBlogEditor />} />
      <Route path="blog/:id" element={<AdminBlogEditor />} />
      <Route path="faq" element={<AdminFAQ />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="pages" element={<AdminPages />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="campaigns" element={<AdminCampaigns />} />
      <Route path="campaigns/:id" element={<AdminCampaignDetail />} />
      <Route path="newsletter" element={<AdminNewsletterSettings />} />
      <Route path="careers" element={<AdminCareers />} />
      <Route path="portfolio" element={<AdminPortfolio />} />
    </Routes>
  );
};

export default AdminRoutes;
