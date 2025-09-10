import { useEffect, useState } from "react";
import axios from "axios"
import Nav from "../../COMPONENTS/Nav"
import "../../CSS/CONNECTED/files.css"

const FilesList = () => {

    const [ files, setFiles ] = useState([])
    const [ error, setError ] = useState("")

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await axios.get("http://localhost:8000/api/endor/files", {
                    withCredentials: true
                })
            
                setFiles(res.data)

            } catch (error) {
                setError(error + " Impossible de charger les fichiers.")
                console.error(error);
            }
        }
        fetchList()
    }, [])

    return (

        <>
        
            <Nav />
            <main className="files-container">
                <h1>Vos fichiers accessibles</h1>
                {error && <p className="error">{error}</p>}

                        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Visibilité</th>
              <th>Rôle requis</th>
              <th>Taille</th>
              <th>Uploader</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.file_id}>
                <td>{file.file_name}</td>
                <td>{file.file_description || "-"}</td>
                <td>{file.file_visibility}</td>
                <td>{file.file_roleRequired || "Aucun"}</td>
                <td>{(file.file_size / 1024).toFixed(1)} KB</td>
                <td>{file.uploader_name}</td>
                <td>
                  <a
                    href={`http://localhost:8000/api/endor/files/download/${file.file_id}`}
                    target="_blank"
                    //rel="noreferrer"
                  >
                    Télécharger
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

            </main>

        </>

    )

}


export default FilesList