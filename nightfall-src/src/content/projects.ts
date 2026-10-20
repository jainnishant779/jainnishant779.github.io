import type { Project } from './types';

export const projects: Project[] = [
  {
    slug: 'edgedesk',
    title: 'EdgeDesk: Secure Multi-Device Remote Access Platform',
    badge: 'Patent application filed — not granted',
    stack: ['Python', 'WebSocket', 'VNC', 'Jetson Nano', 'TLS/WSS'],
    description: [
      'VPN-style secure remote desktop for encrypted screen access and file transfer across a fleet of Jetson Nano edge devices; patent application filed for the multi-device architecture.',
      'Custom WebSocket broker with encrypted file transfer and cross-device drag-and-drop, managing multiple devices from one dashboard with reboot-safe Linux services.',
    ],
    image: '/nightfall/images/projects/edgedesk.jpg',
    imageCaption: 'Illustrative artwork — not a product screenshot.',
  },
  {
    slug: 'crowd-analytics',
    title: 'Real-Time Crowd Analytics & Stampede Detection',
    badge: 'Top Finalist — MPSEDC Mahakumbh Hackathon 2025 (200+ teams)',
    stack: ['Python', 'YOLOv8', 'ByteTrack', 'OpenCV', 'Jetson Nano (CUDA)'],
    description: [
      'GPU-accelerated multi-object tracking pipeline achieving sub-50 ms inference latency for real-time person counting and density/velocity-based stampede alerts.',
    ],
  },
  {
    slug: 'poultry-health-ai',
    title: 'AI-Powered Poultry Health Monitoring',
    badge: 'Client project',
    stack: ['Python', 'YOLO', 'OpenCV', 'Object Detection'],
    description: [
      'Owned the ML lifecycle end-to-end — data collection, annotation, training, and deployment — for a real farm-operator client.',
    ],
    image: '/nightfall/images/projects/poultry-health-ai.jpg',
    imageCaption: 'Illustrative artwork — not a product screenshot.',
  },
  {
    slug: 'on-device-ai',
    title: 'On-Device AI Assistant (Offline Speech & Local LLM)',
    badge: 'Personal R&D — in progress, not a released app',
    stack: ['Android', 'Whisper', 'sherpa-onnx', 'llama.cpp', 'GGUF'],
    description: [
      'Offline speech transcription and local language-model inference running fully on an Android device.',
    ],
    image: '/nightfall/images/projects/on-device-ai.jpg',
    imageCaption: 'Illustrative artwork — not a product screenshot.',
  },
  {
    slug: 'facial-attendance',
    title: 'AI-Accelerated Facial Recognition Attendance System',
    badge: 'Pilot deployment',
    stack: ['Python', 'Flask', 'dlib', 'MySQL', 'AWS EC2'],
    description: [
      'Full-stack attendance system deployed on AWS EC2, reducing manual attendance-taking time by ~90% for a 3-course pilot through automated facial recognition.',
    ],
    image: '/nightfall/images/projects/facial-attendance.jpg',
    imageCaption: 'Illustrative artwork — not a product screenshot.',
  },
  {
    slug: 'lora-traffic-mesh',
    title: 'Adaptive LoRa Traffic Intersection Mesh',
    badge: 'Hardware Prototype — ESP32 & Sub-GHz LoRa',
    stack: ['ESP32', 'LoRaWAN', 'FreeRTOS', 'C++', 'UART / SPI', 'Ad-Hoc Gossip'],
    description: [
      'Decentralized multi-node traffic intersection mesh dynamically coordinating signal green times via sub-GHz LoRa gossip protocol without internet connectivity.',
      'Formulated an ad-hoc peer-to-peer coordination protocol where each intersection controller broadcasts queue density with randomized slotted ALOHA channel backoff and autonomous fail-safe fallback to fixed timing.',
    ],
  },
];
