import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/loginScreen";
import HomeScreen from "../screens/homeScreen";
import CreateTeacherScreen from "../screens/createTeacherScreen";
import AbsentTeacherScreen from "../screens/absentTeacherScreen";
import ClassRoutineScreen from "../screens/classRoutineScreen";
import ProvisionalRoutineScreen from "../screens/provisionalRoutineScreen";
import SubjectCreateScreen from "../screens/SubjectCreateScreen";
import RoutineFilterScreen from "../screens/RoutineFilterScreen";
import TeacherNormalRoutineScreen from "../screens/TeacherNormalRoutineScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="home" component={HomeScreen} options={{title: "Bhangar High School (H.S)",}}/>
      
      <Stack.Screen name="createTeacher" component={CreateTeacherScreen} />
      <Stack.Screen name="absentTeacher"component={AbsentTeacherScreen} options={{ title: "Absent Teachers" }}/>
      <Stack.Screen name="classRoutine" component={ClassRoutineScreen} />
      <Stack.Screen
        name="provisionalRoutine"
        component={ProvisionalRoutineScreen}
      />
      <Stack.Screen
  name="subjectCreate"
  component={SubjectCreateScreen}
  options={{ title: "Create Subject" }}
/>
<Stack.Screen
  name="RoutineFilter"
  component={RoutineFilterScreen}
/>
<Stack.Screen
  name="teacherNormalRoutine"
  component={TeacherNormalRoutineScreen}
/>
    </Stack.Navigator>
  );
}
