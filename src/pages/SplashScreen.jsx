import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function SplashScreen() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Logika berpindah otomatis ke halaman Login setelah 3 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Logika WebGL Shader Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Vertex shader
    const vsSource = `
      attribute vec4 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = a_position;
        v_texCoord = a_position.xy * 0.5 + 0.5;
      }
    `;

    // Fragment shader
    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord;
        vec2 p = (uv * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0);
        
        // Background color #01A684 (Teal)
        vec3 color = vec3(0.0039, 0.651, 0.518);
        
        // Create soft moving waves/ornaments
        float wave = sin(p.x * 2.0 + u_time * 0.5) * cos(p.y * 2.0 + u_time * 0.3);
        float wave2 = sin(p.y * 3.0 - u_time * 0.4) * cos(p.x * 1.5 + u_time * 0.2);
        
        // Add subtle brightness variations
        color += (wave + wave2) * 0.05;
        
        // Vignette effect
        float dist = length(p);
        color *= 1.0 - smoothstep(0.8, 1.5, dist) * 0.5;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");

    function resizeCanvasToDisplaySize(canvas) {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
    }

    let animationFrameId;
    let startTime = Date.now();

    function render() {
      resizeCanvasToDisplaySize(canvas);
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.useProgram(program);

      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      const currentTime = (Date.now() - startTime) / 1000.0;
      gl.uniform1f(timeUniformLocation, currentTime);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-[#01a684] h-screen w-full flex flex-col relative overflow-hidden antialiased items-center justify-center">
      {/* Custom Styles untuk Animasi Dot & Fade */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 0.8; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.5s forwards;
          opacity: 0;
        }

        @keyframes dot-pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .dot {
          animation: dot-pulse 1.5s infinite ease-in-out;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* WebGL Background Canvas */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />

      {/* Area Logo & Animasi Loading */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 z-10">
        <div className="flex flex-col items-center justify-center text-center select-none mb-10">
          <div className="flex items-baseline justify-center tracking-tight text-4xl sm:text-5xl font-extrabold drop-shadow-sm font-['Manrope',sans-serif]">
            <span className="text-[#111827]">titik</span>
            <span className="text-white ml-0.5">jual</span>
            <span className="w-2.5 h-2.5 rounded-full bg-white ml-1 mb-1 inline-block animate-pulse"></span>
          </div>
          <p className="mt-3 text-[11px] sm:text-xs tracking-[0.22em] uppercase font-semibold text-white/90 drop-shadow-sm">
            Solusi Pintar Manajemen Transaksi
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex flex-col items-center space-y-3 animate-fade-in-up">
          <div className="flex items-center space-x-2.5 py-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white dot"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white dot"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white dot"></div>
          </div>
        </div>
      </main>

      {/* Bottom Footer / Version */}
      <footer className="absolute bottom-0 w-full pb-8 flex justify-center items-center z-10 px-6">
        <div className="flex flex-col items-center text-center space-y-1">
          <p className="text-[11px] font-medium tracking-wider text-white/70">v2.4.0</p>
        </div>
      </footer>
    </div>
  );
}

export default SplashScreen;