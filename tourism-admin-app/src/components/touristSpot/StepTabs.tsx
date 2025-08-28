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
    <Box sx={{ mb: 3 }}>
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
                  py: 2,
                  px: 1,
                  minHeight: 50,
                  opacity: isAccessible ? 1 : 0.5,
                  cursor: isAccessible ? 'pointer' : 'not-allowed',
                  '&:hover': {
                    backgroundColor: isAccessible ? 'background.level1' : 'transparent',
                  },
                  ...(isActive && {
                    backgroundColor: 'primary.100',
                    color: 'primary.700',
                  }),
                  ...(isCompleted && !isActive && {
                    backgroundColor: 'success.50',
                    color: 'success.700',
                  }),
                }}
              >
                <Icon 
                  size={20} 
                  color={
                    isActive ? 'var(--joy-palette-primary-500)' :
                    isCompleted ? 'var(--joy-palette-success-500)' :
                    'var(--joy-palette-text-tertiary)'
                  }
                />
                <Typography 
                  level="body-xs" 
                  fontWeight={isActive ? 'md' : 'sm'}
                  sx={{ 
                    textAlign: 'center',
                    color: isActive ? 'primary.700' : 
                           isCompleted ? 'success.700' : 
                           'text.secondary'
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
