import React, { useState, useEffect } from "react";
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
import api from "../api/api";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function TeacherNormalRoutineScreen() {
  const dayList = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [day, setDay] = useState("");
  const [dayModal, setDayModal] = useState(false);

  const [routine, setRoutine] = useState([]);
  const [loading, setLoading] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [teacherModal, setTeacherModal] = useState(false);

  const loadTeachers = async () => {
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadRoutine = async (
    selectedTeacherId = teacherId,
    selectedDay = day
  ) => {
    try {

      setLoading(true);

      const res = await api.get(
        "/teacher-normal-routine",
        {
          params: {
            teacherId:
              selectedTeacherId || undefined,
            day:
              selectedDay || undefined,
          },
        }
      );

      setRoutine(res.data.data || []);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const periodOrder = {
    First: 1,
    Second: 2,
    Third: 3,
    Fourth: 4,
    Fifth: 5,
    Sixth: 6,
    Seventh: 7,
    Eight: 8,
  };

  const groupedRoutine = days.map((d) => ({
    day: d,
    routines: routine
      .filter((item) => item.day === d)
      .sort(
        (a, b) =>
          (periodOrder[a.period] || 99) -
          (periodOrder[b.period] || 99)
      ),
  }));
  const generateTeacherPdf = async () => {
  try {

    const pdfUrl =
      `${api.defaults.baseURL}/teacher-pdf?teacherId=${teacherId}`;

    const fileUri =
      FileSystem.documentDirectory +
      "teacher-routine.pdf";

    const result =
      await FileSystem.downloadAsync(
        pdfUrl,
        fileUri
      );

    await Sharing.shareAsync(
      result.uri
    );

  } catch (err) {

    console.log(
      "PDF ERROR =>",
      err
    );

    Alert.alert(
      "Error",
      "PDF Generation Failed"
    );
  }
};
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Teachers Normal Routine
      </Text>

      <View style={styles.topRow}>

        <TouchableOpacity
          style={styles.dropdownHalf}
          onPress={() => setTeacherModal(true)}
        >
          <Text>
            {teacherName || "Select Teacher"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdownHalf}
          onPress={() => setDayModal(true)}
        >
          <Text>
            {day || "Select Day"}
          </Text>
        </TouchableOpacity>

      </View>
      {loading && (
        <Text style={styles.loading}>
          Loading...
        </Text>
      )}
{teacherName !== "" && (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    }}
  >
    <Text
      style={{
        fontSize: 24,
        fontWeight: "bold",
        color: "#1e3a8a",
      }}
    >
      {teacherName}
    </Text>

    <TouchableOpacity
      style={styles.pdfBtn}
      onPress={generateTeacherPdf}
    >
      <Text style={styles.btnText}>
        Convert PDF
      </Text>
    </TouchableOpacity>
  </View>
)}

      {groupedRoutine.map((group) => {

        if (group.routines.length === 0)
          return null;

        return (

          <View key={group.day}>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
                marginTop: 10,
                color: "#2563eb",
              }}
            >
              {group.day}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >

              {group.routines.map((item, index) => (

                <View
                  key={index}
                  style={styles.routineCard}
                >

                  <Text
                    style={styles.periodText}
                  >
                    {item.period}
                  </Text>

                  <Text>
                    {item.time}
                  </Text>

                  <Text
                    style={styles.subjectText}
                  >
                    {item.subject}
                  </Text>

                  <Text>
                    {item.className}
                  </Text>

                  <Text>
                    {item.section}
                  </Text>

                </View>

              ))}

            </ScrollView>

          </View>

        );

      })}

      {!loading &&
        teacherName !== "" &&
        routine.length === 0 && (
          <Text style={styles.noData}>
            No Routine Found
          </Text>
        )}
      <Modal
        visible={teacherModal}
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <FlatList
              data={teachers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setTeacherId(item.id);
                    setTeacherName(item.name);
                    setTeacherModal(false);

                    setDay("");
                    loadRoutine(item.id, "");
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() =>
                setTeacherModal(false)
              }
            >
              <Text style={{ color: "#fff" }}>
                Close
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
      <Modal
        visible={dayModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <FlatList
              data={dayList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setDay(item);
                    setDayModal(false);

                    loadRoutine(
                      teacherId,
                      item
                    );
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setDayModal(false)}
            >
              <Text style={{ color: "#fff" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1e3a8a",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  dropdownHalf: {
    width: "48%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
  },

  dropdownText: {
    color: "#333",
  },

  searchHalf: {
    width: "48%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  loading: {
    textAlign: "center",
    marginTop: 20,
  },

  noData: {
    textAlign: "center",
    marginTop: 20,
    color: "red",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },

  teacher: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 8,
  },

  info: {
    fontSize: 14,
    marginBottom: 3,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    maxHeight: "80%",
  },

  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  closeBtn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  searchBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },

  routineCard: {
    width: 180,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 15,
    elevation: 4,
  },

  periodText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },

  subjectText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
});