import axios from "axios";

const BASE = "http://localhost:3333/api/roles/crud";
const DB = "DBServer=MongoDB";
const USER = "LoggedUser=FRONTEND";

// 🔹 GET ALL ROLES
export async function getAllRoles() {
  const url = `${BASE}?ProcessType=getAll&${DB}&${USER}`;
  const { data } = await axios.post(url, { rol: {} });
  return data?.value?.[0]?.data || [];
}

// 🔹 GET ROLE BY ID
export async function getRoleById(roleId) {
  const url = `${BASE}?ProcessType=getById&${DB}&${USER}`;
  const { data } = await axios.post(url, {
    rol: { ROLEID: roleId }
  });
  return data?.value?.[0]?.data?.[0] || null;
}

// 🔹 CREATE ROLE
export async function createRole(role) {
  const url = `${BASE}?ProcessType=postRol&${DB}&${USER}`;
  const { data } = await axios.post(url, { rol: role });
  return data;
}

// 🔹 UPDATE ROLE
export async function updateRole(role) {
  const url = `${BASE}?ProcessType=updateOne&${DB}&${USER}`;
  const { data } = await axios.post(url, { rol: role });
  return data;
}

// 🔹 DELETE ROLE
export async function deleteRole(roleId) {
  const url = `${BASE}?ProcessType=deleteRol&${DB}&${USER}`;
  const { data } = await axios.post(url, {
    rol: { ROLEID: roleId }
  });
  return data;
}
