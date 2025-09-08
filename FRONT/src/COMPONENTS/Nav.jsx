import { Link, useNavigate } from "react-router-dom"
import "../CSS/COMPONENTS/Nav.css"


const Nav = () => {

    return (
        <>
            <nav>
                <Link to="/nova">
                    <h2>Accueil</h2>
                </Link>
                <ul>
                    <li>
                        <Link to="/profil">
                            <h2>Profil</h2>
                        </Link>
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