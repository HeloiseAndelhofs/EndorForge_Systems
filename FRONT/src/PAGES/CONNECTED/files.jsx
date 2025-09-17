import { useEffect, useState } from "react";
import axios from "axios"
import Nav from "../../COMPONENTS/Nav"
import "../../CSS/CONNECTED/files.css"

const FilesList = () => {

    const [ files, setFiles ] = useState([])
    const [ error, setError ] = useState("")

    const accessToken = sessionStorage.getItem('accessToken')

    const headers = {
      Authorization : `Bearer ${accessToken}`
    }

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await axios.get("http://192.168.40.2:8000/api/endor/files", {
                    headers,
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
                        <button onClick={() => handleDownload(file.file_id, file.file_name)}>
                          Télécharger
                        </button>
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