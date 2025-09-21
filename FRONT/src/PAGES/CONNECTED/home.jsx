import { useEffect, useState } from "react"
import axios from "axios"
import Nav from "../../COMPONENTS/Nav"
import "../../CSS/CONNECTED/home.css"

const Home = () => {
  const [user, setUser] = useState(null)
  const [weather, setWeather] = useState(null)
  const [files, setFiles] = useState([])

  const accessToken = sessionStorage.getItem('accessToken')

  const headers = {
      Authorization : `Bearer ${accessToken}`
  }

  useEffect(() => {

    const dataProfile = async () => {
        try {
          const result = await axios.get("http://192.168.40.2:8000/api/endor/yourProfile", {
            withCredentials: true,
            headers
        })

        if (!result || !result.data) {
          throw new Error("Aucune donnée reçue")
        }

        setUser(result.data)

    } catch (err) {
        console.error(err);
        
    }
}
    const latestFiles = async () => {
        try {

            const filesResult = await axios.get("http://192.168.40.2:8000/api/endor/files/latest", {
                headers
            })

            setFiles(filesResult.data)
            
        } catch (err) {
            console.error(err);
        }
    }
    
    dataProfile()
    latestFiles()
    
    // Exemple météo via Open-Meteo (pas besoin de clé)
    axios.get("https://api.open-meteo.com/v1/forecast?latitude=50.85&longitude=4.35&current_weather=true")
    .then(res => setWeather(res.data.current_weather))
    .catch(err => console.error(err))
    
}, [])


    const handleDownload = async (fileId, fileName) => {

      try {
        
        const resDownload = await axios.get(`http://192.168.40.2:8000/api/endor/files/download/${fileId}`, {
          headers,
          responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([resDownload.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); 
        document.body.appendChild(link);
        link.click();
        link.remove();

      } catch (err) {
        console.error("Erreur lors du téléchargement : ", err);
      }
    }

    
  // Date du jour
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  })

  // Messages personnalisés selon l'équipe
  const teamMessages = {
    IT: "la réparation des ordinateurs sans casser la tête des employés",
    dev: "le développement d’applications robustes et innovantes",
    HR: "le bonheur des employés en demandant à la direction de ne pas réduire le café",
    Direction: "la lourde tâche de diriger avec sagesse et bienveillance"
  }

  const teamMsg = user ? teamMessages[user.team_ou] || "vos projets du jour" : ""

  return (
    <>
        <Nav />
    
        <div className="home-container">
        <h1>Bienvenue {user ? user.user_firstname : ""}</h1>

        <p className="welcome-text">
            Nous sommes le <b>{today}</b>{weather && `, il fait ${weather.temperature}°C`} <br/>
            Passez une bonne journée {user ? user.username : ""} et travaillez bien sur {teamMsg}.
        </p>

        <div className="dashboard">
        <div className="card">
        <h2>Derniers fichiers uploadés</h2>
        {files.length > 0 ? (
            <ul>
            {files.map((file) => (
                <li key={file.file_id}>
                <span className="file-name">{file.file_name}</span>
                <button
                    className="download-btn"
                    onClick={() => handleDownload(file.file_id, file.file_name)}
                >
                    Télécharger
                </button>
                <span className="file-date">
                    ({new Date(file.file_uploadedAt).toLocaleDateString("fr-FR")})
                </span>
                </li>
            ))}
            </ul>
        ) : (
            <p>Aucun fichier récent.</p>
        )}
        </div>

            <div className="card">
            <h2>Accéder aux équipes</h2>
            <p>Consultez les équipes et leurs membres.</p>
            <a href="/teams">Voir les équipes</a>
            </div>

        </div>
        </div>
    </>
    
  )
}

export default Home
