import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../COMPONENTS/Nav"
import "../CSS/CONNECTED/login.css"


const Login = () => {

    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ error, setError ] = useState("");
    const navigate = useNavigate()

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");

        try {

            const res = await axios.post("http://192.168.40.2:8000/api/login", {
                email : email,
                password : password,
            }, {
                withCredentials : true
            })

            if (res.status !== 200) {
                throw new Error(res.status, res.status.message)
            }

            console.log(res.data.accessToken);
            
            sessionStorage.setItem('accessToken', res.data.accessToken)

            navigate("/nova")

        } catch (error) {
            setError(error.message)
        }

    };

    return (

        <>
            <Nav />

            <div className="login-container">
                <div className="login-form">
                    <h1>Connexion</h1>

                    {error && <p className="error">{error}</p>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <label htmlFor="email"> Email </label>
                        <input
                            name="email"
                            type="email"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="password"> Mot de passe </label>
                        <input
                            name="password"
                            type="password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit"> Connexion </button>
                    </form>
                </div>
            </div>  
        </>

    )

}

export default Login