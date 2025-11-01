/*
  SIMULACIÓN DE TRABAJO MECÁNICO
  Autor: Oscar Ernesto Romero Portales
  Objetivo: Visualizar cómo el trabajo depende de la fuerza, distancia y ángulo.
  Fórmula: W = F * d * cos(θ)
*/

// === ESTADO GLOBAL ===
let force = 50;        // Fuerza en Newtons (N)
let angle = 0;         // Ángulo en grados (°)
let distance = 5;      // Distancia en metros (m)
let isAnimating = false;
let animationProgress = 0; // Progreso de la animación (0 a 1)

// === REFERENCIAS AL DOM ===
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

// Botones
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');
const infoBtn = document.getElementById('infoBtn');

// Controles deslizantes
const forceSlider = document.getElementById('forceSlider');
const angleSlider = document.getElementById('angleSlider');
const distanceSlider = document.getElementById('distanceSlider');

// Mostradores de valores
const forceValue = document.getElementById('forceValue');
const angleValue = document.getElementById('angleValue');
const distanceValue = document.getElementById('distanceValue');

// Resultados
const workResult = document.getElementById('workResult');
const fxResult = document.getElementById('fxResult');
const fyResult = document.getElementById('fyResult');

const infoBox = document.getElementById('infoBox');

// === FUNCIÓN: Actualizar resultados numéricos ===
function updateResults() {
  const rad = (angle * Math.PI) / 180; // Conversión a radianes
  const work = force * distance * Math.cos(rad); // Trabajo (Joules)
  const fx = force * Math.cos(rad); // Componente horizontal
  const fy = force * Math.sin(rad); // Componente vertical

  // Actualizamos el DOM
  workResult.textContent = `${work.toFixed(2)} J`;
  fxResult.textContent = `Fx = ${fx.toFixed(2)} N`;
  fyResult.textContent = `Fy = ${fy.toFixed(2)} N`;
}

// === FUNCIÓN: Dibujar la escena en el canvas ===
function draw() {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  // === FONDO ===
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#0f172a');
  bgGradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // === PISO ===
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height - 100);
  ctx.lineTo(width, height - 100);
  ctx.stroke();

  // Líneas de referencia (para dar perspectiva)
  for (let i = 0; i < width; i += 40) {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(i, height - 100);
    ctx.lineTo(i + 20, height - 80);
    ctx.stroke();
  }

  // === CAJA QUE SE MUEVE ===
  const boxSize = 80;
  const startX = 100; // Posición inicial en X
  const boxY = height - 100 - boxSize; // Arriba del piso
  const currentX = startX + (animationProgress * distance * 50); // Posición actual

  // Sombra suave
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(currentX + boxSize / 2, height - 95, boxSize / 2, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Caja con gradiente azul
  const boxGradient = ctx.createLinearGradient(currentX, boxY, currentX + boxSize, boxY + boxSize);
  boxGradient.addColorStop(0, '#3b82f6');
  boxGradient.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = boxGradient;
  ctx.fillRect(currentX, boxY, boxSize, boxSize);

  // Borde brillante
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 3;
  ctx.strokeRect(currentX, boxY, boxSize, boxSize);

  // Detalles internos de la caja
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(currentX + 10, boxY + 10, boxSize - 20, boxSize - 20);
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 2;
  ctx.strokeRect(currentX + 10, boxY + 10, boxSize - 20, boxSize - 20);

  // === VECTOR DE FUERZA ===
  const forceScale = 2; // Escala visual para el vector
  const forceStartX = currentX + boxSize / 2;
  const forceStartY = boxY + boxSize / 2;
  const rad = (angle * Math.PI) / 180;
  const forceEndX = forceStartX + force * Math.cos(rad) * forceScale;
  const forceEndY = forceStartY - force * Math.sin(rad) * forceScale;

  // Línea del vector con efecto de brillo (glow)
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(forceStartX, forceStartY);
  ctx.lineTo(forceEndX, forceEndY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Punta de flecha
  const arrowSize = 15;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(forceEndX, forceEndY);
  ctx.lineTo(
    forceEndX - arrowSize * Math.cos(rad - Math.PI / 6),
    forceEndY + arrowSize * Math.sin(rad - Math.PI / 6)
  );
  ctx.lineTo(
    forceEndX - arrowSize * Math.cos(rad + Math.PI / 6),
    forceEndY + arrowSize * Math.sin(rad + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  // Etiqueta del vector
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#fef2f2';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(`F = ${force.toFixed(0)} N`, forceEndX + 10, forceEndY - 10);
  ctx.shadowBlur = 0;

  // === VECTOR DE DESPLAZAMIENTO (solo si hay animación) ===
  if (animationProgress > 0) {
    ctx.strokeStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]); // Línea punteada
    ctx.beginPath();
    ctx.moveTo(startX + boxSize / 2, boxY + boxSize / 2);
    ctx.lineTo(currentX + boxSize / 2, boxY + boxSize / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Etiqueta de distancia recorrida
    const midX = (startX + currentX) / 2 + boxSize / 2;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#f0fdf4';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`d = ${(animationProgress * distance).toFixed(2)} m`, midX, boxY + boxSize + 30);
    ctx.shadowBlur = 0;
  }

  // === ARCO DEL ÁNGULO ===
  if (force > 0 && angle !== 0) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Dibuja un arco desde 0 hasta el ángulo (en radianes)
    ctx.arc(forceStartX, forceStartY, 40, 0, -rad, angle > 0);
    ctx.stroke();

    // Etiqueta del ángulo
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${angle}°`, forceStartX + 50, forceStartY - 5);
  }

  // === PARTÍCULAS DE ENERGÍA (solo si hay trabajo positivo) ===
  const work = force * distance * Math.cos(rad);
  if (isAnimating && work > 0) {
    for (let i = 0; i < 5; i++) {
      const px = currentX + boxSize / 2 + (Math.random() - 0.5) * boxSize;
      const py = boxY + boxSize / 2 + (Math.random() - 0.5) * boxSize;
      const size = Math.random() * 3 + 2;
      // Partículas amarillas con transparencia aleatoria
      ctx.fillStyle = `rgba(251, 191, 36, ${Math.random()})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Solicitamos el próximo cuadro de animación
  requestAnimationFrame(draw);
}

// === FUNCIÓN: Iniciar/Pausar animación ===
function toggleAnimation() {
  if (isAnimating) {
    isAnimating = false;
    playBtn.innerHTML = '<span>▶</span> Iniciar';
    playBtn.className = 'btn-play';
  } else {
    isAnimating = true;
    animationProgress = 0;
    playBtn.innerHTML = '<span>⏸</span> Pausar';
    playBtn.className = 'btn-pause';

    // Bucle de animación
    function animate() {
      if (!isAnimating) return;
      animationProgress += 0.01;
      if (animationProgress >= 1) {
        animationProgress = 1;
        isAnimating = false;
        playBtn.innerHTML = '<span>▶</span> Iniciar';
        playBtn.className = 'btn-play';
      } else {
        requestAnimationFrame(animate);
      }
    }
    animate();
  }
}

// === FUNCIÓN: Reiniciar simulación ===
function resetSimulation() {
  isAnimating = false;
  animationProgress = 0;
  playBtn.innerHTML = '<span>▶</span> Iniciar';
  playBtn.className = 'btn-play';
}

// === EVENTOS ===
forceSlider.addEventListener('input', () => {
  force = Number(forceSlider.value);
  forceValue.textContent = `${force} N`;
  updateResults();
});

angleSlider.addEventListener('input', () => {
  angle = Number(angleSlider.value);
  angleValue.textContent = `${angle}°`;
  updateResults();
});

distanceSlider.addEventListener('input', () => {
  distance = Number(distanceSlider.value);
  distanceValue.textContent = `${distance} m`;
  updateResults();
});

playBtn.addEventListener('click', toggleAnimation);
resetBtn.addEventListener('click', resetSimulation);
infoBtn.addEventListener('click', () => {
  infoBox.style.display = infoBox.style.display === 'none' ? 'block' : 'none';
});

// === INICIALIZACIÓN ===
updateResults(); // Calcula resultados iniciales
draw();          // Inicia el bucle de dibujo
