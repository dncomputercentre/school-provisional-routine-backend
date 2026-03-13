import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import api from "../api/api";

export default function ProvisionalRoutineScreen() {

  /* ================= DAY + OFFDAY ================= */

  const dayList = [
    "Monday","Tuesday","Wednesday",
    "Thursday","Friday","Saturday",
    "Sunday (Off Day)",
    "Holiday",
  ];

  const periodList = [
    "First","Second","Third","Fourth",
    "Fifth","Sixth","Seventh","Eighth",
  ];

  /* ================= STATE ================= */

  const [day, setDay] = useState("");
  const [dayModal, setDayModal] = useState(false);
  const [data, setData] = useState([]);
  const [isOffDay, setIsOffDay] = useState(false);

  /* ================= LOAD ================= */

  const loadRoutine = async (selectedDay) => {

    if (selectedDay.includes("Off") ||
        selectedDay === "Holiday") {

      setIsOffDay(true);
      setData([]);
      return;
    }

    setIsOffDay(false);

    const res = await api.get(
      `/provisional-routine/${selectedDay}`
    );

    setData(res.data.data || []);
  };

  /* ================= GROUP CLASS ================= */

  const groupedClass = {};

  data.forEach((r) => {
    const key = `${r.className}-${r.section}`;
    if (!groupedClass[key]) groupedClass[key] = [];
    groupedClass[key].push(r);
  });

  const classKeys = Object.keys(groupedClass);

  /* ================= GROUP TEACHER ================= */

  const groupedTeacher = {};

  data.forEach((r) => {

    const name =
      r.substituteTeacher?.name ||
      r.teacher?.name;

    if (!groupedTeacher[name])
      groupedTeacher[name] = [];

    groupedTeacher[name].push(r);
  });

  const teacherKeys =
    Object.keys(groupedTeacher);

  /* ================= CLASS PDF ================= */

  const printClassPDF = async () => {

    if (!data.length) {
      Alert.alert("No data");
      return;
    }

    let html = `
    <h2 style="text-align:center">
      Provisional Routine - ${day}
    </h2>

    <table border="1"
    style="width:100%;border-collapse:collapse;font-size:12px">

    <tr>
      <th>Class</th>
      ${periodList.map(p=>`<th>${p}</th>`).join("")}
    </tr>
    `;

    classKeys.forEach((key)=>{

      html += `<tr><td>${key}</td>`;

      periodList.forEach((p)=>{

        const item =
          groupedClass[key].find(
            r=>r.period===p
          );

        if(!item){
          html+=`<td></td>`;
          return;
        }

        const teacher =
          item.isAbsent
            ? `<strike>${item.teacher?.name}</strike><br/>
               ${item.substituteTeacher?.name||"Blank"}`
            : item.teacher?.name;

        html+=`
        <td>
          ${item.subject}<br/>
          ${teacher}
        </td>`;
      });

      html+=`</tr>`;
    });

    html+=`</table>`;

    const { uri } =
      await Print.printToFileAsync({
        html,
        width:842,
        height:595,
      });

    await Sharing.shareAsync(uri);
  };

  /* ================= TEACHER PDF ================= */

  const printTeacherPDF = async () => {

    if (!data.length) {
      Alert.alert("No data");
      return;
    }

    let html = `
    <h2 style="text-align:center">
      Teacher Wise Provisional - ${day}
    </h2>

    <table border="1"
    style="width:100%;border-collapse:collapse;font-size:12px">

    <tr>
      <th>Teacher</th>
      ${periodList.map(p=>`<th>${p}</th>`).join("")}
    </tr>
    `;

    teacherKeys.forEach((teacher)=>{

      html+=`<tr><td>${teacher}</td>`;

      periodList.forEach((p)=>{

        const item =
          groupedTeacher[teacher]
          .find(r=>r.period===p);

        if(!item){
          html+=`<td></td>`;
          return;
        }

        html+=`
        <td>
          ${item.className}-${item.section}<br/>
          ${item.subject}
        </td>`;
      });

      html+=`</tr>`;
    });

    html+=`</table>`;

    const { uri } =
      await Print.printToFileAsync({
        html,
        width:842,
        height:595,
      });

    await Sharing.shareAsync(uri);
  };

  /* ================= UI ================= */

  return (
    <ScrollView style={styles.container}>

      {/* DAY SELECT */}
      <TouchableOpacity
        style={styles.dayBtn}
        onPress={()=>setDayModal(true)}
      >
        <Text style={styles.dayText}>
          {day||"Select Day"}
        </Text>
      </TouchableOpacity>

      {/* OFFDAY MESSAGE */}
      {isOffDay && (
        <Text style={styles.offText}>
          Routine Off Day
        </Text>
      )}

      {/* GRID HIDE IF OFFDAY */}
      {!isOffDay && (
        <ScrollView horizontal>
          <View>

            {classKeys.map((key)=>(
              <Text key={key}
                style={styles.classRow}>
                {key}
              </Text>
            ))}

          </View>
        </ScrollView>
      )}

      {/* PRINT BUTTONS */}
      <TouchableOpacity
        style={styles.printBtn}
        onPress={printClassPDF}
      >
        <Text style={styles.printText}>
          🖨️ Class Wise Report
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.printBtn2}
        onPress={printTeacherPDF}
      >
        <Text style={styles.printText}>
          🖨️ Teacher Wise Report
        </Text>
      </TouchableOpacity>

      {/* DAY MODAL */}
      <Modal visible={dayModal} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <FlatList
              data={dayList}
              keyExtractor={(i)=>i}
              renderItem={({item})=>(
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={()=>{
                    setDay(item);
                    setDayModal(false);
                    loadRoutine(item);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container:{flex:1,padding:10},

  dayBtn:{
    backgroundColor:"#2563eb",
    padding:12,
    borderRadius:8,
    marginBottom:10,
  },

  dayText:{
    color:"#fff",
    textAlign:"center",
    fontWeight:"bold",
  },

  offText:{
    textAlign:"center",
    color:"red",
    fontWeight:"bold",
    marginBottom:20,
  },

  classRow:{
    padding:10,
    backgroundColor:"#fff",
    marginBottom:5,
  },

  printBtn:{
    backgroundColor:"#16a34a",
    padding:14,
    borderRadius:10,
    marginTop:15,
  },

  printBtn2:{
    backgroundColor:"#7c3aed",
    padding:14,
    borderRadius:10,
    marginTop:10,
  },

  printText:{
    color:"#fff",
    textAlign:"center",
    fontWeight:"bold",
  },

  modalOverlay:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.4)",
    justifyContent:"center",
    padding:20,
  },

  modalBox:{
    backgroundColor:"#fff",
    borderRadius:10,
    padding:15,
  },

  modalItem:{
    padding:12,
    borderBottomWidth:1,
  },

});
