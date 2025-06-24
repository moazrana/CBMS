import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Sidebar from './../components/sidebar/Sidebar';
import './layout.scss';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-layout">
        <div className="navs">
            <Sidebar />
            <div className="app-main">
                <Navbar />
                <main className="app-content">
                {children}
                </main>
            </div>
        </div>
    </div>
  );
}
