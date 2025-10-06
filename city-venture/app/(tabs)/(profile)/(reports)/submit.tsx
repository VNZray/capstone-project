import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput as RNTextInput, Image, Pressable, Alert } from 'react-native';
import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadReportFileAndGetPublicUrl, createReportWithAttachments } from '@/services/ReportService';
import { router } from 'expo-router';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import { fetchAllTouristSpots } from '@/services/TouristSpotService';
import { fetchAllBusinessDetails } from '@/services/AccommodationService';

const targetTypes = ['business','event','tourist_spot','accommodation'];

export default function SubmitReport(){
  const { user } = useAuth();
  const [targetType,setTargetType] = useState('business');
  const [targetId,setTargetId] = useState('');
  const [targetOptions,setTargetOptions] = useState<DropdownItem[]>([]);
  const [loadingTargets,setLoadingTargets] = useState(false);
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [files,setFiles] = useState<{uri:string; name:string; type:string; size?:number}[]>([]);
  const [loading,setLoading] = useState(false);

  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, mediaTypes: ImagePicker.MediaTypeOptions.All, quality:0.8 });
    if(!res.canceled){
  const assets = res.assets.map((a:any)=>({ uri:a.uri, name:a.fileName || `report-${Date.now()}.jpg`, type:a.mimeType || 'image/jpeg', size:a.fileSize }));
      setFiles(prev=>[...prev, ...assets]);
    }
  };

  // Load selectable targets when target type changes
  useEffect(()=>{
    (async ()=>{
      setTargetOptions([]); setTargetId('');
      if(!targetType) return;
      setLoadingTargets(true);
      try {
        if(targetType==='tourist_spot'){
          const spots = await fetchAllTouristSpots();
          setTargetOptions(spots.map(s=>({ id: String(s.id), label: String(s.name || s.id) })));
        } else if(targetType==='business') {
          const businesses = await fetchAllBusinessDetails();
          setTargetOptions(businesses.map(b=>({ id: String(b.id), label: String(b.business_name || b.id) })));
        } else {
          // For event / accommodation (not yet implemented) rely on manual id input
        }
      } catch(e){ console.warn('Failed to load target options', e); }
      finally { setLoadingTargets(false); }
    })();
  },[targetType]);

  const onSubmit = async () => {
    if(!user) return;
    if(!targetId || !title || !description){
      Alert.alert('Missing Fields','Please fill all required fields.');
      return;
    }
    try{
      setLoading(true);
      const uploaded = [] as { file_url:string; file_name:string; file_type:string; file_size?:number }[];
      const reporter = (user.user_id as string) || (user.id as string);
      for(const f of files){
        const up = await uploadReportFileAndGetPublicUrl(f.uri, f.name, f.type, reporter);
        uploaded.push({ file_url: up.publicUrl, file_name:f.name, file_type:f.type, file_size:f.size });
      }
      await createReportWithAttachments({
        reporter_id: (user.user_id as string) || (user.id as string),
        target_type: targetType,
        target_id: targetId,
        title, description,
        attachments: uploaded
      });
  Alert.alert('Success','Report submitted successfully', [{text:'OK', onPress:()=>router.replace('/(tabs)/(profile)/(reports)/my-reports' as any)}]);
    }catch(e:any){
      Alert.alert('Error', e.message || 'Failed to submit report');
    }finally{
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title-small" weight="bold" style={{marginBottom:12}}>Submit a Report</ThemedText>
      <ThemedText type="body-small">Target Type</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:8}}>
        {targetTypes.map(tt=>{
          const active = tt===targetType;
          return (
            <Pressable key={tt} onPress={()=>setTargetType(tt)} style={[styles.chip, active && styles.chipActive]}>
              <ThemedText type="label-small" style={{color: active? '#fff':'#333'}}>{tt.replace('_',' ')}</ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
      {targetOptions.length>0 ? (
        <Dropdown
          label="Select Target"
          placeholder={loadingTargets? 'Loading...' : 'Choose target'}
          items={targetOptions}
          value={targetId}
          onSelect={(item)=> setTargetId(String(item.id))}
        />
      ) : (
        <RNTextInput placeholder="Target ID (manual)" value={targetId} onChangeText={setTargetId} style={styles.input} />
      )}
      <RNTextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <RNTextInput placeholder="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} style={[styles.input,{height:120,textAlignVertical:'top'}]} />
      <View style={{flexDirection:'row', flexWrap:'wrap', gap:12, marginVertical:12}}>
        {files.map((f,i)=>(
          <Image key={i} source={{uri:f.uri}} style={{width:80,height:80,borderRadius:8}} />
        ))}
        <Pressable onPress={pickImages} style={styles.addBox}>
          <ThemedText type="label-small">Add</ThemedText>
        </Pressable>
      </View>
  <Button label={loading? 'Submitting...':'Submit Report'} onPress={onSubmit} fullWidth size="large" variant={loading? 'soft':'solid'} startIcon="flag" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ padding:24 },
  input:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#E2E8F0', borderRadius:12, paddingHorizontal:14, paddingVertical:12, marginTop:12 },
  chip:{ paddingHorizontal:14, paddingVertical:8, backgroundColor:'#E2E8F0', borderRadius:20, marginRight:8 },
  chipActive:{ backgroundColor:'#2563EB' },
  addBox:{ width:80,height:80,borderRadius:8,borderWidth:1,borderColor:'#CBD5E1',alignItems:'center',justifyContent:'center', backgroundColor:'#F1F5F9' }
});
