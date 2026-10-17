import type { SkillGroup } from './types';

export const skillGroups: SkillGroup[] = [
  {
    group: 'AI/ML & Computer Vision',
    skills: ['Python', 'YOLOv5/v8', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenCV', 'Object Detection', 'Segmentation'],
  },
  {
    group: 'Edge AI & Embedded',
    skills: ['NVIDIA Jetson Nano / Orin', 'CUDA', 'TensorRT (concepts)'],
  },
  {
    group: 'IoT & Hardware',
    skills: ['ESP32', 'Arduino', 'PLC', 'UART', 'I2C', 'TCP/IP'],
  },
  {
    group: 'Backend & Databases',
    skills: ['Flask', 'FastAPI', 'RESTful APIs', 'MySQL', 'SQLite'],
  },
  {
    group: 'Cloud & DevOps',
    skills: ['AWS EC2', 'Linux', 'Nginx', 'Gunicorn', 'Systemd', 'Git'],
  },
  {
    group: 'GenAI',
    skills: ['LLM API integration', 'Prompt Engineering', 'RAG (concepts)'],
  },
  {
    group: 'Mobile & On-device AI',
    skills: ['Android', 'Whisper', 'sherpa-onnx', 'llama.cpp', 'GGUF'],
    note: 'From personal R&D',
  },
];
