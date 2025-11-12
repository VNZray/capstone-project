import { useState } from 'react';
import DynamicTab from '../components/ui/DynamicTab';
import type { TabItem } from '../components/ui/DynamicTab';
import { Box, Typography, Divider } from '@mui/joy';
import { colors } from '../utils/Colors';
import {
  Settings,
  Home,
  User,
  Bell,
  ShoppingCart,
  Heart,
  MessageSquare,
  Share2,
  Download,
  Upload,
  Edit,
  Trash2,
} from 'lucide-react';

const TestButton = () => {
  // Example 1: Basic tabs
  const [activeTab1, setActiveTab1] = useState<string | number>('details');
  const basicTabs: TabItem[] = [
    { id: 'details', label: 'Details' },
    { id: 'photos', label: 'Photos' },
    { id: 'reviews', label: 'Reviews' },
  ];

  // Example 2: Tabs with icons
  const [activeTab2, setActiveTab2] = useState<string | number>('home');
  const tabsWithIcons: TabItem[] = [
    { id: 'home', label: 'Home', icon: <Home size={16} /> },
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  // Example 3: Multiple color schemes
  const [activeTab3, setActiveTab3] = useState<string | number>('primary');
  const colorTabs: TabItem[] = [
    { id: 'primary', label: 'Primary', icon: <Home size={16} /> },
    { id: 'secondary', label: 'Secondary', icon: <Bell size={16} /> },
    { id: 'success', label: 'Success', icon: <ShoppingCart size={16} /> },
    { id: 'error', label: 'Error', icon: <Trash2 size={16} /> },
  ];

  // Example 4: Different sizes - showcased inline in section
  // No state needed as sizes are demonstrated statically

  // Example 5: Disabled tabs
  const [activeTab5, setActiveTab5] = useState<string | number>('active1');
  const disabledTabs: TabItem[] = [
    { id: 'active1', label: 'Active 1', icon: <Heart size={16} /> },
    { id: 'disabled', label: 'Disabled', icon: <MessageSquare size={16} />, disabled: true },
    { id: 'active2', label: 'Active 2', icon: <Share2 size={16} /> },
  ];

  // Example 6: Full width tabs
  const [activeTab6, setActiveTab6] = useState<string | number>('tab1');
  const fullWidthTabs: TabItem[] = [
    { id: 'tab1', label: 'Tab 1', icon: <Home size={16} /> },
    { id: 'tab2', label: 'Tab 2', icon: <User size={16} /> },
    { id: 'tab3', label: 'Tab 3', icon: <Settings size={16} /> },
    { id: 'tab4', label: 'Tab 4', icon: <Bell size={16} /> },
  ];

  // Example 7: Many tabs
  const [activeTab7, setActiveTab7] = useState<string | number>('nav1');
  const manyTabs: TabItem[] = [
    { id: 'nav1', label: 'Navigation 1', icon: <Home size={16} /> },
    { id: 'nav2', label: 'Navigation 2', icon: <User size={16} /> },
    { id: 'nav3', label: 'Navigation 3', icon: <Settings size={16} /> },
    { id: 'nav4', label: 'Navigation 4', icon: <Bell size={16} /> },
    { id: 'nav5', label: 'Navigation 5', icon: <Heart size={16} /> },
    { id: 'nav6', label: 'Navigation 6', icon: <MessageSquare size={16} /> },
  ];

  // Example 8: Custom gaps and styling
  const [activeTab8, setActiveTab8] = useState<string | number>('opt1');
  const spacedTabs: TabItem[] = [
    { id: 'opt1', label: 'Option 1', icon: <Upload size={16} /> },
    { id: 'opt2', label: 'Option 2', icon: <Download size={16} /> },
    { id: 'opt3', label: 'Option 3', icon: <Edit size={16} /> },
  ];

  return (
    <Box
      sx={{
        padding: '40px',
        backgroundColor: colors.lightBackground,
        minHeight: '100vh',
      }}
    >
      <Typography level="h1" sx={{ marginBottom: '40px', color: colors.primary }}>
        Dynamic Tabs Component Showcase
      </Typography>

      {/* Example 1: Basic Tabs */}
      <Box sx={{ marginBottom: '60px' }}>
        <Typography level="h2" sx={{ marginBottom: '20px', color: colors.primary }}>
          1. Basic Tabs
        </Typography>
        <Box sx={{ padding: '20px', backgroundColor: colors.white, borderRadius: '8px' }}>
          <DynamicTab
            tabs={basicTabs}
            activeTabId={activeTab1}
            onChange={setActiveTab1}
            size="md"
          />
          <Typography level="body-sm" sx={{ marginTop: '16px', color: colors.gray }}>
            Active Tab: <strong>{activeTab1}</strong>
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: '60px' }} />

      {/* Example 2: Tabs with Icons */}
      <Box sx={{ marginBottom: '60px' }}>
        <Typography level="h2" sx={{ marginBottom: '20px', color: colors.primary }}>
          2. Tabs with Icons
        </Typography>
        <Box sx={{ padding: '20px', backgroundColor: colors.white, borderRadius: '8px' }}>
          <DynamicTab
            tabs={tabsWithIcons}
            activeTabId={activeTab2}
            onChange={setActiveTab2}
            colorScheme="secondary"
            size="md"
            showIcons={true}
          />
          <Typography level="body-sm" sx={{ marginTop: '16px', color: colors.gray }}>
            Active Tab: <strong>{activeTab2}</strong>
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: '60px' }} />

      {/* Example 3: Different Colors */}
      <Box sx={{ marginBottom: '60px' }}>
        <Typography level="h2" sx={{ marginBottom: '20px', color: colors.primary }}>
          3. Color Scheme: Filled Variant
        </Typography>
        <Box sx={{ padding: '20px', backgroundColor: colors.white, borderRadius: '8px' }}>
          <DynamicTab
            tabs={colorTabs}
            activeTabId={activeTab3}
            onChange={(id) => {
              setActiveTab3(id);
            }}
            colorScheme={activeTab3 as any}
            size="md"
            variant="filled"
          />
          <Typography level="body-sm" sx={{ marginTop: '16px', color: colors.gray }}>
            Active Tab Color: <strong>{activeTab3}</strong>
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: '60px' }} />

      {/* Example 4: Size Variants */}
      <Box sx={{ marginBottom: '60px' }}>
        <Typography level="h2" sx={{ marginBottom: '20px', color: colors.primary }}>
          4. Size Variants
        </Typography>

        {/* Small */}
        <Box sx={{ marginBottom: '20px' }}>
          <Typography level="h4" sx={{ marginBottom: '12px', color: colors.secondary }}>
            Small Size
          </Typography>
          <Box sx={{ padding: '16px', backgroundColor: colors.white, borderRadius: '8px' }}>
            <DynamicTab
              tabs={[
                { id: 'small1', label: 'Small 1', icon: <Home size={12} /> },
                { id: 'small2', label: 'Small 2', icon: <User size={12} /> },
                { id: 'small3', label: 'Small 3', icon: <Settings size={12} /> },
              ]}
              activeTabId="small1"
              onChange={() => {}}
              size="sm"
              colorScheme="primary"
            />
          </Box>
        </Box>

        {/* Medium */}
        <Box sx={{ marginBottom: '20px' }}>
          <Typography level="h4" sx={{ marginBottom: '12px', color: colors.secondary }}>
            Medium Size
          </Typography>
          <Box sx={{ padding: '16px', backgroundColor: colors.white, borderRadius: '8px' }}>
            <DynamicTab
              tabs={[
                { id: 'med1', label: 'Medium 1', icon: <Home size={16} /> },
                { id: 'med2', label: 'Medium 2', icon: <User size={16} /> },
                { id: 'med3', label: 'Medium 3', icon: <Settings size={16} /> },
              ]}
              activeTabId="med1"
              onChange={() => {}}
              size="md"
              colorScheme="secondary"
            />
          </Box>
        </Box>

        {/* Large */}
        <Box sx={{ marginBottom: '20px' }}>
          <Typography level="h4" sx={{ marginBottom: '12px', color: colors.secondary }}>
            Large Size
          </Typography>
          <Box sx={{ padding: '16px', backgroundColor: colors.white, borderRadius: '8px' }}>
            <DynamicTab
              tabs={[
                { id: 'lg1', label: 'Large 1', icon: <Home size={20} /> },
                { id: 'lg2', label: 'Large 2', icon: <User size={20} /> },
                { id: 'lg3', label: 'Large 3', icon: <Settings size={20} /> },
              ]}
              activeTabId="lg1"
              onChange={() => {}}
              size="lg"
              colorScheme="success"
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: '60px' }} />

      {/* Example 5: Disabled Tabs */}
      <Box sx={{ marginBottom: '60px' }}>
        <Typography level="h2" sx={{ marginBottom: '20px', color: colors.primary }}>
          5. Disabled Tabs
        </Typography>
        <Box sx={{ padding: '20px', backgroundColor: colors.white, borderRadius: '8px' }}>
          <DynamicTab
            tabs={disabledTabs}
            activeTabId={activeTab5}
            onChange={setActiveTab5}
            colorScheme="error"
            size="md"
          />
          <Typography level="body-sm" sx={{ marginTop: '16px', color: colors.gray }}>
            Active Tab: <strong>{activeTab5}</strong> (Try clicking disabled tab - it won't respond)
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: '60px' }} />

      {/* Example 6: Full Width Tabs */}
      <Box sx={{ marginBottom: '60px' }}>
        <Typography level="h2" sx={{ marginBottom: '20px', color: colors.primary }}>
          6. Full Width Tabs
        </Typography>
        <Box sx={{ padding: '20px', backgroundColor: colors.white, borderRadius: '8px' }}>
          <DynamicTab
            tabs={fullWidthTabs}
            activeTabId={activeTab6}
            onChange={setActiveTab6}
            colorScheme="secondary"
            size="md"
            fullWidth={true}
          />
          <Typography level="body-sm" sx={{ marginTop: '16px', color: colors.gray }}>
            Active Tab: <strong>{activeTab6}</strong>
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: '60px' }} />

      {/* Example 7: Many Tabs */}
      <Box sx={{ marginBottom: '60px' }}>
        <Typography level="h2" sx={{ marginBottom: '20px', color: colors.primary }}>
          7. Many Tabs with Wrap
        </Typography>
        <Box sx={{ padding: '20px', backgroundColor: colors.white, borderRadius: '8px' }}>
          <DynamicTab
            tabs={manyTabs}
            activeTabId={activeTab7}
            onChange={setActiveTab7}
            colorScheme="primary"
            size="md"
            gap={12}
          />
          <Typography level="body-sm" sx={{ marginTop: '16px', color: colors.gray }}>
            Active Tab: <strong>{activeTab7}</strong>
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: '60px' }} />

      {/* Example 8: Outlined Variant */}
      <Box sx={{ marginBottom: '60px' }}>
        <Typography level="h2" sx={{ marginBottom: '20px', color: colors.primary }}>
          8. Outlined Variant
        </Typography>
        <Box sx={{ padding: '20px', backgroundColor: colors.white, borderRadius: '8px' }}>
          <DynamicTab
            tabs={spacedTabs}
            activeTabId={activeTab8}
            onChange={setActiveTab8}
            colorScheme="warning"
            size="md"
            variant="outlined"
            gap={16}
          />
          <Typography level="body-sm" sx={{ marginTop: '16px', color: colors.gray }}>
            Active Tab: <strong>{activeTab8}</strong>
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: '60px' }} />

      {/* Configuration Guide */}
      <Box
        sx={{
          padding: '20px',
          backgroundColor: colors.tertiary,
          borderRadius: '8px',
          borderLeft: `4px solid ${colors.primary}`,
        }}
      >
        <Typography level="h3" sx={{ marginBottom: '15px', color: colors.primary }}>
          📋 Configuration Guide
        </Typography>
        <Box sx={{ fontSize: '14px', lineHeight: '1.8' }}>
          <Typography level="body-sm" sx={{ marginBottom: '10px' }}>
            <strong>tabs:</strong> Array of TabItem objects with id, label, icon (optional), disabled
            (optional)
          </Typography>
          <Typography level="body-sm" sx={{ marginBottom: '10px' }}>
            <strong>activeTabId:</strong> Current active tab id (string or number)
          </Typography>
          <Typography level="body-sm" sx={{ marginBottom: '10px' }}>
            <strong>onChange:</strong> Callback function when tab changes
          </Typography>
          <Typography level="body-sm" sx={{ marginBottom: '10px' }}>
            <strong>colorScheme:</strong> Any color from Colors.ts (primary, secondary, success,
            error, warning, etc.)
          </Typography>
          <Typography level="body-sm" sx={{ marginBottom: '10px' }}>
            <strong>size:</strong> 'sm' | 'md' | 'lg'
          </Typography>
          <Typography level="body-sm" sx={{ marginBottom: '10px' }}>
            <strong>variant:</strong> 'filled' (solid active + outlined inactive) | 'outlined'
            (soft active + plain inactive)
          </Typography>
          <Typography level="body-sm" sx={{ marginBottom: '10px' }}>
            <strong>gap:</strong> Spacing between tabs in pixels (default: 8)
          </Typography>
          <Typography level="body-sm" sx={{ marginBottom: '10px' }}>
            <strong>fullWidth:</strong> Make tabs stretch to fill container width
          </Typography>
          <Typography level="body-sm" sx={{ marginBottom: '10px' }}>
            <strong>showIcons:</strong> Display icons in tabs (default: true)
          </Typography>
          <Typography level="body-sm">
            <strong>customStyle:</strong> Additional CSS styles for the container
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TestButton;
