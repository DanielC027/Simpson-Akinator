import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

import { useEffect, useState } from 'react';
import Logo from './assets/logo.svg';
import AllCharacters from './assets/all.png';

import AddCharacter from "./agregarPersonajes";
import ANN from './ANN';




export default function App() {
  const [modal, setModal] = useState(false);
  const [personajeNombre, setPersonajeNombre] = useState('');
  const [personajeLink, setPersonajeLink] = useState('');

  const [preguntas, setPreguntas] = useState([]);
  
  const [respuestas, setRespuestas] = useState({});

  const ann = new ANN();

  const predecirPersonaje = async () => {
    await ann.train();
    const inputArray = preguntas.map((p) => respuestas[p.id]);
    const resultado = ann.predict(inputArray);
    setPersonajeNombre(resultado.nombre);
    setPersonajeLink(resultado.link);

    setModal(true);
  }


  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "features"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
        // Ordenar antes de guardar en el estado
        const listaOrdenada = await [...data].sort((a, b) => a.pos - b.pos);
        
        setPreguntas(listaOrdenada);
        
        const respuestasIniciales = {};
        listaOrdenada.forEach((p) => {
          respuestasIniciales[p.id] = 0;
        });

        setRespuestas(respuestasIniciales);
      
      } catch (error) {
        console.error("Error al obtener personajes:", error);
      }
    };

    fetchCharacters();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 flex flex-col items-center justify-start py-6">
      {/* Header con logo */}
      <header className="flex items-center gap-4 mb-6">
        <img src={Logo} alt="Logo" className="w-20 h-20 animate-bounce" />
        <h1 className="text-4xl font-bold text-purple-900 drop-shadow-md">Akinator Simpson</h1>
      </header>

      {/* Imagen de personajes */}
      <div className="max-w-4xl w-full flex justify-center mb-8 px-4">
        <img
          src={AllCharacters}
          alt="Todos los personajes"
          className="rounded-2xl shadow-lg w-full max-w-3xl"
        />
      </div>

      {/* Área de preguntas */}
      <div className="bg-white/90 rounded-xl p-6 shadow-2xl max-w-4xl w-full text-center space-y-6">
        <p className="text-2xl font-bold text-gray-800">Responde las siguientes preguntas:</p>
        <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-3 px-4">Pregunta</th>
              <th className="py-3 px-4 text-center">Respuesta</th>
            </tr>
          </thead>
          <tbody>
            {preguntas.map((pregunta) => (
              <tr key={pregunta.id} className="border-t border-gray-300">
                <td className="py-3 px-4">{pregunta.pregunta}</td>
                <td className="py-3 px-4 text-center">
                  <select
                    className="bg-white border border-gray-300 rounded-md px-3 py-1"
                    value={respuestas[pregunta.id] ?? ""}
                    onChange={(e) =>
                      setRespuestas((prev) => ({
                        ...prev,
                        [pregunta.id]: parseInt(e.target.value),
                      }))
                    }
                  >
                    <option value={0}>No</option>
                    <option value={1}>Sí</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition duration-300"
          onClick={() => {
            console.log("Respuestas del usuario:", respuestas);
            predecirPersonaje();
          }}
        >
          Enviar respuestas
        </button>
      </div>
      <div>
        {/* MODAL */}
        {modal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative animate-fadeIn">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                onClick={() => setModal(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">¡Tu personaje es!</h2>
               {console.log("Link recibido:", personajeLink)}
              <img
                src={personajeLink}
                alt={personajeNombre}
                className="w-full h-64 object-contain rounded-xl shadow-md mb-4"
              />
              <p className="text-xl font-semibold text-center text-gray-800">{personajeNombre}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
