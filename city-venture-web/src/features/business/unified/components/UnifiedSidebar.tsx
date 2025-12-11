/**
 * UnifiedSidebar - Capability-based navigation sidebar
 * Dynamically shows/hides navigation items based on business capabilities and user roles
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, X, ChevronDown } from 'lucide-react';

import logo from '@/src/assets/logo/city-ventures-main.png';
import '@/src/components/Business/Sidebar.css';

import { useAuth } from '@/src/context/AuthContext';
import useRBAC from '@/src/hooks/useRBAC';
import { useBusinessCapabilities } from '../hooks/useBusinessCapabilities';
import { navigationConfig, getFilteredNavigation } from '../config/navigation';
import type { NavItemConfig } from '../types';

const ICON_SIZE = 24;

interface UnifiedSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function UnifiedSidebar({
  isOpen = false,
  onClose,
}: UnifiedSidebarProps): React.ReactElement {
  const { logout } = useAuth();
  const { hasRole, canAny } = useRBAC();
  const navigate = useNavigate();
  const location = useLocation();
  const capabilities = useBusinessCapabilities();
  
  const route = '/business';
  
  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Auto-expand sections when navigating within them
  useEffect(() => {
    navigationConfig.forEach(item => {
      if (item.isSection && item.children) {
        const isInSection = item.children.some(child => 
          location.pathname.startsWith(child.path)
        );
        if (isInSection) {
          setExpandedSections(prev => new Set([...prev, item.id]));
        }
      }
    });
  }, [location.pathname]);
  
  // Get filtered navigation items based on capabilities and roles
  const filteredNavItems = getFilteredNavigation(capabilities, [], hasRole, canAny);
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };
  
  return (
    <aside className={`sidebar business-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Mobile close button */}
      <button
        className="sidebar-close"
        onClick={onClose}
        aria-label="Close sidebar"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 2,
        }}
      >
        <X size={20} />
      </button>
      
      {/* Brand header */}
      <div
        className="sidebar-brand"
        onClick={() => {
          navigate(`${route}/dashboard`);
          onClose?.();
        }}
        style={{ cursor: 'pointer' }}
      >
        <img src={logo} alt="City Ventures" className="sidebar-brand-icon" />
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-title">CITY VENTURES</div>
          <div className="sidebar-brand-subtitle">for Business</div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="sidebar-nav">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {filteredNavItems.map(item => (
            <NavItemRenderer
              key={item.id}
              item={item}
              isExpanded={expandedSections.has(item.id)}
              onToggle={() => toggleSection(item.id)}
              onClose={onClose}
            />
          ))}
        </div>
        
        {/* Logout button */}
        <div
          className="sidebar-logout"
          style={{ marginTop: 'auto', paddingTop: '8px' }}
        >
          <NavItem
            label="Log Out"
            icon={<LogOut size={ICON_SIZE} />}
            onClick={handleLogout}
          />
        </div>
      </nav>
    </aside>
  );
}

interface NavItemRendererProps {
  item: NavItemConfig;
  isExpanded?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

function NavItemRenderer({
  item,
  isExpanded = false,
  onToggle,
  onClose,
}: NavItemRendererProps): React.ReactElement {
  const Icon = item.icon;
  
  // Render expandable section
  if (item.isSection && item.children) {
    return (
      <div className="sidebar-section">
        <button
          type="button"
          className="sidebar-link sidebar-section-header"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={`${item.id}-subnav`}
        >
          <span className="sidebar-icon">
            <Icon size={ICON_SIZE} />
          </span>
          <span>{item.label}</span>
          <span
            className={`sidebar-chevron ${isExpanded ? 'open' : ''}`}
            aria-hidden="true"
          >
            <ChevronDown size={14} />
          </span>
        </button>
        <div
          id={`${item.id}-subnav`}
          className={`sidebar-subnav ${isExpanded ? 'expanded' : 'collapsed'}`}
          role="region"
          aria-label={`${item.label} section`}
          hidden={!isExpanded}
        >
          {item.children.map(child => {
            const ChildIcon = child.icon;
            return (
              <NavItem
                key={child.id}
                to={child.path}
                label={child.label}
                icon={<ChildIcon size={ICON_SIZE} />}
                onClick={onClose}
              />
            );
          })}
        </div>
      </div>
    );
  }
  
  // Render regular nav item
  return (
    <NavItem
      to={item.path}
      label={item.label}
      icon={<Icon size={ICON_SIZE} />}
      onClick={onClose}
    />
  );
}

interface NavItemProps {
  to?: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

function NavItem({
  to,
  label,
  icon,
  onClick,
}: NavItemProps): React.ReactElement {
  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        {icon && <span className="sidebar-icon">{icon}</span>}
        <span>{label}</span>
      </NavLink>
    );
  }
  
  return (
    <button type="button" className="sidebar-link" onClick={onClick}>
      {icon && <span className="sidebar-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
