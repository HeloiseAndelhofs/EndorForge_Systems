import Nav from "../../COMPONENTS/Nav"
import { useEffect, useState } from "react"
import axios from "axios"
import "../../CSS/CONNECTED/profile.css"

const Profile = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState("")

    const accessToken = sessionStorage.getItem('accessToken')

    const headers = {
      Authorization : `Bearer ${accessToken}`
    }


  useEffect(() => {
    const dataProfil = async () => {
      try {
        const result = await axios.get("http://192.168.40.2:8000/api/endor/yourProfile", {
          withCredentials: true,
          headers
        })

        if (!result || !result.data) {
          throw new Error("Aucune donnée reçue")
        }

        setData(result.data)
        //console.log(result.data);
        
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || err.message)
      }
    }
    dataProfil()
  }, [])

  return (
    <>
      <Nav />

      <h1>
        Profile utilisateur de {" "}
        {data ? `${data.user_name} ${data.user_firstname}` : "en cours de chargement..."}
      </h1>

      {error && <p className="error">{error}</p>}

      <div className="profil-container">
        {data && (
          <>
          <div className="card-profil">
            <h1>Utilisateur</h1>
            <h2>Nom : {data.user_name}</h2>
            <h2>Prénom : {data.user_firstname}</h2>
            <h2>Email : {data.user_email}</h2>
            <h2>Rôle au sein de l'entreprise : {data.user_role}</h2>
            <h2>Début du contrat : {data.user_createdAt}</h2>
            <h2>Type de contrat : {data.user_contract_type}</h2>
          </div>
          
          <div className="card-profil">
            <h1>Team</h1>
            <h2>Nom team : {data.team_name}</h2>
            <h2>Description team : {data.team_description}</h2>
          </div>
          </>
        )}
      </div>
    </>
  )
}

export default Profile
