import { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext(null);

const initialState = {
  // Step tracking
  currentStep: 0, // 0=Design, 1=Data, 2=Generate
  
  // Template
  backgroundImage: null,       // base64 or object URL
  backgroundImageName: '',
  imageWidth: 800,
  imageHeight: 600,
  elements: [],                // { id, type: 'text'|'image', x, y, ... }
  selectedElementId: null,
  
  // CSV
  csvData: [],
  csvHeaders: [],
  csvFileName: '',
  
  // Mapping
  mapping: {},                 // { placeholderText: csvHeader }
  
  // Generation
  isGenerating: false,
  progress: 0,
  totalCount: 0,
  generatedCount: 0,
  isComplete: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_BACKGROUND': {
      return {
        ...state,
        backgroundImage: action.payload.image,
        backgroundImageName: action.payload.name,
        imageWidth: action.payload.width,
        imageHeight: action.payload.height,
      };
    }
    
    case 'ADD_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.payload],
        selectedElementId: action.payload.id,
      };
    
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.payload.id ? { ...el, ...action.payload.updates } : el
        ),
      };
    
    case 'DELETE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.payload),
        selectedElementId: state.selectedElementId === action.payload ? null : state.selectedElementId,
      };
    
    case 'SELECT_ELEMENT':
      return { ...state, selectedElementId: action.payload };
    
    case 'SET_CSV_DATA':
      return {
        ...state,
        csvData: action.payload.data,
        csvHeaders: action.payload.headers,
        csvFileName: action.payload.fileName,
        mapping: {},
      };
    
    case 'SET_MAPPING':
      return {
        ...state,
        mapping: { ...state.mapping, [action.payload.placeholder]: action.payload.header },
      };
    
    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload,
        isComplete: false,
        progress: 0,
        generatedCount: 0,
      };
    
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.payload.progress,
        generatedCount: action.payload.count,
        totalCount: action.payload.total,
      };
    
    case 'SET_COMPLETE':
      return {
        ...state,
        isGenerating: false,
        isComplete: true,
        progress: 100,
      };
    
    case 'RESET_GENERATION':
      return {
        ...state,
        isGenerating: false,
        isComplete: false,
        progress: 0,
        generatedCount: 0,
        totalCount: 0,
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setStep = useCallback((step) => dispatch({ type: 'SET_STEP', payload: step }), []);
  const setBackground = useCallback((data) => dispatch({ type: 'SET_BACKGROUND', payload: data }), []);
  
  const addTextElement = useCallback(() => {
    const id = crypto.randomUUID();
    dispatch({
      type: 'ADD_ELEMENT',
      payload: {
        id,
        type: 'text',
        text: '{{Name}}',
        x: 400,
        y: 300,
        fontSize: 32,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        color: '#1a1a25',
      },
    });
  }, []);

  const addImageElement = useCallback((src, width, height) => {
    const id = crypto.randomUUID();
    dispatch({
      type: 'ADD_ELEMENT',
      payload: {
        id,
        type: 'image',
        src,
        x: 400 - width / 2,
        y: 300 - height / 2,
        width,
        height,
      },
    });
  }, []);
  
  const updateElement = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates } });
  }, []);
  
  const deleteElement = useCallback((id) => {
    dispatch({ type: 'DELETE_ELEMENT', payload: id });
  }, []);
  
  const selectElement = useCallback((id) => {
    dispatch({ type: 'SELECT_ELEMENT', payload: id });
  }, []);
  
  const setCsvData = useCallback((data) => {
    dispatch({ type: 'SET_CSV_DATA', payload: data });
  }, []);
  
  const setMapping = useCallback((placeholder, header) => {
    dispatch({ type: 'SET_MAPPING', payload: { placeholder, header } });
  }, []);
  
  const setGenerating = useCallback((val) => {
    dispatch({ type: 'SET_GENERATING', payload: val });
  }, []);
  
  const setProgress = useCallback((progress, count, total) => {
    dispatch({ type: 'SET_PROGRESS', payload: { progress, count, total } });
  }, []);
  
  const setComplete = useCallback(() => dispatch({ type: 'SET_COMPLETE' }), []);
  const resetGeneration = useCallback(() => dispatch({ type: 'RESET_GENERATION' }), []);

  const value = {
    state,
    setStep,
    setBackground,
    addTextElement,
    addImageElement,
    updateElement,
    deleteElement,
    selectElement,
    setCsvData,
    setMapping,
    setGenerating,
    setProgress,
    setComplete,
    resetGeneration,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
}
