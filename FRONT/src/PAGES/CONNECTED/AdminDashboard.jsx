import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../CONTEXT/AuthContext"
import { Navigate } from "react-router-dom"
import "../../CSS/CONNECTED/adminDashboard.css"
import Nav from "../../COMPONENTS/Nav"


const AdminDashboard = () => {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [logs, setLogs] = useState([]);

  const { role } = useAuth()

  if (!role) return <Navigate to="/login" />
  if (role !== "admin") return <Navigate to="/profile" />

  const accessToken = sessionStorage.getItem('accessToken')

  const headers = {
      Authorization : `Bearer ${accessToken}`
    }

  useEffect(() => {

    if (!role) return

    if (tab === "users") {
      axios.get("http://192.168.40.2:8000/api/endor/admin/users", {
                    headers,
                    withCredentials: true
                }).then((res) => setUsers(res.data));
    } else if (tab === "teams") {
      axios.get("http://192.168.40.2:8000/api/endor/admin/teams", {
                    headers,
                    withCredentials: true
                }).then((res) => setTeams(res.data));
    } else if (tab === "logs") {
      axios.get("http://192.168.40.2:8000/api/endor/admin/logs", {
                    headers,
                    withCredentials: true
                }).then((res) => setLogs(res.data));
    }
  }, [tab]);


  return (

    <>
    <Nav />

    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        <button onClick={() => setTab("users")}>Users</button>
        <button onClick={() => setTab("teams")}>Teams</button>
        <button onClick={() => setTab("logs")}>Logs</button>
      </div>

      {tab === "users" && (
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Nom</th><th>Email</th><th>Team</th><th>Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{u.user_name}</td>
                <td>{u.user_email}</td>
                <td>{u.team_name || "-"}</td>
                <td>{u.user_role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "teams" && (
        <ul>
          {teams.map((t) => (
            <li key={t.team_id}>
              {t.team_name} (OU: {t.team_ou})
            </li>
          ))}
        </ul>
      )}

      {tab === "logs" && (
        <pre>{logs.join("\n")}</pre>
      )}
    </div>
    </>

  );
};

export default AdminDashboard;
