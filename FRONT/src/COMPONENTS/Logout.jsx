import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const Logout = () => {
  const navigate = useNavigate()

    const headers = {
      Authorization : `Bearer ${accessToken}`
    }

  useEffect(() => {
    const logoutFunc = async () => {
      try {
        const result = await axios.get("http://192.168.40.2:8000/api/endor/logout", {
          headers,
          withCredentials: true
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
