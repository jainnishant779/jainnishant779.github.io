import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

const nodes: DiagramNode[] = [
  {
    id: 'mic_input',
    label: 'Microphone Stream',
    sublabel: '16kHz Audio Stream',
    x: 40,
    y: 130,
    width: 165,
    height: 70,
    description:
      'Low-latency raw PCM audio streaming from mobile microphone, preprocessed through noise suppression and voice activity detection (VAD).',
  },
  {
    id: 'whisper_onnx',
    label: 'Whisper Offline STT',
    sublabel: 'sherpa-onnx / INT8',
    x: 250,
    y: 130,
    width: 170,
    height: 70,
    description:
      'Quantized INT8 Whisper speech recognition model executing fully on-device via sherpa-onnx runtime with zero cloud dependencies or network calls.',
  },
  {
    id: 'token_broker',
    label: 'Prompt Buffer',
    sublabel: 'Zero-Cloud Context',
    x: 465,
    y: 130,
    width: 165,
    height: 70,
    description:
      'Local RAM context buffer assembling conversation history, system prompt constraints, and streaming user token inputs.',
  },
  {
    id: 'llama_cpp',
    label: 'llama.cpp Inference',
    sublabel: 'GGUF 4-Bit Local LLM',
    x: 675,
    y: 130,
    width: 175,
    height: 70,
    description:
      '4-bit quantized open-weights LLM running natively on ARM CPU / NPU with optimized NEON SIMD kernels for rapid on-device text generation.',
  },
  {
    id: 'actuator',
    label: 'On-Device Actuator',
    sublabel: 'TTS & Local Task Trigger',
    x: 465,
    y: 260,
    width: 195,
    height: 65,
    description:
      'Executes local Android intents, alarms, note taking, and synthesized offline speech output with complete data privacy.',
  },
];

const links: DiagramLink[] = [
  { from: 'mic_input', to: 'whisper_onnx', label: '16kHz PCM' },
  { from: 'whisper_onnx', to: 'token_broker', label: 'Transcribed Text' },
  { from: 'token_broker', to: 'llama_cpp', label: 'Prompt Tokens' },
  { from: 'llama_cpp', to: 'actuator', label: 'Token Stream', dashed: true },
];

export const OnDeviceAiDiagram: React.FC = () => {
  return (
    <Diagram
      title="On-Device Offline STT & Local LLM Pipeline"
      nodes={nodes}
      links={links}
      width={930}
      height={360}
    />
  );
};
