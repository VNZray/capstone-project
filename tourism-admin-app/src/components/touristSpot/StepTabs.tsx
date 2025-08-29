import React from "react";
import {
  Tabs,
  TabList,
  Tab,
  Box,
  Typography,
} from "@mui/joy";
import { 
  User, 
  MapPin, 
  Clock, 
  ImageIcon, 
  CheckCircle 
} from "lucide-react";

interface StepTabsProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  canAccessStep: (step: number) => boolean;
}

const stepData = [
  { label: "Basic Info", icon: User, description: "Name, category, and contact details" },
  { label: "Location", icon: MapPin, description: "Address and map coordinates" },
  { label: "Schedule", icon: Clock, description: "Operating hours" },
  { label: "Images", icon: ImageIcon, description: "Photo gallery" },
  { label: "Review", icon: CheckCircle, description: "Final review and submit" },
];

const StepTabs: React.FC<StepTabsProps> = ({
  currentStep,
  onStepChange,
  canAccessStep,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Tabs
        value={currentStep}
        onChange={(_, value) => onStepChange(value as number)}
        size="lg"
        sx={{
          backgroundColor: 'background.surface',
          borderRadius: 'md',
        }}
      >
        <TabList
          sx={{
            gap: 0,
            '--Tab-gap': '0px',
            backgroundColor: 'transparent',
          }}
        >
          {stepData.map((step, index) => {
            const Icon = step.icon;
            const isAccessible = canAccessStep(index);
            const isActive = currentStep === index;
            const isCompleted = currentStep > index && isAccessible;
            
            return (
              <Tab
                key={index}
                value={index}
                disabled={!isAccessible}
                sx={{
                  flex: 1,
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1.5,
                  px: 1,
                  minHeight: 45,
                  opacity: isAccessible ? 1 : 0.5,
                  cursor: isAccessible ? 'pointer' : 'not-allowed',
                  backgroundColor: isActive ? '#0A1B47 !important' : 'transparent',
                  color: isActive ? 'white !important' : 'inherit',
                  '&:hover': {
                    backgroundColor: isActive ? '#0A1B47 !important' : 
                                    isAccessible ? 'background.level1' : 'transparent',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#0A1B47 !important',
                    color: 'white !important',
                    '&:hover': {
                      backgroundColor: '#0A1B47 !important',
                    },
                  },
                  ...(isCompleted && !isActive && {
                    backgroundColor: 'success.50',
                    color: 'success.700',
                  }),
                }}
              >
                <Icon 
                  size={20} 
                  color={
                    isActive ? 'white' :
                    isCompleted ? 'var(--joy-palette-success-500)' :
                    'var(--joy-palette-text-primary)'
                  }
                />
                <Typography 
                  level="body-xs" 
                  fontWeight={isActive ? 'md' : 'sm'}
                  sx={{ 
                    textAlign: 'center',
                    color: isActive ? 'white !important' : 
                           isCompleted ? 'success.700' : 
                           'text.primary'
                  }}
                >
                  {step.label}
                </Typography>
                <Typography 
                  level="body-xs" 
                  sx={{ 
                    textAlign: 'center',
                    color: 'text.tertiary',
                    fontSize: '12px',
                    display: { xs: 'none', md: 'block' }
                  }}
                >
                  {step.description}
                </Typography>
              </Tab>
            );
          })}
        </TabList>
      </Tabs>
    </Box>
  );
};

export default StepTabs;
