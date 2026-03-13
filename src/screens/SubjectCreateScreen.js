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

export default function SubjectCreateScreen() {
  const [subjectName, setSubjectName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data.data || []);
    } catch {
      Alert.alert("Error", "Failed to load subjects");
    }
  };

  /* ================= SAVE ================= */
  const saveSubject = async () => {
    if (!subjectName.trim()) {
      Alert.alert("Error", "Subject name required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/subjects", {
        name: subjectName.trim(),
      });

      setSubjectName("");
      loadSubjects();

      Alert.alert("Success", "Subject Created");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Subject already exists"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = (subject) => {
    setSelectedSubject(subject);
    setDeleteModal(true);
  };

  const deleteSubject = async () => {
    try {
      await api.delete(`/subjects/${selectedSubject.id}`);
      setDeleteModal(false);
      loadSubjects();
    } catch {
      Alert.alert("Error", "Delete failed");
    }
  };

  /* ================= SEARCH FILTER ================= */
  const filteredSubjects = subjects.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>📚 Subjects</Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {subjects.length}
          </Text>
        </View>
      </View>

      {/* CREATE CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Create New Subject
        </Text>

        <TextInput
          placeholder="Enter subject name..."
          style={styles.input}
          value={subjectName}
          onChangeText={setSubjectName}
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveSubject}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Saving..." : "Save Subject"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔍 SEARCH */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search subject..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setSearch("")}
          >
            <Text style={{ color: "#fff" }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LIST TITLE */}
      <Text style={styles.listTitle}>
        Subject List
      </Text>

      {/* LIST */}
      <FlatList
        data={filteredSubjects}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No subjects found
          </Text>
        }
        renderItem={({ item, index }) => (
          <View style={styles.subjectCard}>
            <View>
              <Text style={styles.subjectIndex}>
                #{index + 1}
              </Text>
              <Text style={styles.subjectName}>
                {item.name}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => confirmDelete(item)}
            >
              <Text style={styles.deleteText}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* DELETE MODAL */}
      <Modal
        visible={deleteModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Delete Subject ⚠️
            </Text>

            <Text style={styles.modalText}>
              Are you sure delete{" "}
              <Text style={{ fontWeight: "bold" }}>
                {selectedSubject?.name}
              </Text>
              ?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteModal(false)}
              >
                <Text style={styles.btnText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={deleteSubject}
              >
                <Text style={styles.btnText}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: "space-between",
    marginBottom: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
  },

  countBadge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  countText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  cardTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
  },

  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
  },

  clearBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  listTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },

  subjectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },

  subjectIndex: {
    fontSize: 12,
    color: "#6b7280",
  },

  subjectName: {
    fontWeight: "bold",
    fontSize: 16,
  },

  deleteBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#6b7280",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  modalText: {
    textAlign: "center",
    marginBottom: 20,
  },

  modalBtnRow: {
    flexDirection: "row",
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#6b7280",
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
  },

  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
