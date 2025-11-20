import axios from "axios";

const BASE = "http://localhost:3333/api/users/crud";
const DB = "DBServer=MongoDB";
const USER = "LoggedUser=FRONTEND";

// 🔹 GET ALL USERS
export async function getAllUsers() {
  const url = `${BASE}?ProcessType=getAll&${DB}&${USER}`;

  const { data } = await axios.post(url, { usuario: {} });

  return data?.value?.[0]?.data || [];
}

// 🔹 GET USER BY ID
export async function getUserById(id) {
  const url = `${BASE}?ProcessType=getById&${DB}&${USER}`;

  const { data } = await axios.post(url, {
    usuario: { USERID: id }
  });

  return data?.value?.[0]?.data?.[0] || null;
}

// 🔹 CREATE USER
export async function createUser(user) {
  const url = `${BASE}?ProcessType=postUsuario&${DB}&${USER}`;
  const { data } = await axios.post(url, { usuario: user });
  return data;
}

// 🔹 UPDATE USER
export async function updateUser(user) {
  const url = `${BASE}?ProcessType=updateOne&${DB}&${USER}`;
  const { data } = await axios.post(url, { usuario: user });
  return data;
}

// 🔹 DELETE USER
export async function deleteUser(id) {
  const url = `${BASE}?ProcessType=deleteUsuario&${DB}&${USER}`;
  const { data } = await axios.post(url, {
    usuario: { USERID: id }
  });
  return data;
}

// 🔹 ASIGNAR ROL
export async function assignRole(userId, roleId) {
  const url = `${BASE}?ProcessType=assignRol&${DB}&${USER}`;
  const { data } = await axios.post(url, {
    usuario: { USERID: userId, ROLEID: roleId }
  });
  return data;
}

// 🔹 DESASIGNAR ROL
export async function unassignRole(userId, roleId) {
  const url = `${BASE}?ProcessType=unassignRol&${DB}&${USER}`;
  const { data } = await axios.post(url, {
    usuario: { USERID: userId, ROLEID: roleId }
  });
  return data;
}
