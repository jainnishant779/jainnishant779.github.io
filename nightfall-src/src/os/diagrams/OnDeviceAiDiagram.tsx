import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

// Personal R&D (not a released app). Stack: Android, Whisper, sherpa-onnx, llama.cpp, GGUF — all running on the device.
const nodes: DiagramNode[] = [
  {
    id: 'speech',
    label: 'Speech Input',
    sublabel: 'Android device',
    x: 40,
    y: 150,
    width: 170,
    height: 70,
    description: 'Speech captured on the Android device.',
  },
  {
    id: 'whisper',
    label: 'Whisper STT',
    sublabel: 'via sherpa-onnx',
    x: 270,
    y: 150,
    width: 170,
    height: 70,
    description: 'Offline speech transcription with Whisper-based recognition running through sherpa-onnx — no cloud.',
  },
  {
    id: 'llm',
    label: 'llama.cpp + GGUF',
    sublabel: 'Local LLM inference',
    x: 500,
    y: 150,
    width: 180,
    height: 70,
    description: 'A local language model in GGUF format, run with llama.cpp directly on the device.',
  },
  {
    id: 'output',
    label: 'Text Response',
    sublabel: 'On device',
    x: 740,
    y: 150,
    width: 160,
    height: 70,
    description: 'The response is produced fully on the device, without cloud dependencies.',
  },
];

const links: DiagramLink[] = [
  { from: 'speech', to: 'whisper', label: 'Audio' },
  { from: 'whisper', to: 'llm', label: 'Transcript' },
  { from: 'llm', to: 'output', label: 'Tokens', dashed: true },
];

export const OnDeviceAiDiagram: React.FC = () => {
  return (
    <Diagram
      title="On-Device Assistant — Simplified Pipeline (personal R&D)"
      nodes={nodes}
      links={links}
      width={930}
      height={300}
    />
  );
};
