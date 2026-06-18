import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/api";

export default function AbsentTeacherScreen() {
  const [teachers, setTeachers] = useState([]);
  const [absentTeacherIds, setAbsentTeacherIds] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      const teacherRes = await api.get("/teachers");
      const absentRes = await api.get("/absent/today");

      const sortedTeachers =
        (teacherRes.data.data || []).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      setTeachers(sortedTeachers);

      const absentIds =
        absentRes.data.data.map(
          (item) => item.teacherId
        );

      setAbsentTeacherIds(absentIds);
    } catch (err) {
      Alert.alert("Error", "Failed to load absent data");
    } finally {
      setLoading(false);
    }
  };

  /* ================= MARK ABSENT ================= */

  const markAbsent = async (teacherId) => {
    try {
      setLoading(true);

      const res = await api.post(
        "/absent/mark",
        { teacherId }
      );

      Alert.alert("Success", res.data.message);

      loadData();
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message ||
        "Failed to mark absent"
      );
    } finally {
      setLoading(false);
    }
  };


  const resetAbsent = async (teacherId) => {
    try {
      setLoading(true);

      await api.delete(
        `/absent/reset/${teacherId}`
      );

      Alert.alert(
        "Success",
        "Teacher reset successfully"
      );

      loadData();
    } catch (err) {
      Alert.alert(
        "Error",
        "Failed to reset teacher"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAllAbsent = async () => {
  Alert.alert(
    "Reset All",
    "Are you sure you want to clear all absent teachers?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          try {

            setLoading(true);

            await api.delete(
              "/absent/reset-all"
            );

            Alert.alert(
              "Success",
              "All absent teachers reset successfully"
            );

            loadData();

          } catch (err) {

            Alert.alert(
              "Error",
              "Failed to reset all teachers"
            );

          } finally {

            setLoading(false);

          }
        },
      },
    ]
  );
};

  /* ================= COUNTS ================= */

  const totalTeachers = teachers.length;
  const totalAbsent =
    absentTeacherIds.length;

  /* ================= RENDER ================= */

  const renderItem = ({ item, index }) => {
    const isAbsent =
      absentTeacherIds.includes(item.id);

    return (
      <View style={styles.card}>

        {/* SERIAL */}
        <View style={styles.serialBox}>
          <Text style={styles.serialText}>
            {index + 1}
          </Text>
        </View>

        {/* INFO */}
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.subjectLine}>
            <Text
              style={styles.mainSubjectText}
            >
              Main: {item.mainSubject}
            </Text>

            {item.optionalSubjects?.[0] && (
              <Text>
                {" "}
                | Opt1: {item.optionalSubjects[0]}
              </Text>
            )}
            {item.optionalSubjects?.[1] && (
              <Text>
                {" "}
                | Opt2: {item.optionalSubjects[1]}
              </Text>
            )}
            {item.optionalSubjects?.[2] && (
              <Text>
                {" "}
                | Opt3: {item.optionalSubjects[2]}
              </Text>
            )}
          </Text>
        </View>

        {/* BUTTON */}
        <View style={styles.buttonRow}>

          <TouchableOpacity
            style={[
              styles.btn,
              isAbsent && styles.btnDisabled,
            ]}
            onPress={() => markAbsent(item.id)}
            
            disabled={isAbsent}
          >
            <Text style={styles.btnText}>
              {isAbsent ? "Absent" : "Present"}
            </Text>
          </TouchableOpacity>

          

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => resetAbsent(item.id)}
          >
            <Text style={styles.btnText}>
              Reset
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  /* ================= UI ================= */

  return (
    <View style={styles.container}>

      {/* TITLE + SUMMARY */}
      <View style={styles.headerRow}>

        <Text style={styles.title}>
          Today Absent Teachers List
        </Text>

        <View style={styles.summaryBox}>

  <View style={styles.summaryCard}>
    <Text style={styles.sumLabel}>
      Total
    </Text>
    <Text style={styles.sumValue}>
      {totalTeachers}
    </Text>
  </View>

  <View
    style={[
      styles.summaryCard,
      styles.absentCard,
    ]}
  >
    <Text style={styles.sumLabel}>
      Absent
    </Text>
    <Text style={styles.sumValue}>
      {totalAbsent}
    </Text>
  </View>

  <TouchableOpacity
    style={styles.resetAllBtn}
    onPress={resetAllAbsent}
  >
    <Text style={styles.btnText}>
      All Reset
    </Text>
  </TouchableOpacity>

</View>
      </View>

      {/* LIST */}
      <FlatList
        data={teachers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f2f6fc",
  },

  /* HEADER ROW */

  headerRow: {
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
    marginBottom: 8,
  },

  /* SUMMARY */

  summaryBox: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  summaryCard: {
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 70,
  },

  absentCard: {
    backgroundColor: "#ef4444",
  },

  sumLabel: {
    color: "#fff",
    fontSize: 11,
  },

  sumValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  /* TEACHER CARD */

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
    elevation: 2,
  },

  serialBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  serialText: {
    color: "#fff",
    fontWeight: "bold",
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },

  subjectLine: {
    fontSize: 12,
    color: "#6b7280",
  },

  mainSubjectText: {
    color: "#047857",
    fontWeight: "bold",
  },

  btn: {
    backgroundColor: "#16a34a",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },

  btnDisabled: {
    backgroundColor: "#ef4444",
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 5,
  },

  resetBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  resetAllBtn: {
  backgroundColor: "#16a34a",
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
},

});
