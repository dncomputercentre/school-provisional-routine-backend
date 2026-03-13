import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import api from "../api/api";

export default function ClassRoutineScreen({ navigation }) {

  /* ================= STATIC LIST ================= */

  const dayList = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const classList = [
    "Class-V", "Class-VI", "Class-VII", "Class-VIII",
    "Class-IX", "Class-X", "Class-XI", "Class-XII",
  ];

  const sectionList = [
    "Section-A", "Section-B", "Section-C",
  ];

  const periodList = [
    "First", "Second", "Third", "Fourth",
    "Fifth", "Sixth", "Seventh", "Eight",
  ];

  const hourList = [
    "09", "10", "11", "12", "01", "02", "03", "04",
  ];

  const minuteList = [
    "00", "05", "10", "15", "20", "25",
    "30", "35", "40", "45", "50", "55",
  ];

  /* ================= STATE ================= */

  const [day, setDay] = useState("");              // ⭐ NEW
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [period, setPeriod] = useState("");

  const [startHour, setStartHour] = useState("");
  const [startMin, setStartMin] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMin, setEndMin] = useState("");

  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  /* ================= MODALS ================= */

  const [dayModal, setDayModal] = useState(false);     // ⭐ NEW
  const [classModal, setClassModal] = useState(false);
  const [sectionModal, setSectionModal] = useState(false);
  const [periodModal, setPeriodModal] = useState(false);
  const [timeModal, setTimeModal] = useState(false);
  const [subjectModal, setSubjectModal] = useState(false);
  const [teacherModal, setTeacherModal] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    loadSubjects();
    loadTeachers();
  }, []);

  const loadSubjects = async () => {
    const res = await api.get("/subjects");
    setSubjects(res.data.data || []);
  };

  const loadTeachers = async () => {
    const res = await api.get("/teachers");
    setTeachers(res.data.data || []);
  };

  /* ================= SAVE ================= */

  const saveRoutine = async () => {
    try {

      if (!day) {
        Alert.alert("Please select day");
        return;
      }

      const time =
        `${startHour}:${startMin} - ${endHour}:${endMin}`;

      const res = await api.post(
        "/class-routine",
        {
          day,
          className,
          section,
          period,
          time,
          subject,
          teacherId,
        }
      );

      console.log(res.data);

      Alert.alert("Saved");

      resetForm();

    } catch (err) {
      console.log("ERROR =>", err.response?.data);
      Alert.alert(
        err.response?.data?.message ||
        "Save failed"
      );
    }
  };

  const resetForm = () => {
    setDay("");
    setClassName("");
    setSection("");
    setPeriod("");
    setStartHour("");
    setStartMin("");
    setEndHour("");
    setEndMin("");
    setSubject("");
    setTeacherId("");
    setSelectedTeacher(null);
  };

  /* ================= UI ================= */

  return (
    <>
      <ScrollView style={styles.container}>

        <Text style={styles.title}>
          Create Class Routine
        </Text>

        {/* DAY ⭐ NEW */}
        <Dropdown
          label={day || "Select Day"}
          onPress={() => setDayModal(true)}
        />

        <Dropdown
          label={className || "Select Class"}
          onPress={() => setClassModal(true)}
        />

        <Dropdown
          label={section || "Select Section"}
          onPress={() => setSectionModal(true)}
        />

        <Dropdown
          label={period || "Select Period"}
          onPress={() => setPeriodModal(true)}
        />

        <Dropdown
          label={
            startHour
              ? `${startHour}:${startMin} - ${endHour}:${endMin}`
              : "Select Time"
          }
          onPress={() => setTimeModal(true)}
        />

        <Dropdown
          label={subject || "Select Subject"}
          onPress={() => setSubjectModal(true)}
        />

        <Dropdown
          label={
            selectedTeacher
              ? `${selectedTeacher.name} (${selectedTeacher.mainSubject})`
              : "Select Teacher"
          }
          onPress={() => setTeacherModal(true)}
        />

        {/* SAVE */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveRoutine}
        >
          <Text style={styles.saveText}>
            Save Routine
          </Text>
        </TouchableOpacity>

        {/* MANAGE */}
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() =>
            navigation.navigate("RoutineFilter")
          }
        >
          <Text style={styles.saveText}>
            📋 Show / Edit / Delete Routine
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ================= DAY MODAL ⭐ NEW ================= */}
      <SelectModal
        visible={dayModal}
        data={dayList}
        onSelect={(v) => {
          setDay(v);
          setDayModal(false);
        }}
        onClose={() => setDayModal(false)}
      />

      {/* CLASS */}
      <SelectModal
        visible={classModal}
        data={classList}
        onSelect={(v) => {
          setClassName(v);
          setClassModal(false);
        }}
        onClose={() => setClassModal(false)}
      />

      {/* SECTION */}
      <SelectModal
        visible={sectionModal}
        data={sectionList}
        onSelect={(v) => {
          setSection(v);
          setSectionModal(false);
        }}
        onClose={() => setSectionModal(false)}
      />

      {/* PERIOD */}
      <SelectModal
        visible={periodModal}
        data={periodList}
        onSelect={(v) => {
          setPeriod(v);
          setPeriodModal(false);
        }}
        onClose={() => setPeriodModal(false)}
      />

      {/* SUBJECT */}
      <SelectModal
        visible={subjectModal}
        data={subjects.map(s => s.name)}
        onSelect={(v) => {
          setSubject(v);
          setSubjectModal(false);
        }}
        onClose={() => setSubjectModal(false)}
      />

      {/* TEACHER */}
      <Modal visible={teacherModal} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <FlatList
              data={teachers}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setTeacherId(item.id);
                    setSelectedTeacher(item);
                    setTeacherModal(false);
                  }}
                >
                  <Text>
                    {item.name} ({item.mainSubject})
                  </Text>
                </TouchableOpacity>
              )}
            />

            <CloseBtn onPress={() => setTeacherModal(false)} />

          </View>
        </View>
      </Modal>

      {/* TIME */}
      <Modal visible={timeModal} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>Start</Text>
            <SelectRow list={hourList} onSelect={setStartHour} />
            <SelectRow list={minuteList} onSelect={setStartMin} />

            <Text style={styles.modalTitle}>End</Text>
            <SelectRow list={hourList} onSelect={setEndHour} />
            <SelectRow list={minuteList} onSelect={setEndMin} />

            <CloseBtn onPress={() => setTimeModal(false)} />

          </View>
        </View>
      </Modal>

    </>
  );
}

/* ================= COMPONENTS ================= */

const Dropdown = ({ label, onPress }) => (
  <TouchableOpacity style={styles.dropdown} onPress={onPress}>
    <Text>{label}</Text>
  </TouchableOpacity>
);

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

        <CloseBtn onPress={onClose} />

      </View>
    </View>
  </Modal>
);

const SelectRow = ({ list, onSelect }) => (
  <FlatList
    horizontal
    data={list}
    keyExtractor={(i) => i}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={styles.timeItem}
        onPress={() => onSelect(item)}
      >
        <Text>{item}</Text>
      </TouchableOpacity>
    )}
  />
);

const CloseBtn = ({ onPress }) => (
  <TouchableOpacity style={styles.closeBtn} onPress={onPress}>
    <Text style={{ color: "#fff" }}>Close</Text>
  </TouchableOpacity>
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
    textAlign: "center",
  },

  dropdown: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  saveBtn: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },

  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
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

  modalTitle: {
    fontWeight: "bold",
    marginTop: 10,
  },

  timeItem: {
    padding: 10,
    backgroundColor: "#eee",
    margin: 5,
    borderRadius: 6,
  },

  manageBtn: {
    backgroundColor: "#7c3aed",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },

});
