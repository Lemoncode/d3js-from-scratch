// Generador de datos aleatorios en formato de array de n posiciones.
const randomArrayGenerator = n => Array.from({length: n}, () => Math.random());

// Otra forma podría ser Array(n).fill(0).map(n => Math.random());


// Singleton inicializado con datos aleatorios. Array de 20 posiciones.
export let randomData = randomArrayGenerator(20);

// Creamos un mecanismo para modifcar estos datos aleatorios cada segundo.
// Simula una fuente de datos 'real-time'. Permitimos la suscripción de un
// callback para informar a la visualización de que hubo modificaciones.
export const startRealTimeDataV1 = (onDataChange: (newData) => void) => {
  setInterval(() => {
    randomData = randomArrayGenerator(20);
    onDataChange && onDataChange(randomData);
  }, 1000);
}

export const startRealTimeDataV2 = (onDataChange: (data: any[]) => void) => {
  setInterval(() => {
    const n = Math.random() * 10 + 10;  // [10, 20]
    onDataChange && onDataChange(randomArrayGenerator(n));
  }, 1500);
}