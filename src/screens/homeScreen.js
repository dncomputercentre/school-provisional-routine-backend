import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.title}>
          🏫 School Provisional Routine
        </Text>
        <Text style={styles.subtitle}>
          Manage Routine • Teachers • Reports
        </Text>
      </View>

      {/* ===== MENU CARDS ===== */}

      <MenuCard
        title="Create Subject"
        icon="📚"
        color="#3b82f6"
        onPress={() =>
          navigation.navigate("subjectCreate")
        }
      />

      <MenuCard
        title="Create Teachers"
        icon="👨‍🏫"
        color="#10b981"
        onPress={() =>
          navigation.navigate("createTeacher")
        }
      />

      <MenuCard
        title="Absent Teachers"
        icon="🚫"
        color="#f59e0b"
        onPress={() =>
          navigation.navigate("absentTeacher")
        }
      />

      <MenuCard
        title="Class Routine"
        icon="🗂️"
        color="#6366f1"
        onPress={() =>
          navigation.navigate("classRoutine")
        }
      />

      <MenuCard
        title="Teachers Normal Routine"
        icon="👩‍🏫"
        color="#0ea5e9"
        onPress={() =>
          navigation.navigate("teacherNormalRoutine")
        }
      />

      <MenuCard
        title="Provisional Routine"
        icon="📊"
        color="#8b5cf6"
        onPress={() =>
          navigation.navigate("provisionalRoutine")
        }
      />

      {/* ===== LOGOUT ===== */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() =>
          navigation.replace("login")
        }
      >
        <Text style={styles.logoutText}>
          🔒 Logout
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

/* ================= MENU CARD ================= */

const MenuCard = ({
  title,
  icon,
  color,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.card, { borderLeftColor: color }]}
    onPress={onPress}
  >
    <Text style={styles.icon}>{icon}</Text>

    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>
        {title}
      </Text>
      <Text style={styles.cardSub}>
        Tap to manage
      </Text>
    </View>

    <Text style={styles.arrow}>
      ➜
    </Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 15,
  },

  /* HEADER */

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
  },

  subtitle: {
    color: "#64748b",
    marginTop: 4,
  },

  /* CARD */

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,

    borderLeftWidth: 6,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  icon: {
    fontSize: 26,
    marginRight: 14,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },

  cardSub: {
    fontSize: 12,
    color: "#64748b",
  },

  arrow: {
    fontSize: 18,
    color: "#94a3b8",
  },

  /* LOGOUT */

  logoutBtn: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },

  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },

});
