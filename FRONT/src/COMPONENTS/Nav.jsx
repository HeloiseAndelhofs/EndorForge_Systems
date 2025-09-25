import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../CONTEXT/AuthContext"
import "../CSS/COMPONENTS/Nav.css"
import { useEffect } from "react"


const Nav = () => {

    const { role, loading } = useAuth();

    if (loading) return null;
    

    return (
        <>
            <nav>
                <Link to="/nova">
                    <h2>Accueil</h2>
                </Link>
                <ul>
                    <li>
                        <Link to="/profile">
                            <h2>Profile</h2>
                        </Link>
                    </li>
                    <li>
                        {role === "admin" && <Link to="/admin"> <h2> Dashboard Admin </h2> </Link>}
                    </li>
                    <li>
                        <Link to="/files">
                            <h2>Fichiers</h2>
                        </Link>
                    </li>
                    <li>
                        <Link to="/files/upload">
                            <h2>Upload fichier</h2>
                        </Link>
                    </li>
                    <li>
                        <Link to="/teams">
                            <h2>Teams</h2>
                        </Link>
                    </li>
                    <li>
                        <Link to="/logout"> 
                            <h2>Logout</h2>
                        </Link>
                    </li>
                </ul>
            </nav>
        </>

    )

}

export default Nav