import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

// provide optional config object (or undefined). Defaults shown.
const config = {
  binaryThresh: 0.5, 
  hiddenLayers: [6], 
  activation: 'sigmoid'
};

const net = new window.brain.NeuralNetwork(config);

export default class ANN {
  constructor() {
    this.trained = false;
    this.cantPersonajes = 0;
  }

  async obtenerDatos(){
      try {
        const querySnapshot = await getDocs(collection(db, "character"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        this.cantPersonajes = data.length;

        return data;
      } catch (error) {
        console.error("Error al obtener personajes:", error);
        return [];
      }
  }

  async train() {
    const data = await this.obtenerDatos();
    this.datosPersonajes = data;
    console.log("caracteres: ",data);
    const formattedData = data.map(({ entrada, salida, nombre }) => ({
      input: entrada.split(',').map(Number),
       output: { [salida]: 1 },
    }));

    console.log("fromato datos: ", formattedData);

    net.train(formattedData, {
      iterations: 10000,
      errorThresh: 0.005,
    });

    this.trained = true;

    const output = net.run([1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]); // devuelve un objeto con probabilidades
    // Devuelve el índice con el valor más alto
    const salida = Object.values(output);
    const index = salida.indexOf(Math.max(...salida));
    console.log("PREDICCION ENTRENANDO: Salida: ",salida," Index: ",index);
  }

  predict(inputObject) {
    if (!this.trained) {
      throw new Error('La red neuronal no está entrenada aún.');
    }

    console.log("Objeto de entrada: ",inputObject);

    const output = net.run(inputObject); // devuelve un objeto como { "0": 0.01, "1": 0.85, "2": 0.14 }
    const salida = Object.values(output);
    const keys = Object.keys(output);
    const index = salida.indexOf(Math.max(...salida));
    const predictedClass = parseInt(keys[index]); // ← esto te da el número de personaje
    console.log("Prediccion predict: ->>>> Salida:", salida, " Index:", predictedClass);
    
    console.log("datos de personaje: -> ",this.datosPersonajes);
    // Busca el personaje cuyo 'salida' coincida
    const personaje = this.datosPersonajes.find((p) => parseInt(p.salida) === predictedClass);

    if (!personaje) {
        return { nombre: "Desconocido", link: "" };
    }

    console.log(personaje);
    return {
        nombre: personaje.nombre,
        link: personaje.link,
    };
    }
}
