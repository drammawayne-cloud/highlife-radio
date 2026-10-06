import { useState, type ReactNode } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C } from "./theme";
export const WEBSITE = "https://drammawayne-cloud.github.io/highlife-radio/";
export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function Page({children}:{children:ReactNode}) {
  return <SafeAreaView edges={["top","left","right"]} style={styles.safe}>
    <ScrollView contentContainerStyle={styles.page}>{children}</ScrollView>
  </SafeAreaView>;
}
export function Brand() {
  return <View><Text style={styles.brand}>HIGH LIFE <Text style={{color:C.acid}}>RADIO</Text></Text>
    <Text style={styles.tag}>CARIBBEAN ENERGY. GLOBAL FREQUENCY.</Text></View>;
}
export function Section({children}:{children:ReactNode}) {return <Text style={styles.section}>{children}</Text>;}
export function Card({title,body,children}:{title?:string;body?:string;children?:ReactNode}) {
  return <View style={styles.card}>{title && <Text style={styles.cardTitle}>{title}</Text>}
    {body && <Text style={styles.body}>{body}</Text>}{children}</View>;
}
export function Button({label,onPress,selected=false,disabled=false}:{label:string;onPress:()=>void;selected?:boolean;disabled?:boolean}) {
  return <Pressable accessibilityRole="button" accessibilityState={{disabled,selected}}
    accessibilityLabel={label} onPress={onPress} disabled={disabled}
    style={({pressed})=>[styles.button,selected&&{backgroundColor:C.acid},pressed&&{opacity:.65},disabled&&{opacity:.45}]}>
    <Text style={[styles.buttonText,selected&&{color:C.ink}]}>{label}</Text>
  </Pressable>;
}
export function ExternalLink({label,url}:{label:string;url:string}) {
  const [error,setError]=useState("");
  return <View><Button label={label} onPress={()=>{
    setError(""); void Linking.openURL(url).catch(()=>setError("This link could not open. Please try again."));
  }}/>{!!error&&<Text accessibilityLiveRegion="polite" style={styles.body}>{error}</Text>}</View>;
}
export const styles=StyleSheet.create({safe:{flex:1,backgroundColor:C.ink},page:{padding:20,paddingBottom:30},
  brand:{color:"white",fontSize:22,fontWeight:"900",letterSpacing:1},
  tag:{color:C.muted,fontSize:9,fontWeight:"700",letterSpacing:1.5,marginTop:6},
  title:{color:"white",fontSize:36,fontWeight:"900",lineHeight:40,marginVertical:12},
  section:{color:C.acid,fontSize:11,fontWeight:"900",letterSpacing:2,marginTop:26,marginBottom:10},
  card:{backgroundColor:C.panel,borderWidth:1,borderColor:"#313a34",borderRadius:16,padding:18,marginBottom:10},
  cardTitle:{color:"white",fontWeight:"800",fontSize:18},body:{color:C.muted,fontSize:14,lineHeight:22,marginTop:8},
  button:{borderWidth:1,borderColor:"#3b443e",borderRadius:12,paddingVertical:14,paddingHorizontal:16,marginTop:10,minHeight:48},
  buttonText:{color:C.acid,fontWeight:"800",fontSize:14},row:{flexDirection:"row",flexWrap:"wrap",gap:10},
  small:{color:C.muted,fontSize:12,lineHeight:18,marginTop:6}});
