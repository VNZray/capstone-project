import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const steps = [
  'Basics',
  'Contact',
  'Location',
  'Description',
  'Links',
  'Pricing',
  'Permits',
  'Review',
  'Submit',
];

const Stepper = ({ currentStep }: { currentStep: number }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <View key={index} style={styles.stepContainer}>
            {/* Circle and line */}
            <View style={styles.circleContainer}>
              {index !== 0 && (
                <View
                  style={[
                    styles.verticalLine,
                    {
                      backgroundColor: isCompleted ? '#0A1B47' : '#e0e0e0',
                    },
                  ]}
                />
              )}
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: isCompleted
                      ? '#0A1B47'
                      : isActive
                      ? '#0A1B47'
                      : '#e0e0e0',
                  },
                ]}
              >
                {isCompleted ? (
                  <MaterialIcons name="check" size={16} color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: isActive ? '#fff' : '#888',
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                {
                  color: isCompleted || isActive ? '#0A1B47' : '#888',
                  fontWeight: isActive ? 'bold' : 'normal',
                },
              ]}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  circleContainer: {
    width: 40,
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  verticalLine: {
    position: 'absolute',
    top: -32,
    width: 2,
    height: 50,
    backgroundColor: '#ccc',
    zIndex: 0,
  },
  label: {
    marginLeft: 10,
    fontSize: 14,
  },
});

export default Stepper;
