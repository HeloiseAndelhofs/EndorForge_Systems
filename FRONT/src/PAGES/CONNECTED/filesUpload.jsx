import { useState } from "react";
import axios from "axios"
import Nav from "../../COMPONENTS//Nav"
import "../../CSS/CONNECTED/filesUpload.css"


const UploadFile = () => {

    const [ file, setFile ] = useState(null)
    const [ description, setDescription ] = useState("")
    const [ visibility, setVisibility ] = useState("")
    const [ roleRequired, setRoleRequired ] = useState("")
    const [ teamName, setTeamName ] = useState("")
    const [ message, setMessage ] = useState("")
    const [ error, setError ] = useState("")

    const accessToken = sessionStorage.getItem('accessToken')
    //const refreshToken = sessionStorage.getItem("refreshToken")

    const headers = {
      Authorization : `Bearer ${accessToken}`
    }

    
    const handleSubmit = async (e) => {
        
        e.preventDefault()
        if (!file) {
            setError("Veuillez sélectionner un fichier")
            return
        }

        const formData = new FormData();

        formData.append("myFile", file); 
        formData.append("description", description);
        formData.append("visibility", visibility || "Public");
        formData.append("roleRequired", roleRequired);

        if (visibility === "Team") {
            formData.append("teamName", teamName);
        }

        try {
            
            const res = await axios.post("http://localhost:8000/api/endor/files/postFile", formData, { headers }, {
                withCredentials: true,
                headers: {"Content-Type" : "multipart/form-data"}
            })

            if (res.status === 200) {
                setMessage("Fichier uploadé avec succès !")
            }

        } catch (err) {
            console.error(err);
            setError(err.message)
        }

    }

    return(

        <>
            <Nav />

            <main className="upload-container">

                <h1> Uploader un fichier </h1>
                {error && <p className="error"> {error} </p>}

                <form onSubmit={handleSubmit}>

                    <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <label htmlFor="visibilityInput"> Visibilité </label>
                    <select name="visibilityInput" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                        <option value="Public"> Public </option>
                        <option value="Team"> Team </option>
                        <option value="Private"> Private </option>
                    </select>

                    {visibility === "Team" && (
                        <>
                        <label htmlFor="visibilityTrue"> Nom de la Team </label>
                        <input
                            name="visibilityTrue"
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required
                        />
                        </>
                    )}

                    <label htmlFor="roleInput"> Rôle requis (optionnel) </label>
                    <select name="roleInput" value={roleRequired} onChange={(e) => setRoleRequired(e.target.value)}>
                        <option value=""> Aucun </option>
                        <option value="Admin"> Admin </option>
                        <option value="RABADON"> RABADON </option>
                        <option value="TRINITE"> TRINITE </option>
                        <option value="MERCURE"> MERCURE </option>
                        <option value="COOKIES"> COOKIES </option>
                        <option value="PINKWARD"> PINKWARD </option>
                    </select>


                    <button type="submit"> Uploader </button>

                </form>

                {message && <p className="success"> {message} </p>}

            </main>

        </>

    )

}

export default UploadFile