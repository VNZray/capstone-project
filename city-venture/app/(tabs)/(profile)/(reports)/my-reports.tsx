import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { getReportsByReporter } from '@/services/ReportService';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReportItem { id:string; title:string; status:string; target_type:string; created_at:string; description:string; }

export default function MyReports(){
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuth();
  const [data,setData] = useState<ReportItem[]>([]);
  const [loading,setLoading] = useState(false);
  const load = async () => {
    if(!user) return; setLoading(true);
    try{
      const items = await getReportsByReporter((user.user_id as string) || (user.id as string));
      // Normalize fields (backend returns created_at and status already)
      const mapped = items.map((r:any)=>({
        id: r.id,
        title: r.title || r.report_title || 'Untitled',
        status: r.status || 'submitted',
        target_type: r.target_type || r.targetType || 'unknown',
        created_at: r.created_at || r.createdAt || new Date().toISOString(),
        description: r.description || ''
      }));
      setData(mapped);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[user?.user_id, user?.id]);
  return (
    <SafeAreaView style={[styles.container,{ backgroundColor: isDark ? '#0F1222' : '#F5F7FB' }]}>
      <View style={styles.headerRow}>
        <ThemedText type="title-small" weight="bold">My Reports</ThemedText>
  <Button label="New" size="small" variant="solid" color="primary" startIcon="plus" onPress={()=>router.push('/(tabs)/(profile)/(reports)/submit' as any)} />
      </View>
      <FlatList data={data} keyExtractor={i=>i.id} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />} renderItem={({item})=>{
        return (
          <Pressable onPress={()=>router.push(`/(tabs)/(profile)/(reports)/detail/${item.id}` as any)} style={[styles.card,{ backgroundColor: isDark ? '#161A2E' : '#fff', borderColor: isDark ? '#28304a' : '#E2E8F0' }]}>
            <ThemedText type="body-medium" weight="semi-bold">{item.title}</ThemedText>
            <ThemedText type="label-small" style={{color: isDark ? '#A9B2D0' : '#64748B', marginTop:4}}>{item.target_type} • {new Date(item.created_at).toLocaleDateString()}</ThemedText>
            <View style={[styles.statusPillBase, statusPillColor(item.status)]}>
              <ThemedText type="label-small" style={{color:'#fff'}}>{item.status.replace('_',' ')}</ThemedText>
            </View>
          </Pressable>
        );
      }} ListEmptyComponent={!loading? <ThemedText type="body-small" style={{marginTop:24}}>No reports yet.</ThemedText>:null} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20 },
  headerRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  card:{ backgroundColor:'#fff', borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:'#E2E8F0' },
  statusPillBase:{ marginTop:12, alignSelf:'flex-start', paddingHorizontal:12, paddingVertical:4, borderRadius:20 }
});

function statusPillColor(status:string){
  let backgroundColor = '#3B82F6';
  if(status==='resolved') backgroundColor = '#16A34A';
  else if(status==='rejected') backgroundColor = '#DC2626';
  else if(status==='in_progress') backgroundColor = '#F59E0B';
  return { backgroundColor } as const;
}
