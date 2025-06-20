import PressableButton from '@/components/PressableButton';
import ErrorModal from '@/components/web-components/modals/ErrorModal';
import SuccessModal from '@/components/web-components/modals/SuccessModal';
import WarningModal from '@/components/web-components/modals/WarningModal';
import { Business } from '@/types/Business';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StepBasicsProps = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  onNext: () => void;
  onPrev: () => void;
};

const StepSubmit: React.FC<StepBasicsProps> = ({ data, setData, onPrev }) => {
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // 🆕 error message state

  const handleSubmit = async () => {
    console.log('Submitting data:', data);

    const { data: existing, error: existingError } = await supabase
      .from('Business')
      .select('id')
      .eq('business_email', data.business_email);

    if (existingError) {
      console.error('Email check error:', existingError);
      setErrorMessage(
        existingError.message || 'Error checking existing email.'
      );
      setErrorVisible(true);
      return;
    }

    if (existing && existing.length > 0) {
      setWarningVisible(true);
      return;
    }

    const { data: newBusiness, error: businessError } = await supabase
      .from('Business')
      .insert({
        ...data,
        status: 'Pending',
      })
      .select('id')
      .single();

    if (businessError) {
      console.error('Business insert error:', businessError);
      setErrorMessage(
        businessError.message || 'Error inserting business data.'
      );
      setErrorVisible(true);
      return;
    }

    console.log('Business registered:', newBusiness);
    setSuccessVisible(true);
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    router.replace('/BusinessApp/(admin)/manage-business');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Submit Registration</Text>
      <Text style={styles.description}>
        Please confirm and submit your business for review. Once submitted, the
        status will be set to{' '}
        <Text style={{ fontWeight: 'bold' }}>pending</Text>.
      </Text>
      <View style={styles.buttonContainer}>
        <PressableButton
          type="cancel"
          color="#fff"
          Title="Prev"
          onPress={onPrev}
          width={200}
        />
        <PressableButton
          type="primary"
          color="#fff"
          Title="Submit"
          onPress={handleSubmit}
          width={200}
        />
      </View>

      {/* Modals */}
      <SuccessModal
        title="Success"
        visible={successVisible}
        message="Your business registration has been submitted for review."
        onClose={handleSuccessClose}
      />

      <WarningModal
        title="Already Registered"
        visible={warningVisible}
        message="A business with this email already exists."
        onClose={() => setWarningVisible(false)}
      />

      <ErrorModal
        title="Submission Failed"
        visible={errorVisible}
        message={errorMessage} // 🆕 show actual error message
        onClose={() => setErrorVisible(false)}
      />
    </View>
  );
};

export default StepSubmit;

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  description: { fontSize: 14, marginBottom: 24 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
});
