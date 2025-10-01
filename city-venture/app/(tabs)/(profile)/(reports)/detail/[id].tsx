import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getReportById } from '@/services/ReportService';
import { ThemedText } from '@/components/themed-text';

interface StatusHistory { id:string; status:string; remarks:string; updated_at:string; }
interface Attachment { id:string; file_url:string; file_name:string; }
interface Report { id:string; title:string; description:string; status:string; target_type:string; created_at:string; status_history:StatusHistory[]; attachments:Attachment[]; }

export default function ReportDetail(){
  const { id } = useLocalSearchParams<{id:string}>();
  const [report,setReport] = useState<Report| null>(null);
  useEffect(()=>{ (async ()=>{ if(id){ const r = await getReportById(id); setReport(r);} })(); },[id]);
  if(!report) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ThemedText type="body-small">Loading...</ThemedText></View>;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title-small" weight="bold">{report.title}</ThemedText>
      <ThemedText type="label-small" style={{marginTop:4, color:'#64748B'}}>{report.target_type} • {new Date(report.created_at).toLocaleString()}</ThemedText>
      <ThemedText type="body-small" style={{marginTop:12}}>{report.description}</ThemedText>
      <ThemedText type="sub-title-small" weight="bold" style={{marginTop:24}}>Status Timeline</ThemedText>
      <View style={{marginTop:12}}>
        {report.status_history.map((s,i)=>{
          const last = i === report.status_history.length -1;
          return (
            <View key={s.id} style={styles.timelineRow}>
              <View style={[styles.timelineIndicator, last && {backgroundColor:'#16A34A'}]} />
              <View style={{flex:1, marginLeft:12}}>
                <ThemedText type="body-small" weight="semi-bold">{s.status.replace('_',' ')}</ThemedText>
                <ThemedText type="label-small" style={{color:'#64748B'}}>{new Date(s.updated_at).toLocaleString()}</ThemedText>
                {s.remarks? <ThemedText type="label-small" style={{marginTop:4}}>{s.remarks}</ThemedText>: null}
              </View>
            </View>
          );
        })}
      </View>
      {report.attachments?.length? <>
        <ThemedText type="sub-title-small" weight="bold" style={{marginTop:24}}>Attachments</ThemedText>
        <View style={styles.attachmentGrid}>
          {report.attachments.map(a=> (
            <Image key={a.id} source={{uri:a.file_url}} style={styles.attachmentImg} />
          ))}
        </View>
      </>: null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ padding:24 },
  timelineRow:{ flexDirection:'row', alignItems:'flex-start', marginBottom:16 },
  timelineIndicator:{ width:12,height:12,borderRadius:6, backgroundColor:'#2563EB', marginTop:4, position:'relative'},
  attachmentGrid:{ flexDirection:'row', flexWrap:'wrap', gap:12, marginTop:12 },
  attachmentImg:{ width:100, height:100, borderRadius:8, backgroundColor:'#E2E8F0' }
});
