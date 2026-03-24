import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Line } from 'react-konva';
import { useAppContext } from '../context/AppContext';
import {
  Upload, Plus, Trash2, Type, Move, Palette as PaletteIcon,
  ChevronRight, ImageIcon, ImagePlus,
} from 'lucide-react';

const FONTS = ['Helvetica', 'Times New Roman', 'Courier', 'Roboto', 'Montserrat', 'Open Sans', 'Playfair Display'];
const FONT_SIZES = [16, 20, 24, 28, 32, 40, 48, 56, 64, 72];
const SNAP_TOLERANCE = 15;

function TextNode({ el, isSelected, onSelect, onChange, onDragMove, onDragEnd }) {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={shapeRef}
        text={el.text}
        x={el.x}
        y={el.y}
        fontSize={el.fontSize}
        fontFamily={el.fontFamily}
        fontStyle={el.fontWeight === 'bold' ? 'bold' : 'normal'}
        fill={el.color}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={onDragMove}
        onDragEnd={(e) => {
          onChange({
            x: Math.round(e.target.x()),
            y: Math.round(e.target.y()),
          });
          if (onDragEnd) onDragEnd();
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          onChange({
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            fontSize: Math.round(el.fontSize * scaleX),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 10) return oldBox;
            return newBox;
          }}
          borderStroke="#7c3aed"
          borderStrokeWidth={1.5}
          anchorStroke="#7c3aed"
          anchorFill="#ffffff"
          anchorSize={8}
          anchorCornerRadius={2}
        />
      )}
    </>
  );
}

function ImageNode({ el, isSelected, onSelect, onChange, onDragMove, onDragEnd }) {
  const shapeRef = useRef();
  const trRef = useRef();
  const [img, setImg] = useState(null);

  useEffect(() => {
    const i = new window.Image();
    i.src = el.src;
    i.onload = () => setImg(i);
  }, [el.src]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={img}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={onDragMove}
        onDragEnd={(e) => {
          onChange({
            x: Math.round(e.target.x()),
            y: Math.round(e.target.y()),
          });
          if (onDragEnd) onDragEnd();
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          onChange({
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            width: Math.round(el.width * scaleX),
            height: Math.round(el.height * scaleY),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            return newBox;
          }}
          borderStroke="#7c3aed"
          borderStrokeWidth={1.5}
          anchorStroke="#7c3aed"
          anchorFill="#ffffff"
          anchorSize={8}
          anchorCornerRadius={2}
        />
      )}
    </>
  );
}

export default function DesignerPanel() {
  const {
    state, setBackground, addTextElement, addImageElement,
    updateElement, deleteElement, selectElement, setStep,
  } = useAppContext();

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [bgImg, setBgImg] = useState(null);
  const [stageScale, setStageScale] = useState(1);
  const [stageWidth, setStageWidth] = useState(800);
  const [snapLines, setSnapLines] = useState([]);

  const selectedEl = state.elements.find(el => el.id === state.selectedElementId);

  // Load background image into Konva Image object
  useEffect(() => {
    if (!state.backgroundImage) {
      setBgImg(null);
      return;
    }
    const img = new window.Image();
    img.src = state.backgroundImage;
    img.onload = () => setBgImg(img);
  }, [state.backgroundImage]);

  // Fit stage to container
  const fitStage = useCallback(() => {
    if (!containerRef.current || !state.imageWidth) return;
    const containerWidth = containerRef.current.clientWidth - 32;
    const scale = Math.min(containerWidth / state.imageWidth, 1);
    setStageScale(scale);
    setStageWidth(containerWidth);
  }, [state.imageWidth]);

  useEffect(() => {
    fitStage();
    window.addEventListener('resize', fitStage);
    return () => window.removeEventListener('resize', fitStage);
  }, [fitStage]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.src = ev.target.result;
      img.onload = () => {
        setBackground({
          image: ev.target.result,
          name: file.name,
          width: img.width,
          height: img.height,
        });
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.src = ev.target.result;
      img.onload = () => {
        // Max initial size roughly 200px
        const maxInitial = 200;
        let w = img.width;
        let h = img.height;
        if (w > maxInitial || h > maxInitial) {
          const ratio = Math.min(maxInitial / w, maxInitial / h);
          w = w * ratio;
          h = h * ratio;
        }
        addImageElement(ev.target.result, w, h);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || (e.target.getClassName() === 'Image' && e.target.image() === bgImg)) {
      selectElement(null);
    }
  };

  const handleDragMove = (e) => {
    const node = e.target;
    const centerX = state.imageWidth / 2;
    const centerY = state.imageHeight / 2;
    
    const width = node.width() * node.scaleX();
    const height = node.height() * node.scaleY();
    const nCenterX = node.x() + width / 2;
    const nCenterY = node.y() + height / 2;
    
    let newX = node.x();
    let newY = node.y();
    let lines = [];

    // Check vertical center snap (X axis)
    if (Math.abs(nCenterX - centerX) < SNAP_TOLERANCE) {
      newX = centerX - width / 2;
      lines.push({ axis: 'x', pos: centerX });
    }
    // Check horizontal center snap (Y axis)
    if (Math.abs(nCenterY - centerY) < SNAP_TOLERANCE) {
      newY = centerY - height / 2;
      lines.push({ axis: 'y', pos: centerY });
    }

    if (node.x() !== newX) node.x(newX);
    if (node.y() !== newY) node.y(newY);

    setSnapLines(lines);
  };

  const handleDragEnd = () => {
    setSnapLines([]);
  };

  const canProceed = state.backgroundImage && state.elements.length > 0;

  return (
    <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 md:px-8 py-5 border-b border-dark-600/50">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Template Designer</h2>
          <p className="text-xs text-dark-300 mt-0.5">Upload a background and add text or image placeholders</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={!state.backgroundImage}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-dark-600 border border-dark-500 text-dark-100 text-xs md:text-sm font-medium
              hover:bg-dark-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ImagePlus size={15} />
            <span className="hidden md:inline">Add Image Element</span>
            <span className="md:hidden">Image</span>
          </button>
          <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleAddImage} />
          
          <button
            onClick={addTextElement}
            disabled={!state.backgroundImage}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-dark-600 border border-dark-500 text-dark-100 text-xs md:text-sm font-medium
              hover:bg-dark-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} />
            <span className="hidden md:inline">Add Text Field</span>
            <span className="md:hidden">Text</span>
          </button>
          
          <button
            onClick={() => setStep(1)}
            disabled={!canProceed}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2 sm:ml-2 md:ml-4 rounded-lg bg-accent-500 text-white text-xs md:text-sm font-semibold
              hover:bg-accent-400 transition-all duration-200 shadow-[0_0_20px_rgba(124,58,237,0.3)]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Next Step
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto relative" ref={containerRef}>
          {!state.backgroundImage ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center gap-4 md:gap-5 p-8 md:p-12 rounded-2xl border-2 border-dashed border-dark-500
                hover:border-accent-400/50 transition-all duration-300 cursor-pointer max-w-md"
            >
              <div className="w-16 h-16 rounded-2xl bg-dark-600 flex items-center justify-center
                group-hover:bg-accent-500/15 transition-all duration-300 group-hover:scale-110">
                <ImageIcon size={28} className="text-dark-300 group-hover:text-accent-400 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-base">Upload Certificate Background</p>
                <p className="text-dark-300 text-sm mt-1">PNG or JPG, any resolution</p>
              </div>
              <div className="px-5 py-2.5 rounded-lg bg-accent-500/15 text-accent-300 text-sm font-medium
                group-hover:bg-accent-500/25 transition-all duration-200">
                Choose File
              </div>
            </button>
          ) : (
            <div className="relative" style={{ width: stageWidth }}>
              <Stage
                width={state.imageWidth * stageScale}
                height={state.imageHeight * stageScale}
                scaleX={stageScale}
                scaleY={stageScale}
                onClick={handleStageClick}
                onTap={handleStageClick}
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <Layer>
                  {bgImg && (
                    <KonvaImage
                      image={bgImg}
                      width={state.imageWidth}
                      height={state.imageHeight}
                    />
                  )}
                  {state.elements.map(el => {
                    if (el.type === 'text') {
                      return (
                        <TextNode
                          key={el.id}
                          el={el}
                          isSelected={el.id === state.selectedElementId}
                          onSelect={() => selectElement(el.id)}
                          onChange={(updates) => updateElement(el.id, updates)}
                          onDragMove={handleDragMove}
                          onDragEnd={handleDragEnd}
                        />
                      );
                    } else if (el.type === 'image') {
                      return (
                        <ImageNode
                          key={el.id}
                          el={el}
                          isSelected={el.id === state.selectedElementId}
                          onSelect={() => selectElement(el.id)}
                          onChange={(updates) => updateElement(el.id, updates)}
                          onDragMove={handleDragMove}
                          onDragEnd={handleDragEnd}
                        />
                      );
                    }
                    return null;
                  })}
                  
                  {/* Snapping Guidelines */}
                  {snapLines.map((line, i) => (
                    <Line
                      key={i}
                      points={
                        line.axis === 'x'
                          ? [line.pos, 0, line.pos, state.imageHeight]
                          : [0, line.pos, state.imageWidth, line.pos]
                      }
                      stroke="#10b981"
                      strokeWidth={1 / stageScale}
                      dash={[4 / stageScale, 4 / stageScale]}
                    />
                  ))}
                </Layer>
              </Stage>

              {/* Replace button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-3 right-3 p-2 rounded-lg glass text-dark-200 hover:text-white
                  transition-all duration-200 z-10"
                title="Replace background"
              >
                <Upload size={16} />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Properties panel */}
        {selectedEl && (
          <div className="w-full h-1/2 md:h-auto md:w-[280px] shrink-0 glass-light border-t md:border-t-0 md:border-l border-dark-600/50 p-5 flex flex-col gap-5 overflow-y-auto z-10 slide-in-bottom md:slide-in-right">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                {selectedEl.type === 'text' ? <Type size={14} className="text-accent-400" /> : <ImagePlus size={14} className="text-accent-400" />}
                Properties
              </h3>
              <button
                onClick={() => deleteElement(selectedEl.id)}
                className="p-1.5 rounded-md hover:bg-rose-500/15 text-dark-300 hover:text-rose-400
                  transition-all duration-200"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {selectedEl.type === 'text' && (
              <>
                {/* Placeholder */}
                <div>
                  <label className="text-[11px] font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={selectedEl.text}
                    onChange={(e) => updateElement(selectedEl.id, { text: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-dark-700 border border-dark-500 text-white text-sm
                      focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all"
                    placeholder="e.g. {{Name}}"
                  />
                </div>

                {/* Font family */}
                <div>
                  <label className="text-[11px] font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">
                    Font Family
                  </label>
                  <select
                    value={selectedEl.fontFamily}
                    onChange={(e) => updateElement(selectedEl.id, { fontFamily: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-dark-700 border border-dark-500 text-white text-sm
                      focus:outline-none focus:border-accent-500/50 appearance-none cursor-pointer"
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Font size */}
                <div>
                  <label className="text-[11px] font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">
                    Font Size — {selectedEl.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={selectedEl.fontSize}
                    onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                    className="w-full accent-accent-500"
                  />
                </div>

                {/* Font weight */}
                <div>
                  <label className="text-[11px] font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">
                    Weight
                  </label>
                  <div className="flex gap-2">
                    {['normal', 'bold'].map(w => (
                      <button
                        key={w}
                        onClick={() => updateElement(selectedEl.id, { fontWeight: w })}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                          selectedEl.fontWeight === w
                            ? 'bg-accent-500 text-white'
                            : 'bg-dark-600 text-dark-200 hover:bg-dark-500'
                        }`}
                      >
                        {w === 'bold' ? 'Bold' : 'Regular'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-[11px] font-medium text-dark-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <PaletteIcon size={12} /> Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedEl.color}
                      onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={selectedEl.color}
                      onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-dark-700 border border-dark-500 text-white text-sm font-mono
                        focus:outline-none focus:border-accent-500/50"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Position */}
            <div>
              <label className="text-[11px] font-medium text-dark-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Move size={12} /> Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-dark-400 mb-0.5 block">X</span>
                  <input
                    type="number"
                    value={selectedEl.x}
                    onChange={(e) => updateElement(selectedEl.id, { x: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-white text-xs
                      focus:outline-none focus:border-accent-500/50"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-dark-400 mb-0.5 block">Y</span>
                  <input
                    type="number"
                    value={selectedEl.y}
                    onChange={(e) => updateElement(selectedEl.id, { y: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-white text-xs
                      focus:outline-none focus:border-accent-500/50"
                  />
                </div>
              </div>
            </div>
            
            {/* Dimensions for Image */}
            {selectedEl.type === 'image' && (
              <div>
                <label className="text-[11px] font-medium text-dark-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-dark-400 mb-0.5 block">Width</span>
                    <input
                      type="number"
                      value={selectedEl.width}
                      onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-white text-xs
                        focus:outline-none focus:border-accent-500/50"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-400 mb-0.5 block">Height</span>
                    <input
                      type="number"
                      value={selectedEl.height}
                      onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-white text-xs
                        focus:outline-none focus:border-accent-500/50"
                    />
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
