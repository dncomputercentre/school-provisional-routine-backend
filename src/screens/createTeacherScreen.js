import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import api from "../api/api";

export default function CreateTeacherScreen() {
  /* ================= STATE ================= */

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const [mainSubject, setMainSubject] =
    useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");

  const [subjects, setSubjects] = useState(
    []
  );
  const [teachers, setTeachers] = useState(
    []
  );

  const [search, setSearch] = useState("");
  const [showList, setShowList] =
    useState(false);

  const [subjectModal, setSubjectModal] =
    useState(false);
  const [selectField, setSelectField] =
    useState("");

  const [editModal, setEditModal] =
    useState(false);
  const [editTeacher, setEditTeacher] =
    useState(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    loadSubjects();
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

  const saveTeacher = async () => {
    if (!name || !mobile || !mainSubject) {
      Alert.alert(
        "Error",
        "Name, Mobile & Main Subject required"
      );
      return;
    }

    await api.post("/teachers", {
      name,
      mobile,
      mainSubject,
      optionalSubjects: [
        opt1,
        opt2,
        opt3,
      ].filter(Boolean),
    });

    resetForm();
    loadTeachers();
  };

  /* ================= EDIT ================= */

  const openEditModal = (t) => {
    setEditTeacher(t);

    setName(t.name);
    setMobile(t.mobile);
    setMainSubject(t.mainSubject);

    setOpt1(
      t.optionalSubjects?.[0] || ""
    );
    setOpt2(
      t.optionalSubjects?.[1] || ""
    );
    setOpt3(
      t.optionalSubjects?.[2] || ""
    );

    setEditModal(true);
  };

  const updateTeacher = async () => {
    await api.put(
      `/teachers/${editTeacher.id}`,
      {
        name,
        mobile,
        mainSubject,
        optionalSubjects: [
          opt1,
          opt2,
          opt3,
        ].filter(Boolean),
      }
    );

    setEditModal(false);
    resetForm();
    loadTeachers();
  };

  /* ================= DELETE ================= */

  const deleteTeacher = async (id) => {
    await api.delete(`/teachers/${id}`);
    loadTeachers();
  };

  /* ================= SUBJECT SELECT ================= */

  const selectSubject = (sub) => {
    if (selectField === "main")
      setMainSubject(sub);
    if (selectField === "o1") setOpt1(sub);
    if (selectField === "o2") setOpt2(sub);
    if (selectField === "o3") setOpt3(sub);

    setSubjectModal(false);
  };

  /* ================= RESET ================= */

  const resetForm = () => {
    setName("");
    setMobile("");
    setMainSubject("");
    setOpt1("");
    setOpt2("");
    setOpt3("");
  };

  /* ================= SEARCH ================= */

  const filteredTeachers =
    teachers.filter(
      (t) =>
        t.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        t.mainSubject
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>
          👨‍🏫 Teachers
        </Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {teachers.length}
          </Text>
        </View>
      </View>

      {/* CREATE CARD */}
      <View style={styles.card}>
        <TextInput
          placeholder="Teacher Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Mobile"
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
        />

        {/* SUBJECTS */}

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setSelectField("main");
            setSubjectModal(true);
          }}
        >
          <Text>
            {mainSubject ||
              "Select Main Subject"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setSelectField("o1");
            setSubjectModal(true);
          }}
        >
          <Text>
            {opt1 ||
              "Optional Subject 1"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setSelectField("o2");
            setSubjectModal(true);
          }}
        >
          <Text>
            {opt2 ||
              "Optional Subject 2"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setSelectField("o3");
            setSubjectModal(true);
          }}
        >
          <Text>
            {opt3 ||
              "Optional Subject 3"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={
            editModal
              ? updateTeacher
              : saveTeacher
          }
        >
          <Text style={styles.btnText}>
            {editModal
              ? "Update Teacher"
              : "Save Teacher"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.showBtn}
          onPress={() => {
            loadTeachers();
            setShowList(!showList);
          }}
        >
          <Text style={styles.btnText}>
            {showList
              ? "Hide Teacher List"
              : "Show Teacher List"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH + LIST */}

      {showList && (
        <>
          <TextInput
            placeholder="Search teacher..."
            style={styles.search}
            value={search}
            onChangeText={setSearch}
          />

          <FlatList
            data={filteredTeachers}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View
                style={
                  styles.teacherRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.name
                    }
                  >
                    {item.name}
                  </Text>
                  <Text>
                    {
                      item.mainSubject
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.actionRow
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.editBtn
                    }
                    onPress={() =>
                      openEditModal(
                        item
                      )
                    }
                  >
                    <Text
                      style={
                        styles.btnText
                      }
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.deleteBtn
                    }
                    onPress={() =>
                      deleteTeacher(
                        item.id
                      )
                    }
                  >
                    <Text
                      style={
                        styles.btnText
                      }
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </>
      )}

      {/* ================= SUBJECT MODAL ================= */}

      <Modal
        visible={subjectModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* TITLE */}
            <Text style={styles.modalTitle}>
              Select Subject
            </Text>

            <FlatList
              data={subjects}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={
                    styles.modalItem
                  }
                  onPress={() =>
                    selectSubject(
                      item.name
                    )
                  }
                >
                  <Text>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* CLOSE BUTTON */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() =>
                setSubjectModal(false)
              }
            >
              <Text style={styles.btnText}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f1f5f9",
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  countBadge: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 20,
  },

  countText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },

  dropdown: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  showBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
  },

  search: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  teacherRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
  },

  editBtn: {
    backgroundColor: "#f59e0b",
    padding: 8,
    borderRadius: 6,
  },

  deleteBtn: {
    backgroundColor: "#dc2626",
    padding: 8,
    borderRadius: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
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
  },
});
