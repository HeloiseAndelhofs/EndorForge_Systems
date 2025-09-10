import { useNavigate } from "react-router-dom"
import axios from "axios"


const Logout = () => {
    const logoutFunc = async () => {
        
        try {
            
            const navigate = useNavigate()
            const result = await axios.get("http://localhost:8000/api/endor/logout")
            
            if (result.status !== 200) {
              throw new Error("Une erreur est survenue pendant la déconnexion")
            }
    
            navigate("/")
        } catch (error) {
            console.error(error)
            throw new Error(error.message)
        }
    }

    logoutFunc()
}

export default Logout