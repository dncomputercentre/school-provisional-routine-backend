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

export default function RoutineFilterScreen() {

  /* ================= STATIC LIST ================= */

  const classList = [
    "Class-V","Class-VI","Class-VII","Class-VIII",
    "Class-IX","Class-X","Class-XI","Class-XII",
  ];

  const sectionList = [
    "Section-A","Section-B","Section-C",
  ];

  /* ================= STATE ================= */

  const [className,setClassName] = useState("");
  const [section,setSection] = useState("");

  const [routines,setRoutines] = useState([]);

  const [classModal,setClassModal] = useState(false);
  const [sectionModal,setSectionModal] = useState(false);

  const [editModal,setEditModal] = useState(false);
  const [selected,setSelected] = useState(null);

  const [subject,setSubject] = useState("");

  /* ================= LOAD ================= */

  useEffect(()=>{
    loadRoutines();
  },[]);

  const loadRoutines = async()=>{
    const res = await api.get("/class-routine");
    setRoutines(res.data.data || []);
  };

  /* ================= FILTER ================= */

  const filteredData = routines.filter(r=>
    (className ? r.className===className : true) &&
    (section ? r.section===section : true)
  );

  /* ================= DELETE ================= */

  const deleteRoutine = (id)=>{
    Alert.alert(
      "Delete Routine",
      "Are you sure?",
      [
        {text:"Cancel"},
        {
          text:"Delete",
          onPress: async()=>{
            await api.delete(`/class-routine/${id}`);
            loadRoutines();
          }
        }
      ]
    );
  };

  /* ================= EDIT ================= */

  const openEdit = (item)=>{
    setSelected(item);
    setSubject(item.subject);
    setEditModal(true);
  };

  const updateRoutine = async()=>{
    await api.put(
      `/class-routine/${selected.id}`,
      { subject }
    );

    setEditModal(false);
    loadRoutines();
  };

  /* ================= UI ================= */

  return(

    <View style={styles.container}>

      <Text style={styles.title}>
        🔎 Filter Routine
      </Text>

      {/* ===== FILTER BAR ===== */}

      <View style={styles.searchRow}>

        <TouchableOpacity
          style={styles.searchBtn}
        >
          <Text style={{color:"#fff"}}>
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={()=>setClassModal(true)}
        >
          <Text>
            {className || "Class"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={()=>setSectionModal(true)}
        >
          <Text>
            {section || "Section"}
          </Text>
        </TouchableOpacity>

      </View>

      {/* ===== ROUTINE LIST ===== */}

      <FlatList
        data={filteredData}
        keyExtractor={(i)=>i.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No Routine Found
          </Text>
        }
        renderItem={({item})=>(

          <View style={styles.card}>

            <View>

              <Text style={styles.class}>
                {item.className} ({item.section})
              </Text>

              <Text>
                {item.period} | {item.time}
              </Text>

              <Text>
                {item.subject}
              </Text>

              <Text>
                👨‍🏫 {item.teacher?.name}
              </Text>

            </View>

            <View style={styles.row}>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={()=>openEdit(item)}
              >
                <Text style={styles.btnText}>
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={()=>deleteRoutine(item.id)}
              >
                <Text style={styles.btnText}>
                  Delete
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        )}
      />

      {/* ================= CLASS MODAL ================= */}

      <SelectModal
        visible={classModal}
        data={classList}
        onSelect={(v)=>{
          setClassName(v);
          setClassModal(false);
        }}
        onClose={()=>setClassModal(false)}
      />

      {/* ================= SECTION MODAL ================= */}

      <SelectModal
        visible={sectionModal}
        data={sectionList}
        onSelect={(v)=>{
          setSection(v);
          setSectionModal(false);
        }}
        onClose={()=>setSectionModal(false)}
      />

      {/* ================= EDIT MODAL ================= */}

      <Modal visible={editModal} transparent>

        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              Edit Subject
            </Text>

            <TouchableOpacity
              style={styles.updateBtn}
              onPress={updateRoutine}
            >
              <Text style={styles.btnText}>
                Update
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={()=>setEditModal(false)}
            >
              <Text style={styles.btnText}>
                Cancel
              </Text>
            </TouchableOpacity>

          </View>
        </View>

      </Modal>

    </View>
  );
}

/* ================= REUSABLE MODAL ================= */

const SelectModal = ({visible,data,onSelect,onClose})=>(
  <Modal visible={visible} transparent>

    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>

        <FlatList
          data={data}
          keyExtractor={(i,idx)=>idx.toString()}
          renderItem={({item})=>(
            <TouchableOpacity
              style={styles.modalItem}
              onPress={()=>onSelect(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
        >
          <Text style={{color:"#fff"}}>
            Close
          </Text>
        </TouchableOpacity>

      </View>
    </View>

  </Modal>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:15,
    backgroundColor:"#f1f5f9",
  },

  title:{
    fontSize:22,
    fontWeight:"bold",
    marginBottom:15,
  },

  searchRow:{
    flexDirection:"row",
    gap:10,
    marginBottom:15,
  },

  searchBtn:{
    backgroundColor:"#2563eb",
    padding:12,
    borderRadius:8,
  },

  filterBtn:{
    flex:1,
    backgroundColor:"#fff",
    padding:12,
    borderRadius:8,
    borderWidth:1,
    alignItems:"center",
  },

  card:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:10,
    marginBottom:10,
  },

  class:{
    fontWeight:"bold",
  },

  row:{
    flexDirection:"row",
    gap:10,
    marginTop:10,
  },

  editBtn:{
    backgroundColor:"#f59e0b",
    padding:8,
    borderRadius:6,
  },

  deleteBtn:{
    backgroundColor:"#dc2626",
    padding:8,
    borderRadius:6,
  },

  btnText:{
    color:"#fff",
  },

  empty:{
    textAlign:"center",
    marginTop:40,
  },

  modalOverlay:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.4)",
    justifyContent:"center",
    padding:20,
  },

  modalBox:{
    backgroundColor:"#fff",
    padding:20,
    borderRadius:10,
  },

  modalItem:{
    padding:12,
    borderBottomWidth:1,
  },

  closeBtn:{
    backgroundColor:"#2563eb",
    padding:12,
    borderRadius:8,
    marginTop:10,
    alignItems:"center",
  },

});
