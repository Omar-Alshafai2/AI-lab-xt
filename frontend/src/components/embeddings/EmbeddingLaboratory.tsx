import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  RotateCw, 
  Search, 
  Layers, 
  Compass, 
  Info, 
  Share2, 
  Box, 
  Maximize2 
} from 'lucide-react';
import * as THREE from 'three';
import { projectEmbeddings } from '../../lib/algorithms/embeddings';
import { EmbeddingPoint } from '../../lib/types';

export const EmbeddingLaboratory: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'pca' | 'tsne' | 'umap'>('pca');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [points, setPoints] = useState<EmbeddingPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<EmbeddingPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<EmbeddingPoint | null>(null);

  // 2D Canvas ref
  const canvas2dRef = useRef<HTMLCanvasElement | null>(null);
  // 3D Three.js container ref
  const container3dRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const projected = projectEmbeddings(algorithm);
    setPoints(projected);
    if (projected.length > 0) {
      setSelectedPoint(projected[0]);
    }
  }, [algorithm]);

  // -------------------------------------------------------------
  // 2D Interactive Canvas Renderer
  // -------------------------------------------------------------
  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvas2dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 160;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid axes
      ctx.strokeStyle = '#27272A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();

      // Draw category clusters & hulls
      points.forEach(p => {
        const px = centerX + p.x2d * scale;
        const py = centerY + p.y2d * scale;

        const isSelected = selectedPoint?.id === p.id;
        const isHovered = hoveredPoint?.id === p.id;

        // Draw connection lines to nearest neighbors if selected
        if (isSelected && p.nearestNeighbors) {
          p.nearestNeighbors.forEach(nn => {
            const neighbor = points.find(pt => pt.id === nn.id);
            if (neighbor) {
              const nx = centerX + neighbor.x2d * scale;
              const ny = centerY + neighbor.y2d * scale;
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(nx, ny);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          });
        }

        // Point rendering
        ctx.beginPath();
        const radius = isSelected ? 8 : isHovered ? 6.5 : 5;
        ctx.arc(px, py, radius, 0, Math.PI * 2);

        let fill = '#06B6D4'; // AI
        if (p.category === 'science') fill = '#10B981';
        if (p.category === 'tech') fill = '#38BDF8';
        if (p.category === 'sports') fill = '#F59E0B';

        ctx.fillStyle = fill;
        ctx.shadowColor = fill;
        ctx.shadowBlur = isSelected || isHovered ? 12 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isSelected) {
          ctx.strokeStyle = '#FAFAFA';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };

    render();

    // Mouse interactions for 2D Canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let found: EmbeddingPoint | null = null;
      for (const p of points) {
        const px = centerX + p.x2d * scale;
        const py = centerY + p.y2d * scale;
        const dist = Math.hypot(mx - px, my - py);
        if (dist < 10) {
          found = p;
          break;
        }
      }
      setHoveredPoint(found);
      render();
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const p of points) {
        const px = centerX + p.x2d * scale;
        const py = centerY + p.y2d * scale;
        const dist = Math.hypot(mx - px, my - py);
        if (dist < 12) {
          setSelectedPoint(p);
          render();
          break;
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [viewMode, points, selectedPoint, hoveredPoint]);

  // -------------------------------------------------------------
  // 3D Three.js WebGL Point Cloud Renderer
  // -------------------------------------------------------------
  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = container3dRef.current;
    if (!container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 0, 180);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Coordinate grid helper
    const gridHelper = new THREE.GridHelper(120, 12, 0x27272a, 0x18181b);
    gridHelper.position.y = -40;
    scene.add(gridHelper);

    // Group for points
    const pointsGroup = new THREE.Group();
    scene.add(pointsGroup);

    const pointMeshes: { mesh: THREE.Mesh; data: EmbeddingPoint }[] = [];

    points.forEach(p => {
      const geometry = new THREE.SphereGeometry(2.4, 16, 16);
      let colorHex = 0x06b6d4; // ai
      if (p.category === 'science') colorHex = 0x10b981;
      if (p.category === 'tech') colorHex = 0x38bdf8;
      if (p.category === 'sports') colorHex = 0xf59e0b;

      const material = new THREE.MeshBasicMaterial({ color: colorHex });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(p.x3d, p.y3d, p.z3d);
      pointsGroup.add(mesh);
      pointMeshes.push({ mesh, data: p });
    });

    // Orbit mouse rotation
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      pointsGroup.rotation.y += deltaX * 0.008;
      pointsGroup.rotation.x += deltaY * 0.008;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animationId: number;
    const animate = () => {
      if (!isDragging) {
        pointsGroup.rotation.y += 0.0015;
      }
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [viewMode, points]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-mono font-bold text-[#FAFAFA] tracking-wide">
              EMBEDDING LABORATORY
            </h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
              HIGH-DIMENSIONAL TOPOLOGY
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mt-0.5">
            Interactive semantic vector projections with PCA, t-SNE, and UMAP manifold reduction algorithms.
          </p>
        </div>

        {/* Algorithm & View Mode Toggles */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Projection Algorithm Selector */}
          <div className="flex bg-[#111113] p-0.5 rounded border border-[#27272A]">
            {(['pca', 'tsne', 'umap'] as const).map(algo => (
              <button
                key={algo}
                onClick={() => setAlgorithm(algo)}
                className={`px-3 py-1 rounded uppercase font-bold text-[11px] transition-colors ${
                  algorithm === algo
                    ? 'bg-cyan-500 text-black'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                }`}
              >
                {algo}
              </button>
            ))}
          </div>

          {/* 2D vs 3D View Toggle */}
          <div className="flex bg-[#111113] p-0.5 rounded border border-[#27272A]">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded font-bold text-[11px] transition-colors ${
                viewMode === '2d'
                  ? 'bg-[#27272A] text-cyan-300'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              2D PLANE
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded font-bold text-[11px] transition-colors ${
                viewMode === '3d'
                  ? 'bg-[#27272A] text-cyan-300'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              3D ORBIT
            </button>
          </div>
        </div>
      </div>

      {/* Category Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111113] border border-[#27272A] px-4 py-2.5 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]"></span>
            <span className="text-[#FAFAFA]">AI & Transformers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span className="text-[#FAFAFA]">Quantum & Science</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></span>
            <span className="text-[#FAFAFA]">Cloud & Systems</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
            <span className="text-[#FAFAFA]">Sports Biomechanics</span>
          </div>
        </div>

        <div className="text-[11px] text-[#71717A]">
          Click point to inspect vector coordinates & nearest neighbors
        </div>
      </div>

      {/* Main Canvas & Inspector Layout (Section 9 Spec) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visualizer Window */}
        <div className="lg:col-span-8 bg-[#111113] border border-[#27272A] rounded-lg p-4 relative overflow-hidden flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2 mb-2 font-mono text-xs text-[#A1A1AA]">
            <div className="flex items-center gap-2 text-[#FAFAFA] font-bold">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>
                {algorithm.toUpperCase()} MANIFOLD ({viewMode.toUpperCase()} PROJECTION)
              </span>
            </div>
            <span>POINTS: {points.length} • DIMENSIONS: 384</span>
          </div>

          <div className="flex-1 relative rounded overflow-hidden bg-[#09090B] border border-[#27272A]">
            {viewMode === '2d' ? (
              <canvas
                ref={canvas2dRef}
                className="w-full h-full cursor-crosshair"
              />
            ) : (
              <div
                ref={container3dRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />
            )}

            {/* Hover Tooltip overlay */}
            {hoveredPoint && (
              <div className="absolute bottom-4 left-4 bg-[#111113]/90 border border-cyan-500/50 p-2.5 rounded font-mono text-xs shadow-xl backdrop-blur pointer-events-none max-w-xs">
                <div className="text-cyan-400 font-bold">{hoveredPoint.title}</div>
                <div className="text-[10px] text-[#A1A1AA] uppercase">{hoveredPoint.category}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inspector Panel (Section 9 Spec) */}
        <div className="lg:col-span-4 bg-[#111113] border border-[#27272A] rounded-lg p-5 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2 font-bold text-[#FAFAFA]">
            <span>DOCUMENT INSPECTOR</span>
            {selectedPoint && (
              <span className="text-cyan-400 text-[11px]">
                ID: DOC #{selectedPoint.id.toString().padStart(3, '0')}
              </span>
            )}
          </div>

          {selectedPoint ? (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-[#A1A1AA] uppercase">TITLE</div>
                <div className="text-sm font-bold text-[#FAFAFA] mt-0.5">
                  {selectedPoint.title}
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-[#18181B] text-cyan-300 border border-[#27272A]">
                  Category: {selectedPoint.category.toUpperCase()}
                </span>
              </div>

              <div>
                <div className="text-[10px] text-[#A1A1AA] uppercase mb-1">TEXT EXCERPT</div>
                <div className="bg-[#18181B] border border-[#27272A] p-2.5 rounded text-[11px] text-[#A1A1AA] leading-relaxed">
                  "{selectedPoint.text}"
                </div>
              </div>

              {/* Vector array preview */}
              <div>
                <div className="text-[10px] text-[#A1A1AA] uppercase mb-1">EMBEDDING VECTOR (384-DIM TRUNCATED)</div>
                <div className="bg-[#09090B] border border-[#27272A] p-2.5 rounded font-mono text-[10px] text-cyan-300/90 break-all leading-normal">
                  [{selectedPoint.vector.map(v => v.toFixed(3)).join(', ')}, ...]
                </div>
              </div>

              {/* Nearest Neighbors Breakdown (Section 9 Spec) */}
              <div>
                <div className="text-[10px] text-[#A1A1AA] uppercase font-bold mb-2">
                  TOP COSINE NEAREST NEIGHBORS
                </div>
                <div className="space-y-1.5">
                  {selectedPoint.nearestNeighbors?.map((nn, i) => (
                    <div
                      key={nn.id}
                      onClick={() => {
                        const target = points.find(p => p.id === nn.id);
                        if (target) setSelectedPoint(target);
                      }}
                      className="p-2 rounded bg-[#18181B] border border-[#27272A] hover:border-cyan-500/40 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="text-[#71717A] text-[10px]">{i + 1}.</span>
                        <span className="text-[#FAFAFA] truncate text-[11px]">{nn.title}</span>
                      </div>
                      <span className="font-bold text-cyan-400 tabular-nums shrink-0">
                        {nn.similarity.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-[#71717A] py-12">
              Select a node in the vector space to inspect metadata and calculate cosine similarity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
