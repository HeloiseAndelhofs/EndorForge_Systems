import { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (tab === "users") {
      axios.get("/api/admin/users").then((res) => setUsers(res.data));
    } else if (tab === "teams") {
      axios.get("/api/admin/teams").then((res) => setTeams(res.data));
    } else if (tab === "logs") {
      axios.get("/api/admin/logs").then((res) => setLogs(res.data));
    }
  }, [tab]);

  return (
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
  );
};

export default AdminDashboard;
