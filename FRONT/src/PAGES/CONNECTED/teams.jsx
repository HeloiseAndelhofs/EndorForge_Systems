import { useEffect, useState } from "react";
import axios from "axios";
import "../../CSS/CONNECTED/teams.css";
import Nav from "../../COMPONENTS/Nav";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");

  const accessToken = sessionStorage.getItem("accessToken");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("http://192.168.40.2:8000/api/endor/teams", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });

        
        setTeams(res.data);
    } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des équipes");
    }
};
    console.log(teams);

    fetchTeams();
  }, []);

  return (
    <>
      <Nav />

      <main className="teams-container">
        <h1>Nos Équipes</h1>

        {error && <p className="error">{error}</p>}

        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.team_id} className="team-card">
              <h2>{team.team_name}</h2>
              <p className="team-ou">{team.team_ou}</p>
              <p className="team-desc">{team.team_description}</p>

              <h3>Membres :</h3>
              {team.members.length > 0 ? (
                <ul className="members-list">
                  {team.members.map((member) => (
                    <li key={member.user_id}>{member.username}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-members">Aucun membre pour le moment</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Teams;
