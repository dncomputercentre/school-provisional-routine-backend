import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api from "../api/api";

export default function ChangePasswordScreen({ route, navigation }) {
  const { userId } = route.params;
  const [password, setPassword] = useState("");

  const handleChange = async () => {
    if (!password) {
      Alert.alert("Error", "New password required");
      return;
    }

    try {
      await api.post("/headmaster/change-password", {
        userId,
        newPassword: password,
      });

      Alert.alert("Success", "Password changed");
      navigation.replace("Login");
    } catch (err) {
      Alert.alert("Error", "Password change failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <TextInput
        placeholder="New Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btn} onPress={handleChange}>
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, textAlign: "center", marginBottom: 30 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 6,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
