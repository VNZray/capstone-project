import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useBusiness } from "@/src/context/BusinessContext";
import Card from "./components/Card";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import type { Business } from "@/src/types/Business";
import { fetchBusinessesByOwner } from "@/src/services/BusinessService";
import { colors } from "@/src/utils/Colors";
import { Button, Typography, Avatar, Dropdown, Menu, MenuButton, MenuItem, ListDivider } from "@mui/joy";
import { Add } from "@mui/icons-material";
import logo from "@/src/assets/images/logo.png";
import "./MyBusiness.css";

const MyBusiness = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setBusinessId } = useBusiness();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const ownerId = user?.owner_id;

  useEffect(() => {
    console.log("Owner ID:", ownerId);

    if (!ownerId) return;

    const loadBusinesses = async () => {
      try {
        const data = await fetchBusinessesByOwner(ownerId!);
        setBusinesses(data);
      } catch (err) {
        console.error("Error fetching businesses:", err);
  }
    };

    loadBusinesses();
  }, [ownerId]);
  // Profile header removed for compact design

  return (
    <div className="myb-page" style={{
      background: `radial-gradient(1200px 600px at 20% 20%, rgba(255,255,255,0.08), transparent 60%), linear-gradient(120deg, ${colors.primary} 0%, #0F172A 55%, #1F2937 100%)`
    }}>
      {/* Center card */}
      <div className="myb-card">
        {/* Top bar: brand (left) + profile (right) */}
        <div className="myb-topbar">
          <div className="myb-brand" role="button" onClick={() => navigate('/')}>
            <img src={logo} alt="City Venture" className="myb-brand-logo" />
            <Typography
              level="title-lg"
              sx={{ fontWeight: 700, fontSize: 20, letterSpacing: 1, textTransform: 'uppercase', color: colors.primary }}
            >
              City Venture
            </Typography>
          </div>
          <div className="myb-profile-actions">
          <Dropdown>
            <MenuButton
              slots={{ root: Avatar }}
              slotProps={{
                root: {
                  sx: {
                    width: 50,
                    height: 50,
                    borderRadius: 8, // square with curved edges
                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #10b981 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                  },
                },
              }}
            >
              {user ? `${(user.first_name ?? '').charAt(0)}${(user.last_name ?? '').charAt(0)}`.toUpperCase() : 'U'}
            </MenuButton>
            <Menu
              placement="bottom-end"
              size="sm"
              sx={{ minWidth: 220, borderRadius: 12, mt: 1.5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
            >
              {/* header with display name */}
              <MenuItem disabled sx={{ fontWeight: 600 }}>{user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : ''}</MenuItem>
              <ListDivider />
              <MenuItem onClick={() => navigate('/business/profile')} sx={{ fontWeight: 600 }}>Profile</MenuItem>
              <MenuItem onClick={() => navigate('/business/settings')} sx={{ fontWeight: 600 }}>Settings</MenuItem>
              {user?.role === 'Tourism' && (
                <MenuItem onClick={() => navigate('/tourism/dashboard')} sx={{ fontWeight: 600 }}>Admin Dashboard</MenuItem>
              )}
              <ListDivider />
              <MenuItem color="danger" onClick={() => { logout(); navigate('/'); }} sx={{ fontWeight: 600 }}>Logout</MenuItem>
            </Menu>
          </Dropdown>
        </div>
        </div>

        {/* Sub header: title + CTA (below icons) */}
        <div className="myb-card-header">
          <Typography level="h4" sx={{ fontWeight: 800, color: colors.primary }}>My Businesses</Typography>
          <Button
            variant="solid"
            size="lg"
            startDecorator={<Add />}
            onClick={() => navigate('/business/register')}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, #0a1a3d 100%)`,
              borderRadius: 12,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: `2px solid ${colors.primary}`,
              '&:hover': {
                background: `linear-gradient(135deg, #0a1a3d 0%, ${colors.primary} 100%)`,
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                '& .MuiSvgIcon-root': {
                  transform: 'rotate(90deg)',
                },
              },
              '&:active': {
                transform: 'translateY(0) scale(1)',
                transition: 'all 0.1s ease',
              },
            }}
          >
            Register Business
          </Button>
        </div>

        <Typography level="body-sm" sx={{ color: '#6B7280', mb: 1 }}>
          You have {businesses.length} {businesses.length === 1 ? 'listing' : 'listings'}
        </Typography>

        <div className="myb-list">
          {businesses.slice(0, 4).map((business) => (
            <div key={business.id} className="myb-list-item">
              <Card
                elevation={1}
                image={business.business_image || placeholderImage}
                title={business.business_name}
                subtitle={business.business_type_id === 1 ? 'Accommodation' : 'Shop'}
                rating={5}
                status={business.status}
              >
                <Button
                  onClick={() => {
                    setBusinessId(business.id);
                    navigate(`/business/dashboard`);
                  }}
                  fullWidth
                  size="md"
                >
                  Manage Business
                </Button>
              </Card>
            </div>
          ))}
          {businesses.length > 4 && (
            <Typography level="body-xs" sx={{ color: '#9CA3AF', gridColumn: '1 / -1', textAlign: 'right' }}>
              Showing 4 of {businesses.length}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBusiness;
