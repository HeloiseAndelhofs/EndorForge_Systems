import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const Logout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const logoutFunc = async () => {
      try {
        const result = await axios.get("http://localhost:8000/api/endor/logout", {
          withCredentials: true, // important si tu utilises des cookies
        })

        if (result.status !== 200) {
          throw new Error("Une erreur est survenue pendant la déconnexion")
        }

        navigate("/")
      } catch (error) {
        console.error(error)
      }
    }

    logoutFunc()
  }, [navigate])

  return <p>Déconnexion en cours...</p>
}

export default Logout
