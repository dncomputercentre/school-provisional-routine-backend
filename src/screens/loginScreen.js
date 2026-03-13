import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../api/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }

    try {
      const res = await api.post("/headmaster/login", {
        email,
        password,
      });

      // ✅ login success
      Alert.alert("Success", "Login successful");

      // 👉 direct home screen (as you want)
      navigation.replace("home");
    } catch (err) {
      console.log("LOGIN ERROR 👉", err.message);
      console.log("FULL ERROR 👉", err);

      Alert.alert(
        "Login failed",
        err.response?.data?.message || err.message || "Unknown error"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Headmaster Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 6,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
