import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import api from "../api/api";

export default function TeacherNormalRoutineScreen() {

  /* ================= DAY LIST ================= */

  const dayList = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  /* ================= STATE ================= */

  const [day, setDay] = useState("");
  const [dayModal, setDayModal] = useState(false);

  const [search, setSearch] = useState("");
  const [routine, setRoutine] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ROUTINE ================= */

  const loadRoutine = async (selectedDay) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/teacher-normal-routine/${selectedDay}`
      );

      setRoutine(res.data.data || []);

    } catch (err) {
      Alert.alert("Routine load failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH FILTER ================= */

  const filteredRoutine = routine.filter((r) => {

    if (!search) return true;

    const teacherName =
      r.teacher?.name || "";

    const subject =
      r.subject || "";

    return (
      teacherName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      subject
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  /* ================= UI ================= */

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Teachers Normal Routine
      </Text>

      {/* 🔥 DAY + SEARCH ROW 🔥 */}
      <View style={styles.topRow}>

        {/* DAY SELECT */}
        <TouchableOpacity
          style={styles.dropdownHalf}
          onPress={() => setDayModal(true)}
        >
          <Text>{day || "Select Day"}</Text>
        </TouchableOpacity>

        {/* SEARCH */}
        <TextInput
          style={styles.searchHalf}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />

      </View>

      {/* LOADING */}
      {loading && (
        <Text style={{ textAlign: "center" }}>
          Loading...
        </Text>
      )}

      {/* ROUTINE CARD */}
      {filteredRoutine.map((item, index) => {

        const teacherName =
          item.teacher?.name || "No Teacher";

        return (
          <View key={index} style={styles.card}>

            <Text style={styles.teacher}>
              👨‍🏫 {teacherName}
            </Text>

            <Text>
              📚 Subject: {item.subject}
            </Text>

            <Text>
              🏫 Class: {item.className}
            </Text>

            <Text>
              🧩 Section: {item.section}
            </Text>

            <Text>
              ⏰ Period: {item.period}
            </Text>

            <Text>
              🕒 Time: {item.time}
            </Text>

          </View>
        );
      })}

      {/* NO DATA */}
      {!loading && filteredRoutine.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No Routine Found
        </Text>
      )}

      {/* DAY MODAL */}
      <Modal visible={dayModal} transparent>

        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <FlatList
              data={dayList}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setDay(item);
                    setDayModal(false);
                    loadRoutine(item);
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

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f1f5f9",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  /* 🔥 TOP ROW STYLE 🔥 */
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  dropdownHalf: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    width: "48%",
  },

  searchHalf: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    width: "48%",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
  },

  teacher: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1e3a8a",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    maxHeight: "80%",
  },

  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
  },

  closeBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

});
