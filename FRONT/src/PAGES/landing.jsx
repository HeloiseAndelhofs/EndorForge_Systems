import "../CSS/landing.css"
import Nav from "../COMPONENTS/Nav"
import { useNavigate } from "react-router-dom"


const Landing = () => {
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate("/login")
  }

  return (
    <>
      <Nav />
      <main>
        <h1>Nova par Endor Forge Systems</h1>
        <h2>
          La plateforme interne sécurisée pour partager vos fichiers, collaborer
          en équipe et gagner du temps
        </h2>

        <p>
          Chez Endor Forge Systems, nous sommes spécialisés dans le développement
          de systèmes embarqués, de solutions de sécurité informatique et de
          logiciels tactiques pour stations orbitales, flottes spatiales et
          infrastructures interplanétaires.
        </p>

        <h3>Avec Nova vous pouvez</h3>
        <ul>
          <li>Centraliser vos fichiers</li>
          <li>Partager vos fichiers</li>
          <li>Gérer vos congés</li>
        </ul>
        <h3>Et bien d'autres...</h3>

        <button onClick={handleLoginClick}>Connectez-vous !</button>
      </main>
    </>
  )
}

export default Landing