import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import api from "../api/api";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function RoutineFilterScreen() {

  /* ================= STATIC LIST ================= */

  const classList = [
    "Class-V", "Class-VI", "Class-VII", "Class-VIII",
    "Class-IX", "Class-X", "Class-XI", "Class-XII",
  ];

  const sectionList = [
    "Section-A", "Section-B", "Section-C",
  ];

  /* ================= STATE ================= */

  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");

  const [routines, setRoutines] = useState([]);

  const [classModal, setClassModal] = useState(false);
  const [sectionModal, setSectionModal] = useState(false);


  /* ================= LOAD ================= */

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    const res = await api.get("/class-routine");
    setRoutines(res.data.data || []);
  };

  /* ================= FILTER ================= */

  const filteredData =
    !className || !section
      ? []
      : routines.filter(
        (r) =>
          r.className === className &&
          r.section === section
      );
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

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const showRoutine =
    className !== "" &&
    section !== "";

  const groupedData = days.map((day) => ({
    day,
    routines: filteredData
      .filter((item) => item.day === day)
      .sort(
        (a, b) =>
          (periodOrder[a.period] || 99) -
          (periodOrder[b.period] || 99)
      ),
  }));

  /* ================= DELETE ================= */

  const deleteRoutine = (id) => {
    Alert.alert(
      "Delete Routine",
      "Are you sure?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await api.delete(`/class-routine/${id}`);
            loadRoutines();
          }
        }
      ]
    );
  };

 const generatePdf = async () => {
  try {

    const pdfUrl =
      `${api.defaults.baseURL}/class-routine/pdf?className=${className}&section=${section}`;

    const fileUri =
      FileSystem.documentDirectory +
      "routine.pdf";

    const result =
      await FileSystem.downloadAsync(
        pdfUrl,
        fileUri
      );

    console.log(result);

    await Sharing.shareAsync(
      result.uri
    );

  } catch (err) {

    console.log("PDF ERROR =>", err);

    Alert.alert(
      "Error",
      err.message
    );

  }
};


  /* ================= UI ================= */

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        🔎 Filter Routine
      </Text>

      {/* ===== FILTER BAR ===== */}

      <View style={styles.searchRow}>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setClassModal(true)}
        >
          <Text>
            {className || "Class"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setSectionModal(true)}
        >
          <Text>
            {section || "Section"}
          </Text>
        </TouchableOpacity>

      </View>

      {/* ===== ROUTINE LIST ===== */}

      {!showRoutine && (
        <Text
          style={{
            textAlign: "center",
            marginTop: 50,
            fontSize: 16,
            color: "red",
            fontWeight: "bold",
          }}
        >
          Please Select Class & Section
        </Text>
      )}
      {showRoutine && (
        <TouchableOpacity
          style={styles.pdfBtn}
          onPress={generatePdf}
        >
          <Text style={styles.btnText}>
            Convert PDF
          </Text>
        </TouchableOpacity>
      )}
      {showRoutine && (
        <FlatList
          data={groupedData}
          keyExtractor={(item) => item.day}
          renderItem={({ item: group }) => (
            <View>

              {group.routines.length > 0 && (
                <Text style={styles.dayTitle}>
                  📅 {group.day}
                </Text>
              )}

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={group.routines}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.routineCard}>

                    <Text style={styles.periodText}>
                      {item.period}
                    </Text>

                    <Text style={styles.timeText}>
                      {item.time}
                    </Text>

                    <Text style={styles.subjectText}>
                      {item.subject}
                    </Text>

                    <Text style={styles.teacherText}>
                      👨‍🏫 {item.teacher?.name}
                    </Text>

                    <View style={styles.row}>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteRoutine(item.id)}
                      >
                        <Text style={styles.btnText}>
                          Delete
                        </Text>
                      </TouchableOpacity>

                    </View>

                  </View>
                )}
              />

            </View>
          )}
        />
      )}

      {/* ================= CLASS MODAL ================= */}

      <SelectModal
        visible={classModal}
        data={classList}
        onSelect={(v) => {
          setClassName(v);
          setClassModal(false);
        }}
        onClose={() => setClassModal(false)}
      />

      {/* ================= SECTION MODAL ================= */}

      <SelectModal
        visible={sectionModal}
        data={sectionList}
        onSelect={(v) => {
          setSection(v);
          setSectionModal(false);
        }}
        onClose={() => setSectionModal(false)}
      />


    </View>
  );
}

/* ================= REUSABLE MODAL ================= */

const SelectModal = ({ visible, data, onSelect, onClose }) => (
  <Modal visible={visible} transparent>

    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>

        <FlatList
          data={data}
          keyExtractor={(i, idx) => idx.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => onSelect(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
        >
          <Text style={{ color: "#fff" }}>
            Close
          </Text>
        </TouchableOpacity>

      </View>
    </View>

  </Modal>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f1f5f9",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  searchBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
  },

  filterBtn: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  deleteBtn: {
    backgroundColor: "#dc2626",
    padding: 8,
    borderRadius: 6,
  },

  btnText: {
    color: "#fff",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
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
  dayTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginTop: 15,
    marginBottom: 10,
  },

  routineCard: {
    width: 150,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginRight: 12,
    marginBottom: 15,
    elevation: 5,
  },

  periodText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },

  timeText: {
    marginTop: 5,
  },

  subjectText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "600",
  },

  teacherText: {
    marginTop: 5,
    color: "#059669",
  },
  pdfBtn: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

});
